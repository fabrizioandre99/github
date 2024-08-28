import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedDataService } from '../services/shared-data.service';
@Injectable({
  providedIn: 'root'
})

export class EsLogin implements CanActivate {

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
      if (rutasGuardadas.length > 0) {
        this.router.navigate([rutasGuardadas[0]]);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class EsLogout implements CanActivate {

  constructor(private sharedDataService: SharedDataService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.sharedDataService.itemNuevaContrasena !== null) {
      return true;
    }
    this.router.navigate(['/']);
    return false;

  }

}
