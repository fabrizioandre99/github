import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { EmisionPlanta } from 'src/app/models/emisionPlanta';
import { IUsuario } from 'src/app/models/usuario';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { PlantaService } from 'src/app/services/planta.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UnidadNegocioService } from 'src/app/services/unidad-negocio.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { EmisionGeiService } from 'src/app/services/emision-gei.service';

@Component({
  selector: 'app-emisiones-planta',
  templateUrl: './emisiones-planta.component.html',
  styleUrls: ['./emisiones-planta.component.css']
})
export class EmisionesPlantaComponent implements OnInit {
  oUsuario: IUsuario;
  lstPeriodo: any[] = [];
  lstMes: any[] = [];
  lstEmpresa: any[] = [];
  lstUnidadNegocio: any[] = [];
  lstCatGeografica: any[] = [];
  lstLocacion: any[] = [];
  lstPlantaByLocacion: any[] = [];
  lstResultadoGEI: any[] = [];
  fShow: boolean = false;
  model: EmisionPlanta = new EmisionPlanta();
  fShowSkeleton: boolean = false;
  loadingBuscar: boolean = false;
  totalEmisiones: any;
  lstSkeleton = Array(4);
  modelfilter: any = {};

  esNaN(valor: number): boolean {
    return isNaN(valor);
  }

  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  constructor(private toastr: ToastrService, private seguridadService: SeguridadService, private periodoService: PeriodoService,
    private parametroService: ParametroService, private unidadNegocioService: UnidadNegocioService, private categoriaService: CategoriaService,
    private plantaService: PlantaService, private locacionService: LocacionService,
    private emisionGeiService: EmisionGeiService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {

      this.fShowSkeleton = true;
      this.fnListarPeriodo();
      this.fnListarMes();
      this.fnListarEmpresa();
      this.fnListarUnidadNegocio();
      this.fnListarCatGeografica();


      this.lstPlantaByLocacion.unshift({
        "nIdPlanta": -1,
        "sNombre": "Todos"
      });
      this.model.oPlanta.nIdPlanta = -1;
      this.fnListarLocacion();



    }
  }

  async listarResultadoGei() {
    let data: IDataResponse = await lastValueFrom(this.emisionGeiService.resultadoGeiPlanta(null!, null!,
      null!, null!, this.model.nIdPeriodo, null!, null!, null!, null!,
      null!));
    if (data.exito) {
      this.lstResultadoGEI = [data.datoAdicional];
      this.totalEmisiones = this.lstResultadoGEI[0].bdTotalgeiCO2eq;

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } this.fShowSkeleton = false;
  }

  getAnioById(nIdPeriodo: number): number {
    const periodo = this.lstPeriodo.find((item) => item.nIdPeriodo === nIdPeriodo);
    return periodo ? periodo.nAnio : null;
  }

  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        //console.log('this.lstPeriodo', this.lstPeriodo);
        this.model.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;

        if (this.model.nIdPeriodo) {
          this.listarResultadoGei();
        }
        //console.log('this.model.nIdPeriodo', this.model.nIdPeriodo);
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

