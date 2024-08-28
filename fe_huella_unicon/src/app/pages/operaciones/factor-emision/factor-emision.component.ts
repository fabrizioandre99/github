import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { FactorEmision } from 'src/app/models/factorEmision';
import { IUsuario } from 'src/app/models/usuario';
import { FactorEmisionService } from 'src/app/services/factor-emision.service';
import { FuenteEmisionService } from 'src/app/services/fuente-emision.service';
import { NivelActividadService } from 'src/app/services/nivel-actividad.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-factor-emision',
  templateUrl: './factor-emision.component.html',
  styleUrls: ['./factor-emision.component.css']
})
export class FactorEmisionComponent implements OnInit {
  oUsuario: IUsuario;
  lstAnio: any[] = [];
  lstFuentesEmision: any[] = [];
  lstFactorEmision: any[] = [];
  esRegexFactores = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;
  regexUnidadVC = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;

  page = 1;
  pageSize = 10;
  total = 0;

  fShowSkeleton: boolean = false;
  fShowGenerarFE: boolean = false;
  loading: boolean = false;
  loadEliminar: boolean = false;
  loadGuardar: boolean = false;
  loadReCalcularGEI: boolean = false;
  showCalcularGEI: boolean = false;

  lstSkeleton = Array(3);

  model: FactorEmision = new FactorEmision();
  modal: any = {};
  currentYear: number = new Date().getFullYear();

  constructor(private seguridadService: SeguridadService, private toastr: ToastrService, private factorEmisionService: FactorEmisionService,
    private fuenteEmisionService: FuenteEmisionService, private modalService: NgbModal, private nivelActividadService: NivelActividadService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.currentYear = new Date().getFullYear();
      this.fnListarAnio();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    // Formatear solo los decimales sin comas en las unidades
    const formattedDecimals = truncatedValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '');

