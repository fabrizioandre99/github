import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class DistribucionFuenteService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarDistFuente = environment.baseUrl + '/rest/distribucionFuente/listar';
  urlListarPorLocacion = environment.baseUrl + '/rest/distribucionFuente/listarPorLocacion';
  urlProcesarDistFuente = environment.baseUrl + '/rest/distribucionFuente/procesar';
  urlRegistrarDistFuente = environment.baseUrl + '/rest/distribucionFuente/registrar';
  urlEliminarDistFuente = environment.baseUrl + '/rest/distribucionFuente/eliminar';

  constructor(private http: HttpClient) { }

  listarDistFuente(idPeriodo: Number, codMes: String, idFuenteEmision: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      }
    }
    return this.http.post<IDataResponse>(this.urlListarDistFuente, JSON.stringify(filtro), this.options);
  }

  listarPorLocacion(idPeriodo: Number, codMes: String, idFuenteEmision: Number, idLocacion: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      },
      oLocacion: {
        nIdLocacion: idLocacion
      }
    }
    return this.http.post<IDataResponse>(this.urlListarPorLocacion, JSON.stringify(filtro), this.options);
  }

  procesarDistFuente(idPeriodo: Number, codMes: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes
    }
    return this.http.post<IDataResponse>(this.urlProcesarDistFuente, JSON.stringify(filtro), this.options);
  }
  registrarDistFuente(oDistFuente: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarDistFuente, JSON.stringify(oDistFuente), this.options);
  }

  eliminarDistFuent(idPeriodo: Number, codMes: String, idFuenteEmision: Number, idLocacion: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      },
      oLocacion: {
        nIdLocacion: idLocacion
      }
    }
    return this.http.post<IDataResponse>(this.urlEliminarDistFuente, JSON.stringify(filtro), this.options);
  }

}
