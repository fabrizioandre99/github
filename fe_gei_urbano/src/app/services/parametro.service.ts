import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarTipos = environment.baseUrl + '/rest/parametro/listarTipos';
  urlListarPorTipo = environment.baseUrl + '/rest/parametro/listarPorTipo';
  urlListarActivosPorTipo = environment.baseUrl + '/rest/parametro/listarActivosPorTipo';
  urlEliminarParametro = environment.baseUrl + '/rest/parametro/eliminar';
  urlRegOActualParametro = environment.baseUrl + '/rest/parametro/registrar';
  urlObtenerParametro = environment.baseUrl + '/rest/parametro/obtenerParametro';

  constructor(private http: HttpClient) { }

  listarTipos() {
    return this.http.post<IDataResponse>(this.urlListarTipos, '', this.options);
  }

  listarPorTipo(tipo: String) {
    let filtro = {
      sTipo: tipo
    }
    return this.http.post<IDataResponse>(this.urlListarPorTipo, JSON.stringify(filtro), this.options);
  }

  listarActivosPorTipo(tipo: String) {
    let filtro = {
      sTipo: tipo
    }
    return this.http.post<IDataResponse>(this.urlListarActivosPorTipo, JSON.stringify(filtro), this.options);
  }

  eliminarParametro(idParametro: Number) {
    let filtro = {
      nIdParametro: idParametro
    }
    return this.http.post<IDataResponse>(this.urlEliminarParametro, JSON.stringify(filtro), this.options);
  }

  regOActualParametro(oParametro: any) {
    console.log('oParametro', oParametro);
    return this.http.post<IDataResponse>(this.urlRegOActualParametro, JSON.stringify(oParametro), this.options);
  }


  obtenerParametro(tipo: String, codigo: String) {
    let filtro = {
      sTipo: tipo,
      sCodigo: codigo
    }
    return this.http.post<IDataResponse>(this.urlObtenerParametro, JSON.stringify(filtro), this.options);
  }

}
