import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlInsertOActual = environment.baseUrl + '/rest/empresa/registrar';
  urlListarEmpresa = environment.baseUrl + '/rest/empresa/listar';
  urlListarById = environment.baseUrl + '/rest/empresa/obtenerByID';
  urlEliminarEmpresa = environment.baseUrl + '/rest/empresa/eliminar';

  constructor(private http: HttpClient) { }

  insertOActual(idEmpresa: Number, codEmpresa: String, ruc: String, codSector: String, razonSocial: String, nombreComercial: String) {
    let filtro = {
      nIdEmpresa: idEmpresa,
      sCodEmpresa: codEmpresa,
      sCodSector: codSector,
      sRuc: ruc,
      sRazonSocial: razonSocial,
      sNombreComercial: nombreComercial
    }

    return this.http.post<IDataResponse>(this.urlInsertOActual, JSON.stringify(filtro), this.options);
  }


  listarEmpresa(oSector: any) {
    let filtro = {
      liSector: oSector
    }

    return this.http.post<IDataResponse>(this.urlListarEmpresa, JSON.stringify(filtro), this.options);
  }

  listarById(codEmpresa: Number) {
    let filtro = {
      sCodEmpresa: codEmpresa
    }

    return this.http.post<IDataResponse>(this.urlListarById, JSON.stringify(filtro), this.options);
  }

  eliminarEmpresa(idEmpresa: Number, codEmpresa: String) {
    let filtro = {
      nIdEmpresa: idEmpresa,
      sCodEmpresa: codEmpresa
    }

    return this.http.post<IDataResponse>(this.urlEliminarEmpresa, JSON.stringify(filtro), this.options);
  }
}
