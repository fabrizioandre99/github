import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { UsuarioMinam } from '../models/usuario-minam';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarUsuarioMinam = environment.baseUrl + '/rest/usuario/listarUsuarioMinam';
  urlListarUsuarioExterno = environment.baseUrl + '/rest/usuario/listarUsuarioExterno';
  urlAsignarRol = environment.baseUrl + '/rest/usuario/asignarRol';
  urlBuscarUsuario = environment.baseUrl + '/rest/usuario/buscarUsuarioMinam';
  urlActualizarUsuario = environment.baseUrl + '/rest/usuario/actualizar';
  urlDescargarUsuario = environment.baseUrl + '/rest/usuario/descargar';

  constructor(private http: HttpClient) { }


  listarUsuarioMinam() {
    return this.http.post<IDataResponse>(this.urlListarUsuarioMinam, "", this.options);
  }
  listarUsuarioExterno() {
    return this.http.post<IDataResponse>(this.urlListarUsuarioExterno, "", this.options);
  }
  buscarUsuario(Usuario: String) {
    let filtro = {
      sUsuario: Usuario
    };
    return this.http.post<IDataResponse>(this.urlBuscarUsuario, JSON.stringify(filtro), this.options);
  }
  asignarRol(IdUsuario: Number, IdRol: Number, Estado: String) {
    let filtro = {
      nIdUsuario: IdUsuario,
      nIdRol: IdRol,
      sEstado: Estado
    };
    return this.http.post<IDataResponse>(this.urlAsignarRol, JSON.stringify(filtro), this.options);
  }
  actualizarUsuario(oUsuarioMinam: UsuarioMinam) {
    return this.http.post<IDataResponse>(this.urlActualizarUsuario, JSON.stringify(oUsuarioMinam), this.options);
  }

  descargarUsuario() {
    return this.http.post(this.urlDescargarUsuario, "", { responseType: 'arraybuffer' });
  }
}
