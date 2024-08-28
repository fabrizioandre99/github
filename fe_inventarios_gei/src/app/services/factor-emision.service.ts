import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FactorEmisionService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  optionsFile = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'blob' as 'json'
  }

  urlListarFactorEmision = environment.baseUrl + '/rest/factorEmision/listar';
  urlListarAnio = environment.baseUrl + '/rest/factorEmision/listarAnios';
  urlInsertarFactorEmision = environment.baseUrl + '/rest/factorEmision/insertar';
  urlActualizarFactorEmision = environment.baseUrl + '/rest/factorEmision/actualizar';
  urlDescargarFactorEmision = environment.baseUrl + '/rest/factorEmision/descargar';

  constructor(private http: HttpClient) { }

  listarFactorEmision(Anio: Number) {
    let filtro = {
      nAnio: Anio
    };
    return this.http.post<IDataResponse>(this.urlListarFactorEmision, JSON.stringify(filtro), this.options);
  }

  listarAnio() {
    return this.http.post<IDataResponse>(this.urlListarAnio, '', this.options);
  }

  insertarFactorEmision(Anio: Number) {
    let filtro = {
      nAnio: Anio
    };
    //console.log('filtro - insertarFactorEmision', filtro)
    return this.http.post<IDataResponse>(this.urlInsertarFactorEmision, JSON.stringify(filtro), this.options);
  }

  actualizarFactorEmision(IdFactorEmision: Number, Descripcion: String,
    FeCO2: Number, FeCH4: Number, FeN2O: Number, valorConversion: Number, perdidasTYD: Number) {
    let filtro = {
      nIdFactorEmision: IdFactorEmision,
      sDescripcion: Descripcion,
      bdFeCO2: FeCO2,
      bdFeCH4: FeCH4,
      bdFeN2O: FeN2O,
      bdValorConversion: valorConversion,
      bdPerdidasTYD: perdidasTYD
    };

    //console.log('filtro actualizarFactorEmision', filtro);
    return this.http.post<IDataResponse>(this.urlActualizarFactorEmision, JSON.stringify(filtro), this.options);
  }

  descargarFactorEmision(Anio: Number) {
    let filtro = {
      nAnio: Anio
    };
    return this.http.post(this.urlDescargarFactorEmision, JSON.stringify(filtro), this.optionsFile);
  }

}
