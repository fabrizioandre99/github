import { Component, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GestionService } from '../../../services/gestion-service/solicitud.service';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { ToastrService } from 'ngx-toastr';
import { ArchivoService } from '../../../services/archivo.service';
import { SesionService } from '../../../services/sesion.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IUsuario } from '../../../models/usuario';
import { MatRadioModule } from '@angular/material/radio';
import { RolService } from '../../../services/gestion-service/rol.service';
import { ErrorService } from '../../../services/error.service';
import { iSolicitudGestion } from '../../../models/solicitudGestion';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';
import { iParametro } from '../../../models/parametro';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    DatePipe
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AlertComponent,
    CdkTextareaAutosize,
    MatCheckboxModule,
    MatRadioModule
  ]
})
export class GestionUsuariosComponent implements AfterViewInit {

  formModal: FormGroup;
  sesion: any = null;
  filtroOrganizacion: string = '';
  filtroSerna: string = '';
  modal: any;

  loadingModal: boolean = false;
  loadingRestablecer: boolean = false;

  lstRol: any[] = [];
  lstUsuariosOrganizacionales: any[] = [];
  lstUsuariosSerna: any[] = [];
  lstTipoDocumento: any[] = [];

  boDocumentoInvalido: boolean = false;
  sDocumentoInvalido: string = '';
  sCodTipoDocumento: string | null = null;
  nIdRol: number | null = null;
  oRestablecer: any = {};

  hOrganizacional: string[] = ['organizacion', 'usuario', 'datosContacto', 'declaracionParticipacion', 'estado', 'acciones'];
  hSerna: string[] = ['datosUsuario', 'datosContacto', 'estado', 'acciones'];

  tOrganizacional = new MatTableDataSource<any>(this.lstUsuariosOrganizacionales);
  tSerna = new MatTableDataSource<any>(this.lstUsuariosSerna);

  @ViewChild('paginatorOrganizacional', { static: false }) paginatorOrganizacional!: MatPaginator;
  @ViewChild('paginatorSerna', { static: false }) paginatorSerna!: MatPaginator;

  @ViewChild('sortOrganizacional', { static: false }) sortOrganizacional!: MatSort;
  @ViewChild('sortSerna', { static: false }) sortSerna!: MatSort;

