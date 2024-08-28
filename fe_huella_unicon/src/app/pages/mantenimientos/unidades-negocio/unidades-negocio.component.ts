import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { UnidadNegocio } from 'src/app/models/unidadNegocio';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UnidadNegocioService } from 'src/app/services/unidad-negocio.service';

@Component({
  selector: 'app-unidades-negocio',
  templateUrl: './unidades-negocio.component.html',
  styleUrls: ['./unidades-negocio.component.css']
})
export class UnidadesNegocioComponent implements OnInit {
  oUsuario: IUsuario;
  lstSkeleton = Array(2);
  eliminar: any = {};

  pageA = 1;
  pageSizeA = 5;
  totalA = 0;

  pageB = 1;
  pageSizeB = 5;
  totalB = 0;

  loadEliminar: boolean = false;
  selectedCategory_A: number | null = null;
  selectedCategory_B: number | null = null;

  regex = /^(?!^\s+$)[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.-]+$/;

  /*------Declaraciones Geográficas---------*/
  lstUnNegocio: any[] = [];
  lstSubUnNegocio: any[] = [];
  fShowSubUnN: boolean = false;
  fShowAgreUnN: boolean = false;
  fShowAgreSubUnN: boolean = false;
  loadRegUnN: boolean = false;
  loadRegSubUnN: boolean = false;
  fSkUnN: boolean = false;
  fSkSubUnN: boolean = false;
  isEditarUnN: boolean = false;
  isEditarSubCatGeo: boolean = false;
  submitUnN: boolean = false;
  submitSubUnN: boolean = false;
  modelUnNegocio: UnidadNegocio = new UnidadNegocio();
  modelUnNegocio_prev: UnidadNegocio = new UnidadNegocio();
  itemSubUnNegocio: UnidadNegocio = new UnidadNegocio();
  modelSubUnN: UnidadNegocio = new UnidadNegocio();
  modelSubUnN_prev: UnidadNegocio = new UnidadNegocio();

