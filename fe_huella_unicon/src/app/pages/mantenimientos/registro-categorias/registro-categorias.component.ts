import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Categoria } from 'src/app/models/categoria';
import { IUsuario } from 'src/app/models/usuario';
import { CategoriaService } from 'src/app/services/categoria.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-registro-categorias',
  templateUrl: './registro-categorias.component.html',
  styleUrls: ['./registro-categorias.component.css']
})
export class RegistroCategoriasComponent implements OnInit {
  oUsuario: IUsuario;
  lstSkeleton = Array(2);
  eliminar: any = {};

  pageA = 1;
  pageSizeA = 5;
  totalA = 0;

  pageB = 1;
  pageSizeB = 5;
  totalB = 0;

  pageC = 1;
  pageSizeC = 5;
  totalC = 0;

  pageD = 1;
  pageSizeD = 5;
  totalD = 0;

  loadEliminar: boolean = false;
  selectedCategory_A: number | null = null;
  selectedCategory_B: number | null = null;
  selectedCategory_C: number | null = null;
  selectedCategory_D: number | null = null;

  /*------Declaraciones Geográficas---------*/
  lstGeograficas: any[] = [];
  lstSubGeograficas: any[] = [];
  fShowSubCatGeo: boolean = false;
  fShowAgreCatGeo: boolean = false;
  fShowAgreSubCatGeo: boolean = false;
  loadRegCatGeo: boolean = false;
  loadRegSubCatGeo: boolean = false;
  fSkCatGeo: boolean = false;
  fSkSubCatGeo: boolean = false;
  isEditarCatGeo: boolean = false;
  isEditarSubCatGeo: boolean = false;
  submitCatGeo: boolean = false;
  submitSubCatGeo: boolean = false;
  modelCatGeo: Categoria = new Categoria();
  modelCatGeo_prev: Categoria = new Categoria();
  itemSubCatGeo: Categoria = new Categoria();
  modelSubCatGeo: Categoria = new Categoria();
  modelSubCatGeo_prev: Categoria = new Categoria();

  /*------Declaraciones de Ámbito---------*/
  lstAmbito: any[] = [];
  lstSubAmbito: any[] = [];
  fShowSubCatAmb: boolean = false;
  fShowAgreCatAmb: boolean = false;
  fShowAgreSubCatAmb: boolean = false;
  loadRegCatAmb: boolean = false;
  loadRegSubCatAmb: boolean = false;
  fSkCatAmb: boolean = false;
  fSkSubCatAmb: boolean = false;
  isEditarCatAmb: boolean = false;
  isEditarSubCatAmb: boolean = false;
  submitCatAmb: boolean = false;
  submitSubCatAmb: boolean = false;
  modelCatAmb: Categoria = new Categoria();
  modelCatAmb_prev: Categoria = new Categoria();
  itemSubCatAmb: Categoria = new Categoria();
  modelSubCatAmb: Categoria = new Categoria();
  modelSubCatAmb_prev: Categoria = new Categoria();

