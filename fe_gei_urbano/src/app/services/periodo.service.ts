import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { fileURLToPath } from 'url';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {


  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPeriodo = environment.baseUrl + '/rest/periodo/listar';
  urlListarPeriodoConEmg = environment.baseUrl + '/rest/periodo/listarConEmisiones';
  urlRegistrarPeriodo = environment.baseUrl + '/rest/periodo/registrar';
  urlEliminarPeriodo = environment.baseUrl + '/rest/periodo/eliminar';
  urlCambiarEstadoPeriodo = environment.baseUrl + '/rest/periodo/cambiarEstado';
  constructor(private http: HttpClient) { }


  listarPeriodo() {
    return this.http.post<IDataResponse>(this.urlListarPeriodo, '', this.options);
  }

  listarPeriodoConEmg() {
    return this.http.post<IDataResponse>(this.urlListarPeriodoConEmg, '', this.options);
  }

  registrarPeriodo(oPeriodo: any) {   
    return this.http.post<IDataResponse>(this.urlRegistrarPeriodo, JSON.stringify(oPeriodo), this.options);
  }

  eliminarPeriodo(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlEliminarPeriodo, JSON.stringify(filtro), this.options);
  }

  cambiarEstado( oPeriodo: any, nEstado: any) {
    let filtro = {
      nIdPeriodo: oPeriodo.nIdPeriodo,
      nEstadoPeriodo: nEstado,
      bdProgreso: oPeriodo.bdProgreso
    }
    return this.http.post<IDataResponse>(this.urlCambiarEstadoPeriodo, JSON.stringify(filtro), this.options);
  }

}