  @ViewChild('modalActualizacion') modalActualizacion: any;
  @ViewChild('modalDetalle') modalDetalle: any;
  @ViewChild('modalRegistro') modalRegistro: any;
  @ViewChild('modalRestablecer') modalRestablecer: any;

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService, public dialog: MatDialog,
    private alert: ToastrService, private parametroService: ParametroService,
    private archivoService: ArchivoService, private sesionService: SesionService, private gestionService: GestionService,
    private rolService: RolService, private errorService: ErrorService) {

    this.sesion = this.sesionService.getSesion();
    this.fnListarUsuariosOrganizacionales();
    this.fnListarUsuariosSerna();
    this.fnListarRolPorTipo();
    this.fnListarParametro();

    this.formModal = this.fb.group({
      sCodTipoDocumento: [''],
      sNumDocumento: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      sNombre: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      sApellidos: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/)]],
      sCorreo: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
      sTelefono: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      boEstado: [false],
      sNombreRol: [''],
      sUsuario: [{ value: '', disabled: true }],
      nIdRol: [2]
    });
  }

  ngOnInit() {
    this.formModal.get('sCorreo')!.valueChanges.subscribe(value => {
      if (value) {
        let usuario = value.split('@')[0];
        this.formModal.get('sUsuario')!.setValue(usuario);
      }
    });
  }

  ngAfterViewInit() {
    this.tOrganizacional.paginator = this.paginatorOrganizacional;
    this.tOrganizacional.sort = this.sortOrganizacional;

    this.tSerna.paginator = this.paginatorSerna;
    this.tSerna.sort = this.sortSerna;
  }

  /* ---------- Llamada de servicios -------------- */
  async fnListarRolPorTipo() {
    try {
      let dataRol: IDataResponse = await lastValueFrom(this.rolService.listarRolesPorTipo('I'));
      if (dataRol.boExito) {
        this.lstRol = dataRol.oDatoAdicional;
        this.nIdRol = this.lstRol.at(0).nIdRol;
        console.log(this.nIdRol);
        console.log('this.lstRol', this.lstRol);
      } else {
        this.alert.warning(dataRol.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarParametro() {
    try {

      let oParametro: iParametro = {
        sTipo: "TIPO_DOCUMENTO"
      };

      let dataParametro: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));
      if (dataParametro.boExito) {
        this.lstTipoDocumento = dataParametro.oDatoAdicional;
        this.sCodTipoDocumento = 'DNI';
        console.log('this.sCodTipoDocumento', this.sCodTipoDocumento);
        console.log('this.lstTipoDocumento', this.lstTipoDocumento);
      } else {
        this.alert.warning(dataParametro.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarUsuariosOrganizacionales() {
    try {
      let dataSolicitud: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuarioPorTipo('E'));
      if (dataSolicitud.boExito) {
        this.lstUsuariosOrganizacionales = dataSolicitud.oDatoAdicional;
        this.tOrganizacional.data = this.lstUsuariosOrganizacionales;
      } else {
        this.alert.warning(dataSolicitud.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarUsuariosSerna() {
    try {
      let dataSolicitud: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuarioPorTipo('I'));
      if (dataSolicitud.boExito) {
        this.lstUsuariosSerna = dataSolicitud.oDatoAdicional;
        this.tSerna.data = this.lstUsuariosSerna;
      } else {
        this.alert.warning(dataSolicitud.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }
  async fnActualizarEstado(item: any, event: any) {
    try {
      let oUsuario: IUsuario = {
        nIdUsuario: item.nIdUsuario,
        boEstado: event.checked
      };

      let rptCambiarEstado: IDataResponse = await lastValueFrom(this.usuarioService.actualizarEstado(oUsuario));
      if (rptCambiarEstado.boExito && rptCambiarEstado.oDatoAdicional) {
        this.alert.success(rptCambiarEstado.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      } else {
        this.alert.warning(rptCambiarEstado.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
      this.fnListarUsuariosOrganizacionales();
      this.fnListarUsuariosSerna();
    } catch (error) {
      this.errorService.enviar(error);
    }
  }


  async fnReenviarMail() {
    this.loadingRestablecer = true;
    try {
      let nEstadoAprobado = 3;

      console.log('this.oRestablecer', this.oRestablecer);

      let oSolicitudGestion: iSolicitudGestion = {
        nIdSolicitudUsuario: this.oRestablecer.nIdUsuario,
        nEstadoSolicitud: nEstadoAprobado,
        sObservacion: null!,
        oInstitucion: {
          sRazonSocial: this.oRestablecer.oInstitucion.sRazonSocial,
          sNumeroRtn: this.oRestablecer.oInstitucion.sNumeroRtn
        },
        oUsuario: {
          sNombre: this.oRestablecer.sNombre,
          sApellidos: this.oRestablecer.sApellidos,
          sCorreo: this.oRestablecer.sCorreo
        }
      };

      console.log('oSolicitudGestion', oSolicitudGestion);


      let data: IDataResponse = await lastValueFrom(this.gestionService.reenviarMail(oSolicitudGestion));
      if (data.boExito) {
        this.dialog.closeAll();
        this.alert.success(data.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
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
    this.loadingRestablecer = false;
  }

  async fnActualizarUsuarioExterno(modal: any) {
    this.loadingModal = true;

    if (this.formModal.valid) {
      try {
        let oUsuario: IUsuario = {
          nIdUsuario: modal.nIdUsuario,
          sNumDocumento: this.formModal.get('sNumDocumento')?.value,
          sNombre: this.formModal.get('sNombre')?.value,
          sApellidos: this.formModal.get('sApellidos')?.value,
          sCorreo: this.formModal.get('sCorreo')?.value,
          sTelefono: this.formModal.get('sTelefono')?.value,
          oInstitucion: {
            nIdInstitucion: modal.oInstitucion.nIdInstitucion,
            sNumeroRtn: modal.oInstitucion.sNumeroRtn
          }
        };

        let rptDocValido: IDataResponse = await lastValueFrom(this.gestionService.validarDocumento(modal.nIdUsuario, 'DNI', this.formModal.get('sNumDocumento')?.value, this.sesion));
        if (rptDocValido.boExito) {
          this.boDocumentoInvalido = false;
          this.sDocumentoInvalido = '';
          let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuarioExterno(oUsuario));
          if (data.boExito) {
            this.alert.success(data.sMensajeUsuario, 'Éxito', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true,
              tapToDismiss: false
            });
            this.fnListarUsuariosOrganizacionales();
          } else {
            this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true,
              tapToDismiss: false
            });
          }
          this.dialog.closeAll();
        } else {
          this.boDocumentoInvalido = true;
          this.sDocumentoInvalido = 'Ya se encuentra registrado un usuario con el número de documento ingresado.';
        }
      } catch (error) {
        this.errorService.enviar(error);
      }
    }
    this.loadingModal = false;
  }

  async fnRegistrarUsuarioSerna(modal: any) {
    this.loadingModal = true;
    if (this.formModal.valid) {
      try {
        let oUsuario: IUsuario = {
          nIdUsuario: modal.nIdUsuario,
          oRol: {
            nIdRol: this.formModal.get('nIdRol')?.value
          },
          sNombre: this.formModal.get('sNombre')?.value,
          sApellidos: this.formModal.get('sApellidos')?.value,
          sCodTipoDocumento: this.formModal.get('sCodTipoDocumento')?.value,
          sNumDocumento: this.formModal.get('sNumDocumento')?.value,
          sCorreo: this.formModal.get('sCorreo')?.value,
          sTelefono: this.formModal.get('sTelefono')?.value,
          boEstado: this.formModal.get('boEstado')?.value
        };

        let rptDocValido: IDataResponse = await lastValueFrom(this.gestionService.validarDocumento(modal.nIdUsuario, this.formModal.get('sCodTipoDocumento')?.value, this.formModal.get('sNumDocumento')?.value, this.sesion));
        if (rptDocValido.oDatoAdicional) {
          this.boDocumentoInvalido = false;
          this.sDocumentoInvalido = '';
          let data: IDataResponse = await lastValueFrom(this.usuarioService.registrarUsuarioSerna(oUsuario));
          if (data.boExito) {
            this.alert.success(data.sMensajeUsuario, 'Éxito', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true,
              tapToDismiss: false
            });
            this.fnListarUsuariosSerna();
          } else {
            this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
              timeOut: 0,
              extendedTimeOut: 0,
              closeButton: true,
              tapToDismiss: false
            });
          }
          this.dialog.closeAll();
        } else {
          this.boDocumentoInvalido = true;
          this.sDocumentoInvalido = 'Ya se encuentra registrado un usuario con el número de documento ingresado.';
        }
      } catch (error) {
        this.errorService.enviar(error);
      }
    }
    this.loadingModal = false;
  }
  /* ---------- Abrir modales -------------- */
  openModalDetalle(item: any) {
    this.modal = JSON.parse(JSON.stringify(item));
    this.dialog.open(this.modalDetalle, {
      autoFocus: false,
      panelClass: 'modal_detalle'
    });
  }

  openModalActualizar(item: any) {
    this.boDocumentoInvalido = false;
    this.sDocumentoInvalido = '';
    this.modal = JSON.parse(JSON.stringify(item));

    this.formModal.patchValue({
      sNumDocumento: item.sNumDocumento,
      sNombre: item.sNombre,
      sApellidos: item.sApellidos,
      sCorreo: item.sCorreo,
      sTelefono: item.sTelefono
    });

    this.dialog.open(this.modalActualizacion, {
      autoFocus: false,
      panelClass: ['modal_detalle', 'modal_actualizacion']
    });
  }

  openModalRegistrar(item: any) {
    this.boDocumentoInvalido = false;
    this.sDocumentoInvalido = '';

    if (item == null) {
      let oUsuario: IUsuario = { nIdUsuario: -1 };
      this.modal = JSON.parse(JSON.stringify(oUsuario));
      this.formModal.patchValue({
        sCodTipoDocumento: this.sCodTipoDocumento,
        nIdRol: this.nIdRol,
        sNumDocumento: '',
        sNombre: '',
        sApellidos: '',
        sCorreo: '',
        sTelefono: '',
        boEstado: false,
        sNombreRol: '',
        sUsuario: ''
      });
    } else {
      this.modal = JSON.parse(JSON.stringify(item));
      this.formModal.patchValue({
        sCodTipoDocumento: item.sCodTipoDocumento,
        nIdRol: item.oRol.nIdRol,
        sNumDocumento: item.sNumDocumento,
        sNombre: item.sNombre,
        sApellidos: item.sApellidos,
        sCorreo: item.sCorreo,
        sTelefono: item.sTelefono,
        boEstado: item.boEstado,
        sNombreRol: item.oRol.sNombre,
        sUsuario: item.sUsuario
      });
    }

    this.dialog.open(this.modalRegistro, {
      autoFocus: false,
      panelClass: 'modal_detalle'
    });
  }

  openRestablecer(item: any) {
    this.oRestablecer = item;

    console.log('this.oRestablecer', this.oRestablecer);
    this.dialog.open(this.modalRestablecer, {
      width: '400px',
    });
  }

  modificarUsuario() {
    let correo = this.formModal.get('sCorreo')?.value.split('@')[0];
    this.formModal.get('sUsuario')!.setValue(correo);
  }

  /* ---------- Descargar archivos -------------- */
  async fnDescargaArchivo(item: any) {
    await this.archivoService.descargaArchivo(item.sCodigoDocumento, item.sNombre);
  }

  /* ---------- Formatear números -------------- */
  formatPhone(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4) + '-' + value.substring(4, 8);
    }
    input.value = value;
  }

  /* ---------- Aplicar Filtro -------------- */
  aplicarFiltro(): void {
    const normalizeString = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');

    const filtroOrganizacionNormalizado = normalizeString(this.filtroOrganizacion);
    const filtroSernaNormalizado = normalizeString(this.filtroSerna);

    this.tOrganizacional.data = this.lstUsuariosOrganizacionales.filter(item =>
      normalizeString(item.oInstitucion.sRazonSocial).includes(filtroOrganizacionNormalizado)
    );

    this.tSerna.data = this.lstUsuariosSerna.filter(item => {
      const nombreCompleto = normalizeString(`${item.sNombre} ${item.sApellidos}`);
      return nombreCompleto.includes(filtroSernaNormalizado);
    });

    if (this.tOrganizacional.paginator) {
      this.tOrganizacional.paginator.firstPage();
    }
    if (this.tSerna.paginator) {
      this.tSerna.paginator.firstPage();
    }
  }


}
