import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class ReconocimientoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarReconocimiento = environment.baseUrl + '/rest/huella/reconocimiento/v1/listar';

  constructor(private http: HttpClient) { }

  listarReconocimiento() {
    return this.http.post<IDataResponse>(this.urlListarReconocimiento, '', this.options);
  }

}
