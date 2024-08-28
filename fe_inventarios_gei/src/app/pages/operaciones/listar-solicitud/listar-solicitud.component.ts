import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { SolicitudUsuario } from 'src/app/models/solicitud';
import { NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { IUsuario } from 'src/app/models/usuario';
import { FileService } from 'src/app/services/file.service';
import { lastValueFrom } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ModalLogoutComponent } from '../modal-logout/modal-logout.component';
import { ModalDescargaComponent } from '../modal-descarga/modal-descarga.component';

@Component({
  selector: 'app-listar-solicitud',
  templateUrl: './listar-solicitud.component.html',
  styleUrls: ['./listar-solicitud.component.css']
})
export class ListarSolicitudComponent implements OnInit {
  oUsuario: IUsuario;
  idSolicitud: Number;
  sObservacion: String;
  sMotivoRechazo: String;
  sEstadoActual: any;

  listarPendiente: SolicitudUsuario[] = [];
  listarHistorial: SolicitudUsuario[] = [];

  pageA = 1;
  pageSizeA = 10;
  totalA = 0;

  pageB = 1;
  pageSizeB = 10;
  totalB = 0;

  modelA: SolicitudUsuario = new SolicitudUsuario();
  modelB: SolicitudUsuario = new SolicitudUsuario();

  calendarPendiente: any;
  calendarHistorialIni: any;
  calendarHistorialFin: any;

  searchPendiente: any;
  searchHistorialInicio: any;
  searchHistorialFin: any;

  getDate: any;

  submitObservar: boolean = false;
  submitMotivoRechazo: boolean = false;
  loading: boolean = false;
  loadingTable: Boolean = true;

  modalReference: NgbModalRef;

