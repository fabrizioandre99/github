import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { SeguridadService } from '../../../services/seguridad.service';
import { ParametroService } from '../../../services/parametro.service';
import { IUsuario } from '../../../models/usuario';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { RutaService } from '../../../services/ruta.service';
import { PeriodoService } from '../../../services/periodo.service';
import { NivelActividadService } from '../../../services/nivel-actividad.service';
import { FactorEmisionService } from '../../../services/factor-emision.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Vehiculo } from '../../../models/vehiculo';
import { environment } from '../../../../environments/environment';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-datos-actividad',
  templateUrl: './datos-actividad.component.html',
  styleUrl: './datos-actividad.component.css'
})
export class DatosActividadComponent {

  esRegexFactores = /^(?!\.)(\d{1,4}|\d{1,4}[.]|\d{0,4}\.\d{0,2}?)$/;

  lstMes: any[] = [];
  lstRuta: any[] = [];
  lstPeriodo: any[] = [];
  lstNivelActividad: any[] = [];
  lstTipoCombustible: any[] = [];
  lstVehiculoNoINS: any[] = [];
  lstEliminarNA: any[] = [];
  lstNaObservados: any[] = [];

  lstSkeleton = Array(7);

  sCodMes: string;
  nIdRuta: number;
  nIdPeriodo: number;
  nViajesDefecto: number;
  nNAFaltantes: number = 0;

  isEdit: boolean = false;
  isClosed: boolean = false;

  oUsuario: IUsuario;
  loadingGuardar: boolean = true;
  fShowSkeleton: boolean = false;
  
  page = 1;
  pageSize = 10;

  pageB = 1;
  pageSizeB = 10;

  pageObs = 1;
  pageSizeObs = 5;

  pageObsNoCalc = 1;
  pageSizeObsNoCalc = 5;

  boEsDefecto: boolean;
  boCargaMasiva: boolean = false;
  boMostrarRendimiento: Boolean = true;
  boReportaEmiNoDef: boolean = false;

  loadRegLocacion: boolean = false;
  xlsxCargaMasiva: any = new Vehiculo();
  getDescargas: any = {};
  selectedFileName: string | undefined = 'Seleccionar archivo';

  sNombreRuta: string;
  nAnio: number;
  sMes: string;
  boLoadDefecto: boolean = false;
  boShowErrorReg: boolean = false;

  boMostrarLoading = false;
  boConObsCalculables = true;

  @ViewChildren('fileCargaDa') fileCargaDa: QueryList<ElementRef>;

