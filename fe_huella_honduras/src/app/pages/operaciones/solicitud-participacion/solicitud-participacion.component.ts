import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxPhosphorIconsModule } from 'ngx-phosphor-icons';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GestionService } from '../../../services/gestion-service/solicitud.service';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { IUsuario } from '../../../models/usuario';
import { ToastrModule } from 'ngx-toastr';
import { SesionService } from '../../../services/sesion.service';
import {
  MatDialog,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchivoService } from '../../../services/archivo.service';
import { CiiuService } from '../../../services/gestion-service/ciiu.service';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-solicitud-participacion',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    NgxPhosphorIconsModule,
    MatIconModule,
    MatToolbarModule,
    CommonModule,
    HttpClientModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatProgressSpinnerModule,
    ToastrModule,
    AlertComponent],
  templateUrl: './solicitud-participacion.component.html',
  styleUrl: './solicitud-participacion.component.css'
})

export class SolicitudParticipacionComponent {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  oUsuario: IUsuario = {};
  lstRol: any[] = [];
  sesion: any = null;

  dragging: boolean = false;
  isUploading: boolean = false;
  isUploaded: boolean = false;
  noEsPdf: boolean = false;
  archivoMuyGrande: boolean = false;
  cambioArchivo: boolean = false;

  archivoEvidencia: File | null = null;

  nombreArchivo: string = '';
  tamanoArchivo: string = '';
  archivoCambio: boolean = false;

  rtnRegistrado: boolean = false;
  msg_rtnRegistrado: string = '';

  dniRegistrado: boolean = false;
  msg_dniRegistrado: string = '';

  errorServer: boolean = false;
  msg_errorServer: string = '';

  shake1: boolean = false;
  shake2: boolean = false;
  shake3: boolean = false;

  numSolicitud: number = 0;
  clickUltimoPaso: boolean = false;

  loadingForm: boolean = false;
  loadingFinal: boolean = false;


  lstGetSolicitud: any = {};
  esEditar: boolean = false;
  getToken: string = '';

  getRuta: any = {};

