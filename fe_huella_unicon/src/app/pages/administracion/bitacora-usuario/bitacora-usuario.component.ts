import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-bitacora-usuario',
  templateUrl: './bitacora-usuario.component.html',
  styleUrls: ['./bitacora-usuario.component.css']
})

export class BitacoraUsuarioComponent implements OnInit {
  lstLog: any[] = [];
  lstSkeleton = Array(4);
  calendar: any;
  searchDay: any;
  oUsuario: IUsuario;

  page = 1;
  pageSize = 10;
  total = 0;
  getDate: { year: number; month: number; day: number; };

  model: any = {};

  rotateArrow: boolean = false;
  fShowSkeleton: boolean = false;

  constructor(private seguridadService: SeguridadService,
    private usuarioService: UsuarioService, private toastr: ToastrService) { }


  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let today = new Date();
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.calendar = this.getDate;
      this.searchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2)
      //console.log('this.searchDay', this.searchDay);
      this.fnListarLog();
    }
  }


  async fnListarLog() {
    try {
      this.fShowSkeleton = true;
      //console.log('this.searchDay', this.searchDay);
      let data: IDataResponse = await lastValueFrom(this.usuarioService.logUsuario(this.searchDay, this.oUsuario.nIdUsuario!));
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


  changeCalendar(changeDate: any) {
    this.searchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)
    this.fnListarLog();
  }

  fnRefrescar() {
    this.rotateArrow = true;
    this.fnListarLog();
  }
}



