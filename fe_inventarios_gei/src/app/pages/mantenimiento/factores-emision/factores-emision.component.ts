import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { factorEmision } from 'src/app/models/factorEmision';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { FactorEmisionService } from 'src/app/services/factor-emision.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ModalDescargaComponent } from '../../operaciones/modal-descarga/modal-descarga.component';

@Component({
  selector: 'app-factores-emision',
  templateUrl: './factores-emision.component.html',
  styleUrls: ['./factores-emision.component.css']
})
export class FactoresEmisionComponent implements OnInit {
  oUsuario: IUsuario;
  lstFactorEmision: factorEmision[] = [];
  lstAnio: any = '';
  modal: any = {};

  busqueda: any;
  Anio: any;

  submitModal: boolean = false;
  loading: Boolean = false;
  loadModal: Boolean = false;
  disabled: Boolean = false;
  loadingTable: Boolean = true;
  fShowGenerarFE: boolean = false;

  page = 1;
  pageSize = 10;
  total = 0;

  model: factorEmision = new factorEmision();
  inputPattern: Boolean = true;

  constructor(private modalService: NgbModal, private alertService: AlertService, private factorEmisionService: FactorEmisionService,
    private seguridadService: SeguridadService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarAnio();
      this.showButton();
    }
  }

  async fnListarAnio() {
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarAnio());
      if (data.exito) {
        this.lstAnio = data.datoAdicional;
        this.Anio = this.lstAnio[this.lstAnio.length - 1];
        this.changeListarFactorEmision();

      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async changeListarFactorEmision() {
    try {
      this.showButton();
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarFactorEmision(this.Anio));
      if (data.exito) {
        this.lstFactorEmision = data.datoAdicional;
        console.log('this.lstFactorEmision', this.lstFactorEmision);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    } this.loadingTable = false;
  }

  async fnInsertarFactorEmision() {
    try {
      this.loading = true;
      let anioSiguiente = this.lstAnio[this.lstAnio.length - 1] + 1;
      //console.log('anioSiguiente', anioSiguiente);
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.insertarFactorEmision(anioSiguiente));
      if (data.exito) {
        this.fnListarAnio();
        this.loading = false;
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.loading = false;
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }


  showButton() {
    const index = this.lstAnio.indexOf(this.Anio + 1);
    if (index !== -1) {
      this.fShowGenerarFE = false;
    } else {
      this.fShowGenerarFE = true;
    }
    //console.log('this.fShowGenerarFE', this.fShowGenerarFE);
  }


  openGenerarFactor(contentGenerarFactor: any) {
    this.modalService.open(contentGenerarFactor, { centered: true, windowClass: "modal-small" });
  }

  openModalGuardar(contentGuardar: any, item: any) {
    this.modalService.open(contentGuardar, { centered: true, windowClass: "modal-large" });
    let object = Object.assign({}, item);
    this.modal = object;
  }

  async fnActualizarFactorEmision(form: NgForm, modal: any) {
    try {
      let bdFeCO2_mod = this.modal.bdFeCO2;
      let bdFeCH4_mod = this.modal.bdFeCH4;
      let bdFeN2O_mod = this.modal.bdFeN2O;

      this.loadModal = true;

      if (this.modal.sDescripcion!.trim().length == 0) {
        this.submitModal = true;
        this.loadModal = false;
        return;
      }

      if (this.modal.sUnidadVcn == '-' && !this.modal.bdPerdidasTYD) {
        this.submitModal = true;
        this.loadModal = false;
        return;
      }

      if (form.invalid) {
        this.loadModal = false;
        return;
      }

      if (this.modal.sTipoFactor == 'EC') {
        bdFeCO2_mod = this.modal.bdFeCO2 / 1000;
        bdFeCH4_mod = this.modal.bdFeCH4 / 1000;
        bdFeN2O_mod = this.modal.bdFeN2O / 1000;
      }

      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarFactorEmision(this.modal.nIdFactorEmision,
        this.modal.sDescripcion.trim(), bdFeCO2_mod, bdFeCH4_mod, bdFeN2O_mod, this.modal.bdValorConversion, this.modal.bdPerdidasTYD));
      if (data.exito) {
        this.changeListarFactorEmision();

      } else {
        this.alertService.error(data.mensajeUsuario);
      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadModal = false;
    modal.close();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  async fnDescargarFactorEmision() {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.factorEmisionService.descargarFactorEmision(this.Anio));
      const blob = new Blob([data as BlobPart], { type: "application/xlsx" })
      let filename = 'FactorEmision.xlsx';
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }

}
