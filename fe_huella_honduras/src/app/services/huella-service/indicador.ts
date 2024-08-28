import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IPeriodo } from '../../models/periodo';
import { iIndicador } from '../../models/indicador';

@Injectable({
  providedIn: 'root'
})
export class IndicadorService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarIndicador = environment.baseUrl + '/rest/huella/indicador/v1/listar';
  urlRegistrarIndicador = environment.baseUrl + '/rest/huella/indicador/v1/registrar';
  urlActualizarEstado = environment.baseUrl + '/rest/huella/indicador/v1/actualizarEstado';

  constructor(private http: HttpClient) { }

  listarIndicador(oIndicador: any) {
    console.log('oIndicador', oIndicador);
    return this.http.post<IDataResponse>(this.urlListarIndicador, JSON.stringify(oIndicador), this.options);
  }

  registrarIndicador(oIndicador: iIndicador) {
    console.log('oIndicador', oIndicador);
    return this.http.post<IDataResponse>(this.urlRegistrarIndicador, JSON.stringify(oIndicador), this.options);
  }

  actualizarEstado(oIndicador: iIndicador) {
    console.log('oIndicador', oIndicador);
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(oIndicador), this.options);
  }
}
