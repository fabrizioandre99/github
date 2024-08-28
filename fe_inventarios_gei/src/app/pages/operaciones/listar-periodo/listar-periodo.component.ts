import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EstadoPeriodo } from 'src/app/models/estadoPeriodo';
import { Municipalidad } from 'src/app/models/municipalidad';
import { Periodo } from 'src/app/models/periodo';
import { AlertService } from 'src/app/services/alert.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { IUsuario } from 'src/app/models/usuario';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { ModalPeriodoComponent } from '../modal-periodo/modal-periodo.component';
import { FileService } from 'src/app/services/file.service';
import { ModalLogoutComponent } from '../modal-logout/modal-logout.component';
import { ModalDescargaComponent } from '../modal-descarga/modal-descarga.component';

@Component({
  selector: 'app-listar-periodo',
  templateUrl: './listar-periodo.component.html',
  styleUrls: ['./listar-periodo.component.css']
})
export class ListarperiodoComponent implements OnInit {
  idUsuario: Number;
  idMunicipalidad: Number;
  lstPeriodo: Periodo[] = [];
  estadoPeriodo: EstadoPeriodo;
  oUsuario: IUsuario;

  anio: any;
  poblacion: any;
  temperatura: any;
  nidperiodo: any;

  page = 1;
  pageSize = 10;
  total = 0;

  public fShow: boolean = false;
  public fShowAnio: boolean = false;
  loadingTable: Boolean = true;

  model: Periodo = new Periodo();
  status: boolean = false;
  loading: boolean = false;

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose() {
    if (window.location.hash == '#/') {
      history.forward()
      this.modalService.dismissAll();
      this.modalService.open(ModalLogoutComponent, { centered: true, windowClass: "modal-small" });
    }
  }

  constructor(private router: Router, private alertService: AlertService, private modalService: NgbModal,
    private periodoService: PeriodoService, private seguridadService: SeguridadService,
    private sharedData: SharedDataService, private fileService: FileService) {
  }


  ngOnInit(): void {

    //console.log('model.nAnio', this.model.nAnio)
    this.oUsuario = this.seguridadService.isLogged();
    //console.log('this.oUsuario', this.oUsuario.nIdInstitucion);
    if (this.oUsuario.sUsuario != undefined) {
      console.log('99 oUsuario', this.oUsuario);
      this.fnListarByMunicipalidad();
    }
  }

