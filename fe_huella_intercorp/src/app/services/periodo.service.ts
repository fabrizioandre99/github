import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlInsertOActual = environment.baseUrl + '/rest/periodo/registrar';
  urlListarByIDEmpresa = environment.baseUrl + '/rest/periodo/listarByIDEmpresa';
  urlEliminarPeriodo = environment.baseUrl + '/rest/periodo/eliminar';
  urlActualizarEstado = environment.baseUrl + '/rest/periodo/actualizarEstado';
  urlDescargarDetLocacion = environment.baseUrl + '/rest/periodo/descargarDetLocacion';
  urlListarByCodSector = environment.baseUrl + '/rest/periodo/listarByCodSector';
  urlListarActivoByIDEmpresa = environment.baseUrl + '/rest/periodo/listarActivoByIDEmpresa';

  constructor(private http: HttpClient) { }

  insertOActual(oPeriodo: any) {
    return this.http.post<IDataResponse>(this.urlInsertOActual, JSON.stringify(oPeriodo), this.options);
  }

  actualizarEstado(oPeriodo: any) {
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(oPeriodo), this.options);
  }

  listarByIDEmpresa(idEmpresa: any) {
    let filtro = {
      nIdEmpresa: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarByIDEmpresa, JSON.stringify(filtro), this.options);
  }

  eliminarPeriodo(idPeriodo: any) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlEliminarPeriodo, JSON.stringify(filtro), this.options);
  }

  listarByCodSector(oSector: any) {
    let filtro = {
      liSector: oSector
    }
    return this.http.post<IDataResponse>(this.urlListarByCodSector, JSON.stringify(filtro), this.options);
  }

  listarActivoByIDEmpresa(idEmpresa: Number) {
    let filtro = {
      nIdEmpresa: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarActivoByIDEmpresa, JSON.stringify(filtro), this.options);
  }


  descargarArchivo(idPeriodo: Number, anio: Number): Observable<any> {
    const filtro = {
      nIdPeriodo: idPeriodo,
      nAnio: anio
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.urlDescargarDetLocacion, JSON.stringify(filtro), {
      headers: headers,
      responseType: 'blob'
    })
  }

}

