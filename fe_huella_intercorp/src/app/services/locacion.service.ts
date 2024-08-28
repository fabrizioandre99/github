import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class LocacionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlInsertOActual = environment.baseUrl + '/rest/locacion/registrar';
  urlActualizarEstado = environment.baseUrl + '/rest/locacion/actualizarEstado';
  urlListarLocacion = environment.baseUrl + '/rest/locacion/listar';
  urlEliminarLocacion = environment.baseUrl + '/rest/locacion/eliminar';
  urlListarDetalle = environment.baseUrl + '/rest/locacion/listarDetalle';
  urlRegDetalleLocacion = environment.baseUrl + '/rest/locacion/registrarDetalleLocacion';
  urlActDetalleLocacion = environment.baseUrl + '/rest/locacion/actualizarDetalleLocacion';
  urlListarActivos = environment.baseUrl + '/rest/locacion/listarActivos';
  urlListarInactivas = environment.baseUrl + '/rest/locacion/listarInactivas';
  urlListarByPeriodo = environment.baseUrl + '/rest/locacion/listarByPeriodo';

  constructor(private http: HttpClient) { }

  insertOActual(idLocacion: Number, empresa: any, nombre: String, ubicacion: String) {
    let filtro = {
      nIdLocacion: idLocacion,
      oEmpresa: {
        nIdEmpresa: empresa,
      },
      sNombre: nombre,
      sUbicacion: ubicacion,
      liPeriodo: []
    }
    return this.http.post<IDataResponse>(this.urlInsertOActual, JSON.stringify(filtro), this.options);
  }

  actualizarEstado(idLocacion: Number, codEstado: Boolean) {
    let filtro = {
      nIdDetalleLocacion: idLocacion,
      boCodEstado: codEstado
    }
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(filtro), this.options);
  }

  listarLocacion(idEmpresa: any) {
    let filtro = {
      nIdEmpresa: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarLocacion, JSON.stringify(filtro), this.options);
  }

  eliminarLocacion(idLocacion: any) {
    let filtro = {
      nIdLocacion: idLocacion
    }
    return this.http.post<IDataResponse>(this.urlEliminarLocacion, JSON.stringify(filtro), this.options);
  }

  listarDetalle(idPeriodo: any) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarDetalle, JSON.stringify(filtro), this.options);
  }

  regDetalleLocacion(oDetalleLocacion: any) {
    return this.http.post<IDataResponse>(this.urlRegDetalleLocacion, JSON.stringify(oDetalleLocacion), this.options);
  }

  actDetalleLocacioncacion(oLocacion: any) {
    return this.http.post<IDataResponse>(this.urlActDetalleLocacion, JSON.stringify(oLocacion), this.options);
  }

  listarActivos(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarActivos, JSON.stringify(filtro), this.options);
  }

  listarInactivas(idEmpresa: Number) {
    let filtro = {
      nIdPeriodo: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarInactivas, JSON.stringify(filtro), this.options);
  }

  listarByPeriodo(idPeriodo: any) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarByPeriodo, JSON.stringify(filtro), this.options);
  }
}

