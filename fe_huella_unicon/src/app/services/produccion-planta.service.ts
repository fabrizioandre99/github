import { Injectable } from '@angular/core';
import { IDataResponse } from '../models/IDataResponse';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProduccionPlantaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarByPeriodo = environment.baseUrl + '/rest/produccionPlanta/listarByPeriodo';
  urlEliminarProdPlanta = environment.baseUrl + '/rest/produccionPlanta/eliminar';
  urlRegistrarProdPlanta = environment.baseUrl + '/rest/produccionPlanta/registrar';
  urlProcesarProdPlanta = environment.baseUrl + '/rest/produccionPlanta/procesar';

  urlRptPorCategoria = environment.baseUrl + '/rest/produccionPlanta/rptPorCategoria';
  urlRptPorFuente = environment.baseUrl + '/rest/produccionPlanta/rptPorFuente';
  urlRptPorUUNN = environment.baseUrl + '/rest/produccionPlanta/rptPorUUNN';
  urlRptPorLocacion = environment.baseUrl + '/rest/produccionPlanta/rptPorLocacion';

  constructor(private http: HttpClient) { }

  listarByPeriodo(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarByPeriodo, JSON.stringify(filtro), this.options);
  }

  eliminarProdPlanta(idProduccionPlanta: Number, idPeriodo: Number, codMes: String) {
    let filtro = {
      nIdProduccionPlanta: idProduccionPlanta,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes
    }
    return this.http.post<IDataResponse>(this.urlEliminarProdPlanta, JSON.stringify(filtro), this.options);
  }

  registrarProdPlanta(mfXlxProduccionPlanta: File, idPeriodo: Number, codMes: String) {
    const headers = new HttpHeaders();
    let filtro = {
      oPeriodo: { nIdPeriodo: idPeriodo },
      sCodMes: codMes
    }

    const formData = new FormData();
    formData.append('mfXlxProduccionPlanta', mfXlxProduccionPlanta);
    formData.append('oProduccion', new Blob([JSON.stringify(filtro)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    return this.http.post<IDataResponse>(this.urlRegistrarProdPlanta, formData, { headers });
  }


  procesarProdPlanta(idProduccionPlanta: Number) {
    let filtro = {
      nIdProduccionPlanta: idProduccionPlanta
    }
    return this.http.post<IDataResponse>(this.urlProcesarProdPlanta, JSON.stringify(filtro), this.options);
  }

  rptPorCategoria(idPeriodo: Number, codMes: String, codEmpresa: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlRptPorCategoria, JSON.stringify(filtro), this.options);
  }

  rptPorFuente(idPeriodo: Number, codMes: String, codEmpresa: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlRptPorFuente, JSON.stringify(filtro), this.options);
  }

  rptPorUUNN(idPeriodo: Number, codMes: String, codEmpresa: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      sCodEmpresa: codEmpresa
    }
    return this.http.post<IDataResponse>(this.urlRptPorUUNN, JSON.stringify(filtro), this.options);
  }

  rptPorLocacion(idPeriodo: Number, codMes: String, codEmpresa: String, idUnidadNegocio: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      sCodEmpresa: codEmpresa,
      nIdUnidadNegocio: idUnidadNegocio
    }
    return this.http.post<IDataResponse>(this.urlRptPorLocacion, JSON.stringify(filtro), this.options);
  }
}
