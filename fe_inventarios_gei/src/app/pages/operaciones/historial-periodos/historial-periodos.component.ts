import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { EstadoPeriodo } from 'src/app/models/estadoPeriodo';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Municipalidad } from 'src/app/models/municipalidad';
import { Periodo } from 'src/app/models/periodo';
import { AlertService } from 'src/app/services/alert.service';
import { FileService } from 'src/app/services/file.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { ModalPeriodoComponent } from '../modal-periodo/modal-periodo.component';


@Component({
  selector: 'app-historial-periodos',
  templateUrl: './historial-periodos.component.html',
  styleUrls: ['./historial-periodos.component.css']
})
export class HistorialPeriodosComponent implements OnInit {

  lstDepartamento: any;
  lstProvincia: any;
  lstDistrito: any;
  lstPeriodo: Periodo[] = [];
  lstestadoPeriodo: EstadoPeriodo[] = [];

  sDescripcion: any;
  nIdPeriodo: any;
  nAnio: any;

  loading: boolean = false;
  submit: boolean = false;
  disabledProvincia: boolean = false;
  disabledDistrito: boolean = false;

  model: Periodo = new Periodo();
  oMunicipalidad = new Municipalidad;

  page = 1;
  pageSize = 10;
  total = 0;

  pageModal = 1;
  pageSizeModal = 5;
  totalModal = 0;

  constructor(private modalService: NgbModal, private fileService: FileService, private alertService: AlertService,
    private solicitudUsuarioService: SolicitudUsuarioService, private periodoService: PeriodoService, private sharedData: SharedDataService,
    private router: Router) { }

  ngOnInit(): void {
    this.fnDepartamento();
    this.oMunicipalidad.sDepartamento = "";
    this.oMunicipalidad.sProvincia = "";
    this.oMunicipalidad.sDistrito = "";
    this.disabledProvincia = false;
    this.disabledDistrito = true;
    //console.log('this.oMunicipalidad.sDepartamento', this.oMunicipalidad.sDepartamento);

    this.fnHistorialAprobados();
  }

  async fnHistorialAprobados() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.historialAprobados(this.oMunicipalidad.sDepartamento, this.oMunicipalidad.sProvincia, this.oMunicipalidad.sDistrito));
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        console.log('this.lstPeriodo', this.lstPeriodo);
      } else {
        this.alertService.warning(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }


  async fnHistorialByPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.historialByPeriodo(this.nIdPeriodo));
      //console.log('data fnListarHistorialPeriodo', data)
      if (data.exito) {
        this.lstestadoPeriodo = data.datoAdicional;
      } else {
        this.alertService.warning(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }


  async fnDepartamento() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDepartamento());
      if (data.exito) {
        this.lstDepartamento = data.datoAdicional;
        this.fnProvincia();
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnProvincia() {
    try {
      this.oMunicipalidad.sProvincia = "";
      this.oMunicipalidad.sDistrito = "";
      this.lstDistrito = [];
      this.lstProvincia = [];
      this.fnHistorialAprobados();


      //Si el select Departamento tiene seleccionado Todos
      if (this.oMunicipalidad.sDepartamento == '') {
        this.disabledProvincia = true;
        this.disabledDistrito = true;
        //console.log('todos');
        return
      } else {
        this.disabledProvincia = false;
        this.disabledDistrito = true;
      }
      //console.log('this.oMunicipalidad.sDepartamento', this.oMunicipalidad.sDepartamento);
      let dataLstProvincia: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarProvincia(this.oMunicipalidad?.sDepartamento));
      if (dataLstProvincia.exito) {
        this.lstProvincia = dataLstProvincia.datoAdicional;
      } else {
        this.alertService.error(dataLstProvincia.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDistrito() {
    try {
      //console.log('oMunicipalidad.sProvincia', this.oMunicipalidad.sProvincia);
      this.oMunicipalidad.sDistrito = "";
      this.lstDistrito = [];
      this.fnHistorialAprobados();

      if (this.oMunicipalidad.sProvincia == "") {
        this.disabledDistrito = true;
        //console.log('here');
        return
      } else {
        this.disabledDistrito = false;
      }

      //Si el select de provincia está en TODOS no llamar al servicio de Listar Distrito
      if (this.oMunicipalidad.sProvincia !== "") {
        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDistrito(this.oMunicipalidad?.sDepartamento, this.oMunicipalidad?.sProvincia));
        if (data.exito) {
          this.lstDistrito = data.datoAdicional;
        } else {
          this.alertService.error(data.mensajeUsuario);
        }
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  Reiniciar(contentReiniciar: any, item: any) {
    this.nIdPeriodo = item.nIdPeriodo;
    this.nAnio = item.nAnio;
    this.oMunicipalidad.nIdMunicipalidad = item.oMunicipalidad.nIdMunicipalidad;
    this.oMunicipalidad.sNombre = item.oMunicipalidad.sNombre;

    //console.log('nIdPeriodo', this.nIdPeriodo, this.nAnio, this.oMunicipalidad.nIdMunicipalidad, this.oMunicipalidad.sNombre);
    this.modalService.open(contentReiniciar, { centered: true });
  }

  Historial(contentHistorial: any, item: any) {
    this.nIdPeriodo = item.nIdPeriodo;
    //console.log('nIdPeriodo', this.nIdPeriodo);
    this.fnHistorialByPeriodo();
    this.modalService.open(contentHistorial, { centered: true, windowClass: "modal-xlarge" });
  }

  async fnReaperturar() {
    try {
      this.loading = true;
      //console.log(this.nIdPeriodo, this.sDescripcion)
      if (this.sDescripcion == undefined || this.sDescripcion.length < 10) {
        this.submit = true;
        this.loading = false;
        return;
      } else {
        this.submit = false;
        let data: IDataResponse = await lastValueFrom(this.periodoService.reaperturar(this.nIdPeriodo, this.nAnio, this.oMunicipalidad.nIdMunicipalidad, this.oMunicipalidad.sNombre, this.sDescripcion.trim()));
        //console.log('data fnListarHistorialPeriodo', data)
        if (data.exito) {
          /* this.oMunicipalidad.sDepartamento = "";
          this.oMunicipalidad.sProvincia = "";
          this.oMunicipalidad.sDistrito = ""; */
          this.fnHistorialAprobados();
          this.modalService.dismissAll();
        } else {
          this.modalService.dismissAll();
          this.sDescripcion = '';
          this.alertService.warning(data.mensajeUsuario);
        }
      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
  }

  async fnDescargarPeriodo(item: any) {
    try {
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
  }
  async fnDescargarEstadoPeriodo(item: any) {
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

  redictDatosActividad(item: any) {
    let periodo = new Periodo
    periodo.nIdPeriodo = item.nIdPeriodo,
      periodo.nEstadoActual = 1,

      //console.log('periodo', periodo)
      this.sharedData.setPeriodo(periodo);
    this.router.navigate(["/listar-datos/"]);
  }

  openModalVer(item: any) {
    console.log('item', item);

    let periodo = new Periodo
    periodo.fShow = true;
    periodo.fShowAnio = true;

    periodo.nAnio = item.nAnio;
    periodo.nPoblacion = item.nPoblacion;
    periodo.nTemperatura = item.nTemperatura;
    periodo.boIncluirData = item.boIncluirData;

    this.sharedData.setPeriodo(periodo);
    this.modalService.open(ModalPeriodoComponent, { centered: true, windowClass: "modal-large" });
  }


}

