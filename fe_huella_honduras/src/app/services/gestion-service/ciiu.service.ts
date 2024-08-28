import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class CiiuService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarCIIU = environment.baseUrl + '/rest/gestion/ciiu/v1/listar';
  urlListarPeriodoFinalizado = environment.baseUrl + '/rest/gestion/ciiu/v1/listarPeriodoFinalizado';
  urlListarTotalInstitciones = environment.baseUrl + '/rest/gestion/ciiu/v1/listarTotalInstitciones';

  constructor(private http: HttpClient) { }

  listarCIIU(idSesion: any) {
    let filtro = {
      nIdSesion: idSesion
    };
   
    return this.http.post<IDataResponse>(this.urlListarCIIU, JSON.stringify(filtro), this.options);
  }

  listarPeriodoFinalizado() {
    return this.http.post<IDataResponse>(this.urlListarPeriodoFinalizado, '', this.options);
  }

  listarTotalInstitciones() {
    return this.http.post<IDataResponse>(this.urlListarTotalInstitciones, '', this.options);
  }
}
