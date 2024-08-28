import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private oEmpresa: BehaviorSubject<any>;
  empresa: Observable<any>;

  private oConsumo: BehaviorSubject<any>;
  consumo: Observable<any>;

  private oProveedor1: BehaviorSubject<any>;
  proveedor1: Observable<any>;

  private oProveedor2: BehaviorSubject<any>;
  proveedor2: Observable<any>;

  private oProveedor3: BehaviorSubject<any>;
  proveedor3: Observable<any>;

  private oPersonales: BehaviorSubject<any>;
  personales: Observable<any>;

  constructor() {
    this.oEmpresa = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("empresa")!));
    this.empresa = this.oEmpresa.asObservable();

    this.oConsumo = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("consumo")!));
    this.consumo = this.oConsumo.asObservable();

    this.oProveedor1 = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("proveedor1")!));
    this.proveedor1 = this.oProveedor1.asObservable();

    this.oProveedor2 = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("proveedor2")!));
    this.proveedor2 = this.oProveedor2.asObservable();

    this.oProveedor3 = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("proveedor3")!));
    this.proveedor3 = this.oProveedor3.asObservable();

    this.oPersonales = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("personales")!));
    this.personales = this.oPersonales.asObservable();

  }

  setEmpresa(itemEmpresa: any) {
    this.oEmpresa.next(itemEmpresa);
    sessionStorage.setItem("empresa", JSON.stringify(itemEmpresa));
  }

  setConsumo(itemConsumo: any) {
    this.oConsumo.next(itemConsumo);
    sessionStorage.setItem("consumo", JSON.stringify(itemConsumo));
  }

  setProveedor1(itemProveedor1: any) {
    this.oProveedor1.next(itemProveedor1);
    sessionStorage.setItem("proveedor1", JSON.stringify(itemProveedor1));
  }

  setProveedor2(itemProveedor2: any) {
    this.oProveedor2.next(itemProveedor2);
    sessionStorage.setItem("proveedor2", JSON.stringify(itemProveedor2));
  }

  setProveedor3(itemProveedor3: any) {
    this.oProveedor3.next(itemProveedor3);
    sessionStorage.setItem("proveedor3", JSON.stringify(itemProveedor3));
  }

  setPersonales(itemPersonales: any) {
    this.oPersonales.next(itemPersonales);
    sessionStorage.setItem("personales", JSON.stringify(itemPersonales));
  }

  get itemEmpresa(): any {
    return this.oEmpresa.value;
  }
  get itemConsumo(): any {
    return this.oConsumo.value;
  }
  get itemProveedor1(): any {
    return this.oProveedor1.value;
  }
  get itemProveedor2(): any {
    return this.oProveedor2.value;
  }
  get itemProveedor3(): any {
    return this.oProveedor3.value;
  }
  get itemPersonales(): any {
    return this.oPersonales.value;
  }
}
