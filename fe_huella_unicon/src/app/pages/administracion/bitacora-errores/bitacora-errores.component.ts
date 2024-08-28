import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { LogService } from 'src/app/services/log.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-bitacora-errores',
  templateUrl: './bitacora-errores.component.html',
  styleUrls: ['./bitacora-errores.component.css']
})
export class BitacoraErroresComponent implements OnInit {
  lstLog: any[] = [];
  lstSkeleton = Array(4);
  firstCalendar: any;
  secondCalendar: any;
  firstSearchDay: any;
  secondSearchDay: any;
  oUsuario: IUsuario;

  invalid_firstDate: boolean = false;
  invalid_secondDate: boolean = false;

  rotateArrow: boolean = false;

  page = 1;
  pageSize = 10;
  total = 0;
  getDate: { year: number; month: number; day: number; };

  fShowSkeleton: boolean = false;

  constructor(private seguridadService: SeguridadService,
    private logService: LogService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let today = new Date();
      //console.log('month: today.getMonth()', { month: today.getMonth() });
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.firstCalendar = this.getDate;
      this.secondCalendar = this.getDate;
      this.firstSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2)
      this.secondSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2)
      //console.log('this.getDate', this.getDate.month);
      this.fnListarLog();
    }
  }

  getLastDayOfMonth(date: NgbDateStruct): NgbDateStruct {
    const lastDay = new Date(date.year, date.month, 0).getDate();
    return { year: date.year, month: date.month + 5, day: lastDay };
  }

  async fnListarLog() {
    try {
      this.fShowSkeleton = true;
      //console.log(this.firstSearchDay, this.secondSearchDay);
      let data: IDataResponse = await lastValueFrom(this.logService.listarLog(this.firstSearchDay, this.secondSearchDay));
      //console.log('fnListarNivelActividad', data);
      if (data.exito) {
        this.page = 1;
        this.lstLog = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.fShowSkeleton = false;
      }
    } catch (error: any) {
      if (error.error.codMensaje == 11) {
        this.seguridadService.logout();
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
        this.fShowSkeleton = false;
      }
      this.fShowSkeleton = false;
    } this.rotateArrow = false;

  }
  convertNgbDateToDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day);
  }

  changeFirstCalendar(changeDate: any) {
    const date1 = this.convertNgbDateToDate(this.firstCalendar); // Convertir la primera fecha a un objeto Date
    const date2 = this.convertNgbDateToDate(this.secondCalendar); // Convertir la segunda fecha a un objeto Date

    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    //console.log('diffDays', diffDays);
    this.firstSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)
    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;


    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La primera fecha no debe ser mayor a la segunda', 'Advertencia');
      this.invalid_firstDate = true;
      return
    } else if (diffDays > 180) {
      this.toastr.warning('El rango de búsqueda es de hasta 6 meses.', 'Advertencia');
      this.invalid_firstDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.fnListarLog();
    }
  }

  changeSecondCalendar(changeDate: any) {
    const date1 = this.convertNgbDateToDate(this.firstCalendar); // Convertir la primera fecha a un objeto Date
    const date2 = this.convertNgbDateToDate(this.secondCalendar); // Convertir la segunda fecha a un objeto Date
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    //console.log('diffDays', diffDays);

    this.secondSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)

    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;
    //console.log(firstDate, secondDate);
    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La segunda fecha no debe ser menor que la primera', 'Advertencia');
      this.invalid_secondDate = true;
    } else if (diffDays > 180) {
      this.toastr.warning('El rango de búsqueda es de hasta 6 meses.', 'Advertencia');
      this.invalid_secondDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.fnListarLog();
    }
  }

  fnRefrescar() {
    this.rotateArrow = true;
    this.fnListarLog();
  }
}
