import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FactorEmisionService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


  urlListarFactorEmision = environment.baseUrl + '/rest/factorEmision/listar';
  urlActualizarFactorEmision = environment.baseUrl + '/rest/factorEmision/actualizar';
  urlListarTipoCombustible = environment.baseUrl + '/rest/factorEmision/listarNoInformativo';
  urlListarFactorEmisionNivel2 = environment.baseUrl + '/rest/factorEmision/listarNivel2';
  urlActualizarFactorEmisionNivel2 = environment.baseUrl + '/rest/factorEmision/actualizarNivel2';

  constructor(private http: HttpClient) { }

  listarFactorEmision() {
    return this.http.post<IDataResponse>(this.urlListarFactorEmision, '', this.options);
  }

  actualizarFactorEmision(sCodFactor: string, feCO2: Number, feCH4: Number, feN2O: Number, vcnCombustible: Number, vcnMasa: number) {
    let filtro = {
      sCodFactor: sCodFactor,
      bdFeCO2: feCO2,
      bdFeCH4: feCH4,
      bdFeN2O: feN2O,
      bdVCNCombustible: vcnCombustible,
      bdVCNMasa: vcnMasa
    }
    return this.http.post<IDataResponse>(this.urlActualizarFactorEmision, JSON.stringify(filtro), this.options);
  }

  listarTipoCombustible(){
    return this.http.post<IDataResponse>(this.urlListarTipoCombustible, '', this.options);
  }

  listarFactorEmisionNivel2(sCodCategoria: string, sCodCombustible: string, sCodTipoVehiculo: string) {
    let filtro = {
      sCodCategoria: sCodCategoria,
      sCodCombustible: sCodCombustible,
      sCodTipoVehiculo: sCodTipoVehiculo
    }
    return this.http.post<IDataResponse>(this.urlListarFactorEmisionNivel2, JSON.stringify(filtro), this.options);
  }

  actualizarFactorEmisionNivel2(nIdFactorEmision: number, feCH4: Number, feN2O: Number) {
    let filtro = {
      nIdFactorEmision: nIdFactorEmision,
      bdFeCH4: feCH4,
      bdFeN2O: feN2O,
    }
    return this.http.post<IDataResponse>(this.urlActualizarFactorEmisionNivel2, JSON.stringify(filtro), this.options);
  }

}
