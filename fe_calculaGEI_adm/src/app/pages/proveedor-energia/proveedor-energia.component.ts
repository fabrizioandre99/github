import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { Proveedor } from 'src/app/models/proveedor';
import { ToastrService } from 'ngx-toastr';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { LocalDataService } from 'src/app/services/local-data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-proveedor-energia',
  templateUrl: './proveedor-energia.component.html',
  styleUrls: ['./proveedor-energia.component.css']
})
export class ProveedorEnergiaComponent implements OnInit {
  page = 1;
  pageSize = 10;
  total = 0;
  lstSector: any[] = [];
  lstSkeleton = Array(10);

  model: Proveedor = new Proveedor();
  submitModal: Boolean = false;
  loading: Boolean = false;
  isEditProveedor: Boolean = false;
  showFactores: boolean = false;
  fShowSkeleton: boolean = false;

  constructor(private modalService: NgbModal, private proveedorService: ProveedorService, private toastr: ToastrService
    , private localDataService: LocalDataService) { }

  ngOnInit(): void {
    this.fnListarProveedor();
    this.model.oProveedorEnergia.nCodEstado = 0;
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  openModalRegistrar(contentRegistrar: any) {
    this.model = new Proveedor;
    this.modalService.open(contentRegistrar, { centered: true, windowClass: "modal-proveedor" });
  }

  async fnListarProveedor() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.proveedorService.listarAdm());
      if (data.exito) {
        this.lstSector = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  async fnEliminarProveedor(item: any) {
    //console.log('item', item.nIdProveedor);
    let data: IDataResponse = await lastValueFrom(this.proveedorService.eliminarAdm(item.nIdProveedor, localStorage.getItem('SessionIdUsuario')!));
    if (data.exito) {
      this.fnListarProveedor();
      this.toastr.success('Se eliminó el proveedor', 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnInsertarProveedor(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.loading = true;
    //this.submitModal = true;
    if (!this.model.oProveedorEnergia?.sNombre?.trim()) {
      this.loading = false;
      return;
    }

    //Validar nCodEstado según el Toogle
    if (this.model.oProveedorEnergia.nCodEstado == true) {
      this.model.oProveedorEnergia.nCodEstado = 1;
    } else {
      this.model.oProveedorEnergia.nCodEstado = 0;
    }

    //Validar factores de emisión
    //if (this.model.oProveedorEnergia.nCodEstado == 1) {
    if (this.showFactores == true) {
      if (!this.model.nFeCO2?.toString()?.trim() || !this.model.nFeCH4?.toString()?.trim() || !this.model.nFeN2O?.toString()?.trim() || !this.model.nFeCO2eq?.toString()?.trim()) {
        this.loading = false;
        return;
      }
    }
    this.loading = true;

    if (this.isEditProveedor == true) {
      //Está en editar
      //console.log('----ESTÁ EN EDITAR----');
      let data: IDataResponse = await lastValueFrom(this.proveedorService.actualizarAdm(this.model.oProveedorEnergia.nIdProveedor, this.model.oProveedorEnergia.nEsNuevo, this.model.oProveedorEnergia.sNombre.replace(/\s{2,}/g, ' '), this.model.oProveedorEnergia.nCodEstado, localStorage.getItem('SessionIdUsuario')!, this.model.nFeCO2,
        this.model.nFeCH4, this.model.nFeN2O, this.model.nFeCO2eq));
      if (data.exito) {
        this.fnListarProveedor();
        this.modalService.dismissAll();
        this.model = new Proveedor;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } else {
      //Está en Insertar
      //console.log('----ESTÁ EN INSERTAR----');
      let data: IDataResponse = await lastValueFrom(this.proveedorService.insertarAdm(this.model.oProveedorEnergia.sNombre.replace(/\s{2,}/g, ' '), this.model.oProveedorEnergia.nCodEstado, localStorage.getItem('SessionIdUsuario')!, this.model.nFeCO2, this.model.nFeCH4, this.model.nFeN2O, this.model.nFeCO2eq));
      if (data.exito) {
        this.fnListarProveedor();
        this.modalService.dismissAll();
        this.model = new Proveedor;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    this.showFactores = false;
    //this.submitModal = false;
    this.loading = false;
  }

  async toogleTable(event: any, item: any) {
    if (item.boEsNuevo == true) {
      item.boCodEstado = false;
      event.currentTarget.checked = false;
      this.toastr.error('Debe ingresar los factores de emisión para activar la empresa', 'Alerta');
      return;
    }

    if (item.boEsNuevo == true) {
      item.nEsNuevo = 1;
    } else {
      item.nEsNuevo = 0;
    }

    if (event.currentTarget.checked == true) {
      item.nCodEstado = 1
    } else {
      item.nCodEstado = 0
    }
    this.model.oProveedorEnergia.nIdProveedor = item.nIdProveedor;
    this.model.oProveedorEnergia.sNombre = item.sNombre;
    this.model.oProveedorEnergia.nCodEstado = item.nCodEstado;
    this.model.oProveedorEnergia.nEsNuevo = item.nEsNuevo;

    //console.log('----ESTÁ EN EDITAR TOGGLE----');
    let data: IDataResponse = await lastValueFrom(this.proveedorService.actualizarAdm(this.model.oProveedorEnergia.nIdProveedor, this.model.oProveedorEnergia.nEsNuevo, this.model.oProveedorEnergia.sNombre?.replace(/\s{2,}/g, ' '), this.model.oProveedorEnergia.nCodEstado, localStorage.getItem('SessionIdUsuario')!));
    if (data.exito) {
      this.toastr.success('Se cambió el estado con éxito', 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  toogleModal(event: any) {
    //Si el toogle está activo en true y es nuevo se muestan los inputs de FE  y Si está checkeado está en registrar proveedor
    if (event.currentTarget.checked && this.model.oProveedorEnergia.boEsNuevo == true || event.currentTarget.checked && this.isEditProveedor == false) {
      this.showFactores = true;
    }
    else {
      this.showFactores = false;
    }
  }

  fnEditarProveedor(item: any, contentRegistrar: any) {
    //Limpiar todos los valores
    this.model = new Proveedor;

    //Cerrar Factores
    this.showFactores = false;
    this.model.nIdUsuario = item.nIdUsuario;
    this.model.oProveedorEnergia.nIdProveedor = item.nIdProveedor;
    this.model.oProveedorEnergia.nCodEstado = item.boCodEstado;
    this.model.oProveedorEnergia.boEsNuevo = item.boEsNuevo;
    this.model.oProveedorEnergia.nEsNuevo = item.nEsNuevo;
    this.model.oProveedorEnergia.sNombre = item.sNombre.trim();

    if (item.boCodEstado == true) {
      this.model.oProveedorEnergia.nCodEstado = 1;
    } else {
      this.model.oProveedorEnergia.nCodEstado = 0;
    }

    if (item.boEsNuevo == true) {
      this.model.oProveedorEnergia.nEsNuevo = 1;
    } else {
      this.model.oProveedorEnergia.nEsNuevo = 0;
    }
    //Si es Nuevo, abrir div de Factores de Emisión
    if (this.model.oProveedorEnergia.boEsNuevo == true && this.model.oProveedorEnergia.nCodEstado) {
      this.showFactores = true;
    }

    //Establecer booleano para poder editar
    this.isEditProveedor = true;

    this.modalService.open(contentRegistrar, { centered: true, windowClass: "modal-proveedor" }).result.then((result) => { }, (reason) => {
      this.modalService.dismissAll();
      this.showFactores = false;
      setTimeout(() => {
        this.isEditProveedor = false;
      }, 500);
    });
  }


  fnCloseModal() {
    this.modalService.dismissAll();
    this.showFactores = false;
    setTimeout(() => {
      this.isEditProveedor = false;
    }, 500);
  }
}
