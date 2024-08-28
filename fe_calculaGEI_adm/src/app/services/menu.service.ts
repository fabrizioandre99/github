import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { EventEmitter, Output } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class MenuService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarMenu = '/rest/administrativo/menu/listar';
  urlListarActivos = '/rest/administrativo/menu/listarActivos';
  urlActualizarMenu = '/rest/administrativo/menu-rol/actualizar';

  @Output() disparadorDeListado: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) { }

  listarMenu(idRol: Number) {
    let filtro = {
      nIdRol: idRol
    }
    return this.http.post<IDataResponse>(this.urlListarMenu, JSON.stringify(filtro), this.options);
  }

  listarActivos(idRol: any) {
    let filtro = {
      nIdRol: idRol
    }
    //console.log('listarActivos', filtro);
    return this.http.post<IDataResponse>(this.urlListarActivos, JSON.stringify(filtro), this.options);
  }

  actualizarMenu(oMenujson: any) {
    return this.http.post<IDataResponse>(this.urlActualizarMenu, JSON.stringify(oMenujson), this.options);
  }
}
