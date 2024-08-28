import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from '../services/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class EsMINAM implements CanActivate {

  constructor(private seguridadService: SeguridadService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.seguridadService.obtenerUsuarioActual.nTipo === "01") {
      return true;
    }

    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EsMuni implements CanActivate {

  constructor(private seguridadService: SeguridadService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.seguridadService.obtenerUsuarioActual.nTipo === "02") {
      return true;
    }
    return false;
  }

}

@Injectable({
  providedIn: 'root'
})

export class EsAmbos implements CanActivate {

  constructor(private seguridadService: SeguridadService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.seguridadService.obtenerUsuarioActual.nTipo === "01" || this.seguridadService.obtenerUsuarioActual.nTipo === "02") {
      return true;
    }
    return false;
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
