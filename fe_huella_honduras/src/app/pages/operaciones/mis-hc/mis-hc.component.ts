import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { ToastrService } from 'ngx-toastr';
import { ArchivoService } from '../../../services/archivo.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IUsuario } from '../../../models/usuario';
import { MatRadioModule } from '@angular/material/radio';
import { PeriodoService } from '../../../services/huella-service/periodo.service';
import { IPeriodo } from '../../../models/periodo';
import { environment } from '../../../../environments/environment';
import { iCambioPeriodo } from '../../../models/cambioPeriodo';
import { MetodologiaService } from '../../../services/huella-service/metodologia.service';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../services/shared-data.service';
import { MitigacionService } from '../../../services/huella-service/medida-mitigacion.service';
import { SolicitudPeriodoService } from '../../../services/huella-service/solicitud-periodo.service';
import { iSolicitudPeriodo } from '../../../models/solicitudPeriodo';
import { iParametro } from '../../../models/parametro';
import { ReconocimientoService } from '../../../services/huella-service/reconocimiento';
import { iReduccion } from '../../../models/reduccion';
import { iCompensacion } from '../../../models/compensacion';
import { ErrorService } from '../../../services/error.service';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-mis-hc',
  standalone: true,
  templateUrl: './mis-hc.component.html',
  styleUrl: './mis-hc.component.css',
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
    MatRadioModule,
    MatChipsModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
})
export class MisHcComponent {
  lstPeriodo: IPeriodo[] = [];
  lstReconocimiento: any[] = [];
  lstPeriodoDisponible: IPeriodo[] = [];

  nAnioBase: number = 0;
  getCodCambioPeriodo: any = {};

  @ViewChild('modalReapertura') modalReapertura: any;
  @ViewChild('modalRegistro') modalRegistro: any;
  @ViewChild('modalMetodologia') modalMetodologia: any;
  @ViewChild('modalCambioAnioBase') modalCambioAnioBase: any;
  @ViewChild('modalActualizarAnioBase') modalActualizarAnioBase: any;

  @ViewChild('modalCuantificacion') modalCuantificacion: any;
  @ViewChild('modalReduccion') modalReduccion: any;
  @ViewChild('modalCompensacion') modalCompensacion: any;
  @ViewChild('modalNeutralizacion') modalNeutralizacion: any;

  @ViewChild('modalReqPostular') modalReqPostular: any;
  @ViewChild('modalReqCompensacion') modalReqCompensacion: any;
  @ViewChild('modalInformativo') modalInformativo: any;

  @ViewChild('modalObsReconocimiento') modalObsReconocimiento: any;

  getParametro: any = {};

  sNombreNuevaMetodologia: string | null = null;
  boAnioBaseFinalizado: boolean = false;

  formReapertura: FormGroup;
  formMetodologia: FormGroup;
  formRegistro: FormGroup;
  formAnioBase: FormGroup;
  formActualizarAnioBase: FormGroup;
  formReqCompensacion: FormGroup;

  sesion: any = null;
  filtro: string = '';

  modal: any = {};
  modal_aniobase: any = {};

  lstTipoDocumento: any[] = [];
  lstUsuariosOrganizacionales: any[] = [];

  loadingModal: boolean = false;
  boListaHC: boolean = true;
  boDocumentoInvalido: boolean = false;

  sDocumentoInvalido: string = '';
  sCodTipoDocumento: string | null = null;

  anioActual = new Date().getFullYear();

  hPeriodos: string[] = ['anio', 'publico', 'fecha', 'emisiones', 'ultreconocimiento', 'estado', 'reconocimientos', 'acciones'];

  hReconocimientos: string[] = ['anio', 'fechaRegistro', 'nivelReconocimiento', 'estado', 'acciones'];
  tReconocimientos = new MatTableDataSource<any>(this.lstReconocimiento);


  tPeriodo = new MatTableDataSource<any>(this.lstPeriodo);

  fileLineaBase: File | null = null;
  fileAnioReduccion: File | null = null;
  isUploadedLineaBase: boolean = false;
  isUploadedAnioReduccion: boolean = false;
  fileLineaBaseInvalid: boolean = false;
  fileAnioReduccionInvalid: boolean = false;
  fileLineaBaseTooLarge: boolean = false;
  fileAnioReduccionTooLarge: boolean = false;
  draggingLineaBase: boolean = false;
  draggingAnioReduccion: boolean = false;
  nombreArchivoLineaBase: string = '';
  nombreArchivoAnioReduccion: string = '';

  fileCompensacion: File | null = null;
  isUploadedCompensacion: boolean = false;
  fileCompensacionInvalid: boolean = false;
  fileCompensacionTooLarge: boolean = false;
  draggingCompensacion: boolean = false;
  nombreArchivoCompensacion: string = '';
  mensajeInformativo: string = '';
  porcentajeCompensadoRequerido: number = 0;
  obsReconocimiento: string = '';

