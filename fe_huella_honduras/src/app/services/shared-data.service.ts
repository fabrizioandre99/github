import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private oNuevaContrasena: BehaviorSubject<any>;
  nuevaContrasena: Observable<any>;

  private oMenu: BehaviorSubject<any>;
  menu: Observable<any>;

  private oPeriodoLimite: BehaviorSubject<any>;
  periodoLimite: Observable<any>;

  constructor() {
    this.oNuevaContrasena = new BehaviorSubject<any>(JSON.parse(localStorage.getItem("nuevaContrasena")!));
    this.nuevaContrasena = this.oNuevaContrasena.asObservable();

    this.oMenu = new BehaviorSubject<any>(JSON.parse(localStorage.getItem("menu")!));
    this.menu = this.oMenu.asObservable();

    this.oPeriodoLimite = new BehaviorSubject<any>(JSON.parse(localStorage.getItem("periodoLimite")!));
    this.periodoLimite = this.oPeriodoLimite.asObservable();
  }

  setNuevaContrasena(itemNuevaContrasena: any) {
    this.oNuevaContrasena.next(itemNuevaContrasena);
    localStorage.setItem("nuevaContrasena", JSON.stringify(itemNuevaContrasena));
  }

  setMenu(itemMenu: any) {
    this.oMenu.next(itemMenu);
    localStorage.setItem("menu", JSON.stringify(itemMenu));
  }

  setPeriodoLimite(itemPeriodoLimite: any) {
    this.oPeriodoLimite.next(itemPeriodoLimite);
    localStorage.setItem("periodoLimite", JSON.stringify(itemPeriodoLimite));
  }

  actualizarNombre(firstName: string, lastName: string) {
    const currentMenu = this.oMenu.value;
    currentMenu.sNombre = firstName;
    currentMenu.sApellidos = lastName;
    this.setMenu(currentMenu);
  }

  actualizarRazon(institutionName: string) {
    const currentMenu = this.oMenu.value;
    currentMenu.oInstitucion.sRazonSocial = institutionName;
    this.setMenu(currentMenu);
  }

  get itemNuevaContrasena(): any {
    return this.oNuevaContrasena.value;
  }

  get itemMenu(): any {
    return this.oMenu.value;
  }

  get itemPeriodoLimite(): any {
    return this.oPeriodoLimite.value;
  }
}
