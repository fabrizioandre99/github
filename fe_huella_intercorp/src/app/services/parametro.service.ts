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

  urlListarParametro = environment.baseUrl + '/rest/parametro/listar';
  urlListarValor = environment.baseUrl + '/rest/parametro/listarValor';

  constructor(private http: HttpClient) { }

  listarParametro(tipo: String) {
    let filtro = {
      sTipo: tipo
    }
    return this.http.post<IDataResponse>(this.urlListarParametro, JSON.stringify(filtro), this.options);
  }

  listarValor() {
    let filtro = {
      sTipo: "ARCHIVO",
      sCodigo: "TAMANIO"
    }
    return this.http.post<IDataResponse>(this.urlListarValor, JSON.stringify(filtro), this.options);
  }


}
