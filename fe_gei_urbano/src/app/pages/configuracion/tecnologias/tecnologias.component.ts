import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { SeguridadService } from '../../../services/seguridad.service';
import { Router } from '@angular/router';
import { Vehiculo } from '../../../models/vehiculo';
import { ParametroService } from '../../../services/parametro.service';
import { FactorEmisionService } from '../../../services/factor-emision.service';
import { TecnologiaService } from '../../../services/tecnologia.service';
import { Tecnologia } from '../../../models/tecnologia';
import { SharedDataService } from '../../../services/shared-data.service';

@Component({
  selector: 'app-tecnologias',
  templateUrl: './tecnologias.component.html',
  styleUrl: './tecnologias.component.css'
})
export class TecnologiasComponent {

  sCodCategoria: string;
  sCodCombustible: string;
  sCodTipoVehiculo: string;

  lstCategorias: any[] = [];
  lstCombustible: any[] = [];
  lstTipoVehiculo: any[] = [];
  lstTecnologia: any[] = [];

  lstRutas: any[] = [];

  lstVehiculos: any[] = [];

  idRutaSelected: number = -1;

  pageA = 1;
  pageSizeA = 5;
  totalA = 0;

  pageB = 1;
  pageSizeB = 10;
  totalB = 0;

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  fShowSkeletonVehiculo: boolean = false;
  lstSkeletonA = Array(5);
  lstSkeletonB = Array(5);

  fShowVehiculo: boolean = false;

  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;

  isEditarTecnologia: boolean = false;
  isEditarVehiculo: boolean = false;

  oUsuario: IUsuario;
  model: Tecnologia = new Tecnologia();
  moVehiculo: Vehiculo = new Vehiculo();

  patronTecnologia = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$/u;
  patronRecorrido = /^\d{1,7}(\.\d{1,2})?$/u;
  patronDecimal = /^[0-9.]+$/u;
  patronDescripcion = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ,.\-: ]+$/u;
  patronVacio = /^\s*\S[\s\S]*$/u;
  patronPlaca = /^[a-zA-Z0-9\- ]+$/u;

  boDisableCategoria: boolean = false;


  constructor(private router: Router, private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService,
    private parametroService: ParametroService, private factorEmisionService: FactorEmisionService, 
    private tecnologiaService: TecnologiaService, private sharedData: SharedDataService
  ) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarCategorias();
      this.fnListarCombustible();
      this.fnListarTipoVehiculo();
    }
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  validarAlTipear(patron: RegExp, evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") {
      return true;
    }

    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!patron.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }
    return true;
  }

  permitirNumerosYPunto(event: KeyboardEvent) {
    const inputValue = this.model.bdRendimiento ? this.model.bdRendimiento.toString() : '';
    const validCharacters = /^[0-9.]$/;

    if (!validCharacters.test(event.key) || (event.key === '.' && inputValue.includes('.'))) {
      // Evitar caracteres no permitidos o más de un punto
      event.preventDefault();
    }
  }


  cumpleconPatron(patron: RegExp, valor: any): boolean {
    return patron.test(valor);
  }

  openRegistrarTecnologia(contentRegistrarTecnologia: any) {
    this.model = new Tecnologia;
    this.model.sCodCategoria = this.sCodCategoria;
    this.model.sCodCombustible = this.sCodCombustible;
    this.modalService.open(contentRegistrarTecnologia, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  openEditarTecnologia(contentRegistrarTecnologia: any, item: any) {
    this.isEditarTecnologia = true;
    console.log(item);
    let object = Object.assign({}, item);
    this.model = object;
    console.log(this.model);
    const modalRef = this.modalService.open(contentRegistrarTecnologia, { centered: true, windowClass: "modal-md", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarTecnologia = false;
      }, 200);

    });
  }

  openEliminarTecnologia(contentEliminar: any, item: any) {
    this.model = new Tecnologia;
    this.model.nIdTecnologia = item.nIdTecnologia;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarCategorias() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo("CATEGORIA_VEHICULO"));

      console.log('data categoría', data);
      if (data.exito) {
        this.lstCategorias = data.datoAdicional;
        if(this.sCodCategoria == undefined) this.sCodCategoria = this.lstCategorias[0].sCodigo;
        if(this.lstCategorias.length == 1) this.boDisableCategoria = true;
        this.fShowSkeleton = false;
        if(this.sCodTipoVehiculo != undefined && this.sCodCombustible != undefined) this.fnListarTecnologia();
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarCombustible() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarTipoCombustible());

      if (data.exito) {
        this.lstCombustible = data.datoAdicional;
        console.log(this.lstCombustible);
        if(this.sCodCombustible == undefined) this.sCodCombustible = this.lstCombustible[0].sCodFactor;
        console.log(this.lstCombustible[0].sTipoCombustible);
        console.log(this.sCodCombustible);
        this.fShowSkeleton = false;
        if(this.sCodCategoria != undefined && this.sCodTipoVehiculo != undefined) this.fnListarTecnologia();
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

  async fnListarTipoVehiculo() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo("TIPOS_VEHICULOS"));

      console.log('data categoría', data);
      if (data.exito) {
        this.lstTipoVehiculo = data.datoAdicional;
        console.log(this.lstTipoVehiculo);
        if(this.sCodTipoVehiculo == undefined) this.sCodTipoVehiculo = this.lstTipoVehiculo[0].sCodigo;
        this.fShowSkeleton = false;
        if(this.sCodCategoria != undefined && this.sCodCombustible != undefined) this.fnListarTecnologia();
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarTecnologia() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.tecnologiaService.listarTecnologia(this.sCodCategoria, this.sCodCombustible, this.sCodTipoVehiculo));
      console.log(data);
      if (data.exito) {
        this.lstTecnologia = data.datoAdicional;
        console.log(this.lstTecnologia);
        this.fShowSkeleton = false;
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  redictFactorEmision(item: any) {
    let oTecnologia = { 
      sCodCategoria: item.sCodCategoria,
      sCodCombustible: item.sCodCombustible,
      sCodTipoVehiculo: item.sCodTipoVehiculo,
      sNombre: item.sNombre
    }
    this.sharedData.setTecnologia(oTecnologia);
    this.router.navigate(['/factor-emision-nivel2']);
  }

  async fnRegistrarTecnologia(form: NgForm) {
    try {
      if (form.invalid) return;
      this.loadRegOEdit = true;
      let nIdTecnologia = -1;

      if (this.isEditarTecnologia) nIdTecnologia = this.model.nIdTecnologia;

      let oTecnologia: Tecnologia = {
        nIdTecnologia: nIdTecnologia,
        sCodCategoria: this.model.sCodCategoria,
        sCodCombustible: this.model.sCodCombustible,
        sCodTipoVehiculo: this.model.sCodTipoVehiculo,
        sNombre: this.model.sNombre?.replace(/\s+/g, ' ').trim(),
        nAnioInicio: this.model.nAnioInicio,
        nAnioFin: this.model.nAnioFin,
        bdRendimiento: this.model.bdRendimiento
      }

      let data: IDataResponse = await lastValueFrom(this.tecnologiaService.registrarTecnologia(oTecnologia));
      
      this.loadRegOEdit = false;
      if (data.exito) {
        this.fnListarTecnologia();
        this.modalService.dismissAll();
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');

    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }


  async fnEliminarTecnologia() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdRuta', this.model.nIdRuta);
      let data: IDataResponse = await lastValueFrom(this.tecnologiaService.eliminarTecnologia(this.model.nIdTecnologia));
      if (data.exito) {
        this.fnListarTecnologia();
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
