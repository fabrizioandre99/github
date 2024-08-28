import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarUsuario = environment.baseUrl + '/rest/usuario/listar';
  urlActualizarUsuario = environment.baseUrl + '/rest/usuario/actualizar';
  urlEliminarUsuario = environment.baseUrl + '/rest/usuario/eliminar';
  urlRegistrarUsuario = environment.baseUrl + '/rest/usuario/registrar';
  urlLogUsuario = environment.baseUrl + '/rest/usuario/logUsuario';
  urlReenviarMail = environment.baseUrl + '/rest/usuario/reenviarMail';
  constructor(private http: HttpClient) { }

  listarUsuario() {
    return this.http.post<IDataResponse>(this.urlListarUsuario, '', this.options);
  }

  actualizarUsuario(idUsuario: Number, estado: Boolean) {
    let filtro = {
      nIdUsuario: idUsuario,
      boEstado: estado
    }
    return this.http.post<IDataResponse>(this.urlActualizarUsuario, JSON.stringify(filtro), this.options);
  }

  eliminarUsuario(idUsuario: Number) {
    let filtro = {
      nIdUsuario: idUsuario
    }
    return this.http.post<IDataResponse>(this.urlEliminarUsuario, JSON.stringify(filtro), this.options);
  }

  registrarUsuario(oUsuario: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarUsuario, JSON.stringify(oUsuario), this.options);
  }

  logUsuario(fechaReg: String, idUsuario: Number) {
    let filtro = {
      sFechaReg: fechaReg,
      nIdUsuario: idUsuario
    }
    return this.http.post<IDataResponse>(this.urlLogUsuario, JSON.stringify(filtro), this.options);
  }

  reenviarMail(oUsuario: any) {
    return this.http.post<IDataResponse>(this.urlReenviarMail, JSON.stringify(oUsuario), this.options);
  }
}
