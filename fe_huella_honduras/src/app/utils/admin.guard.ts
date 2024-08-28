import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SeguridadService } from '../services/seguridad.service';
import { SharedDataService } from '../services/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class isLogeado implements CanActivate {

  constructor(private seguridadService: SeguridadService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = this.seguridadService.obtenerToken;

    if (token) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }


}
@Injectable({
  providedIn: 'root'
})
export class NuevaContrasena implements CanActivate {

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