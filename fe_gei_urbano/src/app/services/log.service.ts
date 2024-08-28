import { Injectable } from '@angular/core';
import { IDataResponse } from '../models/IDataResponse';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarLog = environment.baseUrl + '/rest/log/listar';

  constructor(private http: HttpClient) { }

  listarLog(fechaInicio: String, fechaFin: String) {
    let filtro = {
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin
    }

    console.log('filtro', filtro);
    return this.http.post<IDataResponse>(this.urlListarLog, JSON.stringify(filtro), this.options);
  }
}
