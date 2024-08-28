import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class ContrasenaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlValidarUsuario = environment.baseUrl + '/rest/seguridad/validarUsuario';
  urlValidarCodigo = environment.baseUrl + '/rest/seguridad/validarCodigo';
  urlActualizarContrasena = environment.baseUrl + '/rest/seguridad/actualizarContrasena';

  constructor(private http: HttpClient) { }

  validarUsuario(usuario: String) {
    let filtro = {
      sUsuario: usuario
    }
    console.log('filtro', filtro);
    return this.http.post<IDataResponse>(this.urlValidarUsuario, JSON.stringify(filtro), this.options);
  }

  validarCodigo(codigoMail: String) {
    let filtro = {
      sCodigoMail: codigoMail
    }
    return this.http.post<IDataResponse>(this.urlValidarCodigo, JSON.stringify(filtro), this.options);
  }

  actualizarContrasena(idUsuario: Number, idValidaContrasena: Number, usuario: String,
    contrasena: String, correo: String) {
    let filtro = {
      nIdUsuario: idUsuario,
      nIdValidaContrasena: idValidaContrasena,
      sUsuario: usuario,
      sContrasena: contrasena,
      sCorreo: correo
    }
    return this.http.post<IDataResponse>(this.urlActualizarContrasena, JSON.stringify(filtro), this.options);
  }
}
