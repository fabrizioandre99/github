import { Component, HostListener, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { SolicitudUsuario } from 'src/app/models/solicitud';
import { AlertService } from 'src/app/services/alert.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nueva-contrasena',
  templateUrl: './nueva-contrasena.component.html',
  styleUrls: ['./nueva-contrasena.component.css']
})
export class NuevaContrasenaComponent implements OnInit {

  verificaContrasena: String;
  solicitud = new SolicitudUsuario;
  recibirCodigo: any = {};
  submitted: boolean = false;
  loading: boolean = false;

  //Validación inputs contraseñas
  showPassword: boolean = false;
  showPasswordR: boolean = false;

  //Validación regex texto inferior
  regexMinimo: boolean = false;
  regexMayusculas: boolean = false;
  regexNumero: boolean = false;
  regexCaracter: boolean = false;
  regexInicioCaracter: boolean = false;

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose() {
    window.history.back();
  }

  constructor(private solicitudUsuarioService: SolicitudUsuarioService, private router: Router,
    private alertService: AlertService, private modalService: NgbModal,
    private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    this.recibirCodigo = this.sharedDataService.itemNuevaContrasena;
    //console.log('this.recibirCodigo', this.sharedDataService.itemNuevaContrasena);
  }

  showFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'text';
    //console.log('mostrar');
  }

  hideFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'password';
    //console.log('ocultar');
  }

  showSecondPassword(secondPassword: HTMLInputElement) {
    secondPassword.type = 'text';
    //console.log('mostrar');
  }

  hideSecondPassword(secondPassword: HTMLInputElement) {
    secondPassword.type = 'password';
    //console.log('ocultar');
  }
  async fnNuevaContrasena(form: NgForm, contentNuevaContrasena: any) {
    try {
      this.submitted = true;
      this.loading = true;
      if (form.invalid) {
        /* this.submitted = false; */
        this.loading = false;
        return;
      }

      //Si no regresa nIdUser, asignar valor de -1
      if (!this.recibirCodigo.nIdUser) {
        this.recibirCodigo.nIdUser = -1
      }

      //console.log('58', this.recibirCodigo.nIdUser, this.recibirCodigo.nIdUsuario
      //, this.recibirCodigo.sUsuario, this.solicitud.sContrasenia, this.recibirCodigo.sCorreo)
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.actualizarContrasena(this.recibirCodigo.nIdUser, this.recibirCodigo.nIdUsuario
        , this.recibirCodigo.sUsuario, this.solicitud.sContrasenia, this.recibirCodigo.sCorreo));
      if (data.exito) {
        //console.log(data);
        this.sharedDataService.setNuevaContrasena(null);
        this.alertService.close('');
        this.modalService.open(contentNuevaContrasena, { centered: true, backdrop: 'static' });
      } else {
        this.alertService.error(data.mensajeUsuario);
      }

    }
    catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.submitted = false;
    this.loading = false;
  }
}
