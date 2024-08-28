import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { iArchivo } from '../../models/archivo';

@Injectable({
  providedIn: 'root'
})
export class ArchivoConfigService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListar = environment.baseUrl + '/rest/configuracion/documento/v1/listar';
  urlActualizar = environment.baseUrl + '/rest/configuracion/documento/v1/actualizar';

  constructor(private http: HttpClient) { }

  listar(oArchivo: iArchivo) {
    return this.http.post<IDataResponse>(this.urlListar, JSON.stringify(oArchivo), this.options);
  }

  actualizar(mfDocumento: File, oDocumento: iArchivo) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    formData.append('oDocumento', new Blob([JSON.stringify(oDocumento)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    console.log('mfDocumento', mfDocumento);
    console.log('oArchivo', oDocumento);
    return this.http.post<IDataResponse>(this.urlActualizar, formData, { headers });
  }

}
