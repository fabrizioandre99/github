import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ArchivoService } from '../../../services/archivo.service';
import { SesionService } from '../../../services/sesion.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CiiuService } from '../../../services/gestion-service/ciiu.service';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { IUsuario } from '../../../models/usuario';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { SharedDataService } from '../../../services/shared-data.service';
import { SedeService } from '../../../services/huella-service/sede';
import { ISede } from '../../../models/SEDE';
import { iParametro } from '../../../models/parametro';
import { ErrorService } from '../../../services/error.service';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-perfil-organizacional',
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    DatePipe,
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './perfil-organizacional.component.html',
  styleUrl: './perfil-organizacional.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    AlertComponent,
    CdkTextareaAutosize,
    ToastrModule
  ]

})
export class PerfilOrganizacionalComponent {
  generalForm: FormGroup;
  coordinadorForm: FormGroup;
  sedesForm: FormGroup;

  lstRol: any[] = [];
  lstSede: any[] = [];
  lstTipoDocumento: any[] = [];
  lstUsuario: any = {};
  sesion: any = null;

  loadingPerfil: boolean = false;
  loadingCoordinador: boolean = false;
  loadingSede: boolean = false;
  loadingModal: boolean = false;

  showOtherGenderInput: boolean = false;
  panelOpenState: boolean = false;

  documentoGeneral: any = {};
  getRuta: any = {};
  nIdUsuario: number = 0;

  lstDepartamento: any[] = [];

  tSede = new MatTableDataSource<any>([]);
  nIdSede: number = 0;

  @ViewChild('modalDepurar') modalDepurar: any;
  @ViewChild('paginatorSede', { static: false }) paginatorSede!: MatPaginator;
  @ViewChild('organizationPanel') organizationPanel!: MatExpansionPanel;
  @ViewChild('representativePanel') representativePanel!: MatExpansionPanel;

