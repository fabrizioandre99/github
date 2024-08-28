import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IUsuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarUsuarioPorTipo = environment.baseUrl + '/rest/gestion/usuario/v1/listarPorTipo';
  urlRegistrarUsuarioSerna = environment.baseUrl + '/rest/gestion/usuario/v1/registrar';
  urlActualizarEstado = environment.baseUrl + '/rest/gestion/usuario/v1/actualizarEstado';
  urlObtenerUsuarioExterno = environment.baseUrl + '/rest/gestion/usuario/v1/obtenerUsuario';
  urlActualizarUsuarioExterno = environment.baseUrl + '/rest/gestion/usuario/v1/actualizarUsuario';
  urlActualizarInstitucion = environment.baseUrl + '/rest/gestion/usuario/v1/actualizarInstitucion';

  constructor(private http: HttpClient) { }

  listarUsuarioPorTipo(sCodTipoUsuario: string) {
    let filtro = {
      sCodTipoUsuario: sCodTipoUsuario
    };

    return this.http.post<IDataResponse>(this.urlListarUsuarioPorTipo, JSON.stringify(filtro), this.options);
  }

  registrarUsuarioSerna(oUsuario: IUsuario) {
    return this.http.post<IDataResponse>(this.urlRegistrarUsuarioSerna, JSON.stringify(oUsuario), this.options);
  }

  actualizarEstado(oUsuario: IUsuario) {
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(oUsuario), this.options);
  }

  obtenerUsuarioExterno(oUsuario: IUsuario) {
    return this.http.post<IDataResponse>(this.urlObtenerUsuarioExterno, JSON.stringify(oUsuario), this.options);
  }

  actualizarUsuarioExterno(oUsuario: IUsuario) {
    return this.http.post<IDataResponse>(this.urlActualizarUsuarioExterno, JSON.stringify(oUsuario), this.options);
  }

  actualizarInstitucion(oUsuario: IUsuario) {
    return this.http.post<IDataResponse>(this.urlActualizarInstitucion, JSON.stringify(oUsuario), this.options);
  }

}
