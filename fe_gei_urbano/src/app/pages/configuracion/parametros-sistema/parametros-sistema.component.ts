import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { SeguridadService } from '../../../services/seguridad.service';
import { ParametroService } from '../../../services/parametro.service';
import { Parametros } from '../../../models/parametros';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parametros-sistema',
  templateUrl: './parametros-sistema.component.html',
  styleUrl: './parametros-sistema.component.css'
})
export class ParametrosSistemaComponent {

  lstParamXTipo: any[] = [];
  lstTipos: any[] = [];
  sTipoParam: string;
  sDescripcion: string;
  sOpciones: string;

  boCreate: boolean = true;

  page = 1;
  pageSize = 10;
  total = 0;

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  lstSkeleton = Array(4);

  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;
  isEditarParam: boolean = false;

  oUsuario: IUsuario;
  model: Parametros = new Parametros();

  patronParam = /^(?!.*[ ]{2})[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\-:/(). _]+$/u;
  patronVacio = /^\s*\S[\s\S \\]*$/u;

  constructor(private router: Router, private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService,
    private parametroService: ParametroService,
  ) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {

      this.fnListarTipos();
    }
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  validarAlTipear(patron: RegExp, evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") return true;
  
    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!patron.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }
    return true;
  }


  cumpleconPatron(patron: RegExp, valor: any): boolean {
    return patron.test(valor);
  }


  openRegistrarUsuario(contentRegistrarUsuario: any) {
    this.model = new Parametros;
    this.modalService.open(contentRegistrarUsuario, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  openEditarParam(contentRegistrarUsuario: any, item: any) {
    this.isEditarParam = true;
    //console.log('item', item);
    let object = Object.assign({}, item);
    this.model = object;
    const modalRef = this.modalService.open(contentRegistrarUsuario, { centered: true, windowClass: "modal-md", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarParam = false;
      }, 200);

    });
  }

  openEliminar(contentEliminar: any, item: any) {
    this.model.nIdParametro = item.nIdParametro;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarTipos() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarTipos());
      if (data.exito) {
        this.lstTipos = data.datoAdicional;
        console.log('lstTipos', this.lstTipos);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarParamXTipos() {
    this.boCreate = false;
    this.sDescripcion = '';
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(this.sTipoParam));

      console.log('data paramXTipos', data);
      if (data.exito) {
        this.sDescripcion = this.lstTipos.find(item => item.sTipo === this.sTipoParam).sDescripcion;
        this.sOpciones = this.lstTipos.find(item => item.sTipo === this.sTipoParam).sOpciones;
        this.boCreate = this.sOpciones.includes('C');
        this.lstParamXTipo = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      console.log(error);
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }


  async actualizarParam(item: any) {
    item.boEstado = !item.boEstado;
    let data: IDataResponse = await lastValueFrom(this.parametroService.regOActualParametro(item));
    if (data.exito) {
      this.toastr.success(data.mensajeUsuario, 'Éxito');
    } else {

      item.boEstado = !item.boEstado
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnRegistrarParam(form: NgForm) {
    try {
      if (form.invalid) return;
      this.loadRegOEdit = true;

      const objActualizar = {
        sTipo: this.sTipoParam,
        sCodigo: this.model.sCodigo?.replace(/\s+/g, ' ').trim(),
      };

      const objEditar = {
        nIdParametro: this.isEditarParam ? this.model.nIdParametro : '-1',
        sValor: this.model.sValor?.replace(/\s+/g, ' ').trim(),
        boEstado: this.model.boEstado,
      };

      let oResultado;

      if (!this.isEditarParam) {
        oResultado = {
          ...objActualizar,
          ...objEditar
        };
      } else {
        oResultado = objEditar;
      }

      let data: IDataResponse = await lastValueFrom(this.parametroService.regOActualParametro(oResultado));

      if (data.exito) {
        this.loadRegOEdit = false;
        this.fnListarParamXTipos();
        this.modalService.dismissAll();
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

  async fnEliminarParam() {
    try {
      this.loadEliminar = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.eliminarParametro(this.model.nIdParametro));
      if (data.exito) {
        this.lstParamXTipo = []
        this.fnListarParamXTipos();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.modalService.dismissAll();
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.loadEliminar = false;

  }
}
