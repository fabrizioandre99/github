import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { lastValueFrom } from 'rxjs';
import { ICredencial } from 'src/app/models/credencial';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { AlertService } from 'src/app/services/alert.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class IniciosesionComponent implements OnInit {

  loading = false;
  oCredencial: ICredencial = {};
  changeValue: Boolean = false;
  getTipoCredencial: any = {};

  constructor(private seguridadService: SeguridadService, private router: Router,
    private alertService: AlertService, private recaptchav3Service: ReCaptchaV3Service) {
  }

  ngOnInit(): void {
    this.getTipoCredencial.SoyMinam = environment.sTipoCredencial.SoyMinam;
    this.getTipoCredencial.SoyMuni = environment.sTipoCredencial.SoyMuni;

    //console.log('SoyMinam-->', this.getTipoCredencial.SoyMinam);
    //console.log('SoyMuni-->', this.getTipoCredencial.SoyMuni);

  }

  fnValidaRecaptcha() {
    this.loading = true;
    this.recaptchav3Service.execute('getToken').subscribe((sToken: string) => {
      this.fnIniciarSesion();
    });
  }

  async fnIniciarSesion() {
    try {
      let resultado: IDataResponse = await lastValueFrom(this.seguridadService.login(this.oCredencial));

      if (resultado.exito) {
        if (resultado.datoAdicional.nTipo == '01') {
          this.router.navigate(['/listar-solicitud']);
        } else {
          this.router.navigate(['/listar-periodo']);
        }
      } else {
        this.alertService.error(resultado.mensajeUsuario);
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  changeRadio() {
    //console.log('oCredencial.sTipoUsuario', this.oCredencial.sTipoUsuario);
    if (this.changeValue == false) {
      this.changeValue = true;
    } else if (this.changeValue == true) {
      this.oCredencial.sUsuario = '';
      this.oCredencial.sContrasena = '';
    }
  }
}
