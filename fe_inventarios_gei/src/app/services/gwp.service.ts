import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class GwpService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarPotencial = environment.baseUrl + '/rest/potencial/listar';
  urlActualizarPotencial = environment.baseUrl + '/rest/potencial/actualizar';

  constructor(private http: HttpClient) { }

  listarPotencial() {
    return this.http.post<IDataResponse>(this.urlListarPotencial, '', this.options);
  }

  actualizarPotencial(idPotencial: Number, tipoGas: String, gwp: Number) {
    let filtro = {
      nIdPotencial: idPotencial,
      sTipoGas: tipoGas,
      bdGWP: gwp
    }
    return this.http.post<IDataResponse>(this.urlActualizarPotencial, JSON.stringify(filtro), this.options);
  }

}
