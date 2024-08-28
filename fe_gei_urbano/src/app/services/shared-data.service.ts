import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private oNuevaContrasena: BehaviorSubject<any>;
  nuevaContrasena: Observable<any>;

  private oUserData: BehaviorSubject<any>;
  userData: Observable<any>;

  private oPeriodo: BehaviorSubject<any>;
  periodo: Observable<any>;

  private oTecnologia: BehaviorSubject<any>;
  tecnologia: Observable<any>;

  constructor() {
    this.oNuevaContrasena = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("nuevaContrasena")!));
    this.nuevaContrasena = this.oNuevaContrasena.asObservable();

    this.oUserData = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("nuevaContrasena")!));
    this.userData = this.oUserData.asObservable();

    this.oPeriodo = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("periodo")!));
    this.periodo = this.oPeriodo.asObservable();

    this.oTecnologia = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("tecnologia")!));
    this.tecnologia = this.oTecnologia.asObservable();
  }

  setNuevaContrasena(itemNuevaContrasena: any) {
    this.oNuevaContrasena.next(itemNuevaContrasena);
    sessionStorage.setItem("nuevaContrasena", JSON.stringify(itemNuevaContrasena));
  }

  get itemNuevaContrasena(): any {
    return this.oNuevaContrasena.value;
  }

  setUserData(itemUserData: any) {
    this.oUserData.next(itemUserData);
    sessionStorage.setItem("userData", JSON.stringify(itemUserData));
  }

  get itemUserData(): any {
    return this.oUserData.value;
  }

  setPeriodo(itemPeriodo: any) {
    this.oPeriodo.next(itemPeriodo);
    sessionStorage.setItem("periodo", JSON.stringify(itemPeriodo));
  }

  get itemPeriodo(): any {
    return this.oPeriodo.value;
  }

  setTecnologia(itemTecnologia: any) {
    this.oTecnologia.next(itemTecnologia);
    sessionStorage.setItem("periodo", JSON.stringify(itemTecnologia));
  }

  get itemTecnologia(): any {
    return this.oTecnologia.value;
  }

}
