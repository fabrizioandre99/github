import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { iSolicitudGestion } from '../../models/solicitudGestion';

@Injectable({
  providedIn: 'root'
})
export class GestionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlValidarDocumento = environment.baseUrl + '/rest/gestion/solicitud/v1/validarDocumento';
  urlRegistrarSolicitud = environment.baseUrl + '/rest/gestion/solicitud/v1/registrarSolicitud';
  urlEliminarSolicitud = environment.baseUrl + '/rest/gestion/solicitud/v1/eliminarSolicitud';
  urlListarSolicitud = environment.baseUrl + '/rest/gestion/solicitud/v1/listarSolicitud';
  urlObtenerSolicitudUsuario = environment.baseUrl + '/rest/gestion/solicitud/v1/obtenerSolicitud';
  urlAtenderSolicitud = environment.baseUrl + '/rest/gestion/solicitud/v1/atenderSolicitud';
  urlReenviarMail = environment.baseUrl + '/rest/gestion/solicitud/v1/reenviarMail';

  constructor(private http: HttpClient) { }

  validarDocumento(idSolicitudUsuario: number, tipoDocumento: string, numDocumento: string, idSesionReg: number) {
    let filtro = {
      nIdSolicitudUsuario: idSolicitudUsuario,
      sCodTipoDocumento: tipoDocumento,
      sNumDocumento: numDocumento,
      nIdSesionReg: idSesionReg
    };
    console.log('validarDocumento filtro', filtro);
    return this.http.post<IDataResponse>(this.urlValidarDocumento, JSON.stringify(filtro), this.options);
  }

  eliminarSolicitud(idSolicitudUsuario: number) {
    let filtro = {
      nIdSolicitudUsuario: idSolicitudUsuario
    };
    console.log('eliminarSolicitud filtro', filtro);
    return this.http.post<IDataResponse>(this.urlEliminarSolicitud, JSON.stringify(filtro), this.options);
  }

  listarSolicitud(estadoSolicitud: string, fechaInicio?: string, fechaFin?: string) {
    let filtro = {
      sEstadosSolicitud: estadoSolicitud,
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin
    };
    console.log('listarSolicitud filtro', filtro, this.urlListarSolicitud);
    return this.http.post<IDataResponse>(this.urlListarSolicitud, JSON.stringify(filtro), this.options);
  }

  reenviarMail(oSolicitud: iSolicitudGestion) {
    return this.http.post<IDataResponse>(this.urlReenviarMail, JSON.stringify(oSolicitud), this.options);
  }

  obtenerSolicitudUsuario(codigoAutenticacion: string, idSesionReg: number) {
    let filtro = {
      sCodigoAutenticacion: codigoAutenticacion,
      nIdSesionReg: idSesionReg
    };
    console.log('obtenerSolicitudUsuario filtro', filtro);
    return this.http.post<IDataResponse>(this.urlObtenerSolicitudUsuario, JSON.stringify(filtro), this.options);
  }

  atenderSolicitud(solicitud: any) {
    console.log('atenderSolicitud filtro', solicitud);
    return this.http.post<IDataResponse>(this.urlAtenderSolicitud, JSON.stringify(solicitud), this.options);
  }

  registrarSolicitud(mfDocumento: File, oSolicitud: any) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    formData.append('oSolicitud', new Blob([JSON.stringify(oSolicitud)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data');

    return this.http.post<IDataResponse>(this.urlRegistrarSolicitud, formData, { headers });
  }

}
