import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { ContrasenaService } from 'src/app/services/contrasena.service';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-codigo-confirmacion',
  templateUrl: './codigo-confirmacion.component.html',
  styleUrls: ['./codigo-confirmacion.component.css']
})
export class CodigoConfirmacionComponent implements OnInit {
  codigo: any;
  isRequired: boolean = false;
  isMinimun: boolean = false;
  fShow: boolean = false;
  loading: boolean = false;
  constructor(private toastr: ToastrService, private contrasenaService: ContrasenaService,
    private router: Router, private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
  }

  onOtpChange(otp: any) {
    this.codigo = otp;
    if (!this.codigo) {
      this.isRequired = true;
    } else {
      this.isRequired = false;
    }

    if (this.codigo?.length < 5) {
      this.isMinimun = true;
    } else {
      this.isMinimun = false;
    }
  }

  openAlertInfo() {
    this.toastr.info('Ingrese el código enviado a su bandeja de correo. Si no cuenta con el código comuníquese con el administrador del sistema. ', 'Código de confirmación');
  }

  async fnCodigoConfirmacion(form: NgForm) {
    try {
      if (!this.codigo) {
        this.isRequired = true;
        return;
      }
      if (this.codigo?.length < 5) {
        this.isMinimun = true;
        return;
      }
      this.isRequired = false;
      this.isMinimun = false;
      this.loading = true;

      let data: IDataResponse = await lastValueFrom(this.contrasenaService.validarCodigo(this.codigo));
      if (data.exito) {
        let codigoConfirmar = data.datoAdicional;
        //console.log('codigoConfirmar', codigoConfirmar);
        this.sharedDataService.setNuevaContrasena(codigoConfirmar);
        this.router.navigate(['/nueva-contrasena']);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }

  }

}
