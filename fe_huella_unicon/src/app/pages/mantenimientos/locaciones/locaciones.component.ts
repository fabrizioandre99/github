import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ActividadPlanta } from 'src/app/models/actividadPlanta';
import { Locacion } from 'src/app/models/locacion';
import { Planta } from 'src/app/models/planta';
import { IUsuario } from 'src/app/models/usuario';
import { CategoriaService } from 'src/app/services/categoria.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PlantaService } from 'src/app/services/planta.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UnidadNegocioService } from 'src/app/services/unidad-negocio.service';

@Component({
  selector: 'app-locaciones',
  templateUrl: './locaciones.component.html',
  styleUrls: ['./locaciones.component.css']
})
export class LocacionesComponent implements OnInit {
  oUsuario: IUsuario;
  eliminar: any = {};
  lstSkeleton = Array(2);

  pageA = 1;
  pageSizeA = 5;
  totalA = 0;

  pageB = 1;
  pageSizeB = 5;
  totalB = 0;

  page_modal = 1;
  pageSize_modal = 5;
  totalModal = 0;

  firstCalendar: any;
  secondCalendar: any;
  firstSearchDay: any;
  secondSearchDay: any;
  getDate: { year: number; month: number; day: number; };

  invalid_firstDate: boolean = false;
  invalid_secondDate: boolean = false;

  lstCatGeo: any[] = [];
  lstSubCatGeo: any[] = [];
  lstCatAmb: any[] = [];
  lstSubCatAmb: any[] = [];
  lstUnNegocio: any[] = [];
  lstEmpresa: any[] = [];

  selectedCategory_A: any;
  selectedCategory_B: any;
  selectedCategory_C: any;

  disabledSubCatGeo: boolean = false;
  disabledSubCatAmb: boolean = false;

  /*------Declaraciones de Locación---------*/
  lstLocacion: any[] = [];
  fSkLocacion: boolean = false;
  loadRegLocacion: boolean = false;
  isEditarLocacion: boolean = false;
  fShowAgreLocacion: boolean = false;
  submitLocacion: boolean = false;
  modelLocacion: Locacion = new Locacion();
  itemLocacion: Locacion = new Locacion();
  loadElimLocacion: boolean = false;
  fShowAgreLoc: boolean = false;

  /*------Declaraciones de plantas---------*/
  lstPlanta: any[] = [];
  fSkPlanta: boolean = false;
  fShowPlanta: boolean = false;
  fShowAgrePlanta: boolean = false;
  loadRegPlanta: boolean = false;
  isEditarPlanta: boolean = false;
  submitPlanta: boolean = false;
  modelPlanta: Planta = new Planta();
  itemPlanta: Planta = new Planta();
  loadElimPlanta: boolean = false;

  /*------Declaraciones de Actividad por planta ---------*/
  actiPlanta: any = {};
  lstActiPlanta: any[] = [];
  fShowSkActiPlanta: boolean = false;
  submitActiPlanta: boolean = false;
  loadRegActiPlanta: boolean = false;
  isEditarActiPlanta: boolean = false;
  itemActiPlanta: ActividadPlanta = new ActividadPlanta();
  modelActiPlanta: ActividadPlanta = new ActividadPlanta();
  loadElimActiPlanta: boolean = false;
  modalRef: import("@ng-bootstrap/ng-bootstrap").NgbModalRef;

  constructor(private toastr: ToastrService,
    private locacionService: LocacionService, private plantaService: PlantaService, private unidadNegocioService: UnidadNegocioService, private categoriaService: CategoriaService, private modalService: NgbModal, private seguridadService: SeguridadService,
    private parametroService: ParametroService) { }


  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {

      let today = new Date();
      this.getDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
      this.firstCalendar = this.getDate;
      this.secondCalendar = this.getDate;
      this.firstSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2);
      this.secondSearchDay = this.getDate.year + '-' + ('0' + this.getDate.month).slice(-2) + '-' + ('0' + this.getDate.day).slice(-2);

