import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Empresa } from 'src/app/models/empresa';
import { Locacion } from 'src/app/models/locacion';
import { IUsuario } from 'src/app/models/usuario';
import { EmpresaService } from 'src/app/services/empresa.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-informacion-empresa',
  templateUrl: './informacion-empresa.component.html',
  styleUrls: ['./informacion-empresa.component.css']
})
export class InformacionEmpresaComponent implements OnInit, OnDestroy {
  oUsuario: IUsuario | undefined;
  page = 1;
  pageSize = 10;
  total = 0;
  valorInput: any;

  lstById: any[] = [];

  model_panel: Empresa = new Empresa();
  model: Locacion = new Locacion();

  sfAgLocacion: boolean = false;
  sfEditLocacion: boolean = false;
  fShowSkeleton: boolean = false;
  loadRegLocacion: boolean = false;
  isRegistrar: boolean = false;
  loadEliminar: boolean = false;
  selectedItem: any;
  nIdPeriodo: any;
  nIdLocacion: any;
  patronUbicacion = /^[A-Za-z0-9-/,º°. ñÑáéíóúÁÉÍÓÚüÜ]+$/u;
  patronLocacion = /^[A-Za-z0-9\sáéíóúÁÉÍÓÚñÑüÜ]+$/u;

  constructor(private toastr: ToastrService,
    private seguridadService: SeguridadService, private empresaService: EmpresaService,
    private periodoService: PeriodoService,
    private locacionService: LocacionService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarByCod();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  validarUbicacion(evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") {
      return true;
    }

    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!this.patronUbicacion.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }

    return true;
  }


  validarLocacion(evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") {
      return true;
    }

    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!this.patronLocacion.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }
    return true;
  }

  async fnListarByCod() {
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.listarById(JSON.parse(localStorage.getItem('sUsuario_intercorp')!).sCodEmpresa));
      if (data.exito) {
        this.model_panel = data.datoAdicional[0];
        this.fnListarByIdEmpresa();
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

  async fnListarByIdEmpresa() {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarLocacion(this.model_panel.nIdEmpresa));

      if (data.exito) {
        this.lstById = data.datoAdicional;
      } else {
        this.lstById = [];
        /*  this.toastr.warning(data.mensajeUsuario, 'Advertencia'); */
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnInactivarLocacion(item: any) {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.actualizarEstado(item.nIdLocacion, !item.boCodEstado));
      if (data.exito) {
        //this.fnListarByIdEmpresa();
      } else {
        this.fnListarByIdEmpresa();
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

  async fnRegOEdit(form: NgForm) {
    try {
      if (!this.model.sNombre || !this.model.sUbicacion) {
        this.toastr.warning('Complete los campos.', 'Advertencia');
        return
      }

      if (!this.patronLocacion.test(this.model.sNombre)) {
        this.toastr.warning('Para el nombre de locación solo se permiten letras y números.', 'Advertencia');
        return
      }

      if (!this.patronUbicacion.test(this.model.sUbicacion)) {
        this.toastr.warning('Para ubicación solo se permiten letras, - , / , º , comas (,) y puntos (.).', 'Advertencia');
        return
      }

      if (form.invalid) {
        return
      }

      this.loadRegLocacion = true;
      let nIdLocacion: any = -1;

      if (!this.isRegistrar) {
        nIdLocacion = this.model.nIdLocacion;
      }

      let data: IDataResponse = await lastValueFrom(this.locacionService.insertOActual(nIdLocacion,
        this.model_panel.nIdEmpresa, this.model.sNombre?.replace(/\s+/g, ' ').trim(), this.model.sUbicacion?.replace(/\s+/g, ' ').trim()));

      if (data.exito) {
        this.selectedItem = null!;
        this.sfAgLocacion = false;

        let nombreLocacionActual = this.model.nombreLocacion;
        this.model = new Locacion();
        this.model.nombreLocacion = nombreLocacionActual;

        this.fnListarByIdEmpresa();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadRegLocacion = false;
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


  AgreLocacion() {
    let nombreLocacionActual = this.model.nombreLocacion;
    this.model = new Locacion();
    this.model.nombreLocacion = nombreLocacionActual;

    this.isRegistrar = true;
  }

  editarLocacion(item: any) {
    this.selectedItem = item.nIdLocacion;
    this.isRegistrar = false;
    let object = Object.assign({}, item);
    this.model = object;
    this.sfAgLocacion = true;
  }

  closePanel() {
    this.selectedItem = null!;
    this.sfAgLocacion = false;
  }

  openEliminarLocacion(item: any, contentEmpresa: any) {
    this.nIdLocacion = item.nIdLocacion;
    this.modalService.open(contentEmpresa, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async eliminarLocacion() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.eliminarLocacion(this.nIdLocacion));
      if (data.exito) {
        if (this.model.nIdLocacion == this.nIdLocacion) {
          this.sfAgLocacion = false;
        }
        this.fnListarByIdEmpresa();
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
    this.modalService.dismissAll();
    this.loadEliminar = false;
  }

}
