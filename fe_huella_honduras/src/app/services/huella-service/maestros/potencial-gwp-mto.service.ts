import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IDataResponse } from '../../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class PotencialGwpMtoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarPotencialMto = environment.baseUrl + '/rest/huella/potencial/v1/listar';
  urlActualizarPotencialMto = environment.baseUrl + '/rest/huella/potencial/v1/actualizar';
  //urlRrgistrarPotencialMto = environment.baseUrl + '/rest/huella/fuente/v1/actualizarFuente';

  constructor(private http: HttpClient) { }

  listarPotencialporTipo(tipoGWP: string) {
    let oFiltro = { sTipo: tipoGWP };
    return this.http.post<IDataResponse>(this.urlListarPotencialMto, JSON.stringify(oFiltro), this.options);
  }

  actualizarPotencialMto(oGWP: any) {
    console.log('oGWP', oGWP);
    return this.http.post<IDataResponse>(this.urlActualizarPotencialMto, JSON.stringify(oGWP), this.options);
  }
}
