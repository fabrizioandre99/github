import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlABM_ListarTipoParam = environment.baseUrl + '/rest/parametro/ABM_listarPorTipoParametro';
  urlListarTipoParam = environment.baseUrl + '/rest/parametro/listarTipoParam';
  urlListarPorTipoParam = environment.baseUrl + '/rest/parametro/listarPorTipoParam';
  urlEliminarParametro = environment.baseUrl + '/rest/parametro/eliminar';
  urlRegOActualParametro = environment.baseUrl + '/rest/parametro/registrar';
  urlObtenerPorTipo = environment.baseUrl + '/rest/parametro/obtenerPorTipoParam';

  constructor(private http: HttpClient) { }

  listarABM_TipoParam(tipoParam: String) {
    let filtro = {
      sTipoParam: tipoParam
    }
    return this.http.post<IDataResponse>(this.urlABM_ListarTipoParam, JSON.stringify(filtro), this.options);
  }

  listarTipoParam() {
    return this.http.post<IDataResponse>(this.urlListarTipoParam, '', this.options);
  }

  listarPorTipoParam(tipoParam: String) {
    let filtro = {
      sTipoParam: tipoParam
    }
    return this.http.post<IDataResponse>(this.urlListarPorTipoParam, JSON.stringify(filtro), this.options);
  }

  regOActualParametro(oParametro: any) {
    return this.http.post<IDataResponse>(this.urlRegOActualParametro, JSON.stringify(oParametro), this.options);
  }

  eliminarParametro(idParametro: Number) {
    let filtro = {
      nIdParametro: idParametro
    }
    return this.http.post<IDataResponse>(this.urlEliminarParametro, JSON.stringify(filtro), this.options);
  }

  obtenerPorTipo(tipo: String, codigo: String) {
    let filtro = {
      sTipo: tipo,
      sCodigo: codigo
    }
    return this.http.post<IDataResponse>(this.urlObtenerPorTipo, JSON.stringify(filtro), this.options);
  }

}
