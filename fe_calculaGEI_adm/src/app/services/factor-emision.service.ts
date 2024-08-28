import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  urlListarAdm = '/rest/administrativo/factorEmision/listarAdm';
  urlListarAnio = '/rest/administrativo/factorEmision/listarAnio';
  urlEliminarAnio = '/rest/administrativo/factorEmision/eliminar';
  urlDescargarFormato = '/rest/administrativo/factorEmision/descargar';
  urlCargarArchivo = '/rest/administrativo/factorEmision/cargar';
  urlActualizarAdm = '/rest/administrativo/factorEmision/actualizarAdm';

  constructor(private http: HttpClient) { }

  listarAdm(idProveedor: Number, anio: Number) {
    let filtro = {
      oProveedorEnergia: {
        nIdProveedor: idProveedor
      },
      nAnio: anio
    };
    return this.http.post<IDataResponse>(this.urlListarAdm, JSON.stringify(filtro), this.options);
  }

  listarAnio() {
    return this.http.post<IDataResponse>(this.urlListarAnio, '', this.options);
  }

  descargarFormato(bo_Datos: Number, anio: Number) {
    let filtro = {
      boConDatos: bo_Datos,
      nAnio: anio
    };
    return this.http.post(this.urlDescargarFormato, JSON.stringify(filtro), this.optionsFile);
  }

  cargarArchivo(file: File) {
    const formData = new FormData;
    formData.append('file', file);
    formData.append('nIdUsuario', localStorage.getItem('SessionIdUsuario')!);
    return this.http.post<IDataResponse>(this.urlCargarArchivo, formData);
  }

  actualizarAdm(idFactorEmision: Number, feCO2: Number, feCH4: Number, feN2O: Number, feCO2eq: Number
    , idUsuario: String) {
    let filtro = {
      nIdFactorEmision: idFactorEmision,
      nFeCO2: feCO2,
      nFeCH4: feCH4,
      nFeN2O: feN2O,
      nFeCO2eq: feCO2eq,
      nIdUsuario: idUsuario
    };
    return this.http.post<IDataResponse>(this.urlActualizarAdm, JSON.stringify(filtro), this.options);
  }

  eliminarAnio(anio: Number, idUsuario: String) {
    let filtro = {
      nAnio: anio,
      nIdUsuario: idUsuario
    };
    return this.http.post<IDataResponse>(this.urlEliminarAnio, JSON.stringify(filtro), this.options);
  }
}
