import { Injectable } from '@angular/core';
import { IDataResponse } from '../models/IDataResponse';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPorRol = environment.baseUrl + '/rest/menu/listarPorRol';
  urlActualizarEstado = environment.baseUrl + '/rest/menu/actualizarEstado';

  constructor(private http: HttpClient) { }


  listarPorRol(codRol: String) {
    let filtro = {
      sCodRol: codRol
    }
    return this.http.post<IDataResponse>(this.urlListarPorRol, JSON.stringify(filtro), this.options);
  }

  actualizarEstado(oMenujson: any) {
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(oMenujson), this.options);
  }
}
