import { Component, ViewChild } from '@angular/core';
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
import { SharedDataService } from '../../../services/shared-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IAutenticacion } from '../../../models/autenticacion';
@Component({
  selector: 'app-codigo-verificacion',
  standalone: true,
  imports: [MatCardModule,
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
    AlertComponent,
    MatProgressSpinnerModule],
  templateUrl: './nueva-contrasena.component.html',
  styleUrl: './nueva-contrasena.component.css'
})
export class NuevaContrasenaComponent {
  nuevaContrasenaForm: FormGroup;
  loading: boolean = false;

  hide: boolean = true;
  shake: boolean = false;
  recibirCodigo: any = {};
  sesion: any;

  @ViewChild('modalOlvideContrasena') modalOlvideContrasena: any;

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  constructor(private formBuilder: FormBuilder, private autenticacionService: AutenticacionService, public dialog: MatDialog, private sharedDataService: SharedDataService,
    private sesionService: SesionService, private router: Router,
  ) {
    this.nuevaContrasenaForm = this.formBuilder.group({
      newContrasena: [{ value: '', disabled: this.loading }, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('(?=.*[A-Z])(?=.*[0-9]).{8,}$')
      ]],
      verifContrasena: [{ value: '', disabled: this.loading }, [
        Validators.required,
        Validators.pattern('(?=.*[A-Z])(?=.*[0-9]).{8,}$')
      ]]
    }, {
      validators: this.mustMatch('newContrasena', 'verifContrasena')
    });

    this.recibirCodigo = this.sharedDataService.itemNuevaContrasena;
    this.sesion = this.sesionService.getSesion();

    console.log('this.recibirCodigo', this.recibirCodigo);
  }

  get f() { return this.nuevaContrasenaForm.controls; }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }


  async fnNuevaContrasena() {

    console.log('this.recibirCodigo', this.recibirCodigo);
    if (this.nuevaContrasenaForm.invalid) {
      this.shake = true;
      setTimeout(() => this.shake = false, 500);
      return;
    }

    this.loading = true;

    try {
      //Si no regresa nIdUsuario, asignar valor de -1
      if (!this.recibirCodigo.nIdUsuario) {
        this.recibirCodigo.nIdUsuario = -1
      }

      let oAutenticacion: IAutenticacion = {
        nIdUsuario: this.recibirCodigo.nIdUsuario,
        sUsuario: this.recibirCodigo.sUsuario,
        sContrasenia: this.nuevaContrasenaForm.controls['newContrasena'].value,
        sCorreo: this.recibirCodigo.sCorreo,
        nIdSesionReg: this.sesion
      };

      let data: IDataResponse = await lastValueFrom(this.autenticacionService.cambiarContrasenia(oAutenticacion));

      console.log(data)

      if (data.boExito) {
        this.sharedDataService.setNuevaContrasena(null);

        this.dialog.open(this.modalOlvideContrasena, {
          width: '450px',
          disableClose: true
        });

      } else {
        //this.alertService.error(data.mensajeUsuario);
      }

    }
    catch (error) {
      //this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
  }

  navigateToLogin() {
    this.router.navigate(['/']);
  }
}