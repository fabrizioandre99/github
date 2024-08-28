import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPeriodo = environment.baseUrl + '/rest/periodo/listar';
  urlListarIncertidumbreXFuente = environment.baseUrl + '/rest/periodo/incertidumbreXFuente';
  urlRegistraroActualizar = environment.baseUrl + '/rest/periodo/registrar';
  urlRegistrarIncertidumbre = environment.baseUrl + '/rest/periodo/registrarIncertidumbre';
  urlFinalizaroReiniciar = environment.baseUrl + '/rest/periodo/actualizar';
  urlResultadoGEI = environment.baseUrl + '/rest/periodo/resultadoGEI';
  urlObservar = environment.baseUrl + '/rest/periodo/observar';
  urlObtenerObservar = environment.baseUrl + '/rest/periodo/obtenerObservacion';

  constructor(private http: HttpClient) { }

  listarPeriodo() {
    return this.http.post<IDataResponse>(this.urlListarPeriodo, '', this.options);
  }

  listarIncertidumbreXFuente(idPeriodo: any) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarIncertidumbreXFuente, JSON.stringify(filtro), this.options);
  }

  registraroActualizar(idPeriodo: any, anio: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      nAnio: anio
    }
    return this.http.post<IDataResponse>(this.urlRegistraroActualizar, JSON.stringify(filtro), this.options);
  }


  registrarIncertidumbre(oIncertidumbre: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarIncertidumbre, JSON.stringify(oIncertidumbre), this.options);
  }

  resultadoGEI(idPeriodo: Number, codMes: Number, idLocacion: Number, idUnidadNegocio: Number,
    codEmpresa: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      sCodMes: codMes,
      oLocacion: {
        nIdLocacion: idLocacion
      },
      oUnidadNegocio: {
        nIdUnidadNegocio: idUnidadNegocio
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlResultadoGEI, JSON.stringify(filtro), this.options);
  }

  finalizaroReiniciar(idPeriodo: Number, codEstado: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      nCodEstado: codEstado
    }
    return this.http.post<IDataResponse>(this.urlFinalizaroReiniciar, JSON.stringify(filtro), this.options);
  }

  registrarObservacion(idPeriodo: Number, fileObservar: File,
    observacion: String) {

    const headers = new HttpHeaders();

    let filtro = {
      nIdPeriodo: idPeriodo,
      sObservacion: observacion
    }

    const formData = new FormData();

    if (fileObservar) {
      formData.append('mfXlxPeriodo', fileObservar);
    } else {
      formData.append('mfXlxPeriodo', new Blob(), 'emptyFile');
    }

    formData.append('oPeriodo', new Blob([JSON.stringify(filtro)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data'); // añadir el tipo de media
    return this.http.post<IDataResponse>(this.urlObservar, formData, { headers });
  }

  obtenerObservar(idPeriodo: any) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlObtenerObservar, JSON.stringify(filtro), this.options);
  }
}
