import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private oNuevaContrasena: BehaviorSubject<any>;
  nuevaContrasena: Observable<any>;

  private oPeriodo: BehaviorSubject<any>;
  periodo: Observable<any>;

  private oAlertMessage: BehaviorSubject<any>;
  alertMessage: Observable<any>;

  constructor() {
    this.oNuevaContrasena = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("nuevaContrasena")!));
    this.nuevaContrasena = this.oNuevaContrasena.asObservable();

    this.oPeriodo = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("periodo")!));
    this.periodo = this.oPeriodo.asObservable();

    this.oAlertMessage = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("alertMessage")!));
    this.alertMessage = this.oAlertMessage.asObservable();
  }

  setNuevaContrasena(itemNuevaContrasena: any) {
    this.oNuevaContrasena.next(itemNuevaContrasena);
    sessionStorage.setItem("nuevaContrasena", JSON.stringify(itemNuevaContrasena));
  }

  setPeriodo(itemPeriodo: any) {
    this.oPeriodo.next(itemPeriodo);
    sessionStorage.setItem("periodo", JSON.stringify(itemPeriodo));
  }

  setAlertMessage(itemAlertMessage: any) {
    this.oAlertMessage.next(itemAlertMessage);
    sessionStorage.setItem("alertMessage", JSON.stringify(itemAlertMessage));
  }

  get itemNuevaContrasena(): any {
    return this.oNuevaContrasena.value;
  }

  get itemPeriodo(): any {
    return this.oPeriodo.value;
  }

  get itemAlertMessage(): any {
    return this.oAlertMessage.value;
  }

}
