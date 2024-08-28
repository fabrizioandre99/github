import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlRegistrarEvidencia = environment.baseUrl + '/rest/evidencia/registrar';
  urlListarEvidencia = environment.baseUrl + '/rest/evidencia/listar';
  urlEliminarEvidencia = environment.baseUrl + '/rest/evidencia/eliminar';

  constructor(private http: HttpClient) { }

  registrarEvidencia(mfDocumento: File, idNivelActividad: Number) {
    const headers = new HttpHeaders();
    let filtro = {
      oNivelActividad: {
        nIdNivelActividad: idNivelActividad
      }
    }

    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    formData.append('oEvidencia', new Blob([JSON.stringify(filtro)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data'); // añadir el tipo de media

    return this.http.post<IDataResponse>(this.urlRegistrarEvidencia, formData, { headers });
  }

  listarEvidencia(idNivelActividad: Number) {
    let filtro = {
      nIdNivelActividad: idNivelActividad
    }
    return this.http.post<IDataResponse>(this.urlListarEvidencia, JSON.stringify(filtro), this.options);
  }

  eliminarEvidencia(idEvidencia: Number) {
    let filtro = {
      nIdEvidencia: idEvidencia
    }
    return this.http.post<IDataResponse>(this.urlEliminarEvidencia, JSON.stringify(filtro), this.options);
  }

}