    return formattedDecimals;
  }

  openConfirmacion(contentConfirmacion: any) {
    this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarAnio() {
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarAnio());
      if (data.exito) {
        this.lstAnio = data.datoAdicional;
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

  async fnListarFuenteEmision() {
    try {
      let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarPorFactor(this.model.nAnio));
      if (data.exito) {
        this.lstFuentesEmision = data.datoAdicional;
        //console.log('this.lstFuentesEmision', this.lstFuentesEmision);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnListarFactorEmision() {
    this.fShowSkeleton = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarFactorEmision(this.model.nAnio, this.model.oFuenteEmision.nIdFuenteEmision));
      if (data.exito) {
        this.page = 1;
        this.lstFactorEmision = data.datoAdicional;
        //console.log('lstFactorEmision', this.lstFactorEmision);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkeleton = false;
  }

  canShowButton(): boolean {
    const selectedYear = this.model.nAnio; // Año seleccionado
    const maxYear = Math.max(...this.lstAnio.map(item => item.nAnio)); // Año máximo en la lista
    const minYear = Math.min(...this.lstAnio.map(item => item.nAnio)); // Año mínimo en la lista

    // Verifica si el año seleccionado es el año actual y no hay años mayores al actual en la lista
    if (selectedYear === this.currentYear && maxYear <= this.currentYear) {
      return true;
    }

    // Verifica si todos los años en la lista son menores al año actual
    if (maxYear < this.currentYear && minYear < this.currentYear) {
      return selectedYear === maxYear;
    }

    return false;
  }

  async eliminarFactorEmision() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.eliminarFactorEmision(this.model.nAnio));
      if (data.exito) {
        this.model.nAnio = null!;
        this.fnListarAnio();
        this.fnListarFactorEmision();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    } this.loadEliminar = false;
  }

  openEliminar(contentEliminar: any) {
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async insertarCargaMasiva() {
    this.loading = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.cargaMasiva());
      if (data.exito) {
        this.fnListarAnio();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loading = false;
  }

  async fnReCalcularGei() {
    this.loadReCalcularGEI = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.reCalcularGei(this.model.nAnio, this.model.oFuenteEmision.nIdFuenteEmision));
      if (data.exito) {
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadReCalcularGEI = false;
  }

  changeAnio() {
    this.fnListarFactorEmision();
    this.fnListarFuenteEmision();
  }

  changeFuentesEmision() {
    this.fnListarFactorEmision();
  }

  editarFactor(item: any) {
    item.bdFeCO2_mod = item.bdFeCO2;
    item.bdFeCH4_mod = item.bdFeCH4;
    item.bdFeN2O_mod = item.bdFeN2O;
    item.bdFeCO2e_mod = item.bdFeCO2e;
    item.bdValorConversion_mod = item.bdValorConversion;
    item.edit = true;
  }

  async actualizarFactorSEIN(item: any) {
    if ((item.bdFeCO2 !== -1 && !this.esRegexFactores.test(item.bdFeCO2_mod)) ||
      (item.bdFeCH4 !== -1 && !this.esRegexFactores.test(item.bdFeCH4_mod)) ||
      (item.bdFeN2O !== -1 && !this.esRegexFactores.test(item.bdFeN2O_mod)) ||
      (item.bdFeCO2e !== -1 && !this.esRegexFactores.test(item.bdFeCO2e_mod)) ||
      (item.bdValorConversion !== -1 && !this.esRegexFactores.test(item.bdValorConversion_mod))) {
      this.toastr.warning('Solo se permiten un máximo de 8 unidades y 10 decimales en los factores de emisión.', 'Advertencia');
      return;
    }

    if (!item.bdFeCO2_mod?.toString().trim() ||
      !item.bdFeCH4_mod?.toString().trim() ||
      !item.bdFeN2O_mod?.toString().trim() ||
      !item.bdFeCO2e_mod?.toString().trim() ||
      !item.bdValorConversion_mod?.toString().trim()) {
      this.toastr.warning('Complete todos los campos', 'Advertencia');
      return;
    }

    const haCambiado = (
      item.bdFeCO2.toString() !== item.bdFeCO2_mod.toString() ||
      item.bdFeCH4.toString() !== item.bdFeCH4_mod.toString() ||
      item.bdFeN2O.toString() !== item.bdFeN2O_mod.toString() ||
      item.bdFeCO2e.toString() !== item.bdFeCO2e_mod.toString() ||
      item.bdValorConversion.toString() !== item.bdValorConversion_mod.toString()
    );


    item.bdFeCO2 = item.bdFeCO2_mod;
    item.bdFeCH4 = item.bdFeCH4_mod;
    item.bdFeN2O = item.bdFeN2O_mod;
    item.bdFeCO2e = item.bdFeCO2e_mod;
    item.bdValorConversion = item.bdValorConversion_mod;
    item.edit = false;


    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarFactorEmision(
      item.nIdFactorEmision,
      item.bdFeCO2_mod,
      item.bdFeCH4_mod,
      item.bdFeN2O_mod,
      item.bdFeCO2e_mod,
      item.bdValorConversion_mod
    ));

    if (data.exito) {
      if (haCambiado) {
        this.showCalcularGEI = true;
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  async openActualizarFactorModal(item: any, contentGuardar: any) {

    if ((item.bdFeCO2 !== -1 && !this.esRegexFactores.test(item.bdFeCO2_mod)) ||
      (item.bdFeCH4 !== -1 && !this.esRegexFactores.test(item.bdFeCH4_mod)) ||
      (item.bdFeN2O !== -1 && !this.esRegexFactores.test(item.bdFeN2O_mod)) ||
      (item.bdFeCO2e !== -1 && !this.esRegexFactores.test(item.bdFeCO2e_mod)) ||
      (item.bdValorConversion !== -1 && !this.esRegexFactores.test(item.bdValorConversion_mod))) {
      this.toastr.warning('Solo se permiten un máximo de 8 unidades y 10 decimales en los factores de emisión.', 'Advertencia');
      return;
    }

    if (!item.bdFeCO2_mod?.toString().trim() || !item.bdFeCH4_mod?.toString().trim() || !item.bdFeN2O_mod?.toString().trim() || !item.bdFeCO2e_mod?.toString().trim() || !item.bdValorConversion_mod?.toString().trim()
    ) {
      this.toastr.warning('Complete todos los campos', 'Advertencia');
      return
    }

    this.modal.nIdFactorEmision = item.nIdFactorEmision;
    this.modal.bdFeCO2_mod = item.bdFeCO2_mod;
    this.modal.bdFeCH4_mod = item.bdFeCH4_mod;
    this.modal.bdFeN2O_mod = item.bdFeN2O_mod;
    this.modal.bdFeCO2e_mod = item.bdFeCO2e_mod;
    this.modal.bdValorConversion_mod = item.bdValorConversion_mod;

    this.modalService.open(contentGuardar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async actualizarFactorModal() {
    this.loadGuardar = true;

    // Itera a través de las propiedades de this.modal
    for (const prop in this.modal) {
      if (this.modal.hasOwnProperty(prop) && prop !== 'nIdFactorEmision') {
        if (this.modal[prop] === '-1.00000000') {
          this.modal[prop] = null;
        }
      }
    }

    //console.log('this.modal', this.modal);

    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarFactorEmision(this.modal.nIdFactorEmision, this.modal.bdFeCO2_mod, this.modal.bdFeCH4_mod, this.modal.bdFeN2O_mod, this.modal.bdFeCO2e_mod, this.modal.bdValorConversion_mod));
    if (data.exito) {
      this.lstFactorEmision.forEach(item => {
        if (item.edit && item.nIdFactorEmision === this.modal.nIdFactorEmision) {
          item.bdFeCO2 = this.modal.bdFeCO2_mod;
          item.bdFeCH4 = this.modal.bdFeCH4_mod;
          item.bdFeN2O = this.modal.bdFeN2O_mod;
          item.bdFeCO2e = this.modal.bdFeCO2e_mod;
          item.bdValorConversion = this.modal.bdValorConversion_mod;
          item.edit = false;

        }
      });
      this.toastr.success(data.mensajeUsuario, 'Éxito');
      this.modalService.dismissAll();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.loadGuardar = false;
  }
}
