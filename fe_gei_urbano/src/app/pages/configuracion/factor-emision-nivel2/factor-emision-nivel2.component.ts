import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { FactorEmision } from '../../../models/factorEmision';
import { IUsuario } from '../../../models/usuario';
import { FactorEmisionService } from '../../../services/factor-emision.service';
import { SeguridadService } from '../../../services/seguridad.service';
import { Router } from '@angular/router';
import { ParametroService } from '../../../services/parametro.service';
import { SharedDataService } from '../../../services/shared-data.service';


@Component({
  selector: 'app-factor-emision-nivel2',
  templateUrl: './factor-emision-nivel2.component.html',
  styleUrl: './factor-emision-nivel2.component.css'
})
export class FactorEmisionNivel2Component {
  oUsuario: IUsuario;
  lstFactorEmision: any[] = [];
  esRegexFactores = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;
  regexUnidadVC = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;

  page = 1;
  pageSize = 10;
  total = 0;

  fShowSkeleton: boolean = false;
  loading: boolean = false;
  loadEliminar: boolean = false;
  loadGuardar: boolean = false;
  showCalcularGEI: boolean = false;

  sCodCategoria: string;
  sCodCombustible: string;
  sCodTipoVehiculo: string;
  sNombreTecnologia: string;

  lstCategorias: any[] = [];
  lstCombustible: any[] = [];
  lstTipoVehiculo: any[] = [];
  lstSkeleton = Array(3);

  model: FactorEmision = new FactorEmision();
  modal: any = {};

  boDisableCategoria: boolean = false;

  constructor(private router: Router, private seguridadService: SeguridadService, private toastr: ToastrService, 
    private factorEmisionService: FactorEmisionService, private modalService: NgbModal, 
    private parametroService: ParametroService, private sharedData: SharedDataService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarCategorias();
      this.fnListarCombustible();
      this.fnListarTipoVehiculo();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
    this.sharedData.setTecnologia(null);
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

  async fnListarCategorias() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo("CATEGORIA_VEHICULO"));

      console.log('data categoría', data);
      if (data.exito) {
        this.lstCategorias = data.datoAdicional;
        console.log(this.lstCategorias);
        if(this.lstCategorias.length == 1) this.boDisableCategoria = true;
        if(this.sharedData.itemTecnologia)  {
          this.sCodCategoria = this.sharedData.itemTecnologia.sCodCategoria!;
          this.sNombreTecnologia = this.sharedData.itemTecnologia.sNombre!;
        }
        else if(this.sCodCategoria == undefined) this.sCodCategoria = this.lstCategorias[0].sCodigo;
        
        console.log(this.sCodCategoria);
        this.fShowSkeleton = false;
        if(this.sCodTipoVehiculo != undefined && this.sCodCombustible != undefined) this.fnListarFactorEmision();
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
        
        if(this.sharedData.itemTecnologia) {
          this.sCodCombustible = this.sharedData.itemTecnologia.sCodCombustible!;
          this.sNombreTecnologia = this.sharedData.itemTecnologia.sNombre!;
        } else if(this.sCodCombustible == undefined) this.sCodCombustible = this.lstCombustible[0].sCodFactor;

        this.fShowSkeleton = false;
        if(this.sCodCategoria != undefined && this.sCodTipoVehiculo != undefined) this.fnListarFactorEmision();
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

        if(this.sharedData.itemTecnologia) {
          this.sCodTipoVehiculo = this.sharedData.itemTecnologia.sCodTipoVehiculo!;
          this.sNombreTecnologia = this.sharedData.itemTecnologia.sNombre!;
        } else if(this.sCodTipoVehiculo == undefined) this.sCodTipoVehiculo = this.lstTipoVehiculo[0].sCodFactor;
        
        this.fShowSkeleton = false;
        if(this.sCodCategoria != undefined && this.sCodCombustible != undefined) this.fnListarFactorEmision();
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarFactorEmision() {
    this.fShowSkeleton = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarFactorEmisionNivel2(this.sCodCategoria, this.sCodCombustible, this.sCodTipoVehiculo));
      if (data.exito) {
        this.page = 1;
        this.lstFactorEmision = data.datoAdicional;
        console.log('lstFactorEmision', this.lstFactorEmision);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkeleton = false;
  }

  openEliminar(contentEliminar: any) {
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  editarFactor(item: any) {
    item.bdFeCH4_mod = item.bdFeCH4;
    item.bdFeN2O_mod = item.bdFeN2O;   
    item.edit = true;
  }

  async actualizarFactorEmision(item: any) {
    if ((item.bdFeCH4 !== undefined && !this.esRegexFactores.test(item.bdFeCH4_mod)) ||
      (item.bdFeN2O !== undefined && !this.esRegexFactores.test(item.bdFeN2O_mod))
      ) {
      this.toastr.warning('Solo se permiten un máximo de 8 unidades y 10 decimales en los factores de emisión.', 'Advertencia');
      return;
    }

    if (!item.bdFeCH4_mod?.toString().trim() || !item.bdFeN2O_mod?.toString().trim()) {
      this.toastr.warning('Complete todos los campos', 'Advertencia');
      return;
    }

    const haCambiado = (
      item.bdFeCH4.toString() !== item.bdFeCH4_mod.toString() || item.bdFeN2O.toString() !== item.bdFeN2O_mod.toString()
      );

    item.bdFeCH4 = item.bdFeCH4_mod;
    item.bdFeN2O = item.bdFeN2O_mod;  
    item.edit = false;


    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarFactorEmisionNivel2(
      item.nIdFactorEmision,
      item.bdFeCH4_mod,
      item.bdFeN2O_mod
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

}
