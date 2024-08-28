import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IFuenteEmision } from '../../models/fuenteEmision';

@Injectable({
  providedIn: 'root'
})
export class FuenteEmisionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarFuenteEmision = environment.baseUrl + '/rest/huella/fuente/v1/listar';
  urlListarExclusiones = environment.baseUrl + '/rest/huella/fuente/v1/listarExclusiones';
  urlRegistrarExclusion = environment.baseUrl + '/rest/huella/fuente/v1/registrarExclusion';
  urlEliminarExclusion = environment.baseUrl + '/rest/huella/fuente/v1/eliminarExclusion';


  constructor(private http: HttpClient) { }

  listarFuenteEmision(oFuente: IFuenteEmision) {
    console.log('oFuente', oFuente);
    return this.http.post<IDataResponse>(this.urlListarFuenteEmision, JSON.stringify(oFuente), this.options);
  }

  listarExclusiones(oFuente: IFuenteEmision) {
    console.log('oFuente', oFuente);
    return this.http.post<IDataResponse>(this.urlListarExclusiones, JSON.stringify(oFuente), this.options);
  }

  registrarExclusion(oFuente: IFuenteEmision) {
    console.log('oFuente', oFuente);
    return this.http.post<IDataResponse>(this.urlRegistrarExclusion, JSON.stringify(oFuente), this.options);
  }
  eliminarExclusion(oFuente: IFuenteEmision) {
    console.log('oFuente', oFuente);
    return this.http.post<IDataResponse>(this.urlEliminarExclusion, JSON.stringify(oFuente), this.options);
  }
}
