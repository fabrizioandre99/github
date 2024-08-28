import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IDataResponse } from '../../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FuenteEmisionMtoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarFuenteEmisionMto = environment.baseUrl + '/rest/huella/fuente/v1/listarFuenteEmision';
  urlActualizarFuenteEmisionMto = environment.baseUrl + '/rest/huella/fuente/v1/actualizarFuente';

  constructor(private http: HttpClient) { }

  listarFuenteEmision() {
    return this.http.post<IDataResponse>(this.urlListarFuenteEmisionMto, "", this.options);
  }

  actualizarFuenteEmision(mfFormato: File, oFuente: any) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfFormato', mfFormato);
    formData.append('oFuente', new Blob([JSON.stringify(oFuente)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    console.log(mfFormato);
    console.log(oFuente);
    return this.http.post<IDataResponse>(this.urlActualizarFuenteEmisionMto, formData, { headers });
  }
}
