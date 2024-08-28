import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { SolicitudPeriodoService } from '../../../services/huella-service/solicitud-periodo.service';
import { iParametro } from '../../../models/parametro';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { iSolicitudPeriodo } from '../../../models/solicitudPeriodo';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ErrorService } from '../../../services/error.service';
import { ArchivoService } from '../../../services/archivo.service';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';
declare var bootstrap: any;
@Component({
  selector: 'app-solicitudes-reconocimiento',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatPaginator,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    CommonModule],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './solicitudes-reconocimiento.component.html',
  styleUrls: ['./solicitudes-reconocimiento.component.css']
})
export class SolicitudesReconocimientoComponent implements OnInit {

  lstPendientes: any[] = [];
  lstTipoSolicitud: any[] = [];

  formModal: FormGroup;
  modal: any = {};
  itemRedComNeu: any = {};
  loadingModal: boolean = false;
  modalRed: any = {};
  modalCompNeu: any = {};

  selectedTipo: string = 'CUAN';
  observacion: string = '';

  hReconocimiento: string[] = ['organizacion', 'anio', 'fecha', 'acciones'];
  tReconocimiento = new MatTableDataSource<any>();

  @ViewChild('paginator', { static: false }) paginator!: MatPaginator;
  @ViewChild('modalObservacion') modalObservacion: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;
  @ViewChild('modalDetalle') modalDetalle!: TemplateRef<any>;
  @ViewChild('modalDetalleCompensaNeutraliza') modalDetalleCompensaNeutraliza!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedDataService: SharedDataService,
    private solicitudPeriodoService: SolicitudPeriodoService,
    private parametroService: ParametroService,
    public dialog: MatDialog,
    private alert: ToastrService,
    private errorService: ErrorService,
    private archivoService: ArchivoService
  ) {
    this.formModal = this.fb.group({
      observacion: ['', [
        Validators.required,
        Validators.maxLength(250),
        Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)
      ]]
    });
  }

  async ngOnInit() {
    this.fnListarPorTipo();
    this.fnListarPendientes();

  }


  ngAfterViewInit() {
    this.tReconocimiento.paginator = this.paginator;

    // Inicializa tooltips de Bootstrap una vez abierto
    this.dialog.afterOpened.subscribe(() => {
      setTimeout(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
          new bootstrap.Tooltip(tooltipTriggerEl);
        });
      });
    });
  }

  /* ---------- Llamar a servicios -------------- */
  async fnListarPorTipo() {
    try {
      let oParametro: iParametro = {
        sTipo: 'RECONOCIMIENTO'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));

      if (data.boExito) {
        this.lstTipoSolicitud = data.oDatoAdicional.filter((item: { sCodigo: string; }) => item.sCodigo !== 'SINR');
        console.log('this.lstTipoSolicitud', this.lstTipoSolicitud);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarPendientes() {
    this.tReconocimiento.data = [];
    try {
      let oSolicitudPeriodo: iSolicitudPeriodo = {
        sCodTipoSolicitud: this.selectedTipo
      };

      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarPendientes(oSolicitudPeriodo));
      console.log(data);

      if (data.boExito) {
        this.lstPendientes = data.oDatoAdicional;
        console.log('this.lstPendientes', this.lstPendientes);
        /*  if (this.lstPendientes.length > 0)
           this.tReconocimiento.data = this.lstPendientes.filter(item => item.sCodTipoSolicitud === this.selectedTipo); */
        this.tReconocimiento.data = this.lstPendientes
      } else {
        // Manejar error
      }
    } catch (error) {
      this.tReconocimiento.data = [];
      this.errorService.enviar(error);
    }
  }

  filtrarPorTipo(tipo: string) {
    this.selectedTipo = tipo;
    //this.tReconocimiento.data = this.lstPendientes.filter(item => item.sCodTipoSolicitud === tipo);
    this.fnListarPendientes();
    if (this.tReconocimiento.paginator) {
      this.tReconocimiento.paginator.firstPage();
    }
  }

  async verDetalleSolicitud(item: any) {
    console.log('item', item);
    if (item.sCodTipoSolicitud === 'CUAN') {

      let oSharedPeriodo = {
        nIdPeriodo: item.oPeriodo.nIdPeriodo,
        nAnio: item.oPeriodo.nAnio,
        nIdInstitucion: item.oInstitucion.nIdInstitucion,
        sRutaAnterior: 'solicitudes-reconocimiento',
        esUsuarioInterno: true
      }
      console.log('oPeriodo ENVIADO HC', oSharedPeriodo);

      this.sharedDataService.setPeriodoLimite(oSharedPeriodo);

      console.log('VALOR MANDADO', this.sharedDataService.itemPeriodoLimite);

      this.router.navigate(['/resultado-gei']);
    } else if (item.sCodTipoSolicitud === 'REDU') {

      try {
        let oSolicitudPeriodo: iSolicitudPeriodo = {
          oPeriodo: {
            nIdPeriodo: item.oPeriodo.nIdPeriodo
          },
          oInstitucion: {
            nIdInstitucion: item.oInstitucion.nIdInstitucion
          }
        }

        let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarReduccion(oSolicitudPeriodo));

        if (data.boExito) {
          this.modalRed = data.oDatoAdicional;
          if (this.modalRed.bdReduccion >= 0) {
            let porcRed = Number((this.modalRed.bdEmisionTotal / this.modalRed.bdEmisionBase) * 100).toFixed(0);
            let porcMax = Number((1 - (this.modalRed.bdEmisionTotal / this.modalRed.bdEmisionBase)) * 100).toFixed(0);
            this.modalRed.porcMin = `${porcRed}%`;
            this.modalRed.porcMax = `${porcMax}%`;

          } else {
            let porcMin = Number((this.modalRed.bdEmisionBase / this.modalRed.bdEmisionTotal) * 100).toFixed(0);
            let porcMax = Number((1 - (this.modalRed.bdEmisionBase / this.modalRed.bdEmisionTotal)) * 100).toFixed(0);

            this.modalRed.porcMin = `${porcMin}%`;
            this.modalRed.porcMax = `${porcMax}%`;
          }

          this.modalRed.nAnioRed = item.oPeriodo.nAnio;
          this.modalRed.tooltipBase = `LB: ${this.modalRed.oPeriodo.nAnio} - ${this.modalRed.bdEmisionBase} tCO₂e`;
          this.modalRed.tooltipRed = `AR: ${this.modalRed.nAnioRed} - ${this.modalRed.bdEmisionTotal} tCO₂e`;

          //Indicadores
          this.modalRed.liIndicador.map((iInd: any) => {
            if (iInd.bdReduccion >= 0) {
              let porcIndMin = Number((iInd.bdResultado / iInd.bdResultadoBase) * 100).toFixed(0);
              let porcIndMax = Number((1 - (iInd.bdResultado / iInd.bdResultadoBase)) * 100).toFixed(0);
              iInd.porcMin = `${porcIndMin}%`;
              iInd.porcMax = `${porcIndMax}%`;
            } else {
              let porcIndMin = Number((iInd.bdResultadoBase / iInd.bdResultado) * 100).toFixed(2);
              let porcIndMax = Number((1 - (iInd.bdResultadoBase / iInd.bdResultado)) * 100).toFixed(2);
              iInd.porcMin = `${porcIndMin}%`;
              iInd.porcMax = `${porcIndMax}%`;
            }
            iInd.tooltipBase = `LB: ${iInd.bdResultadoBase} tCO₂e/${iInd.sUnidad}`;
            iInd.tooltipRed = `AR: ${iInd.bdResultado} tCO₂e/${iInd.sUnidad} `;
          });

          this.itemRedComNeu = item;
          this.dialog.open(this.modalDetalle, {
            autoFocus: false,
            panelClass: 'modal_detalle_solicitud'
          });


          console.log(this.modalRed);

        }
      } catch (error) {
        this.errorService.enviar(error);
      }

    } else if (item.sCodTipoSolicitud === 'COMP' || item.sCodTipoSolicitud === 'NEUT') {
      try {
        let oSolicitudPeriodo: iSolicitudPeriodo = {
          oPeriodo: {
            nIdPeriodo: item.oPeriodo.nIdPeriodo
          }
        }

        let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarCompensacion(oSolicitudPeriodo));
        console.log(data);
        if (data.boExito) {
          this.modalCompNeu = data.oDatoAdicional;

          let porcMin = Number(this.modalCompNeu.bdPorcentaje) >= 100 ? 100 : Number(this.modalCompNeu.bdPorcentaje).toFixed(0);
          let porcMax = Number(100 - (this.modalCompNeu.bdPorcentaje)).toFixed(0);
          this.modalCompNeu.porcMin = `${porcMin}%`;
          this.modalCompNeu.porcMax = `${porcMax}%`;

          this.modalCompNeu.nAnio = item.oPeriodo.nAnio;
          this.modalCompNeu.tooltip = `${this.modalCompNeu.nAnio}: ${this.modalCompNeu.bdEmisionTotal} tCO₂e`;
        }
        this.itemRedComNeu = item;

        this.dialog.open(this.modalDetalleCompensaNeutraliza, {
          autoFocus: false,
          width: '500px'
        });
      } catch (error) {
        this.errorService.enviar(error);
      }
    }
  }

  async enviarSolicitud(tipo: string) {
    this.loadingModal = true;
    try {
      console.log('this.modal', this.modal);

      this.modalRed = null;
      this.modalCompNeu.porcMin == null;


      //Si es reducción
      if (this.modal.sCodTipoSolicitud == 'REDU') {
        let oSolicitudRedu: iSolicitudPeriodo = {
          oPeriodo: {
            nIdPeriodo: this.modal.oPeriodo.nIdPeriodo
          },
          oInstitucion: {
            nIdInstitucion: this.modal.oInstitucion.nIdInstitucion
          }
        }

        let dataSolicitud: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarReduccion(oSolicitudRedu));
        if (dataSolicitud.boExito) {
          this.modalRed = dataSolicitud.oDatoAdicional;
        }

        console.log('this.modalRed.bdReduccion', this.modalRed.bdReduccion);
      }


      //Si es compensación
      if (this.modal.sCodTipoSolicitud == 'COMP') {

        let oSolicitudCompen: iSolicitudPeriodo = {
          oPeriodo: {
            nIdPeriodo: this.modal.oPeriodo.nIdPeriodo
          }
        }

        let datCompen: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarCompensacion(oSolicitudCompen));

        if (datCompen.boExito) {
          this.modalCompNeu = datCompen.oDatoAdicional;
          let porcMin = Number(this.modalCompNeu.bdPorcentaje) >= 100 ? 100 : Number(this.modalCompNeu.bdPorcentaje).toFixed(0);
          this.modalCompNeu.porcMin = Number(porcMin);
        }

        console.log('this.modalCompNeu.porcMin', this.modalCompNeu.porcMin);
      }


      let oSolicitudPeriodo: iSolicitudPeriodo = {
        nIdSolicitudPeriodo: this.modal.nIdSolicitudPeriodo,
        oPeriodo: {
          nIdPeriodo: this.modal.oPeriodo.nIdPeriodo,
          nAnio: this.modal.oPeriodo.nAnio,
          bdReduccion: this.modalRed?.bdReduccion,
          bdPorcentaje: this.modalCompNeu?.porcMin,
          bdTotalEmisiones: this.modal.oPeriodo.bdTotalEmisiones,
        },
        sCodTipoSolicitud: this.modal.sCodTipoSolicitud,
        nEstado: tipo === 'OBS' ? 1 : 2, //1:Observado | 2:Aprobado
        sMensaje: tipo === 'OBS' ? this.formModal.controls['observacion'].value : null,

        sTipoSolicitud: this.modal.sTipoSolicitud,
        oInstitucion: {
          nIdInstitucion: this.modal.oInstitucion.nIdInstitucion,
          sRazonSocial: this.modal.oInstitucion.sRazonSocial
        },

      };

      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.gestionarSolicitud(oSolicitudPeriodo));
      console.log(data);

      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarPendientes();

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
    this.dialog.closeAll();
    this.loadingModal = false;
  }

  /* ---------- Abrir Modales -------------- */
  openObservar(item: any) {
    this.modal = item;
    this.formModal.reset();
    this.dialog.open(this.modalObservacion, {
      autoFocus: false,
      width: '450px',
    });
  }

  openAprobar(item: any) {
    this.modal = item;
    this.formModal.reset();
    this.dialog.open(this.modalConfirmacion, {
      autoFocus: false,
      width: '450px',
    });
  }


  openModal(): void {
    this.dialog.open(this.modalDetalle, {
      panelClass: 'modal_detalle_solicitud'
    });

  }

  /* ---------- Descargar archivo -------------- */
  fnDescargaArchivo(codDocumento: string, nombreDocumento: string) {
    this.archivoService.descargaArchivo(codDocumento, nombreDocumento);
  }
}