  constructor(private toastr: ToastrService, private modalService: NgbModal, private seguridadService: SeguridadService, private categoriaService: CategoriaService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarCatGeograficas();
      this.fnListarCatAmbito();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  /*-------Funciones Geográficas-------*/
  async fnListarCatGeograficas() {
    try {
      this.fSkCatGeo = true;
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(-1, 'G'));
      if (data.exito) {
        this.lstGeograficas = data.datoAdicional;
        //console.log('this.lstGeograficas', this.lstGeograficas);
        this.fSkCatGeo = false;
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
  }

  async fnListarSubCatGeo() {
    this.fSkSubCatGeo = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(this.itemSubCatGeo.nIdCategoria, 'G'));
      //console.log('itemSubCatGeo', this.itemSubCatGeo);
      if (data.exito) {
        this.lstSubGeograficas = data.datoAdicional;
        //console.log('this.lstSubGeograficas', this.lstSubGeograficas);
        this.fShowSubCatGeo = true;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fSkSubCatGeo = false;
  }

  async openSubCatGeo(item: any) {
    try {
      this.itemSubCatGeo.nIdCategoria = item.nIdCategoria;
      this.itemSubCatGeo.sNombre = item.sNombre;
      this.fnListarSubCatGeo();
      this.fShowAgreSubCatGeo = false;
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnRegistrarCatGeo(form: NgForm) {
    this.submitCatGeo = true;
    try {

      if (!this.modelCatGeo.sNombre) {
        return
      }
      const objetoEncontrado = this.lstGeograficas.find(obj => obj.sNombre === this.modelCatGeo.sNombre.trim());
      if (objetoEncontrado && !this.isEditarCatGeo) {
        this.toastr.warning('La categoría ingresada ya existe en el listado.', 'Advertencia');
        return
      }

      if (form.invalid) {
        return
      }


      if (JSON.stringify(this.modelCatGeo) === JSON.stringify(this.modelCatGeo_prev)) {
        this.modelCatGeo = new Categoria;
        this.selectedCategory_A = null;
        this.fShowAgreCatGeo = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelCatGeo.sNombre) === JSON.stringify(this.modelCatGeo_prev.sNombre)) {
        nombreModificado = false;
        console.log('Tienen el mismo nombre');
      }


      this.loadRegCatGeo = true;
      let idCategoria = -1;
      let idPadre = -1;

      if (this.isEditarCatGeo) {
        idCategoria = this.modelCatGeo.nIdCategoria;
      }


      let data: IDataResponse = await lastValueFrom(this.categoriaService.registrarCategoria(
        idCategoria, this.modelCatGeo.sNombre.replace(/\s+/g, ' ').trim(), 'G', idPadre, this.modelCatGeo.boCodEstado,
        nombreModificado));

      if (data.exito) {
        if (this.isEditarCatGeo) {
          this.itemSubCatGeo.sNombre = this.modelCatGeo.sNombre;
        }
        this.modelCatGeo = new Categoria;
        this.selectedCategory_A = null;
        this.fnListarCatGeograficas();

        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgreCatGeo = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegCatGeo = false;
    this.submitCatGeo = false;
  }

  async fnRegistrarSubCatGeo(form: NgForm) {
    this.submitSubCatGeo = true;
    try {

      if (!this.modelSubCatGeo.sNombre) {
        return
      }
      const objetoEncontrado = this.lstSubGeograficas.find(obj => obj.sNombre === this.modelSubCatGeo.sNombre.trim());
      if (objetoEncontrado && !this.isEditarSubCatGeo) {
        this.toastr.warning('La subcategoría ingresada ya existe en el listado.', 'Advertencia');
        return
      }

      if (form.invalid) {
        return
      }


      if (JSON.stringify(this.modelSubCatGeo) === JSON.stringify(this.modelSubCatGeo_prev)) {
        this.modelSubCatGeo = new Categoria;
        this.selectedCategory_B = null;
        this.fShowAgreSubCatGeo = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelSubCatGeo.sNombre) === JSON.stringify(this.modelSubCatGeo_prev.sNombre)) {
        nombreModificado = false;
        //console.log('Tienen el mismo nombre');
      }


      this.loadRegSubCatGeo = true;

      let idCategoria = -1;

      if (this.isEditarSubCatGeo) {
        idCategoria = this.modelSubCatGeo.nIdCategoria;
      }

      let data: IDataResponse = await lastValueFrom(this.categoriaService.registrarCategoria(
        idCategoria, this.modelSubCatGeo.sNombre.replace(/\s+/g, ' ').trim(), 'G', this.itemSubCatGeo.nIdCategoria, this.modelSubCatGeo.boCodEstado, nombreModificado));

      if (data.exito) {
        try {
          this.fSkSubCatGeo = true;
          let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(this.itemSubCatGeo.nIdCategoria, 'G'));
          if (data.exito) {

            this.modelSubCatGeo = new Categoria;
            this.selectedCategory_B = null;

            this.lstSubGeograficas = data.datoAdicional;
            //Se cierra el modal cada vez que se edita o se guarda
            this.fShowAgreSubCatGeo = false;

            //console.log(' this.lstSubGeograficas', this.lstSubGeograficas);
          } else {
            this.toastr.warning(data.mensajeUsuario, 'Advertencia');
          }
        } catch (error: any) {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.fSkSubCatGeo = false;

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegSubCatGeo = false;
    this.submitSubCatGeo = false;
  }

  openAgreCatGeo() {
    this.fShowAgreCatGeo = true;
    this.isEditarCatGeo = false;
    this.modelCatGeo = new Categoria;

    this.submitCatGeo = false;
  }

  openEditCatGeo(item: any, index: number) {
    this.selectedCategory_A = item.nIdCategoria;

    this.fShowAgreCatGeo = true;
    this.isEditarCatGeo = true;

    let object = Object.assign({}, item);
    this.modelCatGeo = object;
    this.modelCatGeo_prev = JSON.parse(JSON.stringify(object));

    if (this.modelCatGeo.nIdCategoria !== this.itemSubCatGeo.nIdCategoria) {
      this.fShowSubCatGeo = false;
    }

  }

  openAgreSubCatGeo() {
    this.fShowAgreSubCatGeo = true;
    this.isEditarSubCatGeo = false;
    this.modelSubCatGeo = new Categoria;
    this.submitSubCatGeo = false;
  }

  openEditSubCatGeo(item: any, index: number) {
    this.selectedCategory_B = item.nIdCategoria;

    this.fShowAgreSubCatGeo = true;
    this.isEditarSubCatGeo = true;

    let object = Object.assign({}, item);
    this.modelSubCatGeo = object;
    this.modelSubCatGeo_prev = JSON.parse(JSON.stringify(object));
  }

  cancelCatGeo() {
    this.fShowAgreCatGeo = false;
    this.selectedCategory_A = null;
  }

  cancelSubCatGeo() {
    this.fShowAgreSubCatGeo = false;
    this.selectedCategory_B = null;
  }

  /*-------Funciones de Ámbito-------*/
  async fnListarCatAmbito() {
    try {
      this.fSkCatAmb = true;
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(-1, 'A'));
      if (data.exito) {
        this.lstAmbito = data.datoAdicional;
        //console.log('this.lstAmbito', this.lstAmbito);
        this.fSkCatAmb = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnListarSubCatAmb() {
    this.fSkSubCatAmb = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(this.itemSubCatAmb.nIdCategoria, 'A'));
      //console.log('itemSubCatAmb', this.itemSubCatAmb);
      if (data.exito) {
        this.lstSubAmbito = data.datoAdicional;
        //console.log('this.lstSubAmbito', this.lstSubAmbito);
        this.fShowSubCatAmb = true;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fSkSubCatAmb = false;
  }

  async openSubCatAmb(item: any) {
    try {
      //console.log('item', item);

      this.itemSubCatAmb.nIdCategoria = item.nIdCategoria;
      this.itemSubCatAmb.sNombre = item.sNombre;
      this.fnListarSubCatAmb();
      this.fShowAgreSubCatAmb = false;
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnRegistrarCatAmb(form: NgForm) {
    this.submitCatAmb = true;
    try {

      if (!this.modelCatAmb.sNombre) {
        return
      }

      const objetoEncontrado = this.lstAmbito.find(obj => obj.sNombre === this.modelCatAmb.sNombre.trim());
      if (objetoEncontrado && !this.isEditarCatAmb) {
        this.toastr.warning('La categoría ingresada ya existe en el listado.', 'Advertencia');
        return
      }

      if (form.invalid) {
        return
      }


      if (JSON.stringify(this.modelCatAmb) === JSON.stringify(this.modelCatAmb_prev)) {
        this.modelCatAmb = new Categoria;
        this.selectedCategory_C = null;
        this.fShowAgreCatAmb = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelCatAmb.sNombre) === JSON.stringify(this.modelCatAmb_prev.sNombre)) {
        nombreModificado = false;
      }


      this.loadRegCatAmb = true;
      let idCategoria = -1;
      let idPadre = -1;

      if (this.isEditarCatAmb) {
        idCategoria = this.modelCatAmb.nIdCategoria;
      }

      let data: IDataResponse = await lastValueFrom(this.categoriaService.registrarCategoria(
        idCategoria, this.modelCatAmb.sNombre.replace(/\s+/g, ' ').trim(), 'A', idPadre, this.modelCatAmb.boCodEstado, nombreModificado));

      if (data.exito) {

        if (this.isEditarCatAmb) {
          this.itemSubCatAmb.sNombre = this.modelCatAmb.sNombre;
        }

        this.modelCatAmb = new Categoria;
        this.selectedCategory_C = null;
        this.fnListarCatAmbito();
        //Se cierra el modal cada vez que se edita o se guarda
        this.fShowAgreCatAmb = false;

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegCatAmb = false;
    this.submitCatAmb = false;

  }

  async fnRegistrarSubCatAmb(form: NgForm) {
    this.submitSubCatAmb = true;
    try {

      if (!this.modelSubCatAmb.sNombre) {
        return
      }
      const objetoEncontrado = this.lstSubAmbito.find(obj => obj.sNombre === this.modelSubCatAmb.sNombre.trim());
      if (objetoEncontrado && !this.isEditarSubCatAmb) {
        this.toastr.warning('La subcategoría ingresada ya existe en el listado.', 'Advertencia');
        return
      }

      if (form.invalid) {
        return
      }

      if (JSON.stringify(this.modelSubCatAmb) === JSON.stringify(this.modelSubCatAmb_prev)) {
        this.modelSubCatAmb = new Categoria;
        this.selectedCategory_D = null;
        this.fShowAgreSubCatAmb = false;
        return
      }

      let nombreModificado = true;

      if (JSON.stringify(this.modelSubCatAmb.sNombre) === JSON.stringify(this.modelSubCatAmb_prev.sNombre)) {
        nombreModificado = false;
      }


      this.loadRegSubCatAmb = true;

      let idCategoria = -1;

      if (this.isEditarSubCatAmb) {
        idCategoria = this.modelSubCatAmb.nIdCategoria;
      }

      let data: IDataResponse = await lastValueFrom(this.categoriaService.registrarCategoria(
        idCategoria, this.modelSubCatAmb.sNombre.replace(/\s+/g, ' ').trim(), 'A', this.itemSubCatAmb.nIdCategoria, this.modelSubCatAmb.boCodEstado, nombreModificado));

      if (data.exito) {
        try {
          this.fSkSubCatAmb = true;
          let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByPadre(this.itemSubCatAmb.nIdCategoria, 'A'));
          if (data.exito) {
            this.modelSubCatAmb = new Categoria;
            this.selectedCategory_D = null;
            this.lstSubAmbito = data.datoAdicional;
            //Se cierra el modal cada vez que se edita o se guarda
            this.fShowAgreSubCatAmb = false;
            //console.log('this.lstSubAmbito', this.lstSubAmbito);
          } else {
            this.toastr.warning(data.mensajeUsuario, 'Advertencia');
          }
        } catch (error: any) {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.fSkSubCatAmb = false;

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegSubCatAmb = false;
    this.submitSubCatAmb = false;
  }

  openAgreCatAmb() {
    this.fShowAgreCatAmb = true;
    this.isEditarCatAmb = false;
    this.modelCatAmb = new Categoria;
    this.submitCatAmb = false;
  }

  openEditCatAmb(item: any, index: any) {
    this.selectedCategory_C = item.nIdCategoria;

    this.fShowAgreCatAmb = true;
    this.isEditarCatAmb = true;

    let object = Object.assign({}, item);
    this.modelCatAmb = object;
    this.modelCatAmb_prev = JSON.parse(JSON.stringify(object));

    if (this.modelCatAmb.nIdCategoria !== this.itemSubCatAmb.nIdCategoria) {
      this.fShowSubCatAmb = false;
    }
  }

  openAgreSubCatAmb() {
    this.fShowAgreSubCatAmb = true;
    this.isEditarSubCatAmb = false;
    this.modelSubCatAmb = new Categoria;
    this.submitSubCatAmb = false;
  }

  openEditSubCatAmb(item: any, index: any) {
    this.selectedCategory_D = item.nIdCategoria;

    this.fShowAgreSubCatAmb = true;
    this.isEditarSubCatAmb = true;

    let object = Object.assign({}, item);
    this.modelSubCatAmb = object;
    this.modelSubCatAmb_prev = JSON.parse(JSON.stringify(object));

  }

  cancelCatAmb() {
    this.fShowAgreCatAmb = false;
    this.selectedCategory_C = null;
  }

  cancelSubCatAmb() {
    this.fShowAgreSubCatAmb = false;
    this.selectedCategory_D = null;
  }

  /*-------Funciones de ambos-------*/
  openEliminar(contentEliminar: any, item: any, catoSub: number) {
    this.eliminar.nIdCategoria = item.nIdCategoria;
    this.eliminar.catoSub = catoSub;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnEliminar() {
    try {
      this.loadEliminar = true;

      let data: IDataResponse = await lastValueFrom(this.categoriaService.eliminarCategoria(this.eliminar.nIdCategoria));
      if (data.exito) {
        if (this.eliminar.catoSub == 1) {
          this.lstGeograficas = []
          this.fnListarCatGeograficas();
          this.modalService.dismissAll();

          if (this.eliminar.nIdCategoria == this.modelCatGeo.nIdCategoria) {
            this.fShowAgreCatGeo = false;
          }
          if (this.eliminar.nIdCategoria === this.modelCatGeo.nIdCategoria && this.modelCatGeo.nIdCategoria === this.itemSubCatGeo.nIdCategoria) {
            this.fShowSubCatGeo = false;
          }

          if (this.eliminar.nIdCategoria === this.itemSubCatGeo.nIdCategoria) {
            this.fShowSubCatGeo = false;
          }
        } else if (this.eliminar.catoSub == 2) {
          this.lstSubGeograficas = []
          this.fnListarSubCatGeo();
          this.modalService.dismissAll();

        } else if (this.eliminar.catoSub == 3) {
          this.lstAmbito = []
          this.fnListarCatAmbito();
          this.modalService.dismissAll();

          if (this.eliminar.nIdCategoria == this.modelCatAmb.nIdCategoria) {
            this.fShowAgreCatAmb = false;
          }
          if (this.eliminar.nIdCategoria === this.modelCatAmb.nIdCategoria && this.modelCatAmb.nIdCategoria === this.itemSubCatAmb.nIdCategoria) {
            this.fShowSubCatAmb = false;
          }
          if (this.eliminar.nIdCategoria === this.itemSubCatAmb.nIdCategoria) {
            this.fShowSubCatAmb = false;
          }
        } else if (this.eliminar.catoSub == 4) {
          this.lstSubAmbito = []
          this.fnListarSubCatAmb();
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
