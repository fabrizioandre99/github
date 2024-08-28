import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarUsuarios = '/rest/administrativo/usuario/listar';
  urlInsertarUsuario = '/rest/administrativo/usuario/insertar';
  urlActualizarUsuario = '/rest/administrativo/usuario/actualizar';
  urlObtenerUsuario = '/rest/administrativo/usuario/obtener';

  constructor(private http: HttpClient) { }

  listarUsuarios() {
    return this.http.post<IDataResponse>(this.urlListarUsuarios, '', this.options);
  }

  insertarUsuario(idRol: Number, nombre: String, apellPaterno: String, apellMaterno: String, correo: String, codEstado: Number, idUsuarioMod: String) {
    let filtro = {
      oRol: {
        nIdRol: idRol
      },
      sNombre: nombre,
      sApellPaterno: apellPaterno,
      sApellMaterno: apellMaterno,
      sCorreo: correo,
      nCodEstado: codEstado,
      nIdUsuarioMod: idUsuarioMod
    }
    return this.http.post<IDataResponse>(this.urlInsertarUsuario, JSON.stringify(filtro), this.options);
  }


  actualizarUsuario(idUsuario: Number, idRol: Number, nombre: String, apellPaterno: String, apellMaterno: String, correo: String, codEstado: Number, idUsuarioMod: String) {
    let filtro = {
      nIdUsuario: idUsuario,
      oRol: {
        nIdRol: idRol
      },
      sNombre: nombre,
      sApellPaterno: apellPaterno,
      sApellMaterno: apellMaterno,
      sCorreo: correo,
      nCodEstado: codEstado,
      nIdUsuarioMod: idUsuarioMod
    }
    return this.http.post<IDataResponse>(this.urlActualizarUsuario, JSON.stringify(filtro), this.options);
  }

  obtenerUsuario(correo: String) {
    let filtro = {
      sCorreo: correo
    }
    return this.http.post<IDataResponse>(this.urlObtenerUsuario, JSON.stringify(filtro), this.options);
  }
}
