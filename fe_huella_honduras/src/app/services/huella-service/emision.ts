import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IEmision } from '../../models/emision';

@Injectable({
  providedIn: 'root'
})
export class EmisionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarEmisiones = environment.baseUrl + '/rest/huella/emision/v1/listarEmisiones';
  urlListarInformativas = environment.baseUrl + '/rest/huella/emision/v1/listarInformativas';
  urlObtenerAccionesPendientes = environment.baseUrl + '/rest/huella/emision/v1/obtenerAccionesPendientes';
  urlObtenerTotalInstituciones = environment.baseUrl + '/rest/huella/emision/v1/obtenerTotalInstituciones';
  urlListarHistoricas = environment.baseUrl + '/rest/huella/emision/v1/listarHistoricas';
  urlObtenerDistribucionReconocimiento = environment.baseUrl + '/rest/huella/emision/v1/obtenerDistribucionReconocimiento';
  urlOtenerReconocimientoOrganizacional = environment.baseUrl + '/rest/huella/emision/v1/obtenerReconocimientoOrganizacional';
  urlListarInstitucionPorCIIU = environment.baseUrl + '/rest/gestion/ciiu/v1/listarTotalInstitciones';

  constructor(private http: HttpClient) { }

  listarEmisiones(oEmision: IEmision) {
    return this.http.post<IDataResponse>(this.urlListarEmisiones, JSON.stringify(oEmision), this.options);
  }

  listarInformativas(oEmision: IEmision) {
    return this.http.post<IDataResponse>(this.urlListarInformativas, JSON.stringify(oEmision), this.options);
  }

  obtenerAccionesPendientes() {
    return this.http.post<IDataResponse>(this.urlObtenerAccionesPendientes, "", this.options);
  }

  obtenerTotalInstituciones() {
    return this.http.post<IDataResponse>(this.urlObtenerTotalInstituciones, "", this.options);
  }

  listarInstitucionesPorCIIU() {
    return this.http.post<IDataResponse>(this.urlListarInstitucionPorCIIU, "", this.options);
  }

  listarHistoricas() {
    return this.http.post<IDataResponse>(this.urlListarHistoricas, "", this.options);
  }

  obtenerDistribucionReconocimiento() {
    return this.http.post<IDataResponse>(this.urlObtenerDistribucionReconocimiento,"", this.options);
  }

  otenerReconocimientoOrganizacional() {
    return this.http.post<IDataResponse>(this.urlOtenerReconocimientoOrganizacional, '', this.options);
  }

}
