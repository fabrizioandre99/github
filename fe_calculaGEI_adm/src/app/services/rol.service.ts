import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarRol = '/rest/administrativo/rol/listar';

  constructor(private http: HttpClient) { }

  listarRol() {
    return this.http.post<IDataResponse>(this.urlListarRol, '', this.options);
  }
}
