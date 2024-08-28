import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class DistanciaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPorTipo = environment.baseUrl + '/rest/distancia/listarPorTipo';
  urlRegOEdit = environment.baseUrl + '/rest/distancia/registrar';
  urlEliminarDistancia = environment.baseUrl + '/rest/distancia/eliminar';

  constructor(private http: HttpClient) { }

  listarPorTipo(tipoRecorrido: String) {
    let filtro = {
      sTipoRecorrido: tipoRecorrido
    }
    return this.http.post<IDataResponse>(this.urlListarPorTipo, JSON.stringify(filtro), this.options);
  }

  regOEdit(oDistancia: any) {
    return this.http.post<IDataResponse>(this.urlRegOEdit, JSON.stringify(oDistancia), this.options);
  }

  eliminarDistancia(idDistancia: Number) {
    let filtro = {
      nIdDistancia: idDistancia
    }
    return this.http.post<IDataResponse>(this.urlEliminarDistancia, JSON.stringify(filtro), this.options);
  }

}
