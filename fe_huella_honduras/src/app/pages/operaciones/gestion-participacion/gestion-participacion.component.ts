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
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
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
import { ErrorService } from '../../../services/error.service';
import { iSolicitudGestion } from '../../../models/solicitudGestion';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    DatePipe
  ],
  templateUrl: './gestion-participacion.component.html',
  styleUrls: ['./gestion-participacion.component.css'],
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AlertComponent,
    CdkTextareaAutosize
  ],

})
export class SolicitudesParticipacionComponent implements AfterViewInit {
  lstPendientes: any[] = [];
  lstHistorial: any[] = [];
  sesion: any = null;

  fechaInicial: any = null;
  fechaFinal: any = null;

  filtroOrganizacion: string = '';

  hPendientes: string[] = ['fechaRegistro', 'organizacion', 'declaracionParticipacion', 'detalle', 'acciones'];
  hHistorial: string[] = ['fechaAtencion', 'organizacion', 'declaracionParticipacion', 'detalle', 'estado', 'acciones'];

  tPendientes = new MatTableDataSource<any>(this.lstPendientes);
  tHistorial = new MatTableDataSource<any>(this.lstHistorial);

  formModal: FormGroup;

  esRechazado: boolean = false;
  esObservar: boolean = false;

  objAtenSolicitud: any;
  nIdSolicitudUsuario: number = 0;

  modal: any;
  loadingModal: boolean = false;

  @ViewChild('paginatorPendientes', { static: false }) paginatorPendientes!: MatPaginator;
  @ViewChild('paginatorHistorial', { static: false }) paginatorHistorial!: MatPaginator;

  @ViewChild('sortPendientes', { static: false }) sortPendientes!: MatSort;
  @ViewChild('sortHistorial', { static: false }) sortHistorial!: MatSort;

  @ViewChild('modalAprobar') modalAprobar: any;
  @ViewChild('modalObservarRechazar') modalObservarRechazar: any;
  @ViewChild('modalDepurar') modalDepurar: any;
  @ViewChild('modalDetalle') modalDetalle: any;

  constructor(
    private fb: FormBuilder,
    private gestionService: GestionService,
    public dialog: MatDialog,
    private alert: ToastrService,
    private archivoService: ArchivoService,
    private sesionService: SesionService,
    private errorService: ErrorService) {

    this.sesion = this.sesionService.getSesion();
    this.fnListarPendientes();
    this.fnListarHistorial();
    this.formModal = this.fb.group({
      observacion: ['', [
        Validators.required,
        Validators.maxLength(250),
        Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)
      ]]
    });

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.tPendientes.paginator = this.paginatorPendientes;
    this.tPendientes.sort = this.sortPendientes;

