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

  constructor(private http: HttpClient) { }

  listarFuenteEmision() {
    return this.http.post<IDataResponse>(this.urlListarFuenteEmision, '', this.options);
  }
}