import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SeguridadService } from '../../../services/seguridad.service';
import { IUsuario } from '../../../models/usuario';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { PeriodoService } from '../../../services/periodo.service';
import { NgForm } from '@angular/forms';
import { Periodo } from '../../../models/periodo';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedDataService } from '../../../services/shared-data.service';

@Component({
  selector: 'app-periodos',
  templateUrl: './periodos.component.html',
  styleUrl: './periodos.component.css'
})
export class PeriodosComponent {

  loadRegOEdit: boolean = false;
  loadEliminar: boolean = false;
  sfNuevoPeriodo: boolean = false;

  lstPeriodos: any[] = [];

  fShowSkeleton: boolean = false;
  lstSkeleton = Array(4);

  page = 1;
  pageSize = 8;
  total = 0;

  oUsuario: IUsuario;
  model: Periodo = new Periodo();

  boMostrarAcciones: boolean = true;

  isAccionable: boolean = false;

  constructor(private router: Router, private toastr: ToastrService, private seguridadService: SeguridadService,
    private periodoService: PeriodoService, private modalService: NgbModal, private sharedData: SharedDataService
  ) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) this.fnListarPeriodos();
  }

  async fnListarPeriodos() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());

      if (data.exito) {
        this.lstPeriodos = data.datoAdicional;
        console.log(this.lstPeriodos);
        this.fShowSkeleton = false;

        this.boMostrarAcciones = this.lstPeriodos.some(item => item.nEstadoPeriodo === 0 && item.bdProgreso === 0);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {     
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  redictResultadoGEI(item: any) {
    let oPeriodo = { 
      nIdPeriodo: item.nIdPeriodo
    }
    this.sharedData.setPeriodo(oPeriodo);
    this.router.navigate(['/resultado-gei']);
  }

  openEliminar(contentEliminar: any, item: any) {
    this.model.nIdPeriodo = item.nIdPeriodo;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  openPanel() {
    this.sfNuevoPeriodo = true;
  }

  closePanel() {
    this.sfNuevoPeriodo = false;
  }

  async fnRegistrarPeriodo(form: NgForm) {
    try {
      const regex = /^[0-9]+$/;

      if (form.invalid) return;

      if (this.model.nAnio < 2020 || this.model.nAnio > 2100) {
        this.toastr.warning('Ingrese un año con un valor válido.', 'Advertencia');
        return
      }

      this.loadRegOEdit = true;
      let idPeriodo = -1;

      let oPeriodo = {
        nIdPeriodo: idPeriodo,
        nAnio: this.model.nAnio
      }

      let data: IDataResponse = await lastValueFrom(this.periodoService.registrarPeriodo(oPeriodo));

      if (data.exito) {
        this.loadRegOEdit = false;
        this.sfNuevoPeriodo = false;
        this.fnListarPeriodos();
        this.model = new Periodo();
      } else {
        this.loadRegOEdit = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }


  async fnEliminarPeriodo() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdRuta', this.model.nIdRuta);
      let data: IDataResponse = await lastValueFrom(this.periodoService.eliminarPeriodo(this.model.nIdPeriodo));
      if (data.exito) {
        this.lstPeriodos = []
        this.fnListarPeriodos();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.loadEliminar = false;
  }

  async fnCambiarEstado(item: any) {
    try {
      this.loadEliminar = true;
      let nEstado = 0;
      if (item.nEstadoPeriodo===0) nEstado = 1;
      let data: IDataResponse = await lastValueFrom(this.periodoService.cambiarEstado(item, nEstado));
      if (data.exito) {
        this.lstPeriodos = []
        this.fnListarPeriodos();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.loadEliminar = false;
  }

}
