import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class UnidadNegocioService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarUnidadNegocio = environment.baseUrl + '/rest/unidadNegocio/listar';
  urlListarUnidadNegocioPadre = environment.baseUrl + '/rest/unidadNegocio/listarPadre';
  urlListarUnNegocioABM = environment.baseUrl + '/rest/unidadNegocio/listarABM';
  urlUnNegocioRegistrar = environment.baseUrl + '/rest/unidadNegocio/registrar';
  urlUnNegocioEliminar = environment.baseUrl + '/rest/unidadNegocio/eliminar';
  urlListarByDistribucion = environment.baseUrl + '/rest/unidadNegocio/listarByDistribucion';

  constructor(private http: HttpClient) { }

  listarUnidadNegocio() {
    return this.http.post<IDataResponse>(this.urlListarUnidadNegocio, '', this.options);
  }

  listarUnidadNegocioPadre() {
    return this.http.post<IDataResponse>(this.urlListarUnidadNegocioPadre, '', this.options);
  }

  listarUnNegocioABM(idPadre: Number) {
    let filtro = {
      nIdPadre: idPadre
    }
    return this.http.post<IDataResponse>(this.urlListarUnNegocioABM, JSON.stringify(filtro), this.options);
  }


  registrarUnNegocioABM(idUnidadNegocio: Number, nombre: String, idPadre: Number, codEstado: Boolean, nombreModificado: Boolean) {
    let filtro = {
      nIdUnidadNegocio: idUnidadNegocio,
      sNombre: nombre,
      nIdPadre: idPadre,
      boCodEstado: codEstado,
      boNombreModificado: nombreModificado
    }

    //console.log('registrarUnNegocioABM', filtro);
    return this.http.post<IDataResponse>(this.urlUnNegocioRegistrar, JSON.stringify(filtro), this.options);
  }

  eliminarUnNegocio(idUnidadNegocio: Number) {
    let filtro = {
      nIdUnidadNegocio: idUnidadNegocio
    }
    return this.http.post<IDataResponse>(this.urlUnNegocioEliminar, JSON.stringify(filtro), this.options);
  }

  listarByDistribucion(idPeriodo: Number, codMes: Number, codEmpresa: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarByDistribucion, JSON.stringify(filtro), this.options);
  }
}
