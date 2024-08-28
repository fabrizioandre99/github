import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IUsuario } from '../../../models/usuario';
import { IDataResponse } from '../../../models/IDataResponse';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { SeguridadService } from '../../../services/seguridad.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { lastValueFrom } from 'rxjs';
import { LogService } from '../../../services/log.service';
import { ILog } from '../../../models/log';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-bitacora-incidencias',
  standalone: true,
  templateUrl: './bitacora-incidencias.component.html',
  styleUrls: ['./bitacora-incidencias.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatTooltipModule,
    AlertComponent,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
})
export class BitacoraIncidenciasComponent implements OnInit {
  lstLog: any[] = [];
  hIncidencias: string[] = ['dFechaRegistro', 'sErrorOrigen', 'sErrorResumen', 'acciones'];
  tIncidencias = new MatTableDataSource<any>();

  fechaInicial: Date = new Date();
  fechaFinal: Date = new Date();

  sMensajeModal: string = '';

  @ViewChild('tableIncidencias', { static: true, read: ElementRef }) tableIncidencias: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('paginatorIncidencias', { static: false }) paginatorIncidencias!: MatPaginator;
  @ViewChild('modalError') modalError: any;

  constructor(
    private alert: ToastrService,
    private logService: LogService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.fnListarLog();
  }

  ngAfterViewInit() {
    this.tIncidencias.paginator = this.paginatorIncidencias;
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
      this.fnListarLog();
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
      this.fnListarLog();
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

  async fnListarLog() {
    try {
      const sFechaInicio = this.fechaInicial
        ? this.formatDate(new Date(this.fechaInicial))
        : '';
      const sFechaFin = this.fechaFinal
        ? this.formatDate(new Date(this.fechaFinal))
        : '';

      let oLog: ILog = {
        sFechaInicio,
        sFechaFin
      };

      console.log('oLog', oLog);

      let data: IDataResponse = await lastValueFrom(this.logService.listarLog(oLog));
      if (data.boExito) {
        this.lstLog = data.oDatoAdicional;

        this.tIncidencias.data = this.lstLog; // Asignar datos a tHistorial
        console.log('this.lstLog ', this.lstLog);
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      console.error('Error fetching log data:', error);
    }
  }

  mostrarModalError(item: ILog) {
    console.log('item', item);
    this.sMensajeModal = item.sErrorCompleto!;
    this.dialog.open(this.modalError, {
      panelClass: 'modal_error'
    });
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }
}
