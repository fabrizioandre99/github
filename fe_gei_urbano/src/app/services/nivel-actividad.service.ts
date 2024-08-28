import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class NivelActividadService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarNivelActividad = environment.baseUrl + '/rest/nivelActividad/listar';
  urlRegistrarNivelActividad = environment.baseUrl + '/rest/nivelActividad/registrar';
  urlEliminarNivelActividad = environment.baseUrl + '/rest/nivelActividad/eliminar';
  urlListarVehiculosNoINS = environment.baseUrl + '/rest/nivelActividad/listarInactivos';
  urlDescargarFormato = environment.baseUrl + '/rest/nivelActividad/descargarFormato';
  urlCargaMasiva = environment.baseUrl + '/rest/nivelActividad/cargaMasiva';
  urlRegistroMasivoDefecto = environment.baseUrl + '/rest/nivelActividad/cargaMasivaDefecto';
  constructor(private http: HttpClient) { }

  listarNivelActividad(idPeriodo: number, codMes: string, idRuta: number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      sCodMes: codMes,
      oVehiculo: {
        oRuta: {
          nIdRuta: idRuta
        }
      }
    }
    return this.http.post<IDataResponse>(this.urlListarNivelActividad, JSON.stringify(filtro), this.options);
  }

  registrarNivelActividad(oNivelActividad: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarNivelActividad, JSON.stringify(oNivelActividad), this.options);
  }

  registrarNaMasivoDefecto(oNivelActividad: any) {
    return this.http.post<IDataResponse>(this.urlRegistroMasivoDefecto, JSON.stringify(oNivelActividad), this.options);
  }

  eliminarNivelActividad(lstNA: any[]) {
  
    return this.http.post<IDataResponse>(this.urlEliminarNivelActividad, JSON.stringify(lstNA), this.options);
  }

  listarVehiculosNoINS(idRuta: number,lstVehiculos:any[]) {
    let filtro = {
      nIdRuta: idRuta,
      liIdVehiculos:lstVehiculos
    }
    return this.http.post<IDataResponse>(this.urlListarVehiculosNoINS, JSON.stringify(filtro), this.options);
  }

  descargarFormato(oNa: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.urlDescargarFormato, JSON.stringify(oNa), {
      headers: headers,
      responseType: 'blob'
    })
  }

  cargaMasiva(mfXlsxNa: File, oNa: any) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfXlsxNa', mfXlsxNa);
    formData.append('oNa', new Blob([JSON.stringify(oNa)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    return this.http.post<IDataResponse>(this.urlCargaMasiva, formData, { headers });
  }

}
