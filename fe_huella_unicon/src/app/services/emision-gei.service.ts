import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class EmisionGeiService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlResultadoGeiPlanta = environment.baseUrl + '/rest/emisionGei/resultadoGeiPlanta';
  urlListarNegocio = environment.baseUrl + '/rest/emisionGei/listarPorUUNN';
  urlListarAmbito = environment.baseUrl + '/rest/emisionGei/listarPorAmbito';
  urlListarGeografica = environment.baseUrl + '/rest/emisionGei/listarPorGeografica';
  urlListarLocacion = environment.baseUrl + '/rest/emisionGei/listarPorLocacion';
  urlListarPlanta = environment.baseUrl + '/rest/emisionGei/listarPorPlanta';
  urlObtenerRatio = environment.baseUrl + '/rest/emisionGei/obtenerRatioConcreto';

  constructor(private http: HttpClient) { }

  resultadoGeiPlanta(codMes: Number, codEmpresa: Number, idCatGeo: Number, idCatAmb: Number,
    idPeriodo: Number, idPlanta: Number, idLocacion: Number, subcatGeo_idCategoria: Number,
    subcatAmb_idCategoria: Number, idUnidadNegocio: Number) {
    let filtro = {
      sCodMes: codMes,
      sCodEmpresa: codEmpresa,
      nIdCatGeo: idCatGeo,
      nIdCatAmb: idCatAmb,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      oPlanta: {
        nIdPlanta: idPlanta,
        oLocacion: {
          nIdLocacion: idLocacion,
          oSubcatGeo: {
            nIdCategoria: subcatGeo_idCategoria
          },
          oSubcatAmb: {
            nIdCategoria: subcatAmb_idCategoria
          }
        },
        oUUNN: {
          nIdUnidadNegocio: idUnidadNegocio
        }
      }
    }
    return this.http.post<IDataResponse>(this.urlResultadoGeiPlanta, JSON.stringify(filtro), this.options);
  }

  listarNegocio(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarNegocio, JSON.stringify(filtro), this.options);
  }

  listarAmbito(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarAmbito, JSON.stringify(filtro), this.options);
  }

  listarGeografica(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarGeografica, JSON.stringify(filtro), this.options);
  }

  listarLocacion(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarLocacion, JSON.stringify(filtro), this.options);
  }

  listarPlanta(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlListarPlanta, JSON.stringify(filtro), this.options);
  }

  obtenerRatio(codMes: any,
    idPeriodo: Number, codEmpresa: String) {
    let filtro = {
      sCodMes: codMes,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlObtenerRatio, JSON.stringify(filtro), this.options);
  }
}