  async fnListarByMunicipalidad() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarByMunicipalidad(this.oUsuario.nIdInstitucion));
      if (!data.exito) {
        this.alertService.warning(data.mensajeUsuario);
      } else {
        this.lstPeriodo = data.datoAdicional;
        console.log('81 this.lstPeriodo ', this.lstPeriodo);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  async fnFinalizarRegistro(item: any) {
    try {
      this.loading = true;
      let filtro = {
        oPeriodo: {
          nIdPeriodo: item.nIdPeriodo,
          nAnio: item.nAnio,
          oMunicipalidad: {
            nIdMunicipalidad: this.oUsuario.nIdInstitucion,
            sNombre: this.oUsuario.sNombreInstitucion
          }
        }
      };

      //console.log('filtro', filtro);

      let data: IDataResponse = await lastValueFrom(this.periodoService.registrarEstado(filtro));
      //console.log(data);
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      }
      this.fnListarByMunicipalidad();

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
    this.loading = false;
  }

  openModalConfirm(contentObservar: any) {
    this.modalService.open(contentObservar, { centered: true });
  }

  openModalEditar(item: any) {

    console.log('HA ABIERTO EL MODAL EDITAR');

    let periodo = new Periodo
    periodo.fShow = false;
    periodo.fShowAnio = true;

    periodo.nIdPeriodo = item.nIdPeriodo,
    periodo.oMunicipalidad = new Municipalidad;
    periodo.oMunicipalidad.nIdMunicipalidad = this.oUsuario.nIdInstitucion!;
    periodo.oMunicipalidad.sDepartamento = this.oUsuario.sDepartamento!;
    periodo.oMunicipalidad.sProvincia = this.oUsuario.sProvincia!;
    periodo.oMunicipalidad.sTipo = this.oUsuario.sTipoMunicipalidad;

    periodo.nAnio = item.nAnio;
    periodo.nPoblacion = item.nPoblacion;
    periodo.nTemperatura = item.nTemperatura;
    periodo.sNivelRep = item.sNivelRep;
    periodo.boIncluirData = item.boIncluirData;

    console.log("99 periodo", periodo);
    this.sharedData.setPeriodo(periodo);

    //Abrir componente modal a travéz de Event Emitter
    const modalRef = this.modalService.open(ModalPeriodoComponent, { centered: true, windowClass: "modal-large" })

    modalRef.componentInstance["actualizarListadoEvent"].subscribe((event: any) => {
      //console.log(event);
      this.alertService.close("");
      this.fnListarByMunicipalidad();

    });
    modalRef.componentInstance["errorAlertEvent"].subscribe((event: any) => {
      console.log('event: ',event);
      this.alertService.warning(event);
    });


  }

  openModalVer(item: any) {
    console.log('item', item);

    let periodo = new Periodo
    periodo.fShow = true;
    periodo.fShowAnio = true;

    periodo.nIdPeriodo = item.nIdPeriodo,
    periodo.oMunicipalidad = new Municipalidad;
    periodo.oMunicipalidad.nIdMunicipalidad = this.idMunicipalidad;

    periodo.nAnio = item.nAnio,
      periodo.nPoblacion = item.nPoblacion,
      periodo.nTemperatura = item.nTemperatura,
      periodo.sNivelRep = item.sNivelRep

    //console.log("periodo", periodo);

    this.sharedData.setPeriodo(periodo);

    //Abrir componente modal a travéz de Event Emitter.
    const modalRef = this.modalService.open(ModalPeriodoComponent, { centered: true, windowClass: "modal-large" })
    modalRef.componentInstance["actualizarListadoEvent"].subscribe((event: any) => {
      //console.log(event);
      this.alertService.close("");
      this.fnListarByMunicipalidad();
    });
    modalRef.componentInstance["errorAlertEvent"].subscribe((event: any) => {
      //console.log(event);
      this.alertService.error("Error");
    });
  }

  openModalRegistrar() {
    if (this.lstPeriodo.some(e => e.nEstadoActual !== 3)) {
      this.alertService.warning('No se puede crear un nuevo periodo, ya que tiene uno en proceso de aprobación.');
    } else {
      //Limpiar valores determinados de setPeriodo.
      let periodo = new Periodo;

      periodo.nIdPeriodo = -1;
      periodo.fShow = false;
      periodo.fShowAnio = false;
      periodo.oMunicipalidad = new Municipalidad;
      periodo.oMunicipalidad.nIdMunicipalidad = this.oUsuario.nIdInstitucion!;
      periodo.oMunicipalidad.sDepartamento = this.oUsuario.sDepartamento!;
      periodo.oMunicipalidad.sProvincia = this.oUsuario.sProvincia!;
      periodo.oMunicipalidad.sTipo = this.oUsuario.sTipoMunicipalidad!;

      this.sharedData.setPeriodo(periodo);

      console.log('218 periodo', periodo);
      //Abrir componente modal y recibir Event Emitter
      const modalRef = this.modalService.open(ModalPeriodoComponent, { centered: true, windowClass: "modal-large" })
      modalRef.componentInstance["actualizarListadoEvent"].subscribe((event: any) => {
        //console.log(event);
        this.alertService.close('');
        this.fnListarByMunicipalidad();
      });

      modalRef.componentInstance["errorAlertEvent"].subscribe((event: any) => {
        this.alertService.error(event);
      });

    }
  }

  async fnDescargarReporteGei(item: any) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.fileService.downloadFile(item.sUIDReporteGEI));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = item.sNombreReporteGEI;

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


  redictDatosActividad(item: any) {
    let periodo = new Periodo
    periodo.nIdPeriodo = item.nIdPeriodo,
      periodo.nEstadoActual = item.nEstadoActual,
      //console.log("periodo", periodo);
      this.sharedData.setPeriodo(periodo);
    this.router.navigate(["/listar-datos/"]);

  }

}
