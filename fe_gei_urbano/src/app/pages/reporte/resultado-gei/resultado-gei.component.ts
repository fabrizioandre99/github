import { Component } from '@angular/core';
import { IUsuario } from '../../../models/usuario';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { SeguridadService } from '../../../services/seguridad.service';
import { PeriodoService } from '../../../services/periodo.service';
import { ParametroService } from '../../../services/parametro.service';
import { RutaService } from '../../../services/ruta.service';
import { ResultadoGeiService } from '../../../services/resultado-gei.service';
import { SharedDataService } from '../../../services/shared-data.service';


@Component({
  selector: 'app-resultado-gei',
  templateUrl: './resultado-gei.component.html',
  styleUrl: './resultado-gei.component.css'
})
export class ResultadoGeiComponent {

  //Variables
  oUsuario: IUsuario;
  loadingDescargar: boolean = false;
  fShowSkeleton: boolean = false;

  sCodMes: string;
  nIdRuta: number;
  nIdPeriodo: number;

  lstMes: any[] = [];
  lstRuta: any[] = [];
  lstPeriodo: any[] = [];
  lstEmisionGei: any[] = [];
  lstTipoCombustible: any[] = [];

  lstSkeleton = Array(7);

  isCollapsed_nivel1: boolean[] = [];
  isCollapsed_nivel2: boolean[][] = [];

  boMostrarLoading: boolean = false;

  //Constructor
  constructor(
    private router: Router, private toastr: ToastrService, private seguridadService: SeguridadService,
    private periodoService: PeriodoService, private resultadoGeiService: ResultadoGeiService,
    private parametroService: ParametroService, private rutaService: RutaService, 
    private sharedData: SharedDataService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      //Colocamos los servicios a usar
      this.fShowSkeleton = true;
      this.fnListarPeriodo();
      this.fnListarMes();
      this.fnListarRutas();
    }
  }

  ngOnDestroy() {
    this.sharedData.setPeriodo(null);
  }

  //ListarEmisionesGEI
  async fnListarEmisionesGEI() {
    try {
      let sCodMes = (this.sCodMes === '-1' ? null : this.sCodMes);
      let nIdRuta = (this.nIdRuta === -1 ? null : this.nIdRuta);
      let data: IDataResponse = await lastValueFrom(this.resultadoGeiService.listarNivelActividad(this.nIdPeriodo, sCodMes, nIdRuta));
      
      if (data.exito) {
        this.lstEmisionGei = data.datoAdicional;
        this.isCollapsed_nivel1 = new Array(this.lstEmisionGei.length).fill(true);
        this.isCollapsed_nivel2 = this.lstEmisionGei.map(emision => 
          Array.from({ length: emision.liRuta.length }, () => true)
        );

        if(this.lstEmisionGei.length != 0) {
          this.isCollapsed_nivel1[0] = false;
          this.isCollapsed_nivel2[0][0] = false;
        }
        
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      console.log(this.lstEmisionGei);
    } catch (error: any) {
      console.log(error);
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        
        if(this.sharedData.itemPeriodo) {
          this.nIdPeriodo = parseInt(this.sharedData.itemPeriodo.nIdPeriodo!);
        } else {
          this.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;
        }
        this.fnListarEmisionesGEI();
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      console.log(this.lstPeriodo);
    } catch (error: any) {
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async fnListarMes() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo('MES'));
      if (data.exito) {

        this.lstMes = data.datoAdicional;
        if(this.lstMes.length != 0) this.sCodMes = "-1";
        //this.sCodMes = this.lstMes[0].sCodigo;
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async fnListarRutas() {
    try {
      let data: IDataResponse = await lastValueFrom(this.rutaService.listarRutasActivas());
      if (data.exito) {

        this.lstRuta = data.datoAdicional;
        this.fShowSkeleton = false;
        if(this.lstRuta.length != 0) this.nIdRuta = -1;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async fnDescargarZip() {
    this.boMostrarLoading = true;
    try {
      let periodoSeleccionado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.nIdPeriodo);
      let nAnioSeleccionado = periodoSeleccionado.nAnio;
      
      let data = await lastValueFrom(this.resultadoGeiService.descargarZip(this.nIdPeriodo, nAnioSeleccionado));
      const tipoDeDatos = getDataType(data);

      if(tipoDeDatos === 1) {
        const myJsonData: IDataResponse = arrayBufferAJson(data);
        this.toastr.warning(myJsonData.mensajeUsuario, 'Advertencia');
      } else {
        let data = await lastValueFrom(this.resultadoGeiService.descargarZip(this.nIdPeriodo, nAnioSeleccionado));
        const blob = new Blob([data as unknown as BlobPart])
        let filename = "Reporte_emisiones_" + nAnioSeleccionado + ".zip";
        const a = document.createElement('a');
        a.download = filename;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
      }
      this.boMostrarLoading = false;
    } catch (error: any) {
      this.boMostrarLoading = false;
      this.router.navigate(['/error-500']);
    }
  }

  ChangeCollapse(objeto: any) {
    objeto.collapse = !objeto.collapse;
  }

}

function getDataType(arrayBuffer: ArrayBuffer): number | null {
  const texto = new TextDecoder().decode(arrayBuffer);
  try {
    const json = JSON.parse(texto);
    return 1;
  } catch (error) {
    return null;
  }
}

function arrayBufferAJson(arrayBuffer: ArrayBuffer): any {
  const texto = new TextDecoder().decode(arrayBuffer);
  return JSON.parse(texto);
}