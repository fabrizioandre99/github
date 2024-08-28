import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../../utils/alert/alert.component';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialog,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ICredencial } from '../../../helpers/credencial';
import { SeguridadService } from '../../../services/seguridad.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from '../../../services/error.service';
import { IAutenticacion } from '../../../models/autenticacion';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgxPhosphorIconsModule,
    MatIconModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    CommonModule,
    MatProgressSpinnerModule,
    AlertComponent,
    RecaptchaV3Module
  ],
})
export class InicioSesionComponent {
  loginForm: FormGroup;
  modalForm: FormGroup;

  errorLogin: boolean = false;
  msgError: string = '';
  loadingForm: boolean = false;

  loadingModal: boolean = false;

  shake: boolean = false;
  hide: boolean = true;

  sesion: any = null;

  @ViewChild('modalOlvideContrasena') modalOlvideContrasena: any;
  @ViewChild('modalAlerta') modalAlerta: any;

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  constructor(
    private fb: FormBuilder,
    private alert: ToastrService,
    public dialog: MatDialog,
    private autenticacionService: AutenticacionService,
    private sesionService: SesionService,
    private sharedDataService: SharedDataService,
    private router: Router,
    private seguridadService: SeguridadService,
    private errorService: ErrorService,
    private recaptchav3Service: ReCaptchaV3Service
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });

    this.modalForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }

  async ngOnInit() {
    await this.sesionService.guardarSesion();
    this.sesion = this.sesionService.getSesion();
    console.log('%c-----OBTIENE LA SESIÓN this.sesion-----', 'color: green; font-size: 20px;', this.sesion);
  }


  async iniciarSesion() {
    try {
      this.loadingForm = true;

      if (!this.loginForm.valid) {
        return
      }

      // Asegurarse de que la sesión está cargada antes de continuar
      if (!this.sesion) {
        await this.cargarSesion();
      }

      const credenciales: ICredencial = {
        sUsuario: this.loginForm.controls['usuario'].value,
        sContrasenia: this.loginForm.controls['contrasena'].value,
        nIdSesion: this.sesion
      };

      console.log('%c-----CREDENCIALES MANDADAS EN EL LOGIN-----', 'color: green; font-size: 20px;', credenciales);

      this.recaptchav3Service.execute('getToken').subscribe(async (sToken: string) => {

        //console.log('sToken', sToken);

        let data: IDataResponse = await lastValueFrom(this.seguridadService.login(credenciales));

        console.log('data', data);
        if (data.boExito) {
          this.sharedDataService.setMenu(null);
          this.sharedDataService.setMenu(data.oDatoAdicional);

          if (data.oDatoAdicional.sTipoUsuario === "Externo") {
            this.router.navigate(['/inicio-org']);
          } else {
            this.router.navigate(['/inicio']);
          }
        } else {
          this.loadingForm = false;
          if (data.nCodMensaje === 21) {
            this.dialog.open(this.modalAlerta, {
              width: '450px',
            });
          } else {
            this.errorLogin = true;
            this.msgError = data.sMensajeUsuario;
          }
        }
      });

    } catch (error) {
      this.errorService.enviar(error);
      this.loadingForm = false;
    }

  }

  private async cargarSesion() {
    await this.sesionService.guardarSesion();
    this.sesion = this.sesionService.getSesion();
  }

  async verificarUsuario() {
    try {
      console.log('this.modalForm.valid', this.modalForm.valid);
      this.loadingModal = true;
      if (this.modalForm.valid) {
        let oAutenticacion: IAutenticacion = {
          sUsuario: this.modalForm.controls['usuario'].value,
          nIdSesionReg: this.sesion
        };

        let data: IDataResponse = await lastValueFrom(this.autenticacionService.validarUsuario(oAutenticacion));

        console.log('data', data);
        if (data.oDatoAdicional) {
          console.log('here');
          this.router.navigate(['/codigo-verificacion']);
        } else {
          this.dialog.closeAll();
        }
      } else {
        // Manejo del caso cuando el formulario no es válido
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
  }

  checkFormValidation() {
    if (this.loginForm.invalid || this.errorLogin) {
      this.shake = true;
      setTimeout(() => this.shake = false, 500);
    }
  }

  olvideContrasena() {
    this.modalForm.reset();
    this.dialog.open(this.modalOlvideContrasena, {
      width: '450px',
    });
  }

  aceptarAlerta() {
    this.dialog.closeAll();
    this.olvideContrasena();
  }

  redictSolicitud() {
    this.router.navigate(['/solicitud-participacion']);
  }
}