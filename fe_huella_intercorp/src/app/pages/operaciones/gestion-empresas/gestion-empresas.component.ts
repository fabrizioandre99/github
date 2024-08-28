import { Component, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Empresa } from 'src/app/models/empresa';
import { IUsuario } from 'src/app/models/usuario';
import { EmpresaService } from 'src/app/services/empresa.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-gestion-empresas',
  templateUrl: './gestion-empresas.component.html',
  styleUrls: ['./gestion-empresas.component.css']
})
export class EmpresasComponent implements OnDestroy {
  oUsuario: IUsuario | undefined;
  page = 1;
  pageSize = 10;
  total = 0;
  codEmpresa: any;

  patronNombres = /^[A-Za-z0-9. ñÑáéíóúÁÉÍÓÚüÜ]+$/u;
  patronCodigo = /^(?!-)([a-záéíóúüñ0-9]+(-?[a-záéíóúüñ0-9]+){2,62})$/i;

  lstEmpresas: any[] = [];
  lstSector: any[] = [];

  model: Empresa = new Empresa();
  loadRegSub: boolean = false;
  fShowSkeleton: boolean = false;
  sfNuevaGestion: boolean = false;
  isRegistrar: boolean = false;
  loadEliminar: boolean = false;
  hasPeriodos: boolean = false;

  nombreEmpresa: any;
  sector: any;
  selectedItem: any;
  nIdEmpresa: any;

  constructor(private modalService: NgbModal, private toastr: ToastrService,
    private seguridadService: SeguridadService, private empresaService: EmpresaService,
    private parametroService: ParametroService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.codEmpresa = localStorage.getItem('LocalCodEmpresa_intercorp');
      this.fnListarSector();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }


  validarNombres(evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") {
      return true;
    }

    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!this.patronNombres.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }

    return true;
  }


  async fnListarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('SECTOR'));
      if (data.exito) {
        this.lstSector = data.datoAdicional;

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

  async fnListarEmpresa() {
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.listarEmpresa([this.sector]));
      if (data.exito) {
        this.lstEmpresas = data.datoAdicional;

      } else {
        this.lstEmpresas = [];
        /*  this.toastr.warning(data.mensajeUsuario, 'Advertencia'); */
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnRegOEdit(form: NgForm) {

    /*     let isValid = true; */

    if (this.model.sCodEmpresa && !this.patronCodigo.test(this.model.sCodEmpresa)) {
      this.toastr.warning('El código no cumple con el formato.', 'Advertencia');
      return
    }
    if (!this.model.sCodEmpresa || !this.model.sRuc || !this.model.sCodSector
      || !this.model.sRazonSocial || !this.model.sNombreComercial) {
      this.toastr.warning('Complete los campos.', 'Advertencia');
      return
    }

    if (this.model.sRuc.length < 11) {
      this.toastr.warning('El ruc debe tener 11 dígitos.', 'Advertencia');
      return
    }

    /*     if (!isValid) {
          return;
        }
     */
    if (!this.patronNombres.test(this.model.sRazonSocial) || !this.patronNombres.test(this.model.sNombreComercial)) {
      this.toastr.warning('No se permiten caracteres extraños.', 'Advertencia');
      return;
    }

    if (form.invalid) {
      return
    }

    this.loadRegSub = true;
    let nIdEmpresa: any = -1;

    if (!this.isRegistrar) {
      nIdEmpresa = this.model.nIdEmpresa
    }
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.insertOActual(nIdEmpresa,
        this.model.sCodEmpresa, this.model.sRuc, this.model.sCodSector, this.model.sRazonSocial?.replace(/\s+/g, ' ').trim(), this.model.sNombreComercial?.replace(/\s+/g, ' ').trim()));

      if (data.exito) {
        this.selectedItem = null!;
        this.model = new Empresa();
        this.sfNuevaGestion = false;
        this.fnListarSector();
        this.fnListarEmpresa();
        this.toastr.success(data.mensajeUsuario, 'Éxito');
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
    this.loadRegSub = false;
  }

  closePanel() {
    this.selectedItem = null!;
    this.sfNuevaGestion = false;
  }

  nuevaEmpresa() {
    this.selectedItem = null!;
    this.model = new Empresa();
    this.isRegistrar = true;
    this.model.nIdEmpresa = -1;
    this.sfNuevaGestion = true;
  }

  editarEmpresa(item: any) {
    this.selectedItem = item.nIdEmpresa;
    this.isRegistrar = false;
    let object = Object.assign({}, item);
    this.model = object;
    this.sfNuevaGestion = true;
  }

  openEliminarEmpresa(item: any, contentEmpresa: any) {
    if (!item.boTienePeriodos) {
      this.hasPeriodos = item.boTienePeriodos;
      this.nIdEmpresa = item.nIdEmpresa;
      this.modalService.open(contentEmpresa, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
    } else {
      this.toastr.warning('La empresa tiene periodos registrados.', 'Advertencia');
    }

  }

  async fnEliminarEmpresa() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.eliminarEmpresa(this.nIdEmpresa, this.codEmpresa));
      if (data.exito) {
        if (this.nIdEmpresa == this.model.nIdEmpresa) {
          this.sfNuevaGestion = false;
        }
        this.fnListarEmpresa();

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
    } this.modalService.dismissAll();
    this.loadEliminar = false;
  }

  openTooltip(tooltip: any) {
    if (!tooltip.isOpen()) {
      tooltip.open();
    }
  }

  closeTooltip(tooltip: any) {
    if (tooltip.isOpen()) {
      tooltip.close();
    }
  }

}


