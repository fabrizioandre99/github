import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { IAutenticacion } from '../models/autenticacion';
import { ILog } from '../models/log';


@Injectable({
  providedIn: 'root'
})
export class LogService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarLog = environment.baseUrl + '/rest/bitacora/v1/listar';

  constructor(private http: HttpClient) { }

  listarLog(oLog: ILog) {
    console.log('oLog', oLog);
    return this.http.post<IDataResponse>(this.urlListarLog, JSON.stringify(oLog), this.options);
  }

}
