import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { EmpresaService } from 'src/app/services/empresa.service';
import { LogService } from 'src/app/services/log.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-bitacora-log',
  templateUrl: './bitacora-log.component.html',
  styleUrls: ['./bitacora-log.component.css']
})
export class BitacoraLogComponent implements OnInit {
  oUsuario: IUsuario | undefined;
  empresa: any;

  page = 1;
  pageSize = 10;
  total = 0;

  firstCalendar: any;
  secondCalendar: any;

  firstSearchDay: any;
  secondSearchDay: any;

  lstBitacora: any[] = [];
  lstEmpresas: any[] = [];


  invalid_firstDate: boolean = false;
  invalid_secondDate: boolean = false;
  rotateArrow: boolean = false;

  getDate: { year: number; month: number; day: number; };

  constructor(private toastr: ToastrService,
    private seguridadService: SeguridadService, private empresaService: EmpresaService, private logService: LogService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.listarEmpresas();
      let today = new Date();

      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.firstCalendar = this.getDate;
      this.secondCalendar = this.getDate;
      this.firstSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2)
      this.secondSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2)

    }
  }

  convertNgbDateToDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day);
  }

  changeFirstCalendar(changeDate: any) {
    const date1 = this.convertNgbDateToDate(this.firstCalendar); // Convertir la primera fecha a un objeto Date
    const date2 = this.convertNgbDateToDate(this.secondCalendar); // Convertir la segunda fecha a un objeto Date

    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.firstSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)
    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;


    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La primera fecha no debe ser mayor a la segunda.', 'Advertencia');
      this.invalid_firstDate = true;
      return
    } else if (diffDays > 92) {
      this.toastr.warning('El rango de búsqueda es de hasta 3 meses.', 'Advertencia');
      this.invalid_firstDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.listarBitacora();
    }
  }

  changeSecondCalendar(changeDate: any) {
    const date1 = this.convertNgbDateToDate(this.firstCalendar); // Convertir la primera fecha a un objeto Date
    const date2 = this.convertNgbDateToDate(this.secondCalendar); // Convertir la segunda fecha a un objeto Date
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.secondSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)

    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;

    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La segunda fecha no debe ser menor que la primera.', 'Advertencia');
      this.invalid_secondDate = true;
    } else if (diffDays > 92) {
      this.toastr.warning('El rango de búsqueda es de hasta 3 meses.', 'Advertencia');
      this.invalid_secondDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.listarBitacora();
    }
  }


  async listarEmpresas() {
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.listarById(null!));
      if (data.exito) {
        this.lstEmpresas = data.datoAdicional;

        if (this.lstEmpresas.length > 0) {
          this.lstEmpresas.push({
            sCodEmpresa: "-001",
            sNombreComercial: "Otros"
          });
        }

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  async listarBitacora() {
    try {
      let data: IDataResponse = await lastValueFrom(this.logService.listarLog(this.empresa, this.firstSearchDay, this.secondSearchDay));

      if (data.exito) {
        this.lstBitacora = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }

    this.rotateArrow = false;
  }

  refrescar() {
    this.rotateArrow = true;
    this.listarBitacora();
  }
}


