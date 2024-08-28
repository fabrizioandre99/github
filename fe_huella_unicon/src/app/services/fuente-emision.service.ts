import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FuenteEmisionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarFuenteEmision = environment.baseUrl + '/rest/fuenteEmision/listar';
  urlListarPorFactor = environment.baseUrl + '/rest/fuenteEmision/listarPorFactor';

  constructor(private http: HttpClient) { }

  listarFuenteEmision() {
    return this.http.post<IDataResponse>(this.urlListarFuenteEmision, '', this.options);
  }

  listarPorFactor(anio: Number) {
    let filtro = {
      nAnio: anio
    }
    return this.http.post<IDataResponse>(this.urlListarPorFactor, JSON.stringify(filtro), this.options);
  }
}
