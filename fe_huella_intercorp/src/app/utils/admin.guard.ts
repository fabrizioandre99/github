
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EsLogin implements CanActivate {

  constructor(private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const rutasPermitidas = JSON.parse(localStorage.getItem('LocalRutas_intercorp')!);
    const currentRoute = state.url;

    const permitida = rutasPermitidas?.includes(currentRoute);

    if (localStorage.getItem('sToken_intercorp') && permitida) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
