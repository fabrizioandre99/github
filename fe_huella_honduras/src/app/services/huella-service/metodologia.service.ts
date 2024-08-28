import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class MetodologiaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlValidarMetodologia = environment.baseUrl + '/rest/huella/metodologia/v1/validar';
  
  constructor(private http: HttpClient) { }

  validarMetodologia() {
    return this.http.post<IDataResponse>(this.urlValidarMetodologia, null, this.options);
  }

}
