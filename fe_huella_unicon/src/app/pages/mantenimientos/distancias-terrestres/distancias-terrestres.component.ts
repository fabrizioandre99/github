import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { DistAereasYTerrestres } from 'src/app/models/distAereasyTerrestres';
import { IUsuario } from 'src/app/models/usuario';
import { DistanciaService } from 'src/app/services/distancia.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-distancias-terrestres',
  templateUrl: './distancias-terrestres.component.html',
  styleUrls: ['./distancias-terrestres.component.css']
})
export class DistanciasTerrestresComponent implements OnInit {
  oUsuario: IUsuario;
  lstTerrestres: any[] = [];
  eliminar: any = {};
  page = 1;
  pageSize = 10;
  total = 0;
  lstSkeleton = Array(4);
  regex = /^(?!\.)(\d{1,5}|\d{1,5}[.]|\d{0,5}\.\d{0,4}?)$/;
  regexNoCeros = /^(?!0+(\.0+)?$)\d+(\.\d*)?$/;

  model: DistAereasYTerrestres = new DistAereasYTerrestres();
  fShowSkeleton: boolean = false;
  fShow: boolean = false;
  isEditarTerrestre: boolean = false;
  isErrorDistancia: boolean = false;
  loadRegOEdit: boolean = false;
  loadEliminar: boolean = false;
  submitCategoria: boolean = false;
  selectedCategory_A: any;

  constructor(private toastr: ToastrService, private modalService: NgbModal, private seguridadService: SeguridadService, private distanciaService: DistanciaService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarTerrestres();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  async fnListarTerrestres() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.distanciaService.listarPorTipo('T'));
      if (data.exito) {
        this.lstTerrestres = data.datoAdicional;
        //console.log('this.lstTerrestres', this.lstTerrestres);
        this.fShowSkeleton = false;
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

  async fnRegOEdit(form: NgForm) {
    this.submitCategoria = true;
    try {

      if (!this.regex.test(this.model.bdDistacia) && this.model.bdDistacia) {
        this.isErrorDistancia = true;
        this.toastr.warning('Solo se permite un número con un máximo de 5 unidades y 4 decimales', 'Advertencia');
        return
      }

      if (!this.regexNoCeros.test(this.model.bdDistacia)) {
        return
      }

      if (form.invalid) {
        return
      }

      this.loadRegOEdit = true;

      let idDistancia = -1;
      if (this.isEditarTerrestre) {
        idDistancia = this.model.nIdDistancia;
      }
      let obj = {
        nIdDistancia: idDistancia,
        sOrigen: this.model.sOrigen?.replace(/\s+/g, ' ').trim(),
        sDestino: this.model.sDestino?.replace(/\s+/g, ' ').trim(),
        bdDistacia: this.model.bdDistacia?.toString().replace(/\s+/g, ' ').trim(),
        sTipoRecorrido: 'T',
      }
      //console.log(obj);
      let data: IDataResponse = await lastValueFrom(this.distanciaService.regOEdit(obj));

      if (data.exito) {
        this.model = new DistAereasYTerrestres;
        this.fShow = false;
        this.selectedCategory_A = null!;
        this.fnListarTerrestres();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegOEdit = false;
    this.submitCategoria = false;
  }

  fnNuevoTramo() {
    this.selectedCategory_A = null!;
    this.fShow = true;
    this.model = new DistAereasYTerrestres;
    this.isEditarTerrestre = false;
  }

  fnEditarTramo(item: any, index: number) {
    this.submitCategoria = false;
    this.selectedCategory_A = item.nIdDistancia;
    this.isEditarTerrestre = true;
    this.fShow = true;
    let object = Object.assign({}, item);
    this.model = object;
  }

  openEliminar(contentEliminar: any, item: any) {
    this.eliminar.nIdDistancia = item.nIdDistancia;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnEliminar() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.distanciaService.eliminarDistancia(this.eliminar.nIdDistancia));
      if (data.exito) {
        this.fnListarTerrestres();
        this.modalService.dismissAll();
        if (this.eliminar.nIdDistancia == this.model.nIdDistancia) {
          this.fShow = false;
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;
  }
}
