import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResultadoGeiService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarEmisionGEI = environment.baseUrl + '/rest/emisionGei/listar';
  urlDescargarZIP = environment.baseUrl + '/rest/emisionGei/descargar';
  urlEmisionHistoricaRuta = environment.baseUrl + '/rest/emisionGei/listarEmisionesAnualRuta';
  urlEmisionHistoricaCombustible = environment.baseUrl + '/rest/emisionGei/listarEmisionesAnualCombustible';
  urlEmisionAnualRuta = environment.baseUrl + '/rest/emisionGei/listarEmisionRuta';
  urlEmisionAnualRutaTotal = environment.baseUrl + '/rest/emisionGei/listarEmisionRutaCompleto';
  urlEmisionAnualRutaMes = environment.baseUrl + '/rest/emisionGei/listarEmisionRutaMes';
  urlEmisionAnualTotal = environment.baseUrl + '/rest/emisionGei/listarTotalEmisiones';
  urlEmisionPorRuta = environment.baseUrl + '/rest/emisionGei/listarEmisionesPorRuta';
  urlEmisionVehiculoMes = environment.baseUrl + '/rest/emisionGei/listarEmisionVehiculoMes';
  constructor(private http: HttpClient) { }

  listarNivelActividad(idPeriodo: number, codMes: string | null, idRuta: number | null) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      sCodMes: codMes,
      oVehiculo: {
        oRuta: {
          nIdRuta: idRuta
        }
      }
    }
    return this.http.post<IDataResponse>(this.urlListarEmisionGEI, JSON.stringify(filtro), this.options);
  }

  descargarZip(idPeriodo: number, anio: number) {
    let filtro = {
      nIdPeriodo: idPeriodo,
      nAnio: anio
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.urlDescargarZIP, JSON.stringify(filtro), {
      headers: headers,
      responseType: 'arraybuffer' // Cambiado a arraybuffer
    });
  }

  listarReporteHistoricaRuta() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IDataResponse>(this.urlEmisionHistoricaRuta, null, this.options);
  }

  listarReporteHistoricaCombustible() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IDataResponse>(this.urlEmisionHistoricaCombustible, null, this.options);
  }

  listarReporteAnualRuta(idPeriodo: Number, boTop: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo,
      boTop: boTop
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualRuta, JSON.stringify(filtro), this.options);
  }

  listarReporteAnualRutaCompleto(idPeriodo: Number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualRutaTotal, JSON.stringify(filtro), this.options);
  }

  listarReporteAnualRutaMes(idPeriodo: Number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualRutaMes, JSON.stringify(filtro), this.options);
  }

  listarReporteAnualTotal(idPeriodo: Number, idRuta: number | null) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo,
      nIdRuta: idRuta
    }
    return this.http.post<IDataResponse>(this.urlEmisionAnualTotal, JSON.stringify(filtro), this.options);
  }

  listarReportePorRuta(idPeriodo: Number, idRuta: number, boTop: boolean) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo,
      nIdRuta: idRuta,
      boTop: boTop
    }
    return this.http.post<IDataResponse>(this.urlEmisionPorRuta, JSON.stringify(filtro), this.options);
  }

  listarReporteVehiculoMes(idPeriodo: Number, idRuta: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let filtro = {
      nIdPeriodo: idPeriodo,
      nIdRuta: idRuta
    }
    return this.http.post<IDataResponse>(this.urlEmisionVehiculoMes, JSON.stringify(filtro), this.options);
  }

}
