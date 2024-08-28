import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { EstadoPeriodo } from 'src/app/models/estadoPeriodo';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Municipalidad } from 'src/app/models/municipalidad';
import { Periodo } from 'src/app/models/periodo';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { FileService } from 'src/app/services/file.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { ModalPeriodoComponent } from '../modal-periodo/modal-periodo.component';

@Component({
  selector: 'app-listar-inventarios',
  templateUrl: './listar-inventarios.component.html',
  styleUrls: ['./listar-inventarios.component.css']
})

export class ListarInventariosComponent implements OnInit {
  lstInventarios: Periodo[];
  oUsuario: IUsuario;
  page = 1;
  pageSize = 10;
  total = 0;
  model: Municipalidad = new Municipalidad();
  loadingTable: Boolean = true;

  itemObservar: any = {};
  itemAprobar: any = {};

  incorrectFile: boolean = false;
  submitModal: boolean = false;
  loading: boolean = false;
  //Archivo
  fileToUpload: any;

  @ViewChild('InputPdf', { static: false }) InputPdf: ElementRef;
  constructor(private router: Router, private seguridadService: SeguridadService, private sharedData: SharedDataService, private modalService: NgbModal, private fileService: FileService, private alertService: AlertService, private periodoService: PeriodoService) { }

  ngOnInit(): void {
    //console.log('model.sNombre?.length', this.model.sNombre?.length)
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarInventarios();
    }
  }

  async fnListarInventarios() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarCompletos());
      //console.log('this.ListarInventarios', data);
      if (data.exito) {
        this.lstInventarios = data.datoAdicional;

      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  onFileChange($event: any) {
    let filetemp = $event.target.files[0];

    if (filetemp.type.endsWith('pdf')) {
      this.incorrectFile = false;
      this.submitModal = false;
      this.fileToUpload = $event.target.files[0];
      this.InputPdf.nativeElement.innerText = this.fileToUpload.name;
      this.alertService.close("");

    } else {
      this.incorrectFile = true;
      this.InputPdf.nativeElement.value = null;
      this.InputPdf.nativeElement.innerText = "Seleccionar archivo...";
    }

    $event.target.value = null;
  }

  async cambiarEstadoObservar() {
    try {
      //console.log('OBSERVADO');
      this.loading = true;
      //console.log('this.fileToUpload', this.fileToUpload);

      if (this.fileToUpload == null) {
        this.submitModal = true;
        this.loading = false;
        return;
      }

      this.loading = true;

      let dataFile = await lastValueFrom(this.fileService.uploadFile(this.fileToUpload));
      //console.log('Subir Pdf:', dataFile);
      if (dataFile.exito) {

        //Armar json de entrada
        let periodo = new EstadoPeriodo;

        periodo.oPeriodo.nIdPeriodo = this.itemObservar.nIdPeriodo;
        periodo.oPeriodo.nAnio = this.itemObservar.nAnio;
        periodo.oPeriodo.oMunicipalidad = {
          nIdMunicipalidad: this.itemObservar.oMunicipalidad.nIdMunicipalidad,
          sNombre: this.itemObservar.oMunicipalidad.sNombre
        };

        periodo.nEstadoActual = 2;
        periodo.sUIDdocumento = dataFile.datoAdicional.sUidDocumento;
        periodo.sNombreDocumento = dataFile.datoAdicional.sNombreDocumento;

        let data = await lastValueFrom(this.periodoService.cambiarEstadoActual(periodo));

        //console.log('cambiarEstadoObservar: data', data);
        if (data.exito) {
          this.fnListarInventarios();
          this.alertService.success('Periodo observado con éxito.');
        } else {
          this.alertService.error(data.mensajeUsuario);
        }
      } else {
        this.alertService.error(dataFile.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
    this.submitModal = false;
    let elem = document.getElementById('closeModal')!;
    elem.click();
  }

  async cambiarEstadoAprobar() {
    try {
      this.loading = true;
      //Armar json de entrada
      let periodo = new EstadoPeriodo;
      periodo.oPeriodo.nIdPeriodo = this.itemAprobar.nIdPeriodo;
      periodo.oPeriodo.nAnio = this.itemAprobar.nAnio;
      periodo.oPeriodo.oMunicipalidad = {
        nIdMunicipalidad: this.itemAprobar.oMunicipalidad.nIdMunicipalidad,
        sNombre: this.itemAprobar.oMunicipalidad.sNombre
      };
      periodo.nEstadoActual = 3;
      //console.log('periodo', periodo)
      //console.log('APROBADO');

      let data = await lastValueFrom(this.periodoService.cambiarEstadoActual(periodo));
      //console.log('cambiarEstadoObservar: data', data)
      if (data.exito) {
        this.fnListarInventarios();
        this.alertService.success('Periodo aprobado con éxito.');
      } else {
        this.alertService.error(data.mensajeUsuario);
      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
    this.modalService.dismissAll();
  }

  openModalVer(item: any) {
    console.log('item', item);

    let periodo = new Periodo
    periodo.fShow = true;
    periodo.fShowAnio = true;

    periodo.nAnio = item.nAnio;
    periodo.nPoblacion = item.nPoblacion;
    periodo.nTemperatura = item.nTemperatura;
    periodo.sNivelRep = item.sNivelRep;
    periodo.boIncluirData = item.boIncluirData;

    this.sharedData.setPeriodo(periodo);
    this.modalService.open(ModalPeriodoComponent, { centered: true, windowClass: "modal-large" });
  }

  openModalAprobar(contentAprobar: any, item: any) {
    this.modalService.open(contentAprobar, { centered: true });
    //console.log('item', item);
    this.itemAprobar = item;
  }

  openObservar(item: any) {
    this.itemObservar = item;
  }

  closeObservar() {
    this.incorrectFile = false;
    this.submitModal = false;
    this.loading = false;
    this.fileToUpload = null;
    this.InputPdf.nativeElement.value = null;
    this.InputPdf.nativeElement.innerText = "Seleccionar archivo...";
  }

  redictDatosActividad(item: any) {
    let periodo = new Periodo
    periodo.nIdPeriodo = item.nIdPeriodo,
      periodo.nEstadoActual = 1,

      this.sharedData.setPeriodo(periodo);
    this.router.navigate(["/listar-datos/"]);
  }


  redictResultadosGei(item: any) {
    let periodo = new Periodo
    periodo.nIdPeriodo = item.nIdPeriodo,
      this.sharedData.setPeriodo(periodo);
    this.router.navigate(["/resultados-gei/"]);
  }
}
