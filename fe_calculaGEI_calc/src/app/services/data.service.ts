import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarSector = environment.baseUrl + '/rest/calculadora/sector/listar';
  urlListarProveedor = environment.baseUrl + '/rest/calculadora/proveedor/listar';
  urlListarEmision = environment.baseUrl + '/rest/calculadora/emision/listar';
  urlInsertarCliente = environment.baseUrl + '/rest/calculadora/cliente/insertar';
  urlEnviarEmision = environment.baseUrl + '/rest/calculadora/emision/enviar';

  constructor(private http: HttpClient) { }

  listarSector() {
    return this.http.post<IDataResponse>(this.urlListarSector, this.options);
  }

  listarProveedor() {
    let filtro = {
      nombre: ""
    };
    return this.http.post<IDataResponse>(this.urlListarProveedor, JSON.stringify(filtro), this.options);
  }

  listarEmision(idCliente: any) {
    let filtro = {
      id_cliente: idCliente
    };
    return this.http.post<IDataResponse>(this.urlListarEmision, JSON.stringify(filtro), this.options);
  }

  InsertarCliente(jsonParam: any) {
    let filtro = jsonParam;
    return this.http.post<IDataResponse>(this.urlInsertarCliente, JSON.stringify(filtro), this.options);
  }

  EnviarEmision(file: any) {
    const formData = new FormData;
    formData.append('file', file);
    return this.http.post<IDataResponse>(this.urlEnviarEmision + '?id_emision_gei=15', formData);
  }
}