  constructor(private toastr: ToastrService,
    private unidadNegocioService: UnidadNegocioService, private modalService: NgbModal, private seguridadService: SeguridadService,) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarUnNegocio();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  async fnListarUnNegocio() {
    try {
      this.fSkUnN = true;
      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnNegocioABM(-1));
      if (data.exito) {
        this.lstUnNegocio = data.datoAdicional;
        //console.log('this.lstUnNegocio', this.lstUnNegocio);
        this.fSkUnN = false;
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
    this.fSkUnN = false;
  }

  async fnListarSubUnNegocio() {
    this.fSkSubUnN = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnNegocioABM(this.itemSubUnNegocio.nIdUnidadNegocio));
      //console.log('itemSubUnNegocio', this.itemSubUnNegocio);
      if (data.exito) {
        this.lstSubUnNegocio = data.datoAdicional;
        //console.log('this.lstSubUnNegocio', this.lstSubUnNegocio);
        this.fShowSubUnN = true;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fSkSubUnN = false;
  }

  async openSubCatGeo(item: any) {
    try {
      //console.log('item', item);
      this.itemSubUnNegocio.nIdUnidadNegocio = item.nIdUnidadNegocio;
      this.itemSubUnNegocio.sNombre = item.sNombre;
      this.fnListarSubUnNegocio();
      this.fShowAgreSubUnN = false;
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnRegistrarUnNegocio(form: NgForm) {
    this.submitUnN = true;
    try {
      if (!this.modelUnNegocio.sNombre) {
        return
      }
      const objetoEncontrado = this.lstUnNegocio.find(obj => obj.sNombre === this.modelUnNegocio.sNombre.trim());
      if (objetoEncontrado && !this.isEditarUnN) {
        this.toastr.warning('La categoría ingresada ya existe en el listado.', 'Advertencia');
        return
      }

      if (!this.regex.test(this.modelUnNegocio.sNombre)) {
        return
      }

      if (form.invalid) {
        this.toastr.warning('Ingrese solo letras.', 'Advertencia');
        return
      }

      if (JSON.stringify(this.modelUnNegocio) === JSON.stringify(this.modelUnNegocio_prev)) {
        this.modelUnNegocio = new UnidadNegocio;
        this.selectedCategory_A = null;
        this.fShowAgreUnN = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelUnNegocio.sNombre) === JSON.stringify(this.modelUnNegocio_prev.sNombre)) {
        nombreModificado = false;
      }


      this.loadRegUnN = true;
      let nIdUnidadNegocio = -1;
      let idPadre = -1;

      if (this.isEditarUnN) {
        nIdUnidadNegocio = this.modelUnNegocio.nIdUnidadNegocio;
      }

      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.registrarUnNegocioABM(
        nIdUnidadNegocio, this.modelUnNegocio.sNombre.replace(/\s+/g, ' ').trim(), idPadre, this.modelUnNegocio.boCodEstado, nombreModificado));

      if (data.exito) {
        if (this.isEditarUnN) {
          this.itemSubUnNegocio.sNombre = this.modelUnNegocio.sNombre;
        }
        this.modelUnNegocio = new UnidadNegocio;
        this.selectedCategory_A = null;
        this.fnListarUnNegocio();

        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgreUnN = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegUnN = false;
    this.submitUnN = false;
  }

  async fnRegistrarSubUnNegocio(form: NgForm) {
    this.submitSubUnN = true;
    try {
      if (!this.modelSubUnN.sNombre) {
        return
      }
      const objetoEncontrado = this.lstSubUnNegocio.find(obj => obj.sNombre === this.modelSubUnN.sNombre.trim());
      if (objetoEncontrado && !this.isEditarSubCatGeo) {
        this.toastr.warning('La subcategoría ingresada ya existe en el listado.', 'Advertencia');
        return

      }
      if (!this.regex.test(this.modelSubUnN.sNombre)) {
        return
      }

      if (form.invalid) {
        this.toastr.warning('Ingrese solo letras.', 'Advertencia');
        return
      }

      if (JSON.stringify(this.modelSubUnN) === JSON.stringify(this.modelSubUnN_prev)) {
        this.modelSubUnN = new UnidadNegocio;
        this.selectedCategory_B = null;
        this.fShowAgreSubUnN = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelSubUnN.sNombre) === JSON.stringify(this.modelSubUnN_prev.sNombre)) {
        nombreModificado = false;
      }

      this.loadRegSubUnN = true;
      let nIdUnidadNegocio = -1;

      if (this.isEditarSubCatGeo) {
        nIdUnidadNegocio = this.modelSubUnN.nIdUnidadNegocio;
      }

      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.registrarUnNegocioABM(
        nIdUnidadNegocio, this.modelSubUnN.sNombre.replace(/\s+/g, ' ').trim(), this.itemSubUnNegocio.nIdUnidadNegocio, this.modelSubUnN.boCodEstado, nombreModificado));

      if (data.exito) {
        try {
          this.fSkSubUnN = true;
          let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnNegocioABM(this.itemSubUnNegocio.nIdUnidadNegocio));
          if (data.exito) {

            this.modelSubUnN = new UnidadNegocio;
            this.selectedCategory_B = null;

            this.lstSubUnNegocio = data.datoAdicional;
            //Se cierra el modal cada vez que se edita o se guarda
            this.fShowAgreSubUnN = false;

            //console.log(' this.lstSubUnNegocio', this.lstSubUnNegocio);
          } else {
            this.toastr.warning(data.mensajeUsuario, 'Advertencia');
          }
        } catch (error: any) {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.fSkSubUnN = false;

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegSubUnN = false;
    this.submitSubUnN = false;
  }

  openAgreCatGeo() {
    this.fShowAgreUnN = true;
    this.isEditarUnN = false;
    this.modelUnNegocio = new UnidadNegocio;

    this.submitUnN = false;
  }

  openEditCatGeo(item: any, index: number) {
    this.selectedCategory_A = item.nIdUnidadNegocio;

    this.fShowAgreUnN = true;
    this.isEditarUnN = true;

    let object = Object.assign({}, item);
    this.modelUnNegocio = object;
    this.modelUnNegocio_prev = JSON.parse(JSON.stringify(object));

    if (this.modelUnNegocio.nIdUnidadNegocio !== this.itemSubUnNegocio.nIdUnidadNegocio) {
      this.fShowSubUnN = false;
    }

  }

  openAgreSubCatGeo() {
    this.fShowAgreSubUnN = true;
    this.isEditarSubCatGeo = false;
    this.modelSubUnN = new UnidadNegocio;
    this.submitSubUnN = false;
  }

  openEditSubCatGeo(item: any, index: number) {
    this.selectedCategory_B = item.nIdUnidadNegocio;

    this.fShowAgreSubUnN = true;
    this.isEditarSubCatGeo = true;

    let object = Object.assign({}, item);

    this.modelSubUnN = object;
    this.modelSubUnN_prev = JSON.parse(JSON.stringify(object));
  }

  cancelCatGeo() {
    this.fShowAgreUnN = false;
    this.selectedCategory_A = null;
  }

  cancelSubCatGeo() {
    this.fShowAgreSubUnN = false;
    this.selectedCategory_B = null;
  }

  /*-------Funciones de ambos-------*/
  openEliminar(contentEliminar: any, item: any, catoSub: number) {
    this.eliminar.nIdUnidadNegocio = item.nIdUnidadNegocio;
    this.eliminar.catoSub = catoSub;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnEliminar() {
    try {
      this.loadEliminar = true;

      let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.eliminarUnNegocio(this.eliminar.nIdUnidadNegocio));
      if (data.exito) {
        if (this.eliminar.catoSub == 1) {
          this.lstUnNegocio = []
          this.fnListarUnNegocio();
          this.modalService.dismissAll();

          if (this.eliminar.nIdUnidadNegocio == this.modelUnNegocio.nIdUnidadNegocio) {
            this.fShowAgreUnN = false;
          }
          if (this.eliminar.nIdUnidadNegocio === this.modelUnNegocio.nIdUnidadNegocio && this.modelUnNegocio.nIdUnidadNegocio === this.itemSubUnNegocio.nIdUnidadNegocio) {
            this.fShowSubUnN = false;
          }

          if (this.eliminar.nIdUnidadNegocio === this.itemSubUnNegocio.nIdUnidadNegocio) {
            this.fShowSubUnN = false;
          }
        } else if (this.eliminar.catoSub == 2) {
          this.lstSubUnNegocio = []
          this.fnListarSubUnNegocio();
          this.modalService.dismissAll();

        }
        this.eliminar.catoSub = null!;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;

  }

}