    this.tHistorial.paginator = this.paginatorHistorial;
    this.tHistorial.sort = this.sortHistorial;
  }

  /* ---------- Funciones de calendario -------------- */
  changeFechaInicial(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value!;
    this.fechaInicial = selectedDate;

    if (this.fechaFinal && selectedDate > this.fechaFinal) {
      this.alert.warning('La fecha inicial no puede ser mayor que la fecha final.', 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
      return;
    }

    if (this.fechaFinal && this.isExceedingRange(selectedDate, this.fechaFinal, 6)) {
      this.alert.warning('El rango de búsqueda es de hasta 6 meses.', 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
      return;
    }

    if (this.fechaFinal) {
      this.fnListarHistorial();
    }
  }

  changeFechaFinal(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value!;
    this.fechaFinal = selectedDate;

    console.log('this.fechaInicial', this.fechaInicial);
    console.log('this.fechaFinal', this.fechaFinal);

    if (this.fechaInicial && selectedDate < this.fechaInicial) {
      this.alert.warning('La fecha final no puede ser menor que la fecha inicial.', 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
      return;
    }

    if (this.fechaInicial && this.isExceedingRange(this.fechaInicial, selectedDate, 6)) {
      this.alert.warning('El rango de búsqueda es de hasta 6 meses.', 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
      return;
    }

    if (this.fechaInicial) {
      this.fnListarHistorial();
    }
  }

  isExceedingRange(startDate: Date, endDate: Date, months: number): boolean {
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endYear = endDate.getFullYear();

    const monthDifference = (endYear - startYear) * 12 + (endMonth - startMonth);

    return monthDifference > months;
  }
  /* ---------- Llamar a servicios -------------- */
  async fnListarPendientes() {
    try {
      let dataSolicitud: IDataResponse = await lastValueFrom(this.gestionService.listarSolicitud('1'));
      if (dataSolicitud.boExito) {
        this.lstPendientes = dataSolicitud.oDatoAdicional;
        this.tPendientes.data = this.lstPendientes; // Asignar datos a tPendientes
        console.log('this.lstPendientes', this.lstPendientes);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarHistorial() {
    try {
      let data: IDataResponse = await lastValueFrom(this.gestionService.listarSolicitud('0-2', this.fechaInicial, this.fechaFinal));
      if (data.boExito) {
        this.lstHistorial = data.oDatoAdicional;


        console.log('lstHistorial', this.lstHistorial);
        this.tHistorial.data = this.lstHistorial; // Asignar datos a tHistorial
        console.log('this.lstHistorial', this.lstHistorial);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnAtenSolicitud() {
    this.loadingModal = true;
    try {
      // Agregamos la observación al objeto
      if (this.esObservar || this.esRechazado) {
        this.objAtenSolicitud.sObservacion = this.formModal.controls['observacion'].value;
      }

      console.log('this.objAtenSolicitud', this.objAtenSolicitud);

      let data: IDataResponse = await lastValueFrom(this.gestionService.atenderSolicitud(this.objAtenSolicitud));
      console.log('fnAtenSolicitud', data);
      if (data.boExito) {
        this.fnListarPendientes();
        this.dialog.closeAll();
        this.alert.success(data.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
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

  async fnEliminarSolicitud() {
    this.loadingModal = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.gestionService.eliminarSolicitud(this.nIdSolicitudUsuario));
      if (data.boExito) {
        this.fnListarPendientes();
        this.dialog.closeAll();
        this.alert.success(data.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
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

  async fnReenviarMail(item: any) {
    try {

      console.log('item', item);

      let oSolicitudGestion: iSolicitudGestion = {
        nIdSolicitudUsuario: item.nIdSolicitudUsuario,
        nEstadoSolicitud: item.nEstadoSolicitud,
        sObservacion: item.sObservacion,
        oInstitucion: {
          sRazonSocial: item.oInstitucion.sRazonSocial,
          sNumeroRtn: item.oInstitucion.sNumeroRtn
        },
        oUsuario: {
          sNombre: item.oUsuario.sNombre,
          sApellidos: item.oUsuario.sApellidos,
          sCorreo: item.oUsuario.sCorreo
        }
      };

      let data: IDataResponse = await lastValueFrom(this.gestionService.reenviarMail(oSolicitudGestion));
      if (data.boExito) {
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
  }
  /* ---------- Descargar archivos -------------- */
  async fnDescargaArchivo(item: any) {

    await this.archivoService.descargaArchivo(item.sCodigoDocumento, item.sNombre);
  }

  /* ---------- Abrir Modales -------------- */
  openAprobar(item: any) {
    this.esObservar = false;
    this.esRechazado = false;

    this.objAtenSolicitud = {
      nIdSolicitudUsuario: item.nIdSolicitudUsuario,
      nEstadoSolicitud: 3, // '3' Si estado Aprobado
      oInstitucion: {
        oCiiu: {
          nIdCiiu: item.oInstitucion.oCiiu.nIdCiiu
        },
        sRazonSocial: item.oInstitucion.sRazonSocial,
        sNumeroRtn: item.oInstitucion.sNumeroRtn,
        sDireccion: item.oInstitucion.sDireccion
      },
      oUsuario: {
        sNombre: item.oUsuario.sNombre,
        sApellidos: item.oUsuario.sApellidos,
        sNumDocumento: item.oUsuario.sNumDocumento,
        sCorreo: item.oUsuario.sCorreo,
        sTelefono: item.oUsuario.sTelefono
      },
      oDocumento: {
        sCodigoDocumento: item.oDocumento.sCodigoDocumento
      }
    };

    console.log('this.objAtenSolicitud', this.objAtenSolicitud);

    this.dialog.open(this.modalAprobar, {
      width: '450px',
    });
  }

  openObservarRechazar(action: string, item: any) {
    this.objAtenSolicitud = {
      nIdSolicitudUsuario: item.nIdSolicitudUsuario,
      nEstadoSolicitud: action === 'observar' ? 2 : 0, // '2' Si estado Observado, '1' Si estado es Rechazado
      oInstitucion: {
        sRazonSocial: item.oInstitucion.sRazonSocial,
        sNumeroRtn: item.oInstitucion.sNumeroRtn,
      },
      oUsuario: {
        sNombre: item.oUsuario.sNombre,
        sApellidos: item.oUsuario.sApellidos,
        sCorreo: item.oUsuario.sCorreo,
      }
    };

    if (action === 'observar') {
      this.esObservar = true;
      this.esRechazado = false;
    } else if (action === 'rechazar') {
      this.esObservar = false;
      this.esRechazado = true;
    }
    this.formModal.reset();
    this.dialog.open(this.modalObservarRechazar, {
      width: '450px',
    });
  }

  openDepurar(item: any) {
    this.nIdSolicitudUsuario = item.nIdSolicitudUsuario;
    console.log('this.nIdSolicitudUsuario', this.nIdSolicitudUsuario);
    this.dialog.open(this.modalDepurar, {
      width: '400px',
    });
  }

  openDetalle(item: any) {
    console.log(item);
    this.modal = JSON.parse(JSON.stringify(item));
    console.log('this.modal', this.modal.oInstitucion.sNumeroRtn);

    this.dialog.open(this.modalDetalle, {
      autoFocus: false,
      panelClass: 'modal_detalle'
    });
  }

  /* ---------- Aplicar Filtro -------------- */
  aplicarFiltro(): void {
    this.tHistorial.data = this.lstHistorial.filter(item =>
      item.oInstitucion.sRazonSocial.toLowerCase().includes(this.filtroOrganizacion.toLowerCase())
    );
  }
}
