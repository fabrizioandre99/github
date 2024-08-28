import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class LocacionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarActivos = environment.baseUrl + '/rest/locacion/listarActivos';
  urlListarLocacion = environment.baseUrl + '/rest/locacion/listar';
  urlListarNoDistribuidas = environment.baseUrl + '/rest/locacion/listarNoDistribuidas';
  urlListarByUUNNYCategorias = environment.baseUrl + '/rest/locacion/listarByUUNNYCategorias';
  urlListarABM = environment.baseUrl + '/rest/locacion/listarABM';
  urlListarByLocacion = environment.baseUrl + '/rest/planta/listarByLocacion';
  urlRegistrarLocacion = environment.baseUrl + '/rest/locacion/registrar';
  urlEliminarLocacion = environment.baseUrl + '/rest/locacion/eliminar';

  constructor(private http: HttpClient) { }

  listarActivos() {
    return this.http.post<IDataResponse>(this.urlListarActivos, '', this.options);
  }

  listarLocacion(idUnidadNegocio: String) {
    let filtro = {
      nIdUnidadNegocio: idUnidadNegocio
    }
    return this.http.post<IDataResponse>(this.urlListarLocacion, JSON.stringify(filtro), this.options);
  }

  listarNoDistribuidas(codMes: String, idPeriodo: Number, idFuenteEmision: Number) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      }
    }
    return this.http.post<IDataResponse>(this.urlListarNoDistribuidas, JSON.stringify(filtro), this.options);
  }

  listarByUUNNYCategorias(idSubUnidadNegocio: Number, subcatGeo_idCategoria: Number,
    subcatGeo_idPadre: Number, subcatAmb_idCategoria: Number, subcatAmb_idPadre: Number) {
    let filtro = {
      nIdSubUnidadNegocio: idSubUnidadNegocio,
      oSubcatGeo: {
        nIdCategoria: subcatGeo_idCategoria,
        nIdPadre: subcatGeo_idPadre
      },
      oSubcatAmb: {
        nIdCategoria: subcatAmb_idCategoria,
        nIdPadre: subcatAmb_idPadre
      }
    }
    return this.http.post<IDataResponse>(this.urlListarByUUNNYCategorias, JSON.stringify(filtro), this.options);
  }

  listarABM() {
    return this.http.post<IDataResponse>(this.urlListarABM, '', this.options);
  }

  listarByLocacion(idLocacion: Number) {
    let filtro = {
      nIdLocacion: idLocacion
    }
    return this.http.post<IDataResponse>(this.urlListarByLocacion, JSON.stringify(filtro), this.options);
  }

  registrarLocacion(idLocacion: Number, nombre: String,
    idCategoria_CatGeo: Number, idCategoria_CatAmb: Number, codEstado: Boolean) {
    let filtro = {
      nIdLocacion: idLocacion,
      sNombre: nombre,
      oSubcatGeo: {
        nIdCategoria: idCategoria_CatGeo
      },
      oSubcatAmb: {
        nIdCategoria: idCategoria_CatAmb
      },
      boCodEstado: codEstado
    }
    return this.http.post<IDataResponse>(this.urlRegistrarLocacion, JSON.stringify(filtro), this.options);
  }


  eliminarLocacion(idLocacion: String) {
    let filtro = {
      nIdLocacion: idLocacion
    }
    return this.http.post<IDataResponse>(this.urlEliminarLocacion, JSON.stringify(filtro), this.options);
  }
}
