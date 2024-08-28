import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Periodo } from 'src/app/models/periodo';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { FileService } from 'src/app/services/file.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-bandeja-notificaciones',
  templateUrl: './bandeja-notificaciones.component.html',
  styleUrls: ['./bandeja-notificaciones.component.css']
})
export class BandejaNotificacionesComponent implements OnInit {
  oUsuario: IUsuario;
  idMunicipalidad: Number;
  lstEstado: any[] = [];
  lstEstadoCombo: any[] = [];

  page = 1;
  pageSize = 10;
  total = 0;

  calendar: any;
  searchCalendar: any;
  getDate: any;
  asunto: any;

  model: Periodo = new Periodo();
  comboSelect: any;

  constructor(private periodoService: PeriodoService, private alertService: AlertService, private seguridadService: SeguridadService, private fileService: FileService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.asunto = -1;
      this.idMunicipalidad = <Number>this.oUsuario.nIdInstitucion;

      let today = new Date();
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.calendar = this.getDate;

      this.searchCalendar = ('0' + this.getDate.day).slice(-2) + '/' + ('0' + this.getDate.month).slice(-2) + '/' + this.getDate.year
      this.fnListarEstado();
    }
  }

  async fnListarEstado() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarEstado(this.idMunicipalidad, this.searchCalendar));
      if (data.exito) {
        this.lstEstado = data.datoAdicional;
        //console.log('this.lstEstado', this.lstEstado);

        this.lstEstadoCombo = this.lstEstado.filter((obj, index) => {
          return index === this.lstEstado.findIndex(o => obj.sEstadoActual === o.sEstadoActual);
        });
        //console.log(this.lstEstadoCombo);
      } else {
        this.lstEstado = [];
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDescargarDocumento(item: any) {
    try {
      let data = await lastValueFrom(this.fileService.downloadFile(item.sUIDdocumento));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = item.sNombreDocumento;

      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  changePendiente(changeDate: any) {
    this.searchCalendar = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year
    this.fnListarEstado();
    this.comboSelect = -1;
    this.asunto = -1;
    this.lstEstadoCombo = [];
  }

  changeAsunto() {
    this.comboSelect = this.asunto.sEstadoActual;

    //Filtrar el objeto con mismo Sector
    this.lstEstado.filter(item => item.sEstadoActual === this.asunto.sEstadoActual);
    //console.log('index', this.asunto.sEstadoActual);
  }

}
