import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ResultadosGEI } from 'src/app/models/resultadosGEI';
import { IUsuario } from 'src/app/models/usuario';
import { LocacionService } from 'src/app/services/locacion.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { UnidadNegocioService } from 'src/app/services/unidad-negocio.service';

@Component({
  selector: 'app-resultados-gei',
  templateUrl: './resultados-gei.component.html',
  styleUrls: ['./resultados-gei.component.css']
})
export class ResultadosGeiComponent implements OnInit, OnDestroy {

  lstNivelActividad: any[] = [];
  lstPeriodo: any[] = [];
  lstMes: any[] = [];
  lstEmpresa: any[] = [];
  lstUnidadNegocio: any[] = [];
  lstLocacion: any[] = [];
  lstResultadoGEI: any;

  model: ResultadosGEI = new ResultadosGEI();

  fShowSkeleton: boolean = false;
  loadingBuscar: boolean = false;
  buscarAutomatico: boolean = false;
  loadingEliminar: boolean = false;

  lstSkeleton = Array(3);
  oUsuario: IUsuario;

  page = 1;
  pageSize = 10;
  total = 0;
  selectedMes: any;

  totalEmisiones: any;


  esNaN(valor: number): boolean {
    return isNaN(valor);
  }

  constructor(private periodoService: PeriodoService, private parametroService: ParametroService,
    private unidadNegocioService: UnidadNegocioService,
    private locacionService: LocacionService, private seguridadService: SeguridadService,
    private toastr: ToastrService, private sharedData: SharedDataService) {
  }

  ngOnInit(): void {

    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {

      //console.log('GET nIdPeriodo -->', this.sharedData.itemPeriodo);
      if (this.sharedData.itemPeriodo) {
        this.model.nIdPeriodo = parseInt(this.sharedData.itemPeriodo.nIdPeriodo!);
        this.fShowSkeleton = true;
      }

      this.model.sCodMes = -1;
      this.model.sCodEmpresa = -1;
      this.model.oUnidadNegocio.nIdUnidadNegocio = -1;
      this.model.oLocacion.nIdLocacion = -1;

      //Una vez de terminar de procesar las funciones, listar la tabla si hay nIdPeriodo de la /bandeja-periodos
      Promise.all([this.fnListarPeriodo(), this.fnListarMes(), this.fnListarEmpresas(), this.fnListarUnidadNegocio()]).then(() => {
        if (this.sharedData.itemPeriodo) {
          //this.model.nIdPeriodo = parseInt(localStorage.getItem('nIdPeriodo')!);
          this.buscarAutomatico = true;
          this.fnResultadoGEI();
        }
      });
    }
    //console.log('this.sharedData.itemPeriodo', this.sharedData.itemPeriodo);
  }
  ngOnDestroy() {
    this.sharedData.setPeriodo(null);
  }

  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
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

      //Si se obtiene el nIdPeriodo desde /bandeja-periodos asignar el mes anterior al actual al select
      if (this.sharedData.itemPeriodo?.sCodMes) {
        //Se actualiza el mes de la fecha actual restando 1 al valor del mes actual.
        const fechaActual = new Date();
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        const mesActualMesAnterior = fechaActual.toLocaleString('default', { month: 'short' });
        this.selectedMes = this.lstMes.find(mes => mes.sValor.substring(0, 3).toUpperCase() === mesActualMesAnterior.toUpperCase());

        this.model.sCodMes = this.sharedData.itemPeriodo.sCodMes!;
        this.model.sCodMes_Reg = this.sharedData.itemPeriodo.sCodMes!;
        // this.fShowSkeleton = false;
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarEmpresas() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('EMPRESA'));
    if (data.exito) {
      this.lstEmpresa = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarUnidadNegocio() {
    let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnidadNegocio());
    if (data.exito) {
      this.lstUnidadNegocio = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  changeSubUnidad() {
    this.model.oLocacion.nIdLocacion = -1;
    this.fnListarLocacion();
  }

  async fnListarLocacion() {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarLocacion(this.model.oUnidadNegocio.nIdUnidadNegocio));

      if (data.exito) {
        this.lstLocacion = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnResultadoGEI() {
    try {
      if (!this.buscarAutomatico) { this.loadingBuscar = true; }

      this.lstResultadoGEI = [];
      this.totalEmisiones = null;
      this.fShowSkeleton = true;

      let codMes = this.model.sCodMes;
      let idLocacion = this.model.oLocacion.nIdLocacion;
      let idUnidadNegocio = this.model.oUnidadNegocio.nIdUnidadNegocio;
      let codEmpresa = this.model.sCodEmpresa;

      if (this.model.sCodMes == -1) { codMes = null! }
      if (this.model.oLocacion.nIdLocacion == -1) { idLocacion = null! }
      if (this.model.oUnidadNegocio.nIdUnidadNegocio == -1) { idUnidadNegocio = null! }
      if (this.model.sCodEmpresa == -1) { codEmpresa = null! }

      let data: IDataResponse = await lastValueFrom(this.periodoService.resultadoGEI(this.model.nIdPeriodo, codMes, idLocacion, idUnidadNegocio, codEmpresa));

      if (data.exito) {
        this.lstResultadoGEI = [data.datoAdicional];
        this.totalEmisiones = this.lstResultadoGEI[0].bdTotalgeiCO2eq;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadingBuscar = false;
    this.fShowSkeleton = false;
    this.buscarAutomatico = false;
  }
}
