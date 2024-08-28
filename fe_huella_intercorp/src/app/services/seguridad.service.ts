import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { IUsuario } from '../models/usuario';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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

  urlLogin = environment.baseUrl + '/rest/seguridad/login';
  urlSesion = environment.baseUrl + '/rest/seguridad/sesion';
  urlValidarToken = environment.baseUrl + '/rest/seguridad/validarToken';
  urlMenuRol = environment.baseUrl + '/rest/seguridad/menuRol';

  @Output() disparadorDeListado: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService,) {
    this.usuarioActual = new BehaviorSubject(JSON.parse(localStorage.getItem('sUsuario_intercorp') || 'null'));
    this.currentToken = new BehaviorSubject(localStorage.getItem('sToken_intercorp') || 'null');
  }

  get obtenerUsuarioActual(): IUsuario {
    return this.usuarioActual.value;
  }

  get obtenerToken(): string {
    return this.currentToken?.value;
  }

  setUsuarioActual(oUsuario: IUsuario) {
    localStorage.setItem('sUsuario_intercorp', JSON.stringify(oUsuario));
  }

  setCurrentToken(sToken: string) {
    localStorage.setItem('sToken_intercorp', sToken);
  }

  isLogged(): IUsuario {
    let currentUser = {};
    if (this.obtenerUsuarioActual != null && this.obtenerUsuarioActual != undefined) {
      currentUser = this.obtenerUsuarioActual;
    }
    return currentUser;
  }

  login(idUsuarioCifrado: String) {
    let filtro = {
      sIdUsuarioCifrado: idUsuarioCifrado
    }
    return this.http.post(this.urlSesion, filtro, { observe: 'response' })
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

  logout() {
    localStorage.clear();
    this.currentToken = null!;
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
