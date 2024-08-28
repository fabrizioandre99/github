import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../src/environments/environment';
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
  urlMenuRol = environment.baseUrl + '/rest/seguridad/menuRol';

  @Output() disparadorDeListado: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService,) {
    this.usuarioActual = new BehaviorSubject(JSON.parse(localStorage.getItem("sUsuario") || 'null'));
    this.currentToken = new BehaviorSubject(localStorage.getItem("sToken") || 'null');
  }

  get obtenerUsuarioActual(): IUsuario {
    return this.usuarioActual.value;
  }

  get obtenerToken(): string {
    return this.currentToken.value;
  }

  setUsuarioActual(oUsuario: IUsuario) {
    localStorage.setItem("sUsuario", JSON.stringify(oUsuario));
  }

  setCurrentToken(sToken: string) {
    localStorage.setItem("sToken", sToken);
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

  login(usuario: String, contrasena: String) {
    let filtro = {
      sUsuario: usuario,
      sContrasena: contrasena
    };

    console.log('filtro login', filtro);
    return this.http.post(this.urlLogin, filtro, { observe: 'response' })
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

  logout(mensaje: string) {
    localStorage.clear();
    this.router.navigate(["/"]);
    this.toastr.warning(mensaje, 'Advertencia');
    console.log(mensaje);
  }

}
