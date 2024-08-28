import { Component, HostListener, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { SolicitudUsuario } from '../../../models/solicitud';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedDataService } from '../../../services/shared-data.service';
import { ContrasenaService } from '../../../services/contrasena.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nueva-contrasena',
  templateUrl: './nueva-contrasena.component.html',
  styleUrls: ['./nueva-contrasena.component.css']
})
export class NuevaContrasenaComponent implements OnInit {

  model = new SolicitudUsuario;
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

  isFirstPasswordVisible: boolean = false;
  isSecondPasswordVisible: boolean = false;

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose() {
    window.history.back();
  }

  constructor(private router: Router, private toastr: ToastrService, private modalService: NgbModal, private sharedDataService: SharedDataService,
    private contrasenaService: ContrasenaService) { }

  ngOnInit(): void {
    this.model.sContrasena = '';
    this.model.sRepContrasena = '';

    this.recibirCodigo = this.sharedDataService.itemNuevaContrasena;
    //console.log('this.recibirCodigo', this.sharedDataService.itemNuevaContrasena);
  }

  showFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'text';
    this.isFirstPasswordVisible = true;
    //console.log('mostrar');
  }

  hideFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'password';
    this.isFirstPasswordVisible = false;
    //console.log('ocultar');
  }

  showSecondPassword(secondPassword: HTMLInputElement) {
    secondPassword.type = 'text';
    this.isSecondPasswordVisible = true;
    //console.log('mostrar');
  }

  hideSecondPassword(secondPassword: HTMLInputElement) {
    secondPassword.type = 'password';
    this.isSecondPasswordVisible = false;
    //console.log('ocultar');
  }
  async fnNuevaContrasena(form: NgForm) {
    this.submitted = true;
    if (form.invalid) {
      return;
    }

    if (this.model.sContrasena !== this.model.sRepContrasena) {
      return
    }
    this.submitted = false;
    this.loading = true;

    let data: IDataResponse = await lastValueFrom(this.contrasenaService.actualizarContrasena(this.recibirCodigo.nIdUsuario, this.recibirCodigo.nIdUsuario
      , this.recibirCodigo.sUsuario, this.model.sContrasena, this.recibirCodigo.sCorreo));
    if (data.exito) {

      this.sharedDataService.setNuevaContrasena(null);
      this.router.navigate(['/']);
      this.toastr.success('La contraseña se ha cambiado exitosamente.', 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.submitted = false;
    this.loading = false;
  }

}
