import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { iCambioPeriodo } from '../../models/cambioPeriodo';
import { iSolicitudPeriodo } from '../../models/solicitudPeriodo';
import { IPeriodo } from '../../models/periodo';

@Injectable({
  providedIn: 'root'
})
export class SolicitudPeriodoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlReaperturar = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/reaperturar';
  urlSolicitarReapertura = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/solicitarReapertura';
  urlObservarReapertura = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/observarReapertura';
  urlRegistrarReduccion = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/registrarReduccion';
  urlRegistrarCompensacion = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/registrarCompensacion';
  urlListarPendientes = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/listarPendientes';
  urlListarReduccion = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/listarReduccion';
  urlListarCompensacion = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/listarCompensacion';
  urlGestionarSolicitud = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/gestionarSolicitud';
  urlListarNotificaciones = environment.baseUrl + '/rest/huella/solicitud-periodo/v1/listarNotificaciones';

  constructor(private http: HttpClient) { }

  reaperturar(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlReaperturar, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  solicitarReapertura(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlSolicitarReapertura, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  observarReapertura(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlObservarReapertura, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  registrarReduccion(mfVerificacion: File, mfVerificacionBase: File, oPeriodo: IPeriodo) {
    const headers = new HttpHeaders();
    const formData = new FormData();

    formData.append('mfVerificacion', mfVerificacion);
    formData.append('mfVerificacionBase', mfVerificacionBase);
    formData.append('oPeriodo', new Blob([JSON.stringify(oPeriodo)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    console.log('mfVerificacion', mfVerificacion);
    console.log('mfVerificacionBase', mfVerificacionBase);
    console.log(oPeriodo);
    return this.http.post<IDataResponse>(this.urlRegistrarReduccion, formData, { headers });
  }

  registrarCompensacion(mfCertificado: File, oSolicitudPeriodo: iSolicitudPeriodo) {
    const headers = new HttpHeaders();
    const formData = new FormData();

    formData.append('mfCertificado', mfCertificado);
    formData.append('oSolicitud', new Blob([JSON.stringify(oSolicitudPeriodo)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    console.log('mfCertificado', mfCertificado);
    console.log(oSolicitudPeriodo);
    return this.http.post<IDataResponse>(this.urlRegistrarCompensacion, formData, { headers });
  }

  listarPendientes(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarPendientes, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  listarReduccion(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarReduccion, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  listarCompensacion(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlListarCompensacion, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  gestionarSolicitud(oSolicitudPeriodo: iSolicitudPeriodo) {
    return this.http.post<IDataResponse>(this.urlGestionarSolicitud, JSON.stringify(oSolicitudPeriodo), this.options);
  }

  listarNotificaciones() {
    return this.http.post<IDataResponse>(this.urlListarNotificaciones, '', this.options);
  }
}
