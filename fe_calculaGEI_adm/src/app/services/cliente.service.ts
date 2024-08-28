import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  optionsFile = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'blob' as 'json'
  }

  urlListarCliente = '/rest/administrativo/cliente/listar';
  urlEmision = '/rest/administrativo/cliente/emision';
  urlEliminarCliente = '/rest/administrativo/cliente/eliminar';
  urlDescargarFormato = '/rest/administrativo/cliente/descargar';

  constructor(private http: HttpClient) { }

  listarCliente(fechaInicio: String, fechaFin: String) {
    let filtro = {
      FechaInicio: fechaInicio,
      FechaFin: fechaFin
    };
    return this.http.post<IDataResponse>(this.urlListarCliente, JSON.stringify(filtro), this.options);
  }

  descargarFormato(fechaInicio: String, fechaFin: String) {
    let filtro = {
      FechaInicio: fechaInicio,
      FechaFin: fechaFin
    };
    return this.http.post(this.urlDescargarFormato, JSON.stringify(filtro), this.optionsFile);
  }

  eliminarCliente(idCliente: Number, idUsuario: String) {
    let filtro = {
      nIdCliente: idCliente,
      nIdUsuario: idUsuario
    };
    return this.http.post<IDataResponse>(this.urlEliminarCliente, JSON.stringify(filtro), this.options);
  }

  emision(idCliente: Number) {
    let filtro = {
      nIdCliente: idCliente
    };
    return this.http.post<IDataResponse>(this.urlEmision, JSON.stringify(filtro), this.options);
  }
}
