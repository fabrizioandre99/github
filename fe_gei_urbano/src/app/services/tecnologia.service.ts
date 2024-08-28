import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { Tecnologia } from '../models/tecnologia';

@Injectable({
  providedIn: 'root'
})
export class TecnologiaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarTecnologia = environment.baseUrl + '/rest/tecnologia/listar';
  urlRegistrarTecnologia = environment.baseUrl + '/rest/tecnologia/registrar';
  urlEliminarTecnologia = environment.baseUrl + '/rest/tecnologia/eliminar';

  constructor(private http: HttpClient) { }

  listarTecnologia(sCodCategoria: string, sCodCombustible: string, sCodTipoVehiculo: string) {

    let filtro = {
      sCodCategoria: sCodCategoria,
      sCodCombustible: sCodCombustible,
      sCodTipoVehiculo: sCodTipoVehiculo
    }

    return this.http.post<IDataResponse>(this.urlListarTecnologia, JSON.stringify(filtro), this.options);
  }

  registrarTecnologia(oTecnologia: Tecnologia) {
    return this.http.post<IDataResponse>(this.urlRegistrarTecnologia, JSON.stringify(oTecnologia), this.options);
  }

  eliminarTecnologia(nIdTecnologia: number){
    let filtro = {
      nIdTecnologia: nIdTecnologia
    }
    return this.http.post<IDataResponse>(this.urlEliminarTecnologia, JSON.stringify(filtro), this.options);
  }

}
