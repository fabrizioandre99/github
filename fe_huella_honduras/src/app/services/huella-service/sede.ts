import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IUsuario } from '../../models/usuario';
import { ISede } from '../../models/SEDE';

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarSede = environment.baseUrl + '/rest/huella/sede/v1/listar';
  urlListarNoReportadas = environment.baseUrl + '/rest/huella/sede/v1/listarNoReportadas';
  urlRegistrarSede = environment.baseUrl + '/rest/huella/sede/v1/registrar';
  urlRegistrarNoReportadas = environment.baseUrl + '/rest/huella/sede/v1/registrarNoReportadas';
  urlEliminarSede = environment.baseUrl + '/rest/huella/sede/v1/eliminar';

  constructor(private http: HttpClient) { }

  listarSede(oSede: ISede) {
    console.log('oSede', oSede);
    return this.http.post<IDataResponse>(this.urlListarSede, JSON.stringify(oSede), this.options);
  }

  listarNoReportadas(oSede: ISede) {
    console.log('oSede', oSede);
    return this.http.post<IDataResponse>(this.urlListarNoReportadas, JSON.stringify(oSede), this.options);
  }

  registrarSede(oSede: ISede) {
    console.log('oSede', oSede);
    return this.http.post<IDataResponse>(this.urlRegistrarSede, JSON.stringify(oSede), this.options);
  }

  registrarNoReportadas(oSede: ISede[]) {
    console.log('oSede', oSede);
    return this.http.post<IDataResponse>(this.urlRegistrarNoReportadas, JSON.stringify(oSede), this.options);
  }

  eliminarSede(oSede: ISede) {
    console.log('oSede', oSede);
    return this.http.post<IDataResponse>(this.urlEliminarSede, JSON.stringify(oSede), this.options);
  }
}