  constructor(private router: Router, private toastr: ToastrService, private rutaService: RutaService,
    private datosActividadService: NivelActividadService, private factorService: FactorEmisionService,
    private seguridadService: SeguridadService, private parametroService: ParametroService,
    private periodoService: PeriodoService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fShowSkeleton = true;
      this.xlsxCargaMasiva.Filename = this.selectedFileName;
      this.getDescargas.FormatoCargaMasiva = environment.descargas.FormatoCargaDatosActividad;
      this.fnListarPeriodo();
      this.fnListarMes();
      this.fnListarRutas();
      this.fnListarTipoCombustible();
    }
  }

  async fnListarMes() {
    this.loadingGuardar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo('MES'));
      if (data.exito) {
        this.lstMes = data.datoAdicional;
        this.sCodMes = this.lstMes[0].sCodigo;
        if(this.nIdPeriodo != undefined && this.nIdRuta != undefined) this.fnListarNivelActividad();
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarRutas() {
    this.loadingGuardar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.rutaService.listarRutasActivas());
      if (data.exito) {
        this.lstRuta = data.datoAdicional;
        this.nIdRuta = this.lstRuta[0].nIdRuta;
        if(this.nIdPeriodo != undefined && this.sCodMes != undefined) this.fnListarNivelActividad();
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarPeriodo() {
    this.loadingGuardar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        //this.lstPeriodo = this.lstPeriodo.filter((item) => item.nEstadoPeriodo === 0);
        if(this.lstPeriodo.length != 0) this.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;
        else {
          this.fShowSkeleton = false;
          this.loadingGuardar = false;
        }
          if(this.sCodMes != undefined && this.nIdRuta != undefined) this.fnListarNivelActividad();
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarNivelActividad() {
    this.isClosed = false;
    if (this.nIdPeriodo === undefined || this.sCodMes === undefined || this.nIdRuta === undefined) return;
    this.fShowSkeleton = true;

    this.lstPeriodo.map((item) => {
      //console.log(this.nIdPeriodo);
      if (item.nIdPeriodo === this.nIdPeriodo && item.nEstadoPeriodo != 0) {
        this.isClosed = true;
        this.isEdit = false;
        //console.log(this.isEdit);
      }
    });

    this.lstEliminarNA = [];
    try {
      let data: IDataResponse = await lastValueFrom(this.datosActividadService.listarNivelActividad(this.nIdPeriodo, this.sCodMes, this.nIdRuta));
      if (data.exito) {
        this.lstNivelActividad = data.datoAdicional;
        console.log(this.lstNivelActividad);
        this.lstNivelActividad.map((item) => item.checked = true);
        this.isEdit = false;
        this.fShowSkeleton = false;
        this.fnObtenerDatos();
        
        this.boReportaEmiNoDef = this.lstNivelActividad.some(elem => !elem.boEsDefecto && elem.boReportaEmisiones);
        
        let sumaRendimiento: number = 0;
        let nFaltantes: number = 0;
        this.lstNivelActividad.forEach(function(item) {
          if(item.bdRendimiento == null && item.bdConsumoMensual == null && item.bdConsumoCalculado == null) nFaltantes++;
          if(item.bdRendimiento !== null) sumaRendimiento += item.bdRendimiento;
        });
        this.nNAFaltantes = nFaltantes;
        if(sumaRendimiento > 0) this.boMostrarRendimiento = true;
        else false;
        const boDefecto: boolean | undefined = this.lstNivelActividad.at(0)?.boEsDefecto;
        if(boDefecto != undefined) this.boEsDefecto = boDefecto;

        const bdTotalRendimiento = this.lstNivelActividad.reduce((acc, ele) => {
          return acc + ele.bdRendimiento;
        }, 0);
        if (bdTotalRendimiento != null && bdTotalRendimiento > 0 && bdTotalRendimiento != '' && !boDefecto) 
          this.boMostrarRendimiento = true;
      } else {
        this.fShowSkeleton = false;
        this.isEdit = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadingGuardar = false;
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarTipoCombustible() {
    try {
      let data: IDataResponse = await lastValueFrom(this.factorService.listarTipoCombustible());
      if (data.exito) {
        this.lstTipoCombustible = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnListarVehiculosNoINS(contentAgregarVehiculo: any, contentNaObservados: any) {
    let lstVehiculos = this.lstNivelActividad.map((item) => item.oVehiculo.nIdVehiculo);
    try {
      let data: IDataResponse = await lastValueFrom(this.datosActividadService.listarVehiculosNoINS(this.nIdRuta, lstVehiculos));
      if (data.exito) {
        this.fShowSkeleton = false;
        this.lstVehiculoNoINS = data.datoAdicional;
        this.lstVehiculoNoINS.map((item) => item.checked = false);
        if (this.lstVehiculoNoINS.length > 0)
          this.modalService.open(contentAgregarVehiculo, { centered: true, windowClass: "modal-md", backdrop: 'static' });
        else {
          if(!this.isEdit) {
            console.log("entra acá");
            this.closeModal();
            this.fnRegistrarNivelActividad(true, contentNaObservados);
          } else this.toastr.info("No existen vehículos sin registrar.", "Informativo");
        }
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnRegistrarNivelActividad(boDefecto: boolean, contentModal: any) {
    this.boMostrarLoading = true;
    //Eliminar nivel de actividad
    if (this.lstEliminarNA.length > 0) {
      try {
        let data: IDataResponse = await lastValueFrom(this.datosActividadService.eliminarNivelActividad(this.lstEliminarNA));
        if (!data.exito) {
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
          this.boMostrarLoading = false;
          return;
        }
      } catch (error: any) {
        if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
          this.seguridadService.logout(error.error.mensajeUsuario);
        } else this.router.navigate(['/error-500']);
      }
    }
    this.lstEliminarNA = [];

    if(this.lstNivelActividad.length === 0)  {
      this.isEdit = false;
      this.fShowSkeleton = false;
      this.fnListarNivelActividad();
      this.loadingGuardar = false;
      this.boMostrarLoading = false;
      this.toastr.info('No se encontraron datos de actividad para registrar', 'Éxito');
      return;
    }

    const lstNa = this.lstNivelActividad.map(oNa => {
      return {
          ...oNa,
          nIdPeriodo: this.nIdPeriodo,
          sCodMes: this.sCodMes,
          bdConsumoMensual: boDefecto ? null : (this.isEdit && oNa.bdConsumoMensual == null) ?
            oNa.bdConsumoCalculado : oNa.bdConsumoMensual,
          bdRendimiento: boDefecto ? null : oNa.bdRendimiento,
          bdNumViajes: boDefecto ? null : oNa.bdNumViajes,
          boEsDefecto: boDefecto,
      };
    });
    this.loadingGuardar = true;

    try {
      let data: IDataResponse = await lastValueFrom(this.datosActividadService.registrarNivelActividad(lstNa));
      if (data.exito) {
        this.isEdit = false;
        this.fShowSkeleton = false;
        this.fnListarNivelActividad();
        this.loadingGuardar = false;

        this.lstNaObservados = data.datoAdicional;
        console.log('observados', this.lstNaObservados); 
        if(this.lstNaObservados.length != 0) {
          if(this.lstNaObservados.some(elem => elem.boCalculableDefecto)) this.boConObsCalculables = true;
          else this.boConObsCalculables = false;
          console.log('boConObsCalculables', this.boConObsCalculables);
          this.openNaObservados(contentModal);
        }
        console.log('observados', this.lstNaObservados); 
        this.boReportaEmiNoDef = this.lstNivelActividad.some(elem => !elem.boEsDefecto && elem.boReportaEmisiones);
          
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.loadingGuardar = false;
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.modalService.dismissAll;
    this.boMostrarLoading = false;
  }

  async fnRegistrarDefecto() {
    this.boMostrarLoading = true;
    const lstObservados = this.lstNaObservados.filter(a => a.boCalculableDefecto);
    const lstNa = lstObservados.map(oNa => {
      return {
          ...oNa,
          nIdPeriodo: this.nIdPeriodo,
          sCodMes: this.sCodMes,
          bdConsumoMensual: null,
          bdRendimiento: null,
          bdNumViajes: this.nViajesDefecto,
          boEsDefecto: true,
      };
    });
    this.loadingGuardar = true;

    try {
      let data: IDataResponse = await lastValueFrom(this.datosActividadService.registrarNaMasivoDefecto(lstNa));
      if (data.exito) {
        this.fnListarNivelActividad();
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      this.fShowSkeleton = false;
      this.loadingGuardar = false;
      this.modalService.dismissAll();
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
      this.lstNaObservados = [];
      this.boConObsCalculables = true;
    }
    this.boMostrarLoading = false;
  }

  async fnCargaMasiva(contentNaObservados: any) {
    this.boMostrarLoading = true;
    try {
      if (!this.xlsxCargaMasiva.mfXlsxNa) {
        this.xlsxCargaMasiva.noFormat = true;
        this.toastr.warning('Inserte un archivo.', 'Advertencia');
        this.boMostrarLoading = false;
        return;
      }
      this.xlsxCargaMasiva.loading = true;

      let oNa = {
        oVehiculo: {
          nIdRuta: this.nIdRuta
        },
        nIdPeriodo: this.nIdPeriodo,
        sCodMes: this.sCodMes
      }

      let data: IDataResponse = await lastValueFrom(this.datosActividadService.cargaMasiva(this.xlsxCargaMasiva.mfXlsxNa, oNa));

      if (data.exito) {
        this.closeModal();
        this.lstNaObservados = data.datoAdicional;
        console.log('obs', this.lstNaObservados);
        this.fnListarNivelActividad();
        if(this.lstNaObservados.length != 0) this.openNaObservados(contentNaObservados);
        else this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      
      this.xlsxCargaMasiva.loading = false;
      this.xlsxCargaMasiva.Filename = this.selectedFileName;
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.boMostrarLoading = false;
  }

  async fnDescargarFormato() {
    this.boMostrarLoading = true;
    try {
      let oNa = {
        sNombreRuta: this.sNombreRuta,
        nAnio: this.nAnio,
        sMes: this.sMes
      }

      let data = await lastValueFrom(this.datosActividadService.descargarFormato(oNa));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = this.getDescargas.FormatoCargaMasiva;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();

    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje != undefined && (body.codMensaje >= 86 || body.codMensaje <= 99)) {
            this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
          this.router.navigate(['/error-500']);
        }
      };
      reader.readAsText(error.error);
    }
    this.boMostrarLoading = false;
  }

  addEliminarNivelActividad(item: any, padre: any[] = []) {
    if (item != undefined) {
      if (item.nIdNivelActividad > 0) this.lstEliminarNA.push(item.nIdNivelActividad);
      let idx = this.lstNivelActividad.indexOf(item);
      this.lstNivelActividad.splice(idx, 1);
    } else {
      this.lstEliminarNA.push(item.nIdNivelActividad);
      let idx = padre.indexOf(item);
      padre.splice(idx, 1);
    }
  }

  openVehiculosNoInscritos(contentNaObservados: any) {
    let liVehiculosSelected = this.lstVehiculoNoINS.filter((item) => item.checked);
    this.lstNivelActividad.push(...liVehiculosSelected);
    this.lstVehiculoNoINS = [];
    if(!this.isEdit) this.fnRegistrarNivelActividad(true, contentNaObservados);
    this.modalService.dismissAll();
  }

  openDefecto(contentDefecto: any, contentSelectVehiculo: any, contentNaObservados: any) {
    if(this.boReportaEmiNoDef)
      this.modalService.open(contentDefecto, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
    else this.fnListarVehiculosNoINS(contentSelectVehiculo, contentNaObservados);
  }

  async openCargaMasiva() {
    try {
      console.log('CargaMasiva', this.xlsxCargaMasiva);
      this.boCargaMasiva = !this.boCargaMasiva;
      console.log(this.boEsDefecto);
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  openNaObservados(contentNaObservados: any) {
    this.modalService.open(contentNaObservados, { centered: true, windowClass: "modal-md" , backdrop: 'static'});
  }

  //Carga masiva
  insertarCargaMasiva(event: any, xlsxCargaMasiva: any) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        xlsxCargaMasiva.mfXlsxNa = file;
        xlsxCargaMasiva.noFormat = false;
        xlsxCargaMasiva.Filename = file.name;
      } else {
        xlsxCargaMasiva.mfXlsxNa = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        xlsxCargaMasiva.noFormat = true;
      }
    }
  }

  closeModal() {
    this.boEsDefecto = false;
    this.boCargaMasiva = false;
    this.isEdit = false;
    this.modalService.dismissAll();
    this.fnListarNivelActividad();
  }

  closeModalObsv() {
    this.boEsDefecto = false;
    this.boCargaMasiva = false;
    this.isEdit = false;
    this.lstNaObservados = [];
    this.boConObsCalculables = true;
    this.modalService.dismissAll();
    this.fnListarNivelActividad();
  }

  fnIsEditable() {
    this.isEdit = true;
    this.boEsDefecto = false;
    this.boCargaMasiva = false;
  }

  fnObtenerDatos() {
    let elem = this.lstPeriodo.find(item => item.nIdPeriodo === this.nIdPeriodo);
    this.nAnio = elem.nAnio;

    elem = this.lstMes.find(item => item.sCodigo === this.sCodMes);
    this.sMes = elem.sValor;

    elem = this.lstRuta.find(item => item.nIdRuta === this.nIdRuta);
    this.sNombreRuta = elem.sNombre;
    
    console.log(this.nAnio + " - " + this.sMes + " - " + this.sNombreRuta);

    this.nViajesDefecto = this.lstNivelActividad.at(0).bdNumViajesDefecto;
  }

  triggerHiddenFileInput() {
    const fileInputElement: HTMLElement | null = document.querySelector(`[name="fileCargaDa"]`);
    if (fileInputElement) fileInputElement.click();
  }

  handleDragOverCargaMasiva(event: DragEvent) {
    event.preventDefault();
  }

  handleDropCargaMasiva(event: DragEvent, xlsxCargaMasiva: any) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0]; // Obtén el primer archivo
      const fileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        xlsxCargaMasiva.mfXlsxNa = file;
        xlsxCargaMasiva.noFormat = false;
        xlsxCargaMasiva.Filename = file.name;
      } else {
        xlsxCargaMasiva.mfXlsxNa = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        xlsxCargaMasiva.noFormat = true;
      }
    }
  }

  redireccionarVehiculo() {
    this.modalService.dismissAll();
    this.router.navigate(['/rutas']);
  }

}