      this.fnListarLocacion();
      this.fnListarCatGeo();
      this.fnListarCatAmb();
      this.fnListarUnNegocio();
      this.fnListarEmpresas();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  /*---------- Funciones de Locación ------------ */
  async fnListarLocacion() {
    try {
      this.fSkLocacion = true;
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarABM());
      if (data.exito) {
        this.lstLocacion = data.datoAdicional;
        //console.log('this.lstLocacion', this.lstLocacion);
        this.fSkLocacion = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 11) {
        this.seguridadService.logout();
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    this.fSkLocacion = false;
  }
  async fnListarCatGeo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByTipoYPadre(-1, 'G'));
      if (data.exito) {
        this.lstCatGeo = data.datoAdicional;
        //console.log('this.lstCatGeo', this.lstCatGeo);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }


  async fnListarSubCatGeo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByTipoYPadre(this.modelLocacion.oCatGeo.nIdCategoria, 'G'));
      if (data.exito) {
        this.lstSubCatGeo = data.datoAdicional;
        //console.log('this.lstSubCatGeo', this.lstSubCatGeo);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }


  async fnListarCatAmb() {
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByTipoYPadre(-1, 'A'));
      if (data.exito) {
        this.lstCatAmb = data.datoAdicional;
        //console.log('this.lstCatAmb', this.lstCatAmb);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }


  async fnListarSubCatAmb() {
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByTipoYPadre(this.modelLocacion.oCatAmb.nIdCategoria, 'A'));
      if (data.exito) {
        this.lstSubCatAmb = data.datoAdicional;
        //console.log('this.lstSubCatAmb', this.lstSubCatAmb);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnListarUnNegocio() {
    try {
      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnidadNegocio());
      if (data.exito) {
        this.lstUnNegocio = data.datoAdicional;
        //console.log('this.lstUnNegocio', this.lstUnNegocio);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  changeCatGeo() {
    this.disabledSubCatGeo = false;
    this.modelLocacion.oSubcatGeo.nIdCategoria = null;
    this.fnListarSubCatGeo();
  }

  changeCatAmb() {
    this.disabledSubCatAmb = false;
    this.modelLocacion.oSubcatAmb.nIdCategoria = null;
    this.fnListarSubCatAmb();
  }

  async fnRegOActLocacion(form: NgForm) {
    this.submitLocacion = true;
    try {
      if (!this.modelLocacion.sNombre) {
        return
      }

      if (form.invalid) {
        return
      }

      this.loadRegLocacion = true;
      let nIdLocacion = -1;

      if (this.isEditarLocacion) {
        nIdLocacion = this.modelLocacion.nIdLocacion;

      }

      let data: IDataResponse = await lastValueFrom(this.locacionService.registrarLocacion(
        nIdLocacion, this.modelLocacion.sNombre.replace(/\s+/g, ' ').trim(), this.modelLocacion.oSubcatGeo.nIdCategoria,
        this.modelLocacion.oSubcatAmb.nIdCategoria, this.modelLocacion.boCodEstado));

      if (data.exito) {

        if (this.isEditarLocacion) {
          this.itemPlanta.sNombre = this.modelLocacion.sNombre;

        }

        this.modelLocacion = new Locacion;
        this.selectedCategory_A = null;
        this.fShowAgreLoc = false;
        this.isEditarLocacion = false;
        this.fnListarLocacion();

        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgreLocacion = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegLocacion = false;
    this.submitLocacion = false;
  }


  openEditLocacion(item: any) {
    this.selectedCategory_A = item.nIdLocacion;

    this.fShowAgreLoc = true;
    this.isEditarLocacion = true;

    let object = Object.assign({}, item);
    this.modelLocacion = object;

    this.fnListarSubCatAmb();
    this.fnListarSubCatGeo();

    this.disabledSubCatGeo = false;
    this.disabledSubCatAmb = false;

    if (this.modelLocacion.nIdLocacion !== this.itemPlanta.oLocacion.nIdLocacion) {
      this.fShowPlanta = false;
    }
  }

  openAgreLocacion() {
    this.fShowAgreLoc = true;
    this.isEditarLocacion = false;
    this.disabledSubCatGeo = true;
    this.disabledSubCatAmb = true;
    this.modelLocacion = new Locacion;
    /* this.submitLoc = false; */
  }

  cancelLocacion() {
    this.fShowAgreLoc = false;
    this.selectedCategory_A = null;
    this.submitLocacion = false;
  }

  openEliminarLocacion(contentEliminar: any, item: any, itemElim: number) {
    this.eliminar.nIdLocacion = item.nIdLocacion;
    this.eliminar.itemElim = itemElim;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }


  async fnEliminarLocacion() {
    this.loadElimLocacion = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.eliminarLocacion(this.eliminar.nIdLocacion));
      if (data.exito) {
        if (this.eliminar.nIdLocacion == this.modelLocacion.nIdLocacion) {
          this.fShowAgreLoc = false; this.fShowPlanta = false;
        }

        if (this.eliminar.nIdLocacion == this.itemPlanta.oLocacion.nIdLocacion) {
          this.fShowPlanta = false;
        }

        this.fnListarLocacion();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadElimLocacion = false;
  }

  /*------------Funciones de Planta------------ */
  async fnListarPlanta() {
    this.fSkPlanta = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarByLocacion(this.itemPlanta.oLocacion.nIdLocacion));
      //console.log('itemPlanta', this.itemPlanta);
      if (data.exito) {
        this.lstPlanta = data.datoAdicional;
        //console.log('this.lstPlanta', this.lstPlanta);
        this.fShowPlanta = true;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fSkPlanta = false;
  }

  async openPlanta(item: any) {
    try {
      //console.log('item', item);
      this.itemPlanta.oLocacion.nIdLocacion = item.nIdLocacion;
      this.itemPlanta.sNombre = item.sNombre;
      this.fnListarPlanta();
      this.fShowAgrePlanta = false;
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  openEditPlanta(item: any, index: number) {
    this.selectedCategory_B = item.nIdPlanta;
    this.itemLocacion.nIdLocacion = item.nIdPlanta;
    this.submitPlanta = false;
    this.fShowAgrePlanta = true;
    this.isEditarPlanta = true;
    let object = Object.assign({}, item);
    this.modelPlanta = object;
  }

  openAgrePlanta() {
    this.fShowAgrePlanta = true;
    this.isEditarPlanta = false;
    this.modelPlanta = new Planta;
    this.submitPlanta = false;
  }

  cancelPlanta() {
    this.fShowAgrePlanta = false;
    this.selectedCategory_B = null;
  }


  async fnRegOActPlanta(form: NgForm) {
    this.submitPlanta = true;
    try {
      if (!this.modelPlanta.sNombre) {
        return
      }

      if (form.invalid) {
        return
      }

      this.loadRegPlanta = true;
      let nIdLocacion = -1;

      if (this.isEditarPlanta) {
        nIdLocacion = this.itemLocacion.nIdLocacion;
      }

      let data: IDataResponse = await lastValueFrom(this.plantaService.registrarPlanta(
        nIdLocacion, this.modelPlanta.sNombre.replace(/\s+/g, ' ').trim(), this.modelPlanta.boCodEstado,
        this.itemPlanta.oLocacion.nIdLocacion, this.modelPlanta.oUUNN.nIdUnidadNegocio));

      if (data.exito) {
        if (this.isEditarPlanta) {
          this.itemLocacion.sNombre = this.modelPlanta.sNombre;
        }
        this.modelPlanta = new Planta;
        this.selectedCategory_B = null;

        this.fnListarPlanta();

        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgrePlanta = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegPlanta = false;
    this.submitPlanta = false;
  }

  async regOAct_ActiPlanta(form: NgForm) {
    this.submitActiPlanta = true;
    try {
      if (!this.modelActiPlanta.sCodEmpresa) {
        return
      }

      if (form.invalid || this.invalid_firstDate || this.invalid_secondDate) {
        return
      }

      this.loadRegActiPlanta = true;
      let nIdActividadPlanta = -1;

      if (this.isEditarActiPlanta) {
        nIdActividadPlanta = this.itemActiPlanta.nIdActividadPlanta;
      }

      let data: IDataResponse = await lastValueFrom(this.plantaService.registrarActiPlanta(
        nIdActividadPlanta, this.actiPlanta.nIdPlanta, this.modelActiPlanta.sCodEmpresa,
        this.firstSearchDay, this.secondSearchDay));

      if (data.exito) {
        this.cancelActiPlanta();
        this.fnListarActiPlanta();

        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgrePlanta = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegActiPlanta = false;
    this.submitActiPlanta = false;
  }


  openActiPlanta(contentActiPlanta: any, item: any) {
    this.fShowSkActiPlanta = true;
    this.actiPlanta.nIdPlanta = item.nIdPlanta;
    this.fnListarActiPlanta();
    this.modalService.open(contentActiPlanta, { centered: true, windowClass: "modal-xxl", backdrop: 'static' });
  }

  async fnListarActiPlanta() {
    try {
      let data: IDataResponse = await lastValueFrom(this.plantaService.listarActividad(this.actiPlanta.nIdPlanta));
      if (data.exito) {
        this.lstActiPlanta = data.datoAdicional;
        //console.log('this.lstActiPlanta', this.lstActiPlanta);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkActiPlanta = false;
  }

  async fnListarEmpresas() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('EMPRESA'));
    if (data.exito) {
      this.lstEmpresa = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  async fnEliminarPlanta() {
    this.loadElimPlanta = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.plantaService.eliminarPlanta(this.eliminar.nIdPlanta));
      if (data.exito) {
        if (this.eliminar.nIdPlanta == this.modelPlanta.nIdPlanta) {
          this.fShowAgrePlanta = false;
        }
        this.fnListarPlanta();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadElimPlanta = false;
  }

  openEliminarPlanta(contentEliminar: any, item: any, itemElim: number) {
    this.eliminar.nIdPlanta = item.nIdPlanta;
    this.eliminar.itemElim = itemElim;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  convertNgbDateToDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day);
  }

  changeFirstCalendar(changeDate: any) {
    this.firstSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)
    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;

    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La primera fecha no debe ser mayor a la segunda', 'Advertencia');
      this.invalid_firstDate = true;
      return
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
    }
  }

  changeSecondCalendar(changeDate: any) {
    this.secondSearchDay = changeDate.year + '-' + ('0' + changeDate.month).slice(-2) + '-' + ('0' + changeDate.day).slice(-2)

    const splitFirstDate = this.firstSearchDay.split('-');
    const splitSecondDate = this.secondSearchDay.split('-');

    const firstDate = `${splitFirstDate[0]}/${splitFirstDate[1]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[0]}/${splitSecondDate[1]}/${splitSecondDate[2]}`;
    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La segunda fecha no debe ser menor que la primera', 'Advertencia');
      this.invalid_secondDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
    }
  }

  openEditActiPlanta(item: any) {
    //console.log('item.sFechaFin', item.sFechaFin);
    this.selectedCategory_C = item.nIdActividadPlanta;

    this.itemActiPlanta.nIdActividadPlanta = item.nIdActividadPlanta;

    this.isEditarActiPlanta = true;

    let object = Object.assign({}, item);
    this.modelActiPlanta = object;

    const fechaInicio = item.sFechaInicio.split('-'); // Suponiendo que 'fecha' tiene el formato 'yyyy-mm-dd'
    this.firstCalendar = {
      year: parseInt(fechaInicio[0]),
      month: parseInt(fechaInicio[1]),
      day: parseInt(fechaInicio[2])
    };

    const fechaFin = item.sFechaFin.split('-'); // Suponiendo que 'fecha' tiene el formato 'yyyy-mm-dd'
    this.secondCalendar = {
      year: parseInt(fechaFin[0]),
      month: parseInt(fechaFin[1]),
      day: parseInt(fechaFin[2])
    };
  }

  cancelActiPlanta() {
    this.modelActiPlanta = new ActividadPlanta;
    this.selectedCategory_C = null;
    this.submitActiPlanta = false;
    this.isEditarLocacion = false;
    this.isEditarActiPlanta = false;
    this.firstCalendar = this.getDate;
    this.secondCalendar = this.getDate;
  }

  closeModal() {
    this.modalService.dismissAll();
    this.lstActiPlanta = [];
    this.cancelActiPlanta();
  }

  async fnEliminarActiPlanta() {
    this.loadElimActiPlanta = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.plantaService.eliminarActiPlanta(this.eliminar.nIdActividadPlanta));
      if (data.exito) {
        //console.log('this.eliminar.nIdActividadPlanta', this.eliminar.nIdActividadPlanta, this.modelActiPlanta.nIdActividadPlanta);
        if (this.eliminar.nIdActividadPlanta == this.modelActiPlanta.nIdActividadPlanta) {
          this.cancelActiPlanta();
        }
        this.fnListarActiPlanta();
        this.modalRef.close();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadElimActiPlanta = false;
  }

  openEliminarActiPlanta(contentEliminar: any, item: any, itemElim: number) {
    this.eliminar.nIdPlanta = item.nIdPlanta;
    this.eliminar.nIdActividadPlanta = item.nIdActividadPlanta;
    this.eliminar.itemElim = itemElim;
    this.modalRef = this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

}