  @ViewChild('paginatorHuellas', { static: false }) paginatorHuellas!: MatPaginator;

  filtroAnio: string = '';

  oReduccion: iReduccion = {
    oDocRequisito: {
      sCodigoDocumento: '',
      sNombre: ''
    },
    oPeriodo: {
      oVerificacion: {
        sCodigoDocumento: '',
        sNombre: ''
      }
    }
  }

  oCompensacion: iCompensacion = {
    oDocRequisito: {
      sCodigoDocumento: '',
      sNombre: ''
    },
  }

  nIdUsuario: number = 0;
  nIdInstitucion: number | undefined;

  @ViewChild('paginatorReconocimientos', { static: false }) paginatorReconocimientos!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    public dialog: MatDialog,
    private alert: ToastrService,
    private solicitudPeriodoService: SolicitudPeriodoService,
    private archivoService: ArchivoService,
    private metodologiaService: MetodologiaService,
    private periodoService: PeriodoService,
    private mitigacionService: MitigacionService,
    private sharedDataService: SharedDataService,
    private parametroService: ParametroService,
    private reconocimientoService: ReconocimientoService,
    private errorService: ErrorService
  ) {
    this.formReapertura = this.fb.group({
      motivo: ['', [Validators.maxLength(500), Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)]]
    });

    this.formMetodologia = this.fb.group({
      nAnio: ['', [
        Validators.required,
        Validators.pattern(this.getYearPattern()),
        this.yearValidator(this.anioActual)
      ]]
    });

    this.formRegistro = this.fb.group({
      nAnio: ['', [
        Validators.required,
        Validators.pattern(this.getYearPattern()),
        this.yearValidator(this.anioActual)
      ]],
      boPublico: [false]
    });

    this.formAnioBase = this.fb.group({
      nIdPeriodo: ['', Validators.required],
      motivo: ['', [Validators.maxLength(500), Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)]]
    });

    this.formActualizarAnioBase = this.fb.group({
      nIdPeriodo: ['', Validators.required],
      motivo: ['', [Validators.maxLength(500), Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)]]
    });

    this.formReqCompensacion = this.fb.group({
      bonosCarbono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]]
    });
  }


  async ngOnInit() {
    this.nIdUsuario = this.sharedDataService.itemMenu?.nIdUsuario || 0;
    this.getIdInstitucion();
    this.fnListarHuellas();
    this.fnListarReconocimientos();

    this.getCodCambioPeriodo.anioBase = environment.cambioPeriodo.anio_base;
    this.getCodCambioPeriodo.reapertura = environment.cambioPeriodo.reapertura;
    this.getParametro.sTipo = environment.parametro.sistema.sTipo;
    this.getParametro.sCodigo = environment.parametro.sistema.sCodRutaDescarga;

    console.log(this.sharedDataService.itemMenu);
  }


  ngAfterViewInit() {
    this.tPeriodo.paginator = this.paginatorHuellas;
    this.tReconocimientos.paginator = this.paginatorReconocimientos;
  }

  /* ---------- Llamar a servicios (Mis Huellas de Carbono) -------------- */
  async fnListarHuellas() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.boExito) {
        this.lstPeriodo = data.oDatoAdicional;

        console.log('this.lstPeriodo', this.lstPeriodo);

        this.tPeriodo.data = this.lstPeriodo;

        const oPeriodoBase = this.lstPeriodo.find(periodo => periodo.boAnioBase === true);
        this.nAnioBase = oPeriodoBase?.nAnio == undefined ? 0 : oPeriodoBase.nAnio;
        this.boAnioBaseFinalizado = oPeriodoBase?.nEstadoPeriodo == 3 ? true : false;

        this.lstPeriodoDisponible = this.lstPeriodo.filter(oPer => oPer.nAnio && oPer.nAnio > this.nAnioBase);

        // Ordenar lstPeriodoDisponible de menor a mayor año
        this.lstPeriodoDisponible.sort((a: any, b: any) => a.nAnio - b.nAnio);
        console.log('this.lstPeriodoDisponible', this.lstPeriodoDisponible);
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
  }


  async fnCambioAnioBase() {
    this.loadingModal = true;
    try {
      let oCambioPeriodo: iCambioPeriodo = {
        nIdPeriodoNuevo: this.formAnioBase.controls['nIdPeriodo'].value,
        sJustificacion: this.formAnioBase.controls['motivo'].value
      };

      console.log('oCambioPeriodo', oCambioPeriodo);

      let data: IDataResponse = await lastValueFrom(this.periodoService.cambiarAnioBase(oCambioPeriodo));
      console.log('cambiarAnioBase', data);

      if (data.boExito && data.oDatoAdicional) {
        this.fnListarHuellas();
        this.alert.success(data.sMensajeUsuario, 'Éxito');
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }

      this.dialog.closeAll();
      this.modal = null;
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
    this.formAnioBase.reset();
  }

  async fnSolicitarReapertura() {
    this.loadingModal = true;
    try {
      let oCambioPeriodo: iSolicitudPeriodo = {
        oPeriodo: {
          nIdPeriodo: this.modal.nIdPeriodo
        },
        sMensaje: this.formReapertura.controls['motivo'].value
      };

      console.log('oCambioPeriodo', oCambioPeriodo);

      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.solicitarReapertura(oCambioPeriodo));
      console.log('fnAtenSolicitud', data);

      if (data.boExito && data.oDatoAdicional) {
        this.fnListarHuellas();
        this.alert.success(data.sMensajeUsuario, 'Éxito');
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
        });
      }

      this.dialog.closeAll();
      this.modal = null;
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
    this.formReapertura.reset();
  }

  async fnEstadoReportePublico(oPeriodoDto: IPeriodo, event: any) {
    try {
      let oPeriodo: IPeriodo = {
        nIdPeriodo: oPeriodoDto.nIdPeriodo,
        boReportePublico: event.checked
      };

      console.log('oCambioPeriodo', oPeriodo);

      let data: IDataResponse = await lastValueFrom(this.periodoService.cambiarEstadoReporte(oPeriodo));
      console.log('fnAtenSolicitud', data);

      if (data.boExito && data.oDatoAdicional) this.fnListarHuellas();
      else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
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

      console.log(oUsuario);

      let rptCambiarEstado: IDataResponse = await lastValueFrom(this.usuarioService.actualizarEstado(oUsuario));
      if (rptCambiarEstado.boExito && rptCambiarEstado.oDatoAdicional) {
        this.fnListarHuellas();
      } else {
        this.alert.warning(rptCambiarEstado.sMensajeUsuario, 'Advertencia', {
          timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }


  async fnValidarMetodologia() {
    this.loadingModal = true;

    const nAnioControl = this.formRegistro.get('nAnio');
    const nAnioValue = parseInt(nAnioControl?.value, 10);

    //Mostar mensaje si el año que se quiere registrar ya está en el listado
    if (this.lstPeriodo?.some(periodo => periodo?.nAnio === nAnioValue)) {
      this.alert.warning(`El año ${nAnioValue} ya está registrado.`, 'Advertencia', {
        timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
      });
      this.loadingModal = false;
      return;
    }

    if (nAnioControl && nAnioControl.invalid) {
      if (nAnioControl.hasError('yearInvalid')) {

        this.alert.warning(`El año no puede ser mayor que el año actual.`, 'Advertencia', {
          timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
        });
      }
      this.loadingModal = false;
      return;
    }

    if (this.formRegistro.valid) {
      try {
        let data: IDataResponse = await lastValueFrom(this.metodologiaService.validarMetodologia());
        if (data.boExito) {
          if (data.oDatoAdicional.boExisteNuevaTecnologia) {
            this.sNombreNuevaMetodologia = data.oDatoAdicional.sDescripcion;
            this.openModalMetodologia();
          } else {
            this.fnRegistrarHuella(false);
          }
        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
            timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
          });
        }
      } catch (error) {
        this.errorService.enviar(error);
      }
    }
    this.loadingModal = false;
  }

  async fnRegistrarHuella(boActualizarAnioBase: boolean) {
    try {
      const oPeriodo: IPeriodo = {
        nAnio: this.formRegistro.controls['nAnio'].value,
        boReportePublico: this.formRegistro.controls['boPublico'].value === null ? false : this.formRegistro.controls['boPublico'].value,
        boActualizarMetodologia: boActualizarAnioBase
      };

      let rptPeriodo: IDataResponse = await lastValueFrom(this.periodoService.registrarPerido(oPeriodo));
      if (rptPeriodo.boExito) {
        this.fnListarHuellas();
        this.alert.success(rptPeriodo.sMensajeUsuario, 'Éxito');
      } else {
        this.alert.warning(rptPeriodo.sMensajeUsuario, 'Advertencia', {
          timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
        });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.dialog.closeAll();
    this.formRegistro.reset();
  }


  //Valida si todos el list-check del modal "Nivel de reducción" están activos
  private esTodoActivoReduccion(): boolean {
    return this.modal_aniobase.nEstadoPeriodo == 3 &&
      this.modal.nReconocimientoActual == 1 &&
      this.modal_aniobase.boTieneIndicador &&
      this.modal.boTieneIndicador &&
      this.modal.bdReduccion > 0;
  }

  async fnCambioAnioActuBase() {
    this.loadingModal = true;
    try {
      let oCambioPeriodo: iCambioPeriodo = {
        nIdPeriodoNuevo: this.formActualizarAnioBase.controls['nIdPeriodo'].value,
        sJustificacion: ''
      };

      console.log('oCambioPeriodo', oCambioPeriodo);
      let data: IDataResponse = await lastValueFrom(this.periodoService.cambiarAnioBase(oCambioPeriodo));
      console.log('fnCambioAnioActuBase', data);

      if (data.boExito) {
        this.fnValidarAnioReduccion(this.modal);
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }

      this.dialog.closeAll();
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
  }

  /* ---------- Llamar a servicios (Mis Reconocimientos) -------------- */
  async getIdInstitucion() {
    try {
      let oUsuario: IUsuario = { nIdUsuario: this.nIdUsuario };
      let data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      //console.log('getIdInstitucion', data);
      if (data.boExito) {
        this.nIdInstitucion = data.oDatoAdicional?.oInstitucion?.nIdInstitucion;
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }


  async fnListarReconocimientos() {
    try {
      let data: IDataResponse = await lastValueFrom(this.reconocimientoService.listarReconocimiento());
      if (data.boExito) {
        this.lstReconocimiento = data.oDatoAdicional;

        this.tReconocimientos.data = this.lstReconocimiento;
        console.log('this.lstReconocimiento', this.lstReconocimiento);

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
  }

  async openRequisitos(item: any) {
    console.log('item', item);

    //Si es Reducción
    if (item.sCodReconocimiento == 'REDU') {

      //Resetear valores guardados del modal anterior abierto
      this.modal.oVerificacion = null;
      this.resetReduccion();

      //Asignar periodo
      this.modal.nIdPeriodo = item.oPeriodo.nIdPeriodo;

      //Asignar año
      this.modal.nAnio = item.oPeriodo.nAnio;

      console.log('this.modal ', this.modal);

      try {

        let oSolicitudPeriodo: iSolicitudPeriodo = {
          oPeriodo: {
            nIdPeriodo: this.modal.nIdPeriodo
          },
          oInstitucion: {
            nIdInstitucion: this.nIdInstitucion
          }
        }

        let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarReduccion(oSolicitudPeriodo));

        console.log('Data openRequisitos', data.oDatoAdicional);
        if (data.boExito) {

          //Obtener Documento de reducción 
          this.oReduccion.oDocRequisito.sCodigoDocumento = data.oDatoAdicional.oDocRequisito.sCodigoDocumento;
          this.oReduccion.oDocRequisito.sNombre = data.oDatoAdicional.oDocRequisito.sNombre;


          //Obtener Documento de plan base 
          this.oReduccion.oPeriodo.oVerificacion.sCodigoDocumento = data.oDatoAdicional.oPeriodo.oVerificacion.sCodigoDocumento;
          this.oReduccion.oPeriodo.oVerificacion.sNombre = data.oDatoAdicional.oPeriodo.oVerificacion.sNombre;

        }
      } catch (error) {
        this.errorService.enviar(error);
      }

      console.log('this.modal', this.modal);

      //Obtener valores del año base
      const getAnioBase = this.lstPeriodo.find(periodo => periodo.boAnioBase === true);
      if (getAnioBase) {
        this.modal_aniobase = {
          /*  nIdPeriodo: getAnioBase.nIdPeriodo,
           nEstadoPeriodo: getAnioBase.nEstadoPeriodo,
           boTieneIndicador: getAnioBase.boTieneIndicador, */
          nAnio: getAnioBase.nAnio,
        };
      }

      //Si hay archivo de reducción almacenar en memoria
      if (this.oReduccion.oDocRequisito.sCodigoDocumento) {
        const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(this.oReduccion.oDocRequisito.sCodigoDocumento));
        this.fileAnioReduccion = this.blobToFile(blob, this.oReduccion.oDocRequisito.sNombre);
      }


      //Si hay archivo de plan base almacenar en memoria
      if (this.oReduccion.oPeriodo.oVerificacion.sCodigoDocumento) {
        const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(this.oReduccion.oPeriodo.oVerificacion.sCodigoDocumento));
        this.fileLineaBase = this.blobToFile(blob, this.oReduccion.oPeriodo.oVerificacion.sNombre);
      }

      //Abrir modal de Requisitos
      this.dialog.open(this.modalReqPostular, {
        autoFocus: false,
        panelClass: 'modal_reduccion'
      });
    }

    //Si es Compensación / Neutralización
    else if (item.sCodReconocimiento == 'COMP' || item.sCodReconocimiento == 'NEUT') {
      //Asignar periodo
      this.modal.nIdPeriodo = item.oPeriodo.nIdPeriodo;
      //Asignar año
      this.modal.nAnio = item.oPeriodo.nAnio;
      console.log('modal:', this.modal);

      let oSolicitud: iSolicitudPeriodo = {
        oPeriodo: {
          nIdPeriodo: this.modal.nIdPeriodo
        }
      }
      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarCompensacion(oSolicitud));

      if (data.boExito) {
        console.log('data', data);

        //this.formReqCompensacion.reset();
        this.resetCompensacion();

        let oParametro: iParametro = {
          sTipo: "PERIODO",
          sCodigo: "PORC-COMPENSACION"
        }
        let dataParametro: IDataResponse = await lastValueFrom(this.parametroService.obtenerParametro(oParametro));
        if (dataParametro.boExito) {
          console.log('dataParametro', dataParametro);
          this.porcentajeCompensadoRequerido = parseFloat(dataParametro.oDatoAdicional.sValor);

        } else {
          this.porcentajeCompensadoRequerido = 16;
        }
        this.modal.bdTotalEmisiones = parseFloat(data.oDatoAdicional.bdEmisionTotal);
        this.formReqCompensacion.patchValue({ bonosCarbono: data.oDatoAdicional.bdBonosCarbono });

        console.log('this.porcentajeCompensadoRequerido', this.porcentajeCompensadoRequerido)
        console.log('this.modal.bdTotalEmisiones', this.modal.bdTotalEmisiones)
        console.log('this.formReqCompensacion', this.formReqCompensacion);


        //Obtener Documento de reducción 
        this.oCompensacion.oDocRequisito.sCodigoDocumento = data.oDatoAdicional.oDocRequisito.sCodigoDocumento;
        this.oCompensacion.oDocRequisito.sNombre = data.oDatoAdicional.oDocRequisito.sNombre;


        //Si hay archivo de plan base almacenar en memoria
        if (this.oCompensacion.oDocRequisito.sCodigoDocumento) {
          const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(data.oDatoAdicional.oDocRequisito.sCodigoDocumento));
          this.fileCompensacion = this.blobToFile(blob, data.oDatoAdicional.oDocRequisito.sNombre);
        }

        console.log('fileCompensacion', this.fileCompensacion);

        this.dialog.open(this.modalReqCompensacion, {
          autoFocus: false,
          width: '450px'
        });
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    }
  }


  /* ---------- Aplicar Filtro -------------- */
  aplicarFiltro(): void {
    this.tReconocimientos.data = this.lstReconocimiento.filter(item =>
      item.oPeriodo.nAnio.toString().includes(this.filtroAnio)
    );
  }

  /* ---------- Registro de reducción y compensación -------------- */
  async fnRegistrarReduccion() {
    this.loadingModal = true;
    if (this.fileLineaBase && this.fileAnioReduccion) {
      try {
        let oPeriodo: IPeriodo = { nIdPeriodo: this.modal.nIdPeriodo };

        console.log('oPeriodo', oPeriodo);
        console.log('fileLineaBase', this.fileLineaBase);
        console.log('fileAnioReduccion', this.fileAnioReduccion);

        let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.registrarReduccion(this.fileLineaBase, this.fileAnioReduccion, oPeriodo));

        if (data.boExito) {
          this.alert.success(data.sMensajeUsuario, 'Éxito');
          this.resetReduccion();
          this.dialog.closeAll();
          this.fnListarHuellas();
          this.fnListarReconocimientos();
        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia');
        }

      } catch (error) {
        this.alert.error('Ocurrió un error al registrar la actividad', 'Error');
      }
    } else {
      this.alert.warning('No se ha seleccionado ningún archivo.', 'Advertencia');
      if (!this.fileLineaBase) {
        this.fileLineaBaseInvalid = true;
      }
      if (!this.fileAnioReduccion) {
        this.fileAnioReduccionInvalid = true;
      }
    }

    this.loadingModal = false;
  }


  async fnValidarAnioReduccion(item: any) {

    console.log('item', item);
    try {
      let oPeriodo: IPeriodo = { nIdPeriodo: item.nIdPeriodo };
      this.fnListarHuellas();

      const getAnioBase = this.lstPeriodo.find(periodo => periodo.boAnioBase === true);
      if (getAnioBase) {
        this.modal_aniobase = {
          nIdPeriodo: getAnioBase.nIdPeriodo,
          nEstadoPeriodo: getAnioBase.nEstadoPeriodo,
          boTieneIndicador: getAnioBase.boTieneIndicador,
          nAnio: getAnioBase.nAnio,
          oVerificacion: getAnioBase.oVerificacion
        };
      }

      let data: IDataResponse = await lastValueFrom(this.periodoService.validarAnioReduccion(oPeriodo));

      console.log('aniobase: ', getAnioBase);

      if (data.boExito) {
        if (data.oDatoAdicional.boAnioValido) {
          let dataReduccion: IDataResponse = await lastValueFrom(this.mitigacionService.listarMitigacion({}));
          if (dataReduccion.boExito) {
            this.modal.bdReduccion = dataReduccion.oDatoAdicional.bdReduccion;
            this.modal.anioActual = item.nAnio;
          }

          if (!this.esTodoActivoReduccion()) {
            this.dialog.open(this.modalReduccion, {
              autoFocus: false,
              width: '450px',
            });
          } else {
            this.resetReduccion();
            if (this.modal_aniobase.oVerificacion) {
              const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(this.modal_aniobase.oVerificacion.sCodigoDocumento));
              this.fileLineaBase = this.blobToFile(blob, this.modal_aniobase.oVerificacion.sNombre);
              this.isUploadedLineaBase = true;
              this.nombreArchivoLineaBase = this.modal_aniobase.oVerificacion.sNombre;
            }

            this.dialog.open(this.modalReqPostular, {
              autoFocus: false,
              panelClass: 'modal_reduccion'
            });
          }
        } else {
          this.modal.liPeriodosValidos = data.oDatoAdicional.liPeriodosValidos;
          this.formActualizarAnioBase.reset();
          this.dialog.open(this.modalActualizarAnioBase, {
            autoFocus: false,
            width: '450px',
          });
        }
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false });
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }


  async fnRegistrarCompensacion() {
    const formValid = this.formReqCompensacion.valid;
    const fileValid = !!this.fileCompensacion;

    if (!formValid || !fileValid) {
      if (!formValid) {
        this.formReqCompensacion.markAllAsTouched();
      }
      if (!fileValid) {
        this.fileCompensacionInvalid = true;
      }
      return;
    }

    const bonosCarbonoValue = this.formReqCompensacion.get('bonosCarbono')?.value;
    const porcentajeCompensado = (bonosCarbonoValue / this.modal.bdTotalEmisiones) * 100;

    console.log('Valor del input: ', bonosCarbonoValue);
    console.log('bdTotalEmisiones: ', this.modal.bdTotalEmisiones);
    console.log('porcentajeCompensado: ', porcentajeCompensado);

    if (porcentajeCompensado < this.porcentajeCompensadoRequerido) {
      this.alert.warning(`El porcentaje compensado debe ser al menos el ${this.porcentajeCompensadoRequerido}% de las emisiones totales.`, 'Advertencia');
      return;
    }

    if (porcentajeCompensado > 100) {
      this.alert.warning('El porcentaje compensado no puede ser mayor al 100% de las emisiones totales.', 'Advertencia');
      return;
    }

    this.loadingModal = true;

    let sCodTipoSolicitud = '';
    if (porcentajeCompensado === 100) {
      sCodTipoSolicitud = 'NEUT';
    } else if (porcentajeCompensado >= 16 && porcentajeCompensado < 100) { // Aquí se ajusta el valor a >= 16
      sCodTipoSolicitud = 'COMP';
    }

    const oSolicitudPeriodo: iSolicitudPeriodo = {
      oPeriodo: {
        nIdPeriodo: this.modal.nIdPeriodo,
      },
      sCodTipoSolicitud: sCodTipoSolicitud,
      bdBonosCarbono: bonosCarbonoValue,
    };

    console.log('oSolicitudPeriodo', oSolicitudPeriodo);
    console.log('this.fileCompensacion', this.fileCompensacion!);

    try {

      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.registrarCompensacion(this.fileCompensacion!, oSolicitudPeriodo));
      if (data.boExito) {

        this.dialog.closeAll();
        this.fnListarHuellas();
        this.fnListarReconocimientos();
        this.mensajeInformativo = `Su organización ha postulado al nivel de ${sCodTipoSolicitud === 'NEUT' ? 'neutralización' : 'compensación'}`;
        this.dialog.open(this.modalInformativo, {
          autoFocus: false,
          panelClass: 'modal_informativo'
        });
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.alert.error('Ocurrió un error al registrar la compensación', 'Error');
    }

    this.loadingModal = false;
  }

  //Resetear Formularios
  resetReduccion() {
    this.fileLineaBase = null;
    this.fileAnioReduccion = null;
    this.fileCompensacion = null;
    this.nombreArchivoLineaBase = '';
    this.nombreArchivoAnioReduccion = '';
    this.nombreArchivoCompensacion = '';
    this.isUploadedLineaBase = false;
    this.isUploadedAnioReduccion = false;
    this.isUploadedCompensacion = false;
    this.fileLineaBaseInvalid = false;
    this.fileAnioReduccionInvalid = false;
    this.fileCompensacionInvalid = false;
    this.fileLineaBaseTooLarge = false;
    this.fileAnioReduccionTooLarge = false;
    this.fileCompensacionTooLarge = false;
    this.draggingLineaBase = false;
    this.draggingAnioReduccion = false;
    this.draggingCompensacion = false;

    this.oReduccion.oDocRequisito.sCodigoDocumento = '';
    this.oReduccion.oDocRequisito.sNombre = '';


    this.oReduccion.oPeriodo.oVerificacion.sCodigoDocumento = '';
    this.oReduccion.oPeriodo.oVerificacion.sNombre = '';

  }

  resetCompensacion() {
    this.fileCompensacion = null;
    this.nombreArchivoCompensacion = '';
    this.isUploadedCompensacion = false;
    this.fileCompensacionInvalid = false;
    this.fileCompensacionTooLarge = false;
    this.draggingCompensacion = false;

    this.oCompensacion.oDocRequisito.sCodigoDocumento = '';
    this.oCompensacion.oDocRequisito.sNombre = '';
  }

  //Arrastre y subida de archivos
  onFileChange(event: any, fileType: string): void {
    const file = event.target.files[0];
    this.handleFile(file, fileType);
  }

  handleFile(file: File, fileType: string): void {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.setFileInvalidState(fileType, true);
      } else if (file.type !== 'application/pdf') {
        this.setFileInvalidState(fileType, false);
      } else {
        this.setFileValidState(file, fileType);
      }
    }
  }

  handleDragOver(event: DragEvent, fileType: string): void {
    event.preventDefault();
    if (fileType === 'fileLineaBase' && !this.modal.oVerificacion) {
      this.draggingLineaBase = true;
    } else if (fileType === 'fileAnioReduccion') {
      this.draggingAnioReduccion = true;
    } else if (fileType === 'fileCompensacion') {
      this.draggingCompensacion = true;
    }
  }

  handleDrop(event: DragEvent, fileType: string): void {
    event.preventDefault();
    this.draggingLineaBase = false;
    this.draggingAnioReduccion = false;
    this.draggingCompensacion = false;
    if (fileType !== 'fileLineaBase' || !this.modal.oVerificacion) {
      const file = event.dataTransfer?.files[0];
      if (file) {
        this.handleFile(file, fileType);
      }
    }
  }

  blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }

  //Asignar validaciones
  setFileValidState(file: File, fileType: string): void {
    if (fileType === 'fileLineaBase') {
      this.fileLineaBase = file;
      this.nombreArchivoLineaBase = file.name;
      this.isUploadedLineaBase = true;
      this.fileLineaBaseInvalid = false;
      this.fileLineaBaseTooLarge = false;
    } else if (fileType === 'fileAnioReduccion') {
      this.fileAnioReduccion = file;
      this.nombreArchivoAnioReduccion = file.name;
      this.isUploadedAnioReduccion = true;
      this.fileAnioReduccionInvalid = false;
      this.fileAnioReduccionTooLarge = false;
    } else if (fileType === 'fileCompensacion') {
      this.fileCompensacion = file;
      this.nombreArchivoCompensacion = file.name;
      this.isUploadedCompensacion = true;
      this.fileCompensacionInvalid = false;
      this.fileCompensacionTooLarge = false;
    }
  }

  setFileInvalidState(fileType: string, tooLarge: boolean): void {
    if (fileType === 'fileLineaBase') {
      this.isUploadedLineaBase = false;
      this.fileLineaBaseInvalid = true;
      this.fileLineaBaseTooLarge = tooLarge;
    } else if (fileType === 'fileAnioReduccion') {
      this.isUploadedAnioReduccion = false;
      this.fileAnioReduccionInvalid = true;
      this.fileAnioReduccionTooLarge = tooLarge;
    } else if (fileType === 'fileCompensacion') {
      this.isUploadedCompensacion = false;
      this.fileCompensacionInvalid = true;
      this.fileCompensacionTooLarge = tooLarge;
    }
  }

  async eliminarPeriodo(item: any) {
    console.log('item', item.nIdPeriodo);

    item.loading = true;
    try {

      let oPeriodo: IPeriodo = {
        nIdPeriodo: item.nIdPeriodo
      }

      let data: IDataResponse = await lastValueFrom(this.periodoService.eliminarPeriodo(oPeriodo));
      if (data.boExito) {
        this.fnListarHuellas();
        this.alert.success('El periodo ha sido eliminado.', 'Éxito');
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.errorService.enviar(error);
      this.alert.warning('No se pudo eliminar el periodo.', 'Advertencia');
    }
    item.loading = false;
  }

  /* ---------- Abrir Modales -------------- */
  openModalReapertura(oPeriodo: IPeriodo) {
    this.formReapertura.reset();
    this.modal = JSON.parse(JSON.stringify(oPeriodo));
    this.dialog.open(this.modalReapertura, {
      autoFocus: false,
      width: '650px'
    });
  }

  openModalRegistro() {
    this.formRegistro.reset();
    this.dialog.open(this.modalRegistro, {
      autoFocus: false,
      width: '470px'
    });
  }

  openModalMetodologia() {
    this.dialog.open(this.modalMetodologia, {
      autoFocus: false,
      width: '600px'
    });
  }

  openModalAnioBase() {
    if (this.lstPeriodoDisponible.length == 0) {
      this.alert.warning('No existen años posteriores al año base actual', 'Advertencia', {
        timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false
      });
    } else {
      this.formAnioBase.reset();
      this.dialog.open(this.modalCambioAnioBase, {
        autoFocus: false,
        width: '650px'
      });
    }
  }

  openModalObservacion(item: any) {
    this.obsReconocimiento = item.sObservacion;
    this.dialog.open(this.modalObsReconocimiento, {
      autoFocus: false,
      width: '600px'
    });
  }


  async openReconocimiento(item: IPeriodo, index: number) {
    console.log(item);
    if (index == 1) {
      //Cuantificación
      this.dialog.open(this.modalCuantificacion, {
        autoFocus: false,
        width: '450px'
      });
    }
    else if
      // (index == 2 && oPeriodo.boSegundoReconocimientoActivo == false) 
      (index == 2) {
      //Reducción

      this.modal = JSON.parse(JSON.stringify(item));
      this.fnValidarAnioReduccion(item);

    } else if
      // (index == 3 && item.boTercerCuartoReconocimientoActivo == false)
      (index == 3) {
      //Compensación / Neutralización

      this.modal = JSON.parse(JSON.stringify(item));

      let oParametro: iParametro = {
        sTipo: "PERIODO",
        sCodigo: "PORC-COMPENSACION"
      }
      let dataParametro: IDataResponse = await lastValueFrom(this.parametroService.obtenerParametro(oParametro));
      if (dataParametro.boExito) {

        console.log('dataParametro', dataParametro);
        this.porcentajeCompensadoRequerido = parseFloat(dataParametro.oDatoAdicional.sValor);

        this.formReqCompensacion.reset();
        this.resetCompensacion();
        this.dialog.open(this.modalReqCompensacion, {
          autoFocus: false,
          width: '450px'
        });
      } else {
        this.alert.warning(dataParametro.sMensajeUsuario, 'Advertencia');
      }
    }
  }



  /* ---------- Validación de años -------------- */
  getYearPattern(): string {
    return `^(201[2-9]|20[2-9][0-9]|${this.anioActual})$`;
  }

  yearValidator(maxYear: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const year = parseInt(control.value, 10);
      if (year > maxYear) {
        return { 'yearInvalid': true };
      }
      return null;
    };
  }
  /* ---------- Descargar Archivo -------------- */
  async fnDescargaArchivo(item: any) {
    await this.archivoService.descargaArchivo(item.liReporteGEI[0].oDocumento.sCodigoDocumento, item.liReporteGEI[0].oDocumento.sNombre);

  }

  async fnDescargaReconocimiento(item: any) {
    if (item.oDocReconocimiento.sCodigoDocumento) {
      await this.archivoService.descargaArchivo(item.oDocReconocimiento.sCodigoDocumento, item.oDocReconocimiento.sNombre);
    } else {
      this.alert.warning('No hay un documento de reconocimimento registrado para este año.', 'Advertencia');
    }
  }

  async fnDescargaDiploma(item: any) {
    if (item.oDocDiploma.sCodigoDocumento) {
      await this.archivoService.descargaArchivo(item.oDocDiploma.sCodigoDocumento, item.oDocDiploma.sNombre);
    } else {
      this.alert.warning('No hay un diploma registrado para este año.', 'Advertencia');
    }
  }

  async fnDescargaCertificado(index: number) {

    //Descargar certificado Linea base
    if (index == 1) {

      if (this.modal.oVerificacion != null) {
        await this.archivoService.descargaArchivo(this.modal.oVerificacion.sCodigoDocumento, this.modal.oVerificacion.sNombre);
      } else {
        await this.archivoService.descargaArchivo(this.oReduccion.oPeriodo.oVerificacion.sCodigoDocumento, this.oReduccion.oPeriodo.oVerificacion.sNombre);
      }

    }
    //Descargar certificado Reduccion
    else if
      (index == 2) {
      await this.archivoService.descargaArchivo(this.oReduccion.oDocRequisito.sCodigoDocumento, this.oReduccion.oDocRequisito.sNombre);
    }
    //Descargar certificado Compensacion
    else if
      (index == 3) {
      await this.archivoService.descargaArchivo(this.oCompensacion.oDocRequisito.sCodigoDocumento, this.oCompensacion.oDocRequisito.sNombre);
    }

  }


  /* ---------- Tabs -------------- */
  onTabChange(event: any): void {
    this.boListaHC = event.index === 0;
    if (this.boListaHC)
      this.fnListarHuellas();
    else
      this.fnListarReconocimientos();
    this.filtroAnio = '';
    this.dialog.closeAll();

  }


  redictLimitesInforme(item: any) {

    console.log('item', item);
    let oSharedPeriodo = {
      nIdPeriodo: item.nIdPeriodo,
      nAnio: item.nAnio,
      nEstadoReduccion: item.nEstadoReduccion,
      nEstadoPeriodo: item.nEstadoPeriodo,
      sRutaAnterior: 'mis-hc'
    }

    this.sharedDataService.setPeriodoLimite(oSharedPeriodo);

    console.log('VALOR MANDADO', this.sharedDataService.itemPeriodoLimite);
    this.router.navigate(['/limites-informe']);
  }


  redictAccionesMigitacion() {
    this.router.navigate(['/acciones-mitigacion']);
  }

  fnCerrarModal() {
    this.dialog.closeAll();
    this.loadingModal = false;
    this.formReapertura.reset();
    this.formRegistro.reset();
    this.formAnioBase.reset();
    this.formMetodologia.reset();
  }

  /* ---------- Formateo -------------- */
  formatearComaMiles(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
