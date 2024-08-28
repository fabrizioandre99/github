import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { IAutenticacion } from '../models/autenticacion';


@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlRegistrarSesion = environment.baseUrl + '/rest/autenticacion/v1/registrarSesion';
  urlValidarUsuario = environment.baseUrl + '/rest/autenticacion/v1/validarUsuario';
  urlVerificarCodigo = environment.baseUrl + '/rest/autenticacion/v1/verificarCodigo';
  urlCambiarContrasenia = environment.baseUrl + '/rest/autenticacion/v1/cambiarContrasenia';

  constructor(private http: HttpClient) { }

  registrarSesion(oAutenticacion: IAutenticacion) {
    console.log('oAutenticacion', oAutenticacion);
    return this.http.post<IDataResponse>(this.urlRegistrarSesion, JSON.stringify(oAutenticacion), this.options);
  }

  validarUsuario(oAutenticacion: IAutenticacion) {
    return this.http.post<IDataResponse>(this.urlValidarUsuario, JSON.stringify(oAutenticacion), this.options);
  }

  verificarCodigo(oAutenticacion: IAutenticacion) {
    return this.http.post<IDataResponse>(this.urlVerificarCodigo, JSON.stringify(oAutenticacion), this.options);
  }

  cambiarContrasenia(oAutenticacion: IAutenticacion) {
    return this.http.post<IDataResponse>(this.urlCambiarContrasenia, JSON.stringify(oAutenticacion), this.options);
  }

}