  async fnListarMes() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('MES'));
    if (data.exito) {
      this.lstMes = data.datoAdicional.map((obj: { sCodigo: any; sValor: any; }) => ({ sCodigo: obj.sCodigo, sValor: obj.sValor }));
      this.lstMes.unshift({
        "sCodigo": -1,
        "sValor": "Todos"
      });
      this.model.sCodMes = -1;
      //console.log('this.lstMes', this.lstMes);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  changeSubUnidad() {
    this.fnListarLocacion();
  }


  async changeLocacion() {
    this.model.oPlanta.nIdPlanta = -1;

    let data: IDataResponse = await lastValueFrom(this.plantaService.listarByLocacion(this.model.oPlanta.nIdLocacion));
    if (data.exito) {

      this.lstPlantaByLocacion = data.datoAdicional;
      this.lstPlantaByLocacion.unshift({
        "nIdPlanta": -1,
        "sNombre": "Todos"
      });

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarEmpresa() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('EMPRESA'));
    if (data.exito) {
      this.lstEmpresa = data.datoAdicional;
      this.lstEmpresa.unshift({
        "sCodigo": -1,
        "sValor": "Todos"
      });
      this.model.sCodEmpresa = -1;
      //console.log('this.lstEmpresa', this.lstEmpresa);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  //Subunidad de negocio
  async fnListarUnidadNegocio() {
    let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnidadNegocio());

    if (data.exito) {
      this.lstUnidadNegocio = data.datoAdicional;

      this.lstUnidadNegocio.unshift({
        "nIdUnidadNegocio": -1,
        "sNombre": "Todos"
      });
      //console.log('lstUnidadNegocio', this.lstUnidadNegocio);
      this.model.nIdUnidadNegocio = -1;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarCatGeografica() {
    let data: IDataResponse = await lastValueFrom(this.categoriaService.listarByTipoYPadre(-1, 'G'));
    if (data.exito) {
      this.lstCatGeografica = data.datoAdicional;
      this.lstCatGeografica.unshift({
        "nIdCategoria": -1,
        "sNombre": "Todos"
      });
      this.model.nIdCatGeo = -1;
      //console.log('lstCatGeografica', this.lstCatGeografica);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  cleanPlanta() {
    this.fnListarLocacion();
    /*  this.model.oPlanta.nIdPlanta = -1 */
    this.model.oPlanta.nIdPlanta = -1;
    this.lstPlantaByLocacion = [];
    this.lstPlantaByLocacion.unshift({
      "nIdPlanta": -1,
      "sNombre": "Todos"
    });
  }

  async fnListarLocacion() {

    let idUnidadNegocio = this.model.nIdUnidadNegocio;
    let idCatGeo = this.model.nIdCatGeo;

    if (this.model.nIdUnidadNegocio == -1) { idUnidadNegocio = null! }
    if (this.model.nIdCatGeo == -1) { idCatGeo = null! }

    let data: IDataResponse = await lastValueFrom(this.locacionService.listarByUUNNYCategorias(idUnidadNegocio, null!, idCatGeo, null!, null!));
    if (data.exito) {

      this.lstLocacion = data.datoAdicional;
      this.lstLocacion.unshift({
        "nIdLocacion": -1,
        "sNombre": "Todos"
      });
      this.model.oPlanta.nIdLocacion = -1;

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  async fnResultadoGeiPlanta() {
    try {
      this.loadingBuscar = true;

      this.lstResultadoGEI = [];
      this.totalEmisiones = null;
      this.fShowSkeleton = true;

      let codMes = this.model.sCodMes;
      let sCodEmpresa = this.model.sCodEmpresa;
      let nIdCatGeo = this.model.nIdCatGeo;
      let nIdPlanta = this.model.oPlanta.nIdPlanta;
      let nIdLocacion = this.model.oPlanta.nIdLocacion;
      let subcatGeo_nIdCategoria = this.model.oPlanta.oSubcatGeo;
      let idUnidadNegocio = this.model.nIdUnidadNegocio;

      if (this.model.sCodMes == -1) { codMes = null! }
      if (this.model.sCodEmpresa == -1) { sCodEmpresa = null! }
      if (this.model.nIdCatGeo == -1) { nIdCatGeo = null! }
      if (this.model.oPlanta.nIdPlanta == -1) { nIdPlanta = null! }
      if (this.model.oPlanta.nIdLocacion == -1) { nIdLocacion = null! }
      if (this.model.oPlanta.oSubcatGeo == -1) { subcatGeo_nIdCategoria = null! }
      if (this.model.nIdUnidadNegocio == -1) { idUnidadNegocio = null! }

      const getAnio = this.lstPeriodo.find((item) => item.nIdPeriodo === this.model.nIdPeriodo);
      if (getAnio) { this.modelfilter.nAnio = getAnio.nAnio; }

      const getMes = this.lstMes.find((item: any) => item.sCodigo === this.model.sCodMes);
      if (getMes) { this.modelfilter.mes = getMes.sValor; }

      const getEmpresa = this.lstEmpresa.find((item: any) => item.sCodigo === this.model.sCodEmpresa);
      if (getEmpresa) { this.modelfilter.empresa = getEmpresa.sValor; }

      const getUnidadNegocio = this.lstUnidadNegocio.find((item: any) => item.nIdUnidadNegocio === this.model.nIdUnidadNegocio);
      if (getUnidadNegocio) { this.modelfilter.unidadNegocio = getUnidadNegocio.sNombre; }

      const getCatGeografica = this.lstCatGeografica.find((item: any) => item.nIdCategoria === this.model.nIdCatGeo);
      if (getCatGeografica) { this.modelfilter.catGeografica = getCatGeografica.sNombre; }

      const getLocacion = this.lstLocacion.find((item: any) => item.nIdLocacion === this.model.oPlanta.nIdLocacion);
      if (getLocacion) { this.modelfilter.locacion = getLocacion.sNombre; }

      const getPlanta = this.lstPlantaByLocacion.find((item: any) => item.nIdPlanta === this.model.oPlanta.nIdPlanta);
      if (getPlanta) { this.modelfilter.planta = getPlanta.sNombre; }

      let data: IDataResponse = await lastValueFrom(this.emisionGeiService.resultadoGeiPlanta(codMes, sCodEmpresa,
        nIdCatGeo, null!, this.model.nIdPeriodo, nIdPlanta, nIdLocacion, null!, null!,
        idUnidadNegocio));
      //console.log('data fnResultadoGeiPlanta', data);
      if (data.exito) {
        //console.log([data.datoAdicional].length);
        this.lstResultadoGEI = [data.datoAdicional];
        this.totalEmisiones = this.lstResultadoGEI[0].bdTotalgeiCO2eq;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShow = false;
    this.loadingBuscar = false;
    this.fShowSkeleton = false;
  }

  limpiarFiltro() {
    this.model.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;
    this.model.oPlanta.oSubcatGeo = -1;
    this.model.oPlanta.nIdPlanta = -1;
    this.model.sCodMes = -1;
    this.model.sCodEmpresa = -1;
    this.model.nIdUnidadNegocio = -1;
    this.model.nIdCatGeo = -1;
    this.model.oPlanta.nIdLocacion = -1;
  }
}


