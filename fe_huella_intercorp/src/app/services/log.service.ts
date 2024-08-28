import { Injectable } from '@angular/core';
import { IDataResponse } from '../models/IDataResponse';
import { environment } from 'src/environments/environment';
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

  listarLog(codEmpresa: String, fechaInicio: String, fechaFin: String) {
    let filtro = {
      oEmpresa: {
        sCodEmpresa: codEmpresa
      },
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin
    }
    return this.http.post<IDataResponse>(this.urlListarLog, JSON.stringify(filtro), this.options);
  }
}
