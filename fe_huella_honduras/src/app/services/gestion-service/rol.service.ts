import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IUsuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  urlListar = environment.baseUrl + '/rest/gestion/rol/v1/listar'; 
  urlListarPorTipo = environment.baseUrl + '/rest/gestion/rol/v1/listarPorTipo';


  constructor(private http: HttpClient) { }

  listarRoles() {
    return this.http.post<IDataResponse>(this.urlListar, null, this.options);
  }

  listarRolesPorTipo(sTipoRol: string) {
    let filtro = {
      sTipoRol: sTipoRol
    };
    return this.http.post<IDataResponse>(this.urlListarPorTipo, JSON.stringify(filtro), this.options);
  }

}
