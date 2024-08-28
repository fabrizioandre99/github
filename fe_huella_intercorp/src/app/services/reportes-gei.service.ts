import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class ReportesGeiService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  /*-----Emisiones GEI----*/

  urlParticipacionFuente = environment.baseUrl + '/rest/reportesgei/participacionFuente';
  urlParticipacionCategoria = environment.baseUrl + '/rest/reportesgei/participacionCategoria';
  urlParticipacionLocacion = environment.baseUrl + '/rest/reportesgei/participacionLocacion';

  /*-----Evolución anual----*/

  urlEmisionAnualPorCategoria = environment.baseUrl + '/rest/reportesgei/emisionAnualPorCategoria';
  urlIndicadoreVentasAnual = environment.baseUrl + '/rest/reportesgei/indicadoreVentasAnual';

  /*-----Panel Comparativo----*/
  urlParticipacionAnualPorEmpresa = environment.baseUrl + '/rest/reportesgei/participacionAnualPorEmpresa';
  urlParticipaciónAnualPorCategoria = environment.baseUrl + '/rest/reportesgei/participacionAnualPorCategoria';
  urlEmisionAnualPorFuente = environment.baseUrl + '/rest/reportesgei/emisionAnualPorFuente';

  /*-----Indicares GEI----*/
  urlIndicadorVentasAnualPorSector = environment.baseUrl + '/rest/reportesgei/indicadorVentasAnualPorSector';
  urlEmisionesGEIAnualPorFuente = environment.baseUrl + '/rest/reportesgei/emisionesGEIAnualPorFuente';

  constructor(private http: HttpClient) { }


  /*-----Emisiones GEI----*/
  participacionLocacion(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlParticipacionLocacion, JSON.stringify(filtro), this.options);
  }

  participacionCategoria(idPeriodo: Number, idLocacion: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      nIdLocacion: idLocacion
    }
    return this.http.post<IDataResponse>(this.urlParticipacionCategoria, JSON.stringify(filtro), this.options);
  }

  participacionFuente(oPartFuente: any) {
    return this.http.post<IDataResponse>(this.urlParticipacionFuente, JSON.stringify(oPartFuente), this.options);
  }


  /*-----Evolución anual----*/
  emisionAnualPorCategoria(idLocacion: Number, idEmpresa: Number) {
    let filtro = {
      nIdLocacion: idLocacion,
      nIdEmpresa: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualPorCategoria, JSON.stringify(filtro), this.options);
  }

  indicadoreVentasAnual(idLocacion: Number, idEmpresa: Number) {
    let filtro = {
      nIdLocacion: idLocacion,
      nIdEmpresa: idEmpresa
    }
    return this.http.post<IDataResponse>(this.urlIndicadoreVentasAnual, JSON.stringify(filtro), this.options);
  }

  /*-----Panel Comparativo----*/

  participacionAnualPorEmpresa(anio: Number, oSector: any) {
    let filtro = {
      nAnio: anio,
      liSector: oSector
    }
    return this.http.post<IDataResponse>(this.urlParticipacionAnualPorEmpresa, JSON.stringify(filtro), this.options);
  }

  participaciónAnualPorCategoria(anio: Number, oSector: any) {
    let filtro = {
      nAnio: anio,
      liSector: oSector
    }
    return this.http.post<IDataResponse>(this.urlParticipaciónAnualPorCategoria, JSON.stringify(filtro), this.options);
  }

  emisionAnualPorFuente(anio: Number, oSector: any, idFuenteEmision: Number) {
    let filtro = {
      nAnio: anio,
      liSector: oSector,
      nIdFuenteEmision: idFuenteEmision
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualPorFuente, JSON.stringify(filtro), this.options);
  }

  /*-----Indicares GEI----*/

  indicadorVentasAnualPorSector(oSector: any) {
    return this.http.post<IDataResponse>(this.urlIndicadorVentasAnualPorSector, JSON.stringify(oSector), this.options);
  }

  emisionesGEIAnualPorFuente(idFuenteEmision: Number, oSector: any) {
    let filtro = {
      nIdFuenteEmision: idFuenteEmision,
      liSector: oSector
    }
    return this.http.post<IDataResponse>(this.urlEmisionesGEIAnualPorFuente, JSON.stringify(filtro), this.options);
  }
}