  constructor(
    public dialog: MatDialog,
    private alert: ToastrService,
    private ciiuService: CiiuService,
    private usuarioService: UsuarioService,
    private sedeService: SedeService,
    private fb: FormBuilder,
    private sesionService: SesionService,
    private archivoService: ArchivoService,
    private parametroService: ParametroService,
    private sharedDataService: SharedDataService,
    private errorService: ErrorService
  ) {

    this.generalForm = this.fb.group({
      rtn: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d{15}$/)]],
      rsocial: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ .-]*$/)]],
      address: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ .-]*$/)]],
      ciiu: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(2000)]],

      dni: ['', [Validators.pattern(/^\d{13}$/)]],
      firstName: ['', [Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      lastName: ['', [Validators.maxLength(150), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      documentType: [''],
      gender: [''],
      otherGender: [''],
      isIndigenous: [false]
    });

    this.coordinadorForm = this.fb.group({
      documentType: [{ value: '', disabled: true }, [Validators.required]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      lastName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
    });

    this.sedesForm = this.fb.group({
      nombreSede: ['', Validators.maxLength(150)],
      departamento: ['']
    });
  }

  async ngOnInit() {
    await this.sesionService.guardarSesion();
    this.sesion = this.sesionService.getSesion();
    this.nIdUsuario = this.sharedDataService.itemMenu.nIdUsuario;

    await this.fnListarActividadEconomica();

    await this.getRutaParameter();
    await this.fnListarDepartamento();

    await this.fnObtenerDocumento();
    await this.fnObtenerUsuario();

    await this.fnListarSede();
  }

  ngAfterViewInit() {
    this.tSede.paginator = this.paginatorSede;
  }

  /* ---------- Servicios de Datos generales y Coordinador de GEI-------------- */

  async fnListarActividadEconomica() {
    try {
      let data: IDataResponse = await lastValueFrom(this.ciiuService.listarCIIU(this.sesion));

      console.log('fnListarRol', data);
      if (data.boExito) {
        this.lstRol = data.oDatoAdicional;
      }
    } catch (error: any) {
      this.errorService.enviar(error);
    }
  }

  async fnObtenerDocumento() {
    try {

      let oParametro: iParametro = {
        sTipo: "TIPO_DOCUMENTO"
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));
      if (data.boExito) {
        this.lstTipoDocumento = data.oDatoAdicional;
        console.log('this.lstTipoDocumento', this.lstTipoDocumento);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnObtenerUsuario() {
    try {
      let oUsuario: IUsuario = {
        nIdUsuario: this.nIdUsuario,
      };

      console.log('oUsuario', oUsuario);

      let data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      if (data.boExito) {
        this.lstUsuario = data.oDatoAdicional;

        console.log('this.lstUsuario', this.lstUsuario);

        const genero = this.lstUsuario.oInstitucion?.sGenero || '';
        const isOtherGender = genero !== 'Masculino' && genero !== 'Femenino';

        this.generalForm.patchValue({
          rtn: this.lstUsuario.oInstitucion?.sNumeroRtn || '',
          rsocial: this.lstUsuario.oInstitucion?.sRazonSocial || '',
          address: this.lstUsuario.oInstitucion?.sDireccion || '',
          ciiu: this.lstUsuario.oInstitucion?.oCiiu?.nIdCiiu || '',
          description: this.lstUsuario.oInstitucion?.sDescripcion || '',
          dni: this.lstUsuario.oInstitucion?.sDocRepresentante || '',
          firstName: this.lstUsuario.oInstitucion?.sNombreRepresentante || '',
          lastName: this.lstUsuario.oInstitucion?.sApellidosRepresentante || '',
          documentType: this.lstUsuario.sCodTipoDocumento || '',
          gender: isOtherGender ? 'Otro' : genero,
          isIndigenous: this.lstUsuario.oInstitucion?.boPertenecePiah || false
        });

        if (isOtherGender) {
          this.generalForm.patchValue({
            otherGender: genero
          });
        } else {
          this.generalForm.patchValue({
            otherGender: ''
          });
        }

        this.coordinadorForm.patchValue({
          documentType: 'DNI',
          dni: this.lstUsuario.sNumDocumento || '',
          firstName: this.lstUsuario.sNombre || '',
          lastName: this.lstUsuario.sApellidos || '',
          email: this.lstUsuario.sCorreo || '',
          phone: this.formatPhoneNumber(this.lstUsuario.sTelefono || '')
        });

        // Preseleccionar Otro si no es Masculino o Femenino
        this.showOtherGenderInput = isOtherGender;
        if (isOtherGender) {
          //this.generalForm.get('otherGender')?.setValidators([Validators.required]);
        } else {
          this.generalForm.get('otherGender')?.clearValidators();
          this.generalForm.get('otherGender')?.setValue('');
        }

        this.generalForm.get('otherGender')?.updateValueAndValidity();

        this.documentoGeneral = this.lstUsuario.oInstitucion?.oDocumento || {};

        console.log('lstUsuario', this.lstUsuario);
      } else {
        // Manejar error
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }


  async fnActualizarInst() {
    this.loadingPerfil = true;
    if (this.generalForm.valid) {
      try {
        const formValue = this.generalForm.value;
        const selectedGender = formValue.gender === 'Otro' ? formValue.otherGender : formValue.gender;

        let oSede: ISede = {
          nIdInstitucion: this.lstUsuario.oInstitucion.nIdInstitucion,
          oCiiu: {
            nIdCiiu: formValue.ciiu
          },
          sRazonSocial: formValue.rsocial,
          sDescripcion: formValue.description,
          sNumeroRtn: this.lstUsuario.oInstitucion.sNumeroRtn,
          sDireccion: formValue.address,
          sDocRepresentante: formValue.dni,
          sNombreRepresentante: formValue.firstName,
          sApellidosRepresentante: formValue.lastName,
          sGenero: selectedGender,
          boPertenecePiah: formValue.isIndigenous
        };

        let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarInstitucion(oSede));

        if (data.boExito) {

          this.sharedDataService.actualizarRazon(formValue.rsocial);

          this.alert.success(data.sMensajeUsuario, 'Éxito');

        } else {
          // Manejar error
        }
      } catch (error: any) {
        console.error('Error:', error);
      }
    } else {
      this.openFirstPanelWithErrors();

      this.alert.warning('Datos incorrectos', 'Éxito', {});
    }

    this.loadingPerfil = false;
  }


  async fnActualizarUsuario() {
    this.loadingCoordinador = true;
    if (this.coordinadorForm.valid) {
      try {
        const formValue = this.coordinadorForm.value;

        let oUsuario: IUsuario =
        {
          nIdUsuario: this.lstUsuario.nIdUsuario,
          sNombre: formValue.firstName,
          sApellidos: formValue.lastName,
          sNumDocumento: formValue.dni,
          sCorreo: formValue.email,
          sTelefono: formValue.phone,
          oInstitucion: {
            nIdInstitucion: this.lstUsuario.oInstitucion.nIdInstitucion,
            sNumeroRtn: this.lstUsuario.oInstitucion.sNumeroRtn,
          }
        };

        let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuarioExterno(oUsuario));

        if (data.boExito) {
          // Establecer actualización del menú una vez actualizado el nombre
          this.sharedDataService.actualizarNombre(formValue.firstName, formValue.lastName);

          this.alert.success(data.sMensajeUsuario, 'Éxito');
        } else {
          // Manejar error
        }
      } catch (error: any) {
        console.error('Error:', error);
      }
    } else {
      this.alert.warning('Datos incorrectos', 'Éxito', {});
    } this.loadingCoordinador = false;
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
    await this.archivoService.descargaArchivo(this.documentoGeneral.sCodigoDocumento, this.documentoGeneral.sNombre);
  }

  /* ---------- Servicios de Sedes de mi organización -------------- */

  async fnListarSede() {
    try {
      let oSede: ISede = {
        oInstitucion: {
          nIdInstitucion: this.lstUsuario.oInstitucion.nIdInstitucion
        }
      };

      this.lstSede.forEach(sede => {
        sede.formGroup = new FormGroup({
          sNombre: new FormControl(sede.sNombre),
          sCodDepartamento: new FormControl(sede.sCodDepartamento)
        });
      });

      console.log('oSede fnListarSede', oSede);

      let data: IDataResponse = await lastValueFrom(this.sedeService.listarSede(oSede));
      if (data.boExito) {
        this.lstSede = data.oDatoAdicional;
        console.log('lstSede', this.lstSede);
        this.tSede.data = this.lstSede;

      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }

  async fnListarDepartamento() {
    try {
      let oParametro: iParametro = {
        sTipo: 'DEPARTAMENTO'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));
      if (data.boExito) {
        this.lstDepartamento = data.oDatoAdicional;
        console.log('this.lstDepartamento', this.lstDepartamento);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnRegistrarSede() {
    this.loadingSede = true;

    const nombreSede = this.sedesForm.controls['nombreSede'].value?.trim();
    const departamento = this.sedesForm.controls['departamento'].value;

    // Verificar si el nombre de la sede ya existe en lstSede
    const sedeExistente = this.lstSede.find(sede => sede.sNombre.toLowerCase() === nombreSede.toLowerCase());

    if (sedeExistente) {
      this.alert.warning('El nombre de la sede ya existe.', 'Error');
      this.loadingSede = false;
      return;
    }

    if (nombreSede.length > 0 && departamento) {
      try {
        let oSede: ISede = {
          nIdSede: -1,
          sNombre: this.sedesForm.controls['nombreSede'].value?.trim(),
          sCodDepartamento: this.sedesForm.controls['departamento'].value,
          oInstitucion: {
            nIdInstitucion: this.lstUsuario.oInstitucion.nIdInstitucion
          }
        };

        let data: IDataResponse = await lastValueFrom(this.sedeService.registrarSede(oSede));

        if (data.boExito) {
          this.sedesForm.reset();
          this.fnListarSede();
        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
            timeOut: 0,
            extendedTimeOut: 0,
            closeButton: true,
            tapToDismiss: false
          });
        }
      } catch (error) {
        this.errorService.enviar(error);
      }
    } else {
      this.alert.warning('Complete el formulario.', 'Error');
    }

    this.loadingSede = false;
  }



  /* ---------- Editar y actualizar valores de cada item -------------- */
  editarSede(sede: any) {
    sede.editing = true;
    sede.formGroup = new FormGroup({
      sNombre: new FormControl(sede.sNombre, Validators.required),
      sCodDepartamento: new FormControl(sede.sCodDepartamento, Validators.required)
    });
  }

  async guardarSede(sede: any) {
    if (sede.formGroup.valid) {
      sede.editing = false;
      let oSede: ISede = {
        nIdSede: sede.nIdSede,
        sNombre: sede.formGroup.value.sNombre,
        sCodDepartamento: sede.formGroup.value.sCodDepartamento,
        oInstitucion: {
          nIdInstitucion: this.lstUsuario.oInstitucion.nIdInstitucion
        }
      };

      let data: IDataResponse = await lastValueFrom(this.sedeService.registrarSede(oSede));
      if (data.boExito) {

        sede.sNombre = sede.formGroup.value.sNombre;

        // Realiza la búsqueda del departamento basado en nIdSede
        const buscarSede = this.lstDepartamento.find(s => s.sCodigo === sede.formGroup.value.sCodDepartamento);

        if (buscarSede) {
          sede.sDepartamento = buscarSede.sValor;
        }

        sede.editing = false;
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    }
  }
  cancelarEdicion(sede: any) {
    sede.editing = false;
    sede.formGroup = null;
  }


  async fnEliminarSede() {
    this.loadingModal = true;
    try {

      let oSede: ISede =
      {
        nIdSede: this.nIdSede,
      };

      console.log(oSede);


      let data: IDataResponse = await lastValueFrom(this.sedeService.eliminarSede(oSede));
      if (data.boExito) {
        this.fnListarSede();
        this.dialog.closeAll();
        this.alert.success(data.sMensajeUsuario, 'Éxito');
      } else {
        this.dialog.closeAll();
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
  }
  /* ---------- Mostrar input cuando hace click sobre Otro -------------- */
  onGenderChange(event: any) {
    this.showOtherGenderInput = event.value === 'Otro';
    const otherGenderControl = this.generalForm.get('otherGender');

    if (this.showOtherGenderInput) {
      //otherGenderControl?.setValidators([Validators.required]);
    } else {
      otherGenderControl?.clearValidators();
      otherGenderControl?.setValue('');
    }

    otherGenderControl?.updateValueAndValidity();
  }

  /* ---------- Abrir expansión determinado al presentar error -------------- */
  openFirstPanelWithErrors() {
    const controls = this.generalForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        if (this.isOrganizationField(name)) {
          this.organizationPanel.open();
          break;
        } else if (this.isRepresentativeField(name)) {
          this.representativePanel.open();
          break;
        }
      }
    }
  }

  isOrganizationField(fieldName: string): boolean {
    const organizationFields = ['rtn', 'rsocial', 'address', 'ciiu', 'description'];
    return organizationFields.includes(fieldName);
  }

  isRepresentativeField(fieldName: string): boolean {
    const representativeFields = ['documentType', 'dni', 'firstName', 'lastName', 'gender', 'otherGender', 'isIndigenous'];
    return representativeFields.includes(fieldName);
  }

  /* ---------- Formato de teléfono -------------- */
  formatPhoneNumber(phoneNumber: string): string {
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, '');
    return cleanedPhoneNumber.replace(/(\d{4})(\d{4})/, '$1-$2');
  }

  formatPhone(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4) + '-' + value.substring(4, 8);
    }
    input.value = value;
  }

  /* ---------- Abrir Modales -------------- */
  openDepurar(item: any) {
    this.nIdSede = item.nIdSede;
    console.log('this.nIdSede', this.nIdSede);
    this.dialog.open(this.modalDepurar, {
      width: '400px',
    });
  }
}