  firstCalendar: any;
  secondCalendar: any;
  firstSearchDay: any;
  secondSearchDay: any;
  invalid_firstDate: boolean = false;
  invalid_secondDate: boolean = false;
  invalid_firstDateHistorial: boolean = false;
  invalid_secondDateHistorial: boolean = false;


  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event) {
    if (window.location.hash == '#/') {
      history.forward()
      this.modalService.dismissAll();
      this.modalService.open(ModalLogoutComponent, { centered: true, windowClass: "modal-small" });
    }
  }

  @ViewChild("contentCargando", { static: true }) contentCargando: ElementRef;
  constructor(private seguridadService: SeguridadService, private fileService: FileService,
    private modalService: NgbModal, private solicitudUsuarioService: SolicitudUsuarioService, private alertService: AlertService) {

    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let today = new Date();
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      //this.calendarPendiente = this.getDate;
      //this.calendarHistorial = this.getDate;

      //this.searchPendiente = ('0' + this.calendarPendiente.day).slice(-2) + '/' + ('0' + this.calendarPendiente.month).slice(-2) + '/' + this.calendarPendiente.year
      //this.searchHistorial = ('0' + this.calendarHistorial.day).slice(-2) + '/' + ('0' + this.calendarHistorial.month).slice(-2) + '/' + this.calendarHistorial.year

      this.sEstadoActual = 3;

      this.fnListarPendientes();
      this.fnListarHistorial();
    }
  }

  ngOnInit(): void {
  }

  changePendiente(changeDate: any) {
    //console.log('changeCalendar', changeDate);
    this.searchPendiente = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year
    this.fnListarPendientes();
  }

  changeHistorialInicio(changeDate: any) {
    console.log('changeCalendarIni', changeDate);
    console.log('calendarHistorialFin', this.calendarHistorialFin);
    this.searchHistorialInicio = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year;    
    const splitFirstDate = this.searchHistorialInicio.split('/');

    const firstDate = `${splitFirstDate[2]}/${splitFirstDate[1]}/${splitFirstDate[0]}`;
    let secondDate = new Date().toISOString().slice(0, 10).replace(/-/g, '/');

    console.log(this.calendarHistorialFin);

    if (!this.calendarHistorialFin) {
      this.searchHistorialFin = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      this.calendarHistorialFin = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      };

      console.log("Ingresa >>",this.calendarHistorialFin);

    }

    if (this.calendarHistorialFin) {
      const splitSecondDate = this.searchHistorialFin.split('/');
      secondDate = `${splitSecondDate[2]}/${splitSecondDate[1]}/${splitSecondDate[0]}`;
    }

    if (this.calendarHistorialFin) {
      if (new Date(String(firstDate)) > new Date(String(secondDate))) {
        //console.log('La primera fecha no debe ser mayor a la segunda.');
        this.alertService.warning('La primera fecha no debe ser mayor a la segunda.');
        this.listarHistorial = [];
        this.invalid_firstDateHistorial = true;
        return
      } else {
        this.invalid_firstDateHistorial = false;
        this.invalid_secondDateHistorial = false;
        this.fnListarHistorial();
        this.alertService.close('');
      }
    } else {
      this.invalid_firstDateHistorial = false;
      this.invalid_secondDateHistorial = false;
      this.fnListarHistorial();
      this.alertService.close('');
    }

    
  }

  changeHistorialFin(changeDate: any) {
    console.log('changeCalendarIni', changeDate);
    this.searchHistorialFin = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year;    
    
    const splitFirstDate = this.searchHistorialInicio.split('/');
    const splitSecondDate = this.searchHistorialFin.split('/');

    const firstDate = `${splitFirstDate[2]}/${splitFirstDate[1]}/${splitFirstDate[0]}`;
    const secondDate = `${splitSecondDate[2]}/${splitSecondDate[1]}/${splitSecondDate[0]}`;
    console.log(firstDate, secondDate);
    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.alertService.warning('La segunda fecha no debe ser menor que la primera.');
      this.listarHistorial = [];
      this.invalid_secondDateHistorial = true;
    } else {
      this.invalid_firstDateHistorial = false;
      this.invalid_secondDateHistorial = false;
      this.fnListarHistorial();
      this.alertService.close('');
    }
       
  }


  changeFirstCalendar(changeDate: any) {
    this.firstSearchDay = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year;
    const splitFirstDate = this.firstSearchDay.split('/');

    const firstDate = `${splitFirstDate[2]}/${splitFirstDate[1]}/${splitFirstDate[0]}`;
    let secondDate = new Date().toISOString().slice(0, 10).replace(/-/g, '/');

    

    if (!this.secondCalendar) {
      this.secondSearchDay = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      this.secondCalendar = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      };

    }

    if (this.secondCalendar) {
      const splitSecondDate = this.secondSearchDay.split('/');
      secondDate = `${splitSecondDate[2]}/${splitSecondDate[1]}/${splitSecondDate[0]}`;
    }

    //console.log('HERE firstDate, secondDate', firstDate, secondDate);

    if (this.secondCalendar) {
      if (new Date(String(firstDate)) > new Date(String(secondDate))) {
        //console.log('La primera fecha no debe ser mayor a la segunda.');
        this.alertService.warning('La primera fecha no debe ser mayor a la segunda.');
        this.listarPendiente = [];
        this.invalid_firstDate = true;
        return
      } else {
        this.invalid_firstDate = false;
        this.invalid_secondDate = false;
        this.fnListarPendientes();
        this.alertService.close('');
      }
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.fnListarPendientes();
      this.alertService.close('');
    }
  }

  changeSecondCalendar(changeDate: any) {
    this.secondSearchDay = ('0' + changeDate.day).slice(-2) + '/' + ('0' + changeDate.month).slice(-2) + '/' + changeDate.year;

    const splitFirstDate = this.firstSearchDay.split('/');
    const splitSecondDate = this.secondSearchDay.split('/');

    const firstDate = `${splitFirstDate[2]}/${splitFirstDate[1]}/${splitFirstDate[0]}`;
    const secondDate = `${splitSecondDate[2]}/${splitSecondDate[1]}/${splitSecondDate[0]}`;
    console.log(firstDate, secondDate);
    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.alertService.warning('La segunda fecha no debe ser menor que la primera.');
      this.listarPendiente = [];
      this.invalid_secondDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.fnListarPendientes();
      this.alertService.close('');
    }
  }

  async changeEstadoHistorial() {
    try {
      //console.log('estado', this.sEstadoActual);
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarHistorial(this.searchHistorialInicio,this.searchHistorialFin, this.sEstadoActual));
      if (data.exito) {
        this.listarHistorial = data.datoAdicional;
        this.totalB = this.listarHistorial.length;
      } else {
        this.listarHistorial = [];
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }

  }

  async fnListarPendientes() {
    try {
      console.log('inicio >>',this.firstSearchDay);
      console.log('fin >>',this.secondSearchDay);
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarPendientes(this.firstSearchDay, this.secondSearchDay));
      //console.log('listarPendiente', data);
      if (data.exito) {
        this.listarPendiente = data.datoAdicional;
        this.totalA = this.listarPendiente.length;
        //console.log('listarPendiente', this.listarPendiente);
      } else {
        this.listarPendiente = [];
      }
    } catch (error) {

      this.alertService.error('Existen problemas en el servidor.');
    } this.loadingTable = false;
  }

  async fnListarHistorial() {
    try {
      console.log('dia pendiente 1 >>>', this.searchHistorialInicio);
      console.log('dia pendiente 2 >>>', this.searchHistorialFin);
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarHistorial(this.searchHistorialInicio,this.searchHistorialFin, this.sEstadoActual));
      if (data.exito) {
        this.listarHistorial = data.datoAdicional;
        this.totalB = this.listarHistorial.length;
        //console.log('Listar Historial', data);
      } else {
        this.listarHistorial = [];
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDescargarDocumento(item: SolicitudUsuario) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.fileService.downloadFile(item.sUidDocumento));
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
    this.modalService.dismissAll();
  }


  Aprobar(contentAprobar: any) {
    this.modalService.open(contentAprobar, { centered: true });
  }

  openModalObservar(contentObservar: any, item: SolicitudUsuario) {
    this.idSolicitud = item.nIdSolicitudUsuario;
    this.modalService.open(contentObservar, { centered: true });
  }

  openModalRechazar(contentRechazar: any, item: SolicitudUsuario) {
    this.idSolicitud = item.nIdSolicitudUsuario;
    //console.log('this.idSolicitud', this.idSolicitud)
    this.modalService.open(contentRechazar, { centered: true });
  }

  openModalCargando(contentCargando: any) {
    this.modalReference = this.modalService.open(contentCargando, { centered: true, backdrop: 'static', keyboard: false });
  }

  async fnAprobar(item: SolicitudUsuario) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.aprobar(item));
      //console.log('data', data);
      if (data.exito) {
        this.fnListarHistorial();
        this.fnListarPendientes();
        this.alertService.success(data.mensajeUsuario);
        //this.modalService.dismissAll();
      } else {
        this.fnListarHistorial();
        this.fnListarPendientes();
        this.alertService.error(data.mensajeUsuario);
        //this.modalService.dismissAll();
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }

  async fnReenviarObservar(item: SolicitudUsuario) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.reenviarObservacion(item.nIdSolicitudUsuario, item.sCorreo));
      //console.log('data fnReenviarObservar', data);
      if (data.exito) {
        this.alertService.success('Se envió correctamente el Email.');
        //this.modalService.dismissAll();
      } else {
        this.alertService.error(data.mensajeUsuario);
        //this.modalService.dismissAll();
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }
  async fnReenviarAprobar(item: SolicitudUsuario) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.reenviarAprobacion(item.nIdSolicitudUsuario));
      //console.log('data fnReenviarAprobar', data);
      if (data.exito) {
        this.alertService.success('Se envió correctamente el Email y el SMS.');
        //this.modalService.dismissAll();
      } else {
        this.alertService.error(data.mensajeUsuario);
        //this.modalService.dismissAll();
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }
  async fnReenviarRechazar(item: SolicitudUsuario) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.reenviarRechazo(item.nIdSolicitudUsuario));
      //console.log('data fnReenviarRechazar', data);
      if (data.exito) {
        this.alertService.success('Se envió correctamente el Email.');
        //this.modalService.dismissAll();
      } else {
        this.alertService.error(data.mensajeUsuario);
        //this.modalService.dismissAll();
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }

  async fnObservar(modal: any) {
    try {
      this.submitObservar = true;
      if (this.sObservacion == undefined || this.sObservacion.length < 10) {
        return;
      } else {
        this.loading = true;
        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.observar(this.idSolicitud, this.sObservacion));
        if (data.exito) {
          this.sObservacion = '';
          this.submitObservar = false;
          modal.close();
          this.fnListarPendientes();
          this.fnListarHistorial();
          this.alertService.success(data.mensajeUsuario);
        } else {
          this.alertService.error(data.mensajeUsuario);
        }
        this.loading = false;
      }
    } catch (error) {
      this.loading = false;
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnRechazar(modal: any) {
    try {
      this.submitMotivoRechazo = true;
      if (this.sMotivoRechazo == undefined || this.sMotivoRechazo.length < 10) {
        return;
      } else {
        this.loading = true;
        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.rechazar(this.idSolicitud, this.sMotivoRechazo));
        //console.log(data);
        if (data.exito) {
          this.submitMotivoRechazo = false;
          this.sMotivoRechazo = '',
            modal.close();
          this.fnListarPendientes();
          this.fnListarHistorial();
          this.alertService.success(data.mensajeUsuario);
        } else {
          this.alertService.error(data.mensajeUsuario);
        }
        this.loading = false;
      }
    } catch (error) {
      this.loading = false;
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  fnCerrarRechazar(modalRechazar: any) {
    modalRechazar.close();
    this.sMotivoRechazo = '';
    this.submitMotivoRechazo = false;
    this.loading = false;
  }
  fnCerrarObservar(modalObservar: any) {
    modalObservar.close();
    this.sObservacion = '';
    this.submitObservar = false;
    this.loading = false;
  }

  fnCerrarCargando(modalCargando: any) {
    modalCargando.close();
  }

}