  @ViewChild('fileParticipacion') fileParticipacion: any;
  @ViewChild(MatStepper, { static: true }) stepper!: MatStepper;
  @ViewChild('modalSolicitud') modalSolicitud: any;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private ciiuService: CiiuService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private sesionService: SesionService,
    private gestionService: GestionService,
    private parametroService: ParametroService,
    private archivoService: ArchivoService,
    private errorService: ErrorService) {

    this.firstFormGroup = this.fb.group({
      rtn: ['', [Validators.required, Validators.pattern(/^\d{14,15}$/)]],
      rsocial: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ .-]*$/)]],
      address: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ .-]*$/)]],
      ciiu: ['', Validators.required],
      file: ['']
    });


    this.secondFormGroup = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      lastName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
    });

  }


  async ngOnInit(): Promise<void> {
    await this.sesionService.guardarSesion();
    this.sesion = this.sesionService.getSesion();
    console.log('Sesion detectada en solicitud-particion', this.sesion);

    this.getToken = this.activeRoute.snapshot.params['token'];
    console.log('getToken', this.getToken);

    await this.fnListarActividadEconomica();

    if (this.getToken) {
      await this.getRutaParameter();
      await this.fnObtenerSolicitud();
    }

  }


  async fnListarActividadEconomica() {
    try {
      let data: IDataResponse = await lastValueFrom(this.ciiuService.listarCIIU(this.sesion));

      console.log('fnListarRol', data);
      if (data.boExito) {
        this.lstRol = data.oDatoAdicional;
      }
    }
    catch (error: any) {
      this.errorService.enviar(error);
    }

  }

  async fnObtenerSolicitud() {
    try {
      let data: IDataResponse = await lastValueFrom(this.gestionService.obtenerSolicitudUsuario(this.getToken, this.sesion));

      console.log('fnObtenerSolicitud', data);
      if (data.boExito) {
        console.log('|-------------ESTÁ ACTUALIZANDO---------------|');
        this.esEditar = true;

        this.lstGetSolicitud = data.oDatoAdicional;
        console.log('this.lstGetSolicitud', this.lstGetSolicitud);

        this.firstFormGroup.setValue({
          rtn: this.lstGetSolicitud.oInstitucion.sNumeroRtn,
          rsocial: this.lstGetSolicitud.oInstitucion.sRazonSocial,
          address: this.lstGetSolicitud.oInstitucion.sDireccion,
          ciiu: this.lstGetSolicitud.oInstitucion.oCiiu.nIdCiiu,
          file: null
        });

        this.secondFormGroup.setValue({
          dni: this.lstGetSolicitud.oUsuario.sNumDocumento,
          firstName: this.lstGetSolicitud.oUsuario.sNombre,
          lastName: this.lstGetSolicitud.oUsuario.sApellidos,
          email: this.lstGetSolicitud.oUsuario.sCorreo,
          phone: this.lstGetSolicitud.oUsuario.sTelefono
        });

        this.isUploaded = false;
        this.nombreArchivo = this.lstGetSolicitud.oDocumento.sNombre;
        console.log('this.lstGetSolicitud', this.lstGetSolicitud);

        console.log('this.lstGetSolicitud.oUsuario', this.lstGetSolicitud.oUsuario);

        await this.descargarArchivoMemoria();
      } else {
        console.log('|-------------ESTÁ REGISTRANDO---------------|');
      }
    }
    catch (error: any) {
      this.errorService.enviar(error);
    }

  }
  /* ---------- Funciones de cambio de Step (Header) -------------- */
  checkFormValidation(formGroup: FormGroup, shakeVar: 'shake1' | 'shake2' | 'shake3') {
    if (!formGroup.valid || this.rtnRegistrado || this.dniRegistrado || !this.archivoEvidencia) {
      this[shakeVar] = true;
      setTimeout(() => this[shakeVar] = false, 500);  // Restablecer la animación después de 500ms
    }
  }


  irAlPrimerPaso(stepper: MatStepper) {
    stepper.selectedIndex = 0;
  }
  /* ---------- Funciones de cambio de Step -------------- */

  async irAlSegundoPaso(stepper: MatStepper) {

    this.clickUltimoPaso = true;

    console.log('this.firstFormGroup.valid', this.firstFormGroup.valid);
    console.log(this.esEditar);

    if ((this.firstFormGroup.valid && this.archivoEvidencia) || (this.firstFormGroup.valid && this.esEditar)) {
      try {
        this.rtnRegistrado = false;

        const rtnValue = this.firstFormGroup.get('rtn')?.value;
        const idSolicitudValue = this.esEditar ? this.lstGetSolicitud.nIdSolicitudUsuario : -1;

        let data: IDataResponse = await lastValueFrom(this.gestionService.validarDocumento(idSolicitudValue, 'RTN', rtnValue, this.sesion));


        if (data.oDatoAdicional) {
          stepper.selectedIndex = 1;

        } else {

          this.rtnRegistrado = true;
          this.msg_rtnRegistrado = data.sMensajeUsuario;

        }
      }
      catch (error: any) {
        this.errorService.enviar(error);
      }
    } else {
      this.firstFormGroup.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
    }


  }

  async irAlTercerPaso(stepper: MatStepper) {

    this.loadingForm = true;

    console.log('this.secondFormGroup.valid', this.secondFormGroup.valid);


    if (this.secondFormGroup.valid) {
      try {
        this.dniRegistrado = false;

        const rtnValue = this.secondFormGroup.get('dni')?.value;
        const idSolicitudValue = this.esEditar ? this.lstGetSolicitud.nIdSolicitudUsuario : -1;


        let data: IDataResponse = await lastValueFrom(this.gestionService.validarDocumento(idSolicitudValue, 'DNI', rtnValue, this.sesion));
        console.log('data.oDatoAdicional', data.oDatoAdicional);


        if (data.oDatoAdicional) {

          let oSolicitud =
          {
            nIdSolicitudUsuario: this.esEditar ? this.lstGetSolicitud.nIdSolicitudUsuario : -1,
            nIdSesionReg: this.sesion,
            oInstitucion: {
              oCiiu: {
                nIdCiiu: this.firstFormGroup.controls['ciiu'].value
              },
              sRazonSocial: this.firstFormGroup.controls['rsocial'].value,
              sNumeroRtn: this.firstFormGroup.controls['rtn'].value,
              sDireccion: this.firstFormGroup.controls['address'].value
            },
            oUsuario: {
              sNombre: this.secondFormGroup.controls['firstName'].value,
              sApellidos: this.secondFormGroup.controls['lastName'].value,
              sNumDocumento: this.secondFormGroup.controls['dni'].value,
              sCorreo: this.secondFormGroup.controls['email'].value,
              sTelefono: this.secondFormGroup.controls['phone'].value,
            },
          };

          console.log('oSolicitud', oSolicitud);


          let dataReg: IDataResponse = await lastValueFrom(this.gestionService.registrarSolicitud(this.archivoEvidencia!, oSolicitud));

          console.log('dataReg', dataReg);

          if (dataReg.boExito) {
            this.errorServer = false;

            this.numSolicitud = dataReg.oDatoAdicional;

            this.dialog.open(this.modalSolicitud, {
              disableClose: true
            });

          } else {
            this.errorServer = true;
            this.msg_errorServer = dataReg.sMensajeUsuario;
          }


        } else {

          this.dniRegistrado = true;
          this.msg_dniRegistrado = data.sMensajeUsuario;

        }
      }
      catch (error: any) {
        this.errorService.enviar(error);
      }
    } else {
      this.secondFormGroup.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
    }
    this.loadingForm = false;
  }


  /* ---------- Componente de Input File -------------- */

  handleButtonNEvidencia(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const fileInput = document.querySelector('#fileParticipacion') as HTMLElement | null;
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('El elemento de entrada del archivo no se encontró en el DOM.');
    }
  }

  handleDragOverEvidencia(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  handleDropEvidencia(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.validateFile(file);

      if (this.esEditar) {
        this.cambioArchivo = true;
      }
    }
  }

  changeEvidencia(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.validateFile(file);

      if (this.esEditar) {
        this.cambioArchivo = true;
      }
    }
  }

  validateFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.noEsPdf = true;
      this.archivoMuyGrande = false;
      this.isUploaded = false;
      this.archivoEvidencia = null;
    } else if (file.size > 5 * 1024 * 1024) { // 5 MB
      this.archivoMuyGrande = true;
      this.noEsPdf = false;
      this.isUploaded = false;
      this.archivoEvidencia = null;
    } else {
      this.archivoEvidencia = file;
      this.nombreArchivo = file.name;
      this.isUploaded = true;
      this.noEsPdf = false;
      this.archivoMuyGrande = false;

    }
  }

  /* ---------- Formato de teléfono -------------- */
  formatPhone(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4) + '-' + value.substring(4, 8);
    }
    input.value = value;
  }

  /* ---------- Formato de RTN y DNI -------------- */
  formatRTN(event: Event) {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value;

    inputValue = inputValue.replace(/\D/g, '');

    if (inputValue.length > 3) {
      inputValue = inputValue.substring(0, 3) + ' ' + inputValue.substring(3);
    }
    if (inputValue.length > 7) {
      inputValue = inputValue.substring(0, 7) + ' ' + inputValue.substring(7);
    }
    if (inputValue.length > 12) {
      inputValue = inputValue.substring(0, 12) + ' ' + inputValue.substring(12);
    }

    input.value = inputValue;


    this.firstFormGroup.controls['rtn'].setValue(inputValue);
  }

  /* ---------- Refrescar página -------------- */
  refreshPage() {
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }


  /* ---------- Descargar archivo -------------- */
  blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }

  async getRutaParameter() {
    try {
      let filtro = {
        sTipo: "SISTEMA",
        sCodigo: "RUTA-DATA"
      }
      let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerParametro(filtro));
      console.log(data);
      if (data.boExito) {
        this.getRuta = data.oDatoAdicional;
        console.log('this.getRuta', this.getRuta);
      }

    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnDescargaArchivo() {
    await this.archivoService.descargaArchivo(this.lstGetSolicitud.oDocumento.sCodigoDocumento, this.lstGetSolicitud.oDocumento.sNombre);
  }

  async fnDescargarFormato() {
    await this.archivoService.descargaArchivo(environment.documentos.declaracion, environment.documentos.declaracion);
  }

  async descargarArchivoMemoria() {
    try {
      console.log('here');
      console.log('this.lstGetSolicitud.oDocumento', this.lstGetSolicitud.oDocumento);

      const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(this.lstGetSolicitud.oDocumento.sCodigoDocumento));

      console.log('blob', blob);

      this.archivoEvidencia = this.blobToFile(blob, 'archivoDescargado.pdf'); // Ajusta el nombre y tipo de archivo según sea necesario

    } catch (error) {
      this.errorService.enviar(error);
    }
  }
}

