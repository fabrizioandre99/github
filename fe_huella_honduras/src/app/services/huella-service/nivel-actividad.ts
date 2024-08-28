import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { INivelActividad } from '../../models/nivelActividad';

@Injectable({
  providedIn: 'root'
})
export class NivelActividadService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarNivelActividad = environment.baseUrl + '/rest/huella/nivel-actividad/v1/listar';
  urlRegistrarNivelActividad = environment.baseUrl + '/rest/huella/nivel-actividad/v1/registrarNivelActividad';
  urlRegistrarPersonalizado = environment.baseUrl + '/rest/huella/nivel-actividad/v1/registrarPersonalizado';
  urlEliminarNivelActividad = environment.baseUrl + '/rest/huella/nivel-actividad/v1/eliminar';

  constructor(private http: HttpClient) { }

  listarNivelActividad(oNivelActividad: INivelActividad) {
    console.log('oNivelActividad', oNivelActividad);
    return this.http.post<IDataResponse>(this.urlListarNivelActividad, JSON.stringify(oNivelActividad), this.options);
  }

  registrarNivelActividad(mfDocumento: File, oNivelActividad: INivelActividad) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    formData.append('oNivelActividad', new Blob([JSON.stringify(oNivelActividad)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    console.log(mfDocumento);
    console.log(oNivelActividad);
    return this.http.post<IDataResponse>(this.urlRegistrarNivelActividad, formData, { headers });
  }

  registrarPersonalizado(mfDocumento: File, oEmision: INivelActividad) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    formData.append('oEmision', new Blob([JSON.stringify(oEmision)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');


    console.log(this.urlRegistrarPersonalizado);
    return this.http.post<IDataResponse>(this.urlRegistrarPersonalizado, formData, { headers });
  }


  eliminarNivelActividad(oNivelActividad: INivelActividad) {
    return this.http.post<IDataResponse>(this.urlEliminarNivelActividad, JSON.stringify(oNivelActividad), this.options);
  }
}
