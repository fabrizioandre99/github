import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IPeriodo } from '../../models/periodo';
import { iCambioPeriodo } from '../../models/cambioPeriodo';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPeriodo = environment.baseUrl + '/rest/huella/periodo/v1/listar';
  urlRegistrarPeriodo = environment.baseUrl + '/rest/huella/periodo/v1/registrar';
  urlReaperturarPeriodo = environment.baseUrl + '/rest/huella/periodo/v1/reaperturar';
  urlSolicitarCambio = environment.baseUrl + '/rest/huella/periodo/v1/registrarCambio';
  urlCambiarEstadoReporte = environment.baseUrl + '/rest/huella/periodo/v1/cambiarEstadoReporte';
  urlCambiarAnioBase = environment.baseUrl + '/rest/huella/periodo/v1/cambiarAnioBase';
  urlCompletarPerido = environment.baseUrl + '/rest/huella/periodo/v1/completarPeriodo';
  urlListarHuellaOrganizacional = environment.baseUrl + '/rest/huella/periodo/v1/listarHuellaOrganizacional';
  urlListarReporteGei = environment.baseUrl + '/rest/huella/periodo/v1/listarReporteGei';
  urlListarFinalizados = environment.baseUrl + '/rest/huella/periodo/v1/listarFinalizados';
  urlValidarAnioReduccion = environment.baseUrl + '/rest/huella/periodo/v1/validarAnioReduccion';
  urlEliminarPeriodo = environment.baseUrl + '/rest/huella/periodo/v1/eliminar';

  constructor(private http: HttpClient) { }

  listarPeriodo() {
    return this.http.post<IDataResponse>(this.urlListarPeriodo, null, this.options);
  }

  registrarPerido(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlRegistrarPeriodo, JSON.stringify(oPeriodo), this.options);
  }

  reaperturarPeriodo(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlReaperturarPeriodo, JSON.stringify(oPeriodo), this.options);
  }

  solicitarCambio(oCambioPeriodo: iCambioPeriodo) {
    return this.http.post<IDataResponse>(this.urlSolicitarCambio, JSON.stringify(oCambioPeriodo), this.options);
  }

  cambiarEstadoReporte(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlCambiarEstadoReporte, JSON.stringify(oPeriodo), this.options);
  }

  cambiarAnioBase(oCambioPeriodo: iCambioPeriodo) {
    return this.http.post<IDataResponse>(this.urlCambiarAnioBase, JSON.stringify(oCambioPeriodo), this.options);
  }

  completarPeriodo(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlCompletarPerido, JSON.stringify(oPeriodo), this.options);
  }

  listarHuellaOrganizacional(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarHuellaOrganizacional, JSON.stringify(oPeriodo), this.options);
  }

  listarReporteGei(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarReporteGei, JSON.stringify(oPeriodo), this.options);
  }

  listarFinalizados(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarFinalizados, JSON.stringify(oPeriodo), this.options);
  }

  validarAnioReduccion(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlValidarAnioReduccion, JSON.stringify(oPeriodo), this.options);
  }

  eliminarPeriodo(oPeriodo: IPeriodo) {
    return this.http.post<IDataResponse>(this.urlEliminarPeriodo, JSON.stringify(oPeriodo), this.options);
  }
}


