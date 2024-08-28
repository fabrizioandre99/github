

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { SolicitudUsuario } from '../models/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudUsuarioService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlActualizarContrasena = environment.baseUrl + '/rest/solicitud-usuario/actualizarContrasena';
  urlActualizarSolicitud = environment.baseUrl + '/rest/solicitud-usuario/actualizar';
  urlAprobar = environment.baseUrl + '/rest/atender-solicitud/aprobar';
  urlEnviarMail = environment.baseUrl + '/rest/solicitud-usuario/enviarMail';
  urlListarDepartamento = environment.baseUrl + '/rest/solicitud-usuario/departamentos';
  urlListarProvincia = environment.baseUrl + '/rest/solicitud-usuario/provincias';
  urlListarDistrito = environment.baseUrl + '/rest/solicitud-usuario/distritos';
  urlListarPendientes = environment.baseUrl + '/rest/atender-solicitud/pendiente';
  urlListarHistorial = environment.baseUrl + '/rest/atender-solicitud/historial';
  urlRegistrarSolicitud = environment.baseUrl + '/rest/solicitud-usuario/insertar';
  urlRechazar = environment.baseUrl + '/rest/atender-solicitud/rechazar';
  urlReenviarObservacion = environment.baseUrl + '/rest/atender-solicitud/reenviar';
  urlReenviarAprobacion = environment.baseUrl + '/rest/atender-solicitud/reenviarAprobacion';
  urlReenviarRechazo = environment.baseUrl + '/rest/atender-solicitud/reenviarRechazo';
  urlObservar = environment.baseUrl + '/rest/atender-solicitud/observar';
  urlObtenerDatos = environment.baseUrl + '/rest/solicitud-usuario/obtener-datos';
  urlVerificarRuc = environment.baseUrl + '/rest/solicitud-usuario/verificar-ruc';
  urlVerificarDni = environment.baseUrl + '/rest/solicitud-usuario/verificar-dni';
  urlValidarCodigo = environment.baseUrl + '/rest/solicitud-usuario/validar-codigo';
  urlValidarContrasenaCodigo = environment.baseUrl + '/rest/solicitud-usuario/validarContrasenaCodigo';

  constructor(private http: HttpClient) { }

  actualizar(oSolicitud: SolicitudUsuario) {
    //console.log('filtro - actualizar:', oSolicitud)
    return this.http.post<IDataResponse>(this.urlActualizarSolicitud, JSON.stringify(oSolicitud), this.options);
  }

  actualizarContrasena(user: Number, idUsuario: Number, usuario: String, contracena: String, correo: String) {
    let filtro = {
      nIdUser: user,
      nIdUsuario: idUsuario,
      sUsuario: usuario,
      sContracena: contracena,
      sCorreo: correo
    };
    //console.log('filtro -actualizarContrasena', filtro);
    return this.http.post<IDataResponse>(this.urlActualizarContrasena, JSON.stringify(filtro), this.options);
  }

  aprobar(oSolicitud: SolicitudUsuario) {
    return this.http.post<IDataResponse>(this.urlAprobar, JSON.stringify(oSolicitud), this.options);
  }

  enviarMail(usuario: Number) {
    let filtro = {
      sUsuario: usuario
    };
    return this.http.post<IDataResponse>(this.urlEnviarMail, JSON.stringify(filtro), this.options);
  }

  listarPendientes(fechaInicio: String, fechaFin: String) {
    let filtro = {
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin
    }
    //console.log('filtro listarPendientes', filtro);
    return this.http.post<IDataResponse>(this.urlListarPendientes, JSON.stringify(filtro), this.options);
  }

  listarHistorial(fechaInicio: String,fechaFin:String, estadoActual: Number) {
    let filtro = {
      sFechaInicio: fechaInicio,
      sFechaFin: fechaFin,
      sEstadoActual: estadoActual
    };

    //console.log('filtro listarHistorial', filtro);
    return this.http.post<IDataResponse>(this.urlListarHistorial, JSON.stringify(filtro), this.options);
  }

  listarDepartamento() {
    return this.http.post<IDataResponse>(this.urlListarDepartamento, "", this.options);
  }

  listarProvincia(departamento: String) {
    let filtro = {
      sCodDep: departamento
    }
    //console.log('filtro listarProvincia', filtro);
    return this.http.post<IDataResponse>(this.urlListarProvincia, JSON.stringify(filtro), this.options);
  }

  listarDistrito(departamento: String, provincia: String) {
    let filtro = {
      sCodDep: departamento,
      sCodProv: provincia
    }
    return this.http.post<IDataResponse>(this.urlListarDistrito, JSON.stringify(filtro), this.options);
  }

  observar(idSolicitud: Number, observacion: String) {
    let filtro = {
      nIdSolicitud: idSolicitud,
      sObservacion: observacion
    };
    //console.log('observar', filtro)
    return this.http.post<IDataResponse>(this.urlObservar, JSON.stringify(filtro), this.options);
  }

  obtenerDatos(urlKey: String) {
    let filtro = {
      sUrlKey: urlKey
    };
    //console.log('obtenerDatos', filtro)
    return this.http.post<IDataResponse>(this.urlObtenerDatos, JSON.stringify(filtro), this.options);
  }

  rechazar(idSolicitud: Number, motivo: String) {
    let filtro = {
      nIdSolicitud: idSolicitud,
      sObservacion: motivo
    };
    //console.log(filtro)
    return this.http.post<IDataResponse>(this.urlRechazar, JSON.stringify(filtro), this.options);
  }

  reenviarObservacion(idSolicitudUsuario: Number, correo: String) {
    let filtro = {
      nIdSolicitudUsuario: idSolicitudUsuario,
      sCorreo: correo
    };
    //console.log('filtro - Reenviar Observacion:', filtro)
    return this.http.post<IDataResponse>(this.urlReenviarObservacion, JSON.stringify(filtro), this.options);
  }

  reenviarAprobacion(idSolicitudUsuario: Number) {
    let filtro = {
      nIdSolicitudUsuario: idSolicitudUsuario
    };
    //console.log('filtro - Reenviar Aprobacion:', filtro)
    return this.http.post<IDataResponse>(this.urlReenviarAprobacion, JSON.stringify(filtro), this.options);
  }

  reenviarRechazo(idSolicitudUsuario: Number) {
    let filtro = {
      nIdSolicitudUsuario: idSolicitudUsuario
    };
    //console.log('filtro - Reenviar Rechazo:', filtro)
    return this.http.post<IDataResponse>(this.urlReenviarRechazo, JSON.stringify(filtro), this.options);
  }

  registrar(oSolicitud: SolicitudUsuario) {
    //console.log('filtro - insertar:', oSolicitud)
    return this.http.post<IDataResponse>(this.urlRegistrarSolicitud, JSON.stringify(oSolicitud), this.options);
  }

  verificarRuc(sRuc: Number) {
    let filtro = {
      ruc: sRuc
    };
    return this.http.post<IDataResponse>(this.urlVerificarRuc, JSON.stringify(filtro), this.options);
  }

  verificarDni(sDni: Number) {
    let filtro = {
      dni: sDni
    };
    return this.http.post<IDataResponse>(this.urlVerificarDni, JSON.stringify(filtro), this.options);
  }

  validarCodigo(codigo: Number) {
    let filtro = {
      sCodigo: codigo
    };
    return this.http.post<IDataResponse>(this.urlValidarCodigo, JSON.stringify(filtro), this.options);
  }

  validarContrasenaCodigo(codigo: Number) {
    let filtro = {
      sCodigo: codigo
    };
    return this.http.post<IDataResponse>(this.urlValidarContrasenaCodigo, JSON.stringify(filtro), this.options);
  }
}



