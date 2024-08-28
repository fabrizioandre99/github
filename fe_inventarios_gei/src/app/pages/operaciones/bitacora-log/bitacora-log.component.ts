import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Log } from 'src/app/models/log';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { BitacoraService } from 'src/app/services/bitacora.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-bitacora-log',
  templateUrl: './bitacora-log.component.html',
  styleUrls: ['./bitacora-log.component.css']
})

export class BitacoraLogComponent implements OnInit {
  oUsuario: IUsuario;
  lstBitacora: any[] = [];

  loadingTable: Boolean = true;

  calendar: any;
  getDate: any;
  searchDay: any;

  page = 1;
  pageSize = 10;
  total = 0;
  collectionSize = 0;

  maxPag = 0;
  minPage = 0;

  model: Log = new Log();

  constructor(private bitacoraService: BitacoraService, private seguridadService: SeguridadService
    , private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let today = new Date();
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.calendar = this.getDate;
      this.searchDay = ('0' + this.getDate.day).slice(-2) + '/' + ('0' + this.getDate.month).slice(-2) + '/' + this.getDate.year

      this.model.dFechaRegistro = this.getDate;
      this.fnBitacora();
      this.fnObtenerRegistros();
    }
  }

  async fnBitacora() {
    try {
      if (this.page == 1) {
        this.maxPag = this.pageSize;
        this.minPage = this.page;
      } else {
        this.minPage = this.maxPag;
        this.maxPag = this.page * this.pageSize;
      }
      //console.log(this.maxPag + ":::" + this.minPage);
      let data: IDataResponse = await lastValueFrom(this.bitacoraService.listarBitacora(this.searchDay, 10, 1));
      //console.log(data);
      if (data.exito) {
        this.lstBitacora = data.datoAdicional;
        //this.loadingTable = false;
        //console.log('this.lstBitacora', this.lstBitacora);
        this.alertService.close('');
      } else {
        this.lstBitacora = [];
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  changeCalendar(changeDate: any) {
    //console.log('changeCalendar', changeDate);
    this.searchDay = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year
    this.page = 1;
    this.fnBitacora();
    this.fnObtenerRegistros();
  }

  async fnObtenerRegistros() {
    try {
      let data: IDataResponse = await lastValueFrom(this.bitacoraService.numRegistros(this.searchDay));
      if (data.exito == true) {
        this.collectionSize = data.datoAdicional;
        this.alertService.close('');
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async pageChanged(pageActual: any) {
    try {
      //console.log('Page Actual es:', pageActual);
      //console.log('MIN:', pageActual * this.pageSize - 9);
      //console.log('MAX:', pageActual * this.pageSize)

      if (pageActual == 1) {
        this.maxPag = this.pageSize;
        this.minPage = pageActual;
      } else {
        this.minPage = pageActual * this.pageSize - 9;
        this.maxPag = pageActual * this.pageSize;
      }

      let data: IDataResponse = await lastValueFrom(this.bitacoraService.listarBitacora(this.searchDay, this.maxPag, this.minPage));
      if (data.exito) {
        this.lstBitacora = data.datoAdicional;
        this.alertService.close('');
      } else {
        this.alertService.error('data.mensajeUsuario');
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }

  }
}
