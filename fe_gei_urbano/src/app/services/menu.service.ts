import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


  urlMenuRol = environment.baseUrl + '/rest/menu/listarRol';
  urlMenuRolCompleto = environment.baseUrl + '/rest/menu/listarRolCompleto';
  urlActualizarMenu = environment.baseUrl + '/rest/menu/registrar';

  constructor(private http: HttpClient) { }


  menuRol(codRol: String) {
    let filtro = {
      sCodRol: codRol
    }
    return this.http.post<IDataResponse>(this.urlMenuRol, JSON.stringify(filtro), this.options);
  }


  menuRolCompleto(codRol: String) {
    let filtro = {
      sCodRol: codRol
    }
    return this.http.post<IDataResponse>(this.urlMenuRolCompleto, JSON.stringify(filtro), this.options);
  }

  actualizarMenu(oMenu: any) {
    return this.http.post<IDataResponse>(this.urlActualizarMenu, JSON.stringify(oMenu), this.options);
  }
}
