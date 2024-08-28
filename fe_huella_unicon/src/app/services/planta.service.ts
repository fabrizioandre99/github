import { Injectable } from '@angular/core';
import { IDataResponse } from '../models/IDataResponse';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlantaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarByLocacion = environment.baseUrl + '/rest/planta/listarByLocacion';
  urlListarActividad = environment.baseUrl + '/rest/planta/listarActividad';
  urlRegistrarPlanta = environment.baseUrl + '/rest/planta/registrar';
  urlRegistrarActiPlanta = environment.baseUrl + '/rest/planta/registrarActividad';
  urlEliminarPlanta = environment.baseUrl + '/rest/planta/eliminar';
  urlEliminarActiPlanta = environment.baseUrl + '/rest/planta/eliminarActividad';

  constructor(private http: HttpClient) { }

  listarByLocacion(idLocacion: Number) {
    let filtro = {
      nIdLocacion: idLocacion
    }
    return this.http.post<IDataResponse>(this.urlListarByLocacion, JSON.stringify(filtro), this.options);
  }

  listarActividad(idPlanta: Number) {
    let filtro = {
      nIdPlanta: idPlanta
    }
    return this.http.post<IDataResponse>(this.urlListarActividad, JSON.stringify(filtro), this.options);
  }

  registrarPlanta(idPlanta: Number, nombre: String,
    codEstado: Boolean, idLocacion: Number, idUnidadNegocio: Number) {
    let filtro = {
      nIdPlanta: idPlanta,
      sNombre: nombre,
      boCodEstado: codEstado,
      oLocacion: {
        nIdLocacion: idLocacion
      },
      oUUNN: {
        nIdUnidadNegocio: idUnidadNegocio
      },

    }
    return this.http.post<IDataResponse>(this.urlRegistrarPlanta, JSON.stringify(filtro), this.options);
  }

  registrarActiPlanta(idActividadPlanta: Number, idPlanta: Number,
    codEmpresa: String, fechaInicio: String, fechaFin: String) {
    let filtro = {
      nIdActividadPlanta: idActividadPlanta,
      oPlanta: {
        nIdPlanta: idPlanta
      },
      sCodEmpresa: codEmpresa,
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin,
    }

    return this.http.post<IDataResponse>(this.urlRegistrarActiPlanta, JSON.stringify(filtro), this.options);
  }

  eliminarPlanta(idPlanta: String) {
    let filtro = {
      nIdPlanta: idPlanta
    }

    return this.http.post<IDataResponse>(this.urlEliminarPlanta, JSON.stringify(filtro), this.options);
  }

  eliminarActiPlanta(idActividadPlanta: String) {
    let filtro = {
      nIdActividadPlanta: idActividadPlanta
    }
    return this.http.post<IDataResponse>(this.urlEliminarActiPlanta, JSON.stringify(filtro), this.options);
  }
}
