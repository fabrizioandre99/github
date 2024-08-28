import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { IUsuario } from '../models/usuario';
import { Router } from '@angular/router';
import { ICredencial } from '../helpers/credencial';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  public usuarioActual: BehaviorSubject<IUsuario>;
  public currentToken: BehaviorSubject<string>;

  oRespuesta!: IDataResponse;

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlLogin = environment.baseUrl + '/rest/autenticacion/v1/iniciarSesion';
  urlSesion = environment.baseUrl + '/rest/seguridad/sesion';
  urlValidarToken = environment.baseUrl + '/rest/seguridad/validarToken';
  urlMenuRol = environment.baseUrl + '/rest/seguridad/menuRol';

  @Output() disparadorDeListado: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('sUsuario_honduras');
    const savedToken = localStorage.getItem('sToken_honduras');

    this.usuarioActual = new BehaviorSubject<IUsuario>(savedUser ? JSON.parse(savedUser) : {} as IUsuario);
    this.currentToken = new BehaviorSubject<string>(savedToken ? savedToken : '');
  }

  get obtenerUsuarioActual(): IUsuario {
    return this.usuarioActual.value;
  }

  get obtenerToken(): string {
    return this.currentToken?.value;
  }

  setUsuarioActual(oUsuario: IUsuario) {
    localStorage.setItem('sUsuario_honduras', JSON.stringify(oUsuario));
  }

  setCurrentToken(sToken: string) {
    localStorage.setItem('sToken_honduras', sToken);
  }

  isLogged(): IUsuario {
    let currentUser = {};
    if (this.obtenerUsuarioActual != null && this.obtenerUsuarioActual != undefined) {
      currentUser = this.obtenerUsuarioActual;
    }
    return currentUser;
  }

  login(credenciales: ICredencial) {
    return this.http.post(this.urlLogin, credenciales, { observe: 'response' })
      .pipe(map((data: any) => {
        let body = data.body;

        this.oRespuesta = body;
        if (body.boExito) {
          this.setCurrentToken(data.headers.get('Authorization'));
          this.currentToken.next(data.headers.get('Authorization'))
          this.setUsuarioActual(body.oDatoAdicional);
          this.usuarioActual.next(body.oDatoAdicional);
        }
        return this.oRespuesta;
      })
      )
  }

  logout() {
    localStorage.clear();
    this.currentToken.next('');
    this.usuarioActual.next({} as IUsuario);
    this.router.navigate(["/"]);
  }


  menuRol(codRol: String) {
    let filtro = {
      sCodRol: codRol
    }
    return this.http.post<IDataResponse>(this.urlMenuRol, JSON.stringify(filtro), this.options);
  }

  validarToken() {
    return this.http.post<IDataResponse>(this.urlValidarToken, '', this.options);
  }


}
