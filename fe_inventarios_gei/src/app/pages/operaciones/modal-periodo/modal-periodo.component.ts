import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Periodo } from 'src/app/models/periodo';
import { IUsuario } from 'src/app/models/usuario';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-modal-periodo',
  templateUrl: './modal-periodo.component.html',
  styleUrls: ['./modal-periodo.component.css']
})

export class ModalPeriodoComponent implements OnInit {
  periodo = new Periodo;
  public fShow: boolean;
  public fShowAnio: boolean;
  loading: Boolean = false;
  esProvincia: Boolean = true;
  @Output() actualizarListadoEvent = new EventEmitter<string>();
  @Output() errorAlertEvent = new EventEmitter<string>();
  oUsuario: IUsuario;

  constructor(private sharedData: SharedDataService, private periodoService: PeriodoService,
    private modalService: NgbModal, private seguridadService: SeguridadService) { }

  ngOnInit(): void {

    this.oUsuario = this.seguridadService.isLogged();
    console.log('oUsuario', this.oUsuario);

    this.periodo = this.sharedData.itemPeriodo;
    console.log('this.periodo', this.periodo);

    if (this.periodo?.oMunicipalidad?.sTipo) {
      this.esProvincia = this.periodo.oMunicipalidad.sTipo == 'P' ? true : false;
    }

    this.fShow = this.sharedData.itemPeriodo.fShow;
    this.fShowAnio = this.sharedData.itemPeriodo.fShowAnio;

  }

  async guardarRegistro(form: NgForm) {
    this.loading = true;
    if (form.invalid) {
      this.loading = false;
      return;
    }

    delete this.sharedData.itemPeriodo.fShow;
    delete this.sharedData.itemPeriodo.fShowAnio;

    console.log(this.periodo);

    let data: IDataResponse = await lastValueFrom(this.periodoService.registrar(this.periodo));
    //console.log('guardarRegistro', data);
    if (data.exito) {
      this.actualizarListadoEvent.emit('');
    } else {
      console.log('DA ERROR');
      this.errorAlertEvent.emit(data.mensajeUsuario);

    }

    //Cerrar Modal
    this.modalService.dismissAll();
    this.loading = false;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

}
