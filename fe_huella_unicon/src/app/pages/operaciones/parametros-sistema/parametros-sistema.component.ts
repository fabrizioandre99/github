import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Parametro } from 'src/app/models/parametro';
import { IUsuario } from 'src/app/models/usuario';
import { ParametroService } from 'src/app/services/parametro.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-parametros-sistema',
  templateUrl: './parametros-sistema.component.html',
  styleUrls: ['./parametros-sistema.component.css']
})
export class ParametrosSistemaComponent implements OnInit {
  sTipoParam: String;
  lstTipoParametro: any[] = [];
  lstParametros: any[] = [];
  lstSkeleton = Array(3);
  oUsuario: IUsuario;

  page = 1;
  pageSize = 10;
  total = 0;

  model: Parametro = new Parametro();

  loadingModal: boolean = false;
  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;
  fShowSkeleton: boolean = false;
  isVerParametro: boolean = false;
  isEditarParametro: boolean = false;

  constructor(private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService, private parametroService: ParametroService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarTipoParametro();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  openNuevoParametro(contentNuevoParametro: any) {
    this.model = new Parametro;
    this.model.boEstado = true;
    this.modalService.open(contentNuevoParametro, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
  }

  openEditarParametro(contentNuevoParametro: any, item: any) {
    this.isEditarParametro = true;
    //console.log('item', item);
    let object = Object.assign({}, item);
    this.model = object;

    const modalRef = this.modalService.open(contentNuevoParametro, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarParametro = false;
      }, 200);
    });
  }

  openConfirmacion(contentConfirmacion: any, item: any) {
    this.model.nIdParametro = item.nIdParametro;
    this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarTipoParametro() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarTipoParam());
      if (data.exito) {
        this.lstTipoParametro = data.datoAdicional;
        //console.log('this.lstTipoParametro', this.lstTipoParametro);

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

  async fnListarParametros() {
    this.fShowSkeleton = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarABM_TipoParam(this.sTipoParam));
      if (data.exito) {
        this.lstParametros = data.datoAdicional;
        //console.log('this.lstNivelIncer', this.lstParametros);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkeleton = false;
  }

  async fnNuevoParametro(form: NgForm) {
    try {
      if (form.invalid) {
        return
      }
      this.loadRegOEdit = true;
      if (this.isEditarParametro) {
        let objetEditar = {
          nIdParametro: this.model.nIdParametro,
          boEstado: this.model.boEstado,
          sValor: this.model.sValor?.replace(/\s+/g, ' ').trim()

        }
        //console.log('objetEditar', objetEditar);
        let data: IDataResponse = await lastValueFrom(this.parametroService.regOActualParametro(objetEditar));

        if (data.exito) {
          this.loadRegOEdit = false;
          this.fnListarParametros();
          this.modalService.dismissAll();
        } else {
          this.loadRegOEdit = false;
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        }
      } else {
        let objetRegistrar = {
          nIdParametro: -1,
          sTipo: this.sTipoParam,
          sCodigo: this.model.sCodigo?.replace(/\s+/g, ' ').trim().toUpperCase(),
          sValor: this.model.sValor?.replace(/\s+/g, ' ').trim(),
          boEstado: this.model.boEstado
        }
        //console.log('objetRegistrar', objetRegistrar);
        let data: IDataResponse = await lastValueFrom(this.parametroService.regOActualParametro(objetRegistrar));

        if (data.exito) {
          this.loadRegOEdit = false;
          this.fnListarParametros();
          this.modalService.dismissAll();
          this.toastr.success(data.mensajeUsuario, 'Éxito');
        } else {
          this.loadRegOEdit = false;
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        }
      }
    } catch (error) {
      this.loadRegOEdit = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnEliminarParametro() {
    try {
      this.loadEliminar = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.eliminarParametro(this.model.nIdParametro));
      if (data.exito) {
        this.lstParametros = []
        this.fnListarParametros();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;
  }
}
