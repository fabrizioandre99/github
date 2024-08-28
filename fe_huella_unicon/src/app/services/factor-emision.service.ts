import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FactorEmisionService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarAnio = environment.baseUrl + '/rest/factorEmision/listarAnio';
  urlListarFactorEmision = environment.baseUrl + '/rest/factorEmision/listar';
  urlActualizarFactorEmision = environment.baseUrl + '/rest/factorEmision/actualizar';
  urlCargaMasiva = environment.baseUrl + '/rest/factorEmision/cargaMasiva';
  urlEliminarFactorEmision = environment.baseUrl + '/rest/factorEmision/eliminar';

  constructor(private http: HttpClient) { }

  listarAnio() {
    return this.http.post<IDataResponse>(this.urlListarAnio, '', this.options);
  }

  listarFactorEmision(anio: Number, idFuenteEmision: Number) {
    let filtro = {
      nAnio: anio,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      }
    }
    return this.http.post<IDataResponse>(this.urlListarFactorEmision, JSON.stringify(filtro), this.options);
  }

  actualizarFactorEmision(idFactorEmision: Number, feCO2: Number, feCH4: Number, feN2O: Number, feCO2e: Number, valorConversion: Number) {
    let filtro = {
      nIdFactorEmision: idFactorEmision,
      bdFeCO2: feCO2,
      bdFeCH4: feCH4,
      bdFeN2O: feN2O,
      bdFeCO2e: feCO2e,
      bdValorConversion: valorConversion,
    }
    return this.http.post<IDataResponse>(this.urlActualizarFactorEmision, JSON.stringify(filtro), this.options);
  }

  cargaMasiva() {
    return this.http.post<IDataResponse>(this.urlCargaMasiva, '', this.options);
  }

  eliminarFactorEmision(anio: Number) {
    let filtro = {
      nAnio: anio
    }
    return this.http.post<IDataResponse>(this.urlEliminarFactorEmision, JSON.stringify(filtro), this.options);
  }
}
