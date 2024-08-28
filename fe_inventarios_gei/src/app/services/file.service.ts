

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlUploadFile = environment.baseUrl + '/rest/alfresco/upload';
  urlUpdatedFile = environment.baseUrl + '/rest/alfresco/update?UUIDCodigo=';
  urlCargarArchivo = environment.baseUrl + '/rest/alfresco/upload';
  urlDownloadFile = environment.baseUrl + '/rest/alfresco/download?UUIDCodigo=';

  constructor(private http: HttpClient) { }

  uploadFile(file: File) {
    const formData = new FormData;
    formData.append('archivo', file);
    //console.log('Filtro - Subir Archivo:', file);
    return this.http.post<IDataResponse>(this.urlUploadFile, formData);
  }

  updatedFile(file: File, param: String) {
    const formData = new FormData;
    formData.append('archivo', file);
    //console.log('Filtro - Actualizar Archivo:', this.urlUpdatedFile + param, formData);

    return this.http.post<IDataResponse>(this.urlUpdatedFile + param, formData);
  }

  downloadFile(param: String) {
    //console.log('Filtro - Descargar Archivo:', param);
    return this.http.post(this.urlDownloadFile + param, "", { responseType: 'arraybuffer' });
  }

}
