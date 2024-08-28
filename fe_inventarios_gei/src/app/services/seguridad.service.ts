import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICredencial } from '../models/credencial';
import { IDataResponse } from '../models/IDataResponse';
import { IUsuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  public usuarioActual: BehaviorSubject<IUsuario>;
  public currentToken: BehaviorSubject<string>

  oRespuesta: IDataResponse;

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlLogin = environment.baseUrl + '/rest/seguridad/login';
  urlMenuRol = environment.baseUrl + '/rest/seguridad/menu-rol';
  urlListarRol = environment.baseUrl + '/rest/seguridad/listarRol';
  urlListarBloqueados = environment.baseUrl + '/rest/seguridad/listarBloqueados';
  urlDesbloquearUsuario = environment.baseUrl + '/rest/seguridad/desbloquearUsuario';

  constructor(private http: HttpClient) {
    this.usuarioActual = new BehaviorSubject(JSON.parse(localStorage.getItem(environment.sNombreCookie) || 'null'));
    this.currentToken = new BehaviorSubject(localStorage.getItem("sToken") || 'null');
  }

  get obtenerUsuarioActual(): IUsuario {
    return this.usuarioActual.value;
  }

  get obtenerToken(): string {
    return this.currentToken.value;
  }

  setUsuarioActual(oUsuario: IUsuario) {
    localStorage.setItem(environment.sNombreCookie, JSON.stringify(oUsuario));
  }

  setCurrentToken(sToken: string) {
    localStorage.setItem("sToken", sToken);
  }

  logout() {
    localStorage.removeItem("sToken");
    localStorage.removeItem(environment.sNombreCookie);
    this.usuarioActual.next({});
    this.currentToken.next("");
  }

  isLogged(): IUsuario {
    let currentUser = {};
    //console.log(this.obtenerUsuarioActual);
    if (this.obtenerUsuarioActual != null && this.obtenerUsuarioActual != undefined) {
      //console.log(this.obtenerUsuarioActual.sUsuario);
      currentUser = this.obtenerUsuarioActual;
    }
    return currentUser;
  }

  login(credenciales: ICredencial) {
    return this.http.post(this.urlLogin, credenciales, { observe: 'response' })
      .pipe(map((data: any) => {

        let body = data.body;
        this.oRespuesta = body;
        if (body.exito) {
          this.setCurrentToken(data.headers.get('Authorization'));
          this.currentToken.next(data.headers.get('Authorization'))
          this.setUsuarioActual(body.datoAdicional);
          this.usuarioActual.next(body.datoAdicional);
        }
        return this.oRespuesta;
      })
      )
  }

  obtenerMenuRol(nRol: Number) {
    let filtro = {
      nIdRol: nRol
    };
    return this.http.post<IDataResponse>(this.urlMenuRol, JSON.stringify(filtro), this.options);
  }

  listarRol() {
    return this.http.post<IDataResponse>(this.urlListarRol, "", this.options);
  }

  listarBloqueados() {
    return this.http.post<IDataResponse>(this.urlListarBloqueados, "", this.options);
  }

  desbloquearUsuario(idUsuarioBloqueado: Number) {
    let filtro = {
      nIdUsuarioBloqueado: idUsuarioBloqueado
    };
    return this.http.post<IDataResponse>(this.urlDesbloquearUsuario, JSON.stringify(filtro), this.options);
  }
}
