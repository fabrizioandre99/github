import { Component, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { SesionService } from '../../../services/sesion.service';
import { NgxPhosphorIconsModule } from 'ngx-phosphor-icons';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { FormsModule } from '@angular/forms';

import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialog,
} from '@angular/material/dialog';

import { Router } from '@angular/router';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorService } from '../../../services/error.service';
import { IAutenticacion } from '../../../models/autenticacion';
@Component({
  selector: 'app-codigo-verificacion',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPhosphorIconsModule,
    MatIconModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatProgressSpinnerModule,
    CommonModule,
    AlertComponent,
    NgOtpInputModule,
    MatTooltipModule],
  templateUrl: './codigo-verificacion.component.html',
  styleUrl: './codigo-verificacion.component.css'
})

export class CodigoVerificacionComponent {
  codigo: any;
  sesion: any = null;
  errorLogin: boolean = false;
  loading: boolean = false;
  msgError: string = '';

  constructor(public dialog: MatDialog,
    private autenticacionService: AutenticacionService,
    private sesionService: SesionService,
    private sharedDataService: SharedDataService,
    private router: Router,
    private errorService: ErrorService
  ) {

  }

  async ngOnInit() {
    await this.sesionService.guardarSesion();
    this.sesion = this.sesionService.getSesion();

    console.log('this.sesion', this.sesion);
  }


  onOtpChange(otp: any) {
    this.codigo = otp;
    console.log(this.codigo);
  }

  async fnCodigoContrasena() {
    this.loading = true;
    try {

      if (this.codigo.length == 6) {
        let oAutenticacion: IAutenticacion = {
          sCodigoValidacion: this.codigo,
          nIdSesionReg: this.sesion
        };

        console.log('oAutenticacion', oAutenticacion);

        let data: IDataResponse = await lastValueFrom(this.autenticacionService.verificarCodigo(oAutenticacion));

        console.log(data);

        if (data.boExito) {
          let codigoConfirmar = data.oDatoAdicional;

          //console.log('codigoConfirmar', codigoConfirmar);

          this.sharedDataService.setNuevaContrasena(codigoConfirmar);
          this.router.navigate(['/nueva-contrasena']);
        } else {

          this.errorLogin = true;

          this.msgError = data.sMensajeUsuario;
        }

      }

    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loading = false;
  }

}
