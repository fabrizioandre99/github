import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { Proveedor } from '../models/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarAdm = '/rest/administrativo/proveedor/listarAdm';
  urlListarComboFe = '/rest/administrativo/proveedor/listarComboFe';
  urlListarComboCli = '/rest/administrativo/proveedor/listarComboCli';
  urlEliminarAdm = '/rest/administrativo/proveedor/eliminarAdm';
  urlInsertarAdm = '/rest/administrativo/proveedor/insertarAdm';
  urlActualizarAdm = '/rest/administrativo/proveedor/actualizarAdm';

  constructor(private http: HttpClient) { }

  listarAdm() {
    return this.http.post<IDataResponse>(this.urlListarAdm, '', this.options);
  }

  listarComboFe() {
    return this.http.post<IDataResponse>(this.urlListarComboFe, '', this.options);
  }

  listarComboCli(fechaInicio: String, fechaFin: String) {
    let filtro = {
      FechaInicio: fechaInicio,
      FechaFin: fechaFin
    };
    return this.http.post<IDataResponse>(this.urlListarComboCli, JSON.stringify(filtro), this.options);
  }

  eliminarAdm(idProveedor: Number, idUsuario: String) {
    let filtro = {
      nIdProveedor: idProveedor,
      nIdUsuario: idUsuario
    }
    return this.http.post<IDataResponse>(this.urlEliminarAdm, JSON.stringify(filtro), this.options);
  }

  insertarAdm(nombre: String, codEstado: Number, idUsuario: String, feCO2?: Number, feCH4?: Number, feN2O?: Number,
    feCO2eq?: Number) {
    let filtro = {
      oProveedorEnergia: {
        sNombre: nombre,
        nCodEstado: codEstado
      },
      nIdUsuario: idUsuario,
      nFeCO2: feCO2,
      nFeCH4: feCH4,
      nFeN2O: feN2O,
      nFeCO2eq: feCO2eq
    }
    return this.http.post<IDataResponse>(this.urlInsertarAdm, JSON.stringify(filtro), this.options);
  }


  actualizarAdm(idProveedor: Number, esNuevo: Number, nombre: String, codEstado: Number, idUsuario: String,
    feCO2?: Number, feCH4?: Number, feN2O?: Number, feCO2eq?: Number) {
    let filtro = {
      oProveedorEnergia: {
        nIdProveedor: idProveedor,
        nEsNuevo: esNuevo,
        sNombre: nombre,
        nCodEstado: codEstado
      },
      nIdUsuario: idUsuario,
      nFeCO2: feCO2,
      nFeCH4: feCH4,
      nFeN2O: feN2O,
      nFeCO2eq: feCO2eq
    }
    return this.http.post<IDataResponse>(this.urlActualizarAdm, JSON.stringify(filtro), this.options);
  }

}
