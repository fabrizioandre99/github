import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class EmisionGeiService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  constructor(private http: HttpClient) { }

  urlListarResultado = environment.baseUrl + '/rest/emision-gei/listarResultado';
  urlListarBiomasa = environment.baseUrl + '/rest/emision-gei/listarBiomasa';


  listarResultado(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    //console.log('filtro listarResultado', filtro);
    return this.http.post<IDataResponse>(this.urlListarResultado, JSON.stringify(filtro), this.options);
  }

  listarBiomasa(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarBiomasa, JSON.stringify(filtro), this.options);
  }

}
