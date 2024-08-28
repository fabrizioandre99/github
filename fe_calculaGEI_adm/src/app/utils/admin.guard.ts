import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class hasAccess implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    //Obtener el array guardado en localStorage
    const rutasGuardadas = JSON.parse(localStorage.getItem('Rutas') || '[]');
    const ruta = state.url;

    if (localStorage.getItem('SessionaInicio')) {
      localStorage.removeItem('SessionaInicio');
      return true;
    }

    if (rutasGuardadas.includes(ruta)) {
      return true;
    } else {
      this.router.navigate([rutasGuardadas[0]]);
      return false;
    }
  }

}
