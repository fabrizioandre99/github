import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { MenuService } from 'src/app/services/menu.service';
import { UsuarioService } from 'src/app/services/usuario.service';
@Component({
  selector: 'app-loading-login',
  templateUrl: './loading-login.component.html',
  styleUrls: ['./loading-login.component.css']
})
export class LoadingLoginComponent implements OnInit {
  user: any;
  cookieEmail: any;
  rutaRedict: string;

  constructor(private menuService: MenuService, private router: Router, private usuarioService: UsuarioService, private toastr: ToastrService) { }

  ngOnInit(): void {
    //console.log('sessionRol', sessionStorage.getItem('SessionRol'));
    this.cookieEmail = this.getCookie('correo');
    //console.log(' this.cookieEmail', this.cookieEmail);
    this.fnObtenerUsuario();
  }

  async fnObtenerUsuario() {
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuario(this.cookieEmail));
      if (data.exito) {

        localStorage.setItem('SessionRol', data.datoAdicional.oRol.nIdRol);
        //console.log('sessionRol', localStorage.getItem('SessionRol'));

        localStorage.setItem('SessionUser', data.datoAdicional.sNombre + " " + data.datoAdicional.sApellPaterno + " " + data.datoAdicional.sApellMaterno);
        //console.log('sessionUser', localStorage.getItem('SessionUser'));

        localStorage.setItem('SessionIdUsuario', data.datoAdicional.nIdUsuario);
        //console.log('sessionIdUsuario', localStorage.getItem('SessionIdUsuario'));

        localStorage.setItem('SessionaInicio', "iniciado");
        //console.log('sessionIdUsuario', localStorage.getItem('SessionIdUsuario'));

        this.menuService.disparadorDeListado.emit();
        this.fnListarMenu();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.router.navigate(["/"]);
      this.toastr.warning('Cuenta inválida', 'Advertencia');
    }
  }


  async fnListarMenu() {
    //console.log('Session', localStorage.getItem('SessionRol'));
    let data: IDataResponse = await lastValueFrom(this.menuService.listarActivos(localStorage.getItem('SessionRol')));
    if (data.exito) {
      for (let i = 0; i < data.datoAdicional.length; i++) {
        const menu = data.datoAdicional[i];
        if (menu.sRuta.startsWith('/')) {
          this.rutaRedict = menu.sRuta;
          continue;
        } else if (menu.liSeccion.length > 0) {
          this.rutaRedict = menu.liSeccion[0].sRuta;
          break;
        }
      }

      localStorage.setItem('SessionRuta', this.rutaRedict);
      this.router.navigate([this.rutaRedict]);

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  getCookie(name: string): string | null {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

}
