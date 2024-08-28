import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { IPeriodo } from '../../../models/periodo';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PeriodoService } from '../../../services/huella-service/periodo.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ArchivoService } from '../../../services/archivo.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { iSolicitudPeriodo } from '../../../models/solicitudPeriodo';
import { SolicitudPeriodoService } from '../../../services/huella-service/solicitud-periodo.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';

@Component({
  selector: 'app-hc-organizacional',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatPaginator,
    FormsModule,
    ReactiveFormsModule,
    CdkTextareaAutosize,
    MatSlideToggleModule,
    CommonModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './hc-organizacional.component.html',
  styleUrl: './hc-organizacional.component.css'
})
export class HcOrganizacionalComponent {

  formRechazoHC: FormGroup;
  modal: any = {};
  lstHC: any[] = [];
  lstAnio: any[] = [];
  sesion: any = null;
  loadingModal: boolean = false;

  selectedAnio: number | string = "Todos";
  selectedActividadEconomica: string = '';
  sJustificacion: string = '';
  boSoloReapertura: boolean = false;

  filtroOrganizacion: string = '';

  hOrganizacional: string[] = ['organization', 'year', 'totalEmissions', 'recognitions', 'actions'];
  tOrganizacional = new MatTableDataSource<any>();

  @ViewChild('modalReaperturaHC') modalReaperturaHC: any;
  @ViewChild('modalRechazoHC') modalRechazoHC: any;
  @ViewChild('paginatorOrganizacional', { static: false }) paginatorOrganizacional!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private sharedDataService: SharedDataService,
    private periodoService: PeriodoService,
    private solicitudPeriodoService: SolicitudPeriodoService,
    private alert: ToastrService,
    private archivoService: ArchivoService
  ) {
    this.formRechazoHC = this.fb.group({
      motivo: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/^[\wáéíóúñÁÉÍÓÚÑ0-9,.: \n]*$/)]]
    });
  }

  async ngOnInit() {
    await this.fnListarAnio();
    await this.fnListarHC();
  }

  ngAfterViewInit() {
    this.tOrganizacional.paginator = this.paginatorOrganizacional;
  }

  /* ---------- Llamar a servicios -------------- */
  async fnListarAnio() {
    try {
      let data = await lastValueFrom(this.periodoService.listarFinalizados({}));
      if (data.boExito) {
        this.lstAnio = data.oDatoAdicional;
        this.lstAnio.unshift("Todos");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fnListarHC() {
    try {
      let anioSeleccionado = this.selectedAnio === "Todos" ? -1 : this.selectedAnio;
      let filtro: IPeriodo = {
        nAnio: anioSeleccionado as number,
        boSoloReapertura: this.boSoloReapertura
      };
      let data = await lastValueFrom(this.periodoService.listarHuellaOrganizacional(filtro));
      console.log(data);
      if (data.boExito) {
        this.lstHC = data.oDatoAdicional;

        console.log('this.lstHC', this.lstHC);
        this.aplicarFiltro();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  aplicarFiltro(): void {
    this.tOrganizacional.data = this.lstHC?.filter(item =>
      item.oInstitucion.sRazonSocial.toLowerCase().includes(this.filtroOrganizacion.toLowerCase())
    );
    if (this.tOrganizacional.paginator) {
      this.tOrganizacional.paginator.firstPage();
    }
  }

  async fnRechazarReapertura() {
    this.loadingModal = true;
    try {
      let oSolicitudPeriodo: iSolicitudPeriodo = {
        oPeriodo: {
          nIdPeriodo: this.modal.periodo,
          oInstitucion: {
            nIdInstitucion: this.modal.nIdInstitucion
          },
          nAnio: this.modal.nAnio
        },
        sMensaje: this.formRechazoHC.controls['motivo'].value
      };

      console.log('oSolicitudPeriodo', oSolicitudPeriodo);

      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.observarReapertura(oSolicitudPeriodo));
      if (data.boExito && data.oDatoAdicional) {
        this.fnListarHC();
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
      // Manejar error
    }
    this.loadingModal = false;
  }

  async fnAperturar() {
    this.loadingModal = true;
    try {

      console.log('this.modal', this.modal);
      let oSolicitudPeriodo: iSolicitudPeriodo = {
        oPeriodo: {
          nIdPeriodo: this.modal.periodo,
          oInstitucion: {
            nIdInstitucion: this.modal.nIdInstitucion
          },
          nAnio: this.modal.nAnio
        }

      };

      console.log('oSolicitudPeriodo', oSolicitudPeriodo);


      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.reaperturar(oSolicitudPeriodo));
      if (data.boExito && data.oDatoAdicional) {
        this.fnListarHC();
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
      // Manejar error
    }
    this.loadingModal = false;


  }

  /* ---------- Modales -------------- */
  openMotivoReapertura(item: any) {

    console.log('item', item);
    this.modal.periodo = item.nIdPeriodo;
    this.modal.nAnio = item.nAnio;
    this.modal.nIdInstitucion = item.oInstitucion.nIdInstitucion;

    console.log('this.modal', this.modal);

    this.sJustificacion = item.sJustificacionReapertura;
    this.dialog.open(this.modalReaperturaHC, {
      autoFocus: false,
      width: '450px',
    });
  }

  openRechazarHC() {
    this.formRechazoHC.reset();
    this.dialog.open(this.modalRechazoHC, {
      autoFocus: false,
      width: '450px',
    });
  }

  /* ---------- Descargar Archivo -------------- */

  async fnDescargaArchivo(item: any) {
    let oPeriodo: IPeriodo = {
      nIdPeriodo: item.nIdPeriodo
    };
    let data = await lastValueFrom(this.periodoService.listarReporteGei(oPeriodo));
    if (data.boExito) {
      const oDocumento = data.oDatoAdicional[0];
      const sCodigoDocumento = oDocumento.oDocumento.sCodigoDocumento;
      const sNombre = oDocumento.oDocumento.sNombre;
      await this.archivoService.descargaArchivo(sCodigoDocumento, sNombre);
    }
  }
  async fnDescargaZip(item: any) {
    await this.archivoService.descargaArchivo(item.oEvidencia.sCodigoDocumento, item.oEvidencia.sNombre);
  }

  /* ---------- Redireccionar-------------- */
  redictLimitesInforme(item: any) {
    console.log('item', item);
    let oSharedPeriodo = {
      nIdPeriodo: item.nIdPeriodo,
      nAnio: item.nAnio,
      nEstadoReduccion: item.nEstadoReduccion,
      nEstadoPeriodo: 3,
      esUsuarioInterno: true,
      nIdInstitucion: item.oInstitucion.nIdInstitucion,
      sRutaAnterior: 'hc-organizacional'
    };

    console.log('oSharedPeriodo', oSharedPeriodo);
    this.sharedDataService.setPeriodoLimite(oSharedPeriodo);
    this.router.navigate(['/limites-informe']);
  }
}
