import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { NivelActividad } from 'src/app/models/nivelActividad';
import { IUsuario } from 'src/app/models/usuario';
import { ArchivoService } from 'src/app/services/archivo.service';
import { BackCloseService } from 'src/app/services/back-close.service';
import { EvidenciaService } from 'src/app/services/evidencia.service';
import { FuenteEmisionService } from 'src/app/services/fuente-emision.service';
import { NivelActividadService } from 'src/app/services/nivel-actividad.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nivel-actividad',
  templateUrl: './nivel-actividad.component.html',
  styleUrls: ['./nivel-actividad.component.css']
})
export class NivelActividadComponent implements OnInit {
  lstNivelActividad: any[] = [];
  lstFuenteEmision: any[] = [];
  lstIncerXFuente: any[] = [];
  lstNivelIncer: any[] = [];
  lstPeriodo: any[] = [];
  lstMes: any[] = [];
  lstEvidencia: any[] = [];
  lstTramoNoConfig: any[] = [];
  modalConfirmacion: any;
  selectedPeriod: any;
  sortedPeriods: any;
  currentYear: any;
  nIdFuenteEmision: any;

  model: NivelActividad = new NivelActividad();
  modal: any = {};

  fShowSkeleton: boolean = true;
  fShowSkEvidencia: boolean = true;
  fShowSkObservacion: boolean = true;
  fShowProduccion: boolean = false;
  fShowSkIncerXFuente: boolean = false;

  loadEliminar: boolean = false;
  loadRegistrarNA: boolean = false;
  loadRegistrarEV: boolean = false;
  loadNIcertidumbre: boolean = false;
  loadObservacion: boolean = false;
  loadingDescargar: boolean = false;
  noFormatNActividad: boolean = false;
  noFormatUnMixer: boolean = false;
  noFormatMfDoc: boolean = false;

  disabledForNoIdPeriodo: boolean = false;
  disabledCodEstado: boolean = false;

  isSameLevel: boolean = false;
  observarAbierto: boolean = false;

  lstSkeleton = Array(2);
  lstSkIncerXFuent = Array(3);

  oUsuario: IUsuario;

  page = 1;
  pageSize = 10;

  pageA_modal = 1;
  pageSizeA_modal = 6;

  pageB_modal = 1;
  pageSizeB_modal = 5;


  pageC_modal = 1;
  pageSizeC_modal = 5;

  total = 0;
  selectedMes: any;
  nextNumber = 0;

  //Archivo
  uploadNActividad: File;
  uploadUnMixer: File;

  ulpoadMfDocumento: any;

  codIncertidumbre: any;

  modelObs: any = {}
  getDescargas: any = {};

  @ViewChild('fileNActividad', { static: true }) fileNActividad: ElementRef;
  @ViewChild('fileUnMixer', { static: true }) fileUnMixer: ElementRef;
  @ViewChild('fileMfDocumento', { static: true }) fileMfDocumento: ElementRef;

  dragOverHandler(ev: DragEvent) {
    ev.preventDefault(); // Previene el comportamiento por defecto de abrir el archivo.
  }

  dropHandler(ev: DragEvent, inputId: string) {
    ev.preventDefault(); // Previene el comportamiento por defecto del navegador.

    if (ev.dataTransfer?.files) {
      const file = ev.dataTransfer.files[0]; // Asumimos que solo interesa el primer archivo.
      this.handleFileInputChange(file, inputId);
    }

    this.clearDragData(ev);
  }

  handleFileInputChange(file: File, inputId: string) {
    // Construye un evento falso para reutilizar las funciones de cambio existentes.
    const fakeEvent = { target: { files: [file] } };
    switch (inputId) {
      case 'fileNActividad':
        this.changeFileNActividad(fakeEvent);
        break;
      case 'fileUnMixer':
        this.changeFileUnMixer(fakeEvent);
        break;
      case 'fileMfDocumento':
        this.changeFileMfDocumento(fakeEvent);
        break;
      // Agrega más casos si tienes más inputs de archivo.
    }
  }

  clearDragData(ev: DragEvent) {
    if (ev.dataTransfer?.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.dataTransfer?.clearData();
    }
  }

  constructor(private toastr: ToastrService, private modalService: NgbModal, private nivelActividadService: NivelActividadService,
    private seguridadService: SeguridadService, private periodoService: PeriodoService,
    private fuenteEmisionService: FuenteEmisionService,
    private parametroService: ParametroService, private archivoService: ArchivoService, private backCloseService: BackCloseService, private evidenciaService: EvidenciaService,
    private router: Router, public sharedData: SharedDataService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.getDescargas.FormatoProdConcretoMixer = environment.descargas.FormatoProdConcretoMixer;
      //console.log('this.getDescarga.FormatoCargaMasiva', this.getDescargas.FormatoProdConcretoMixer);

      this.getDescargas.FormatosNA = environment.descargas.FormatosNA;
      //console.log('this.getDescarga.FormatosNA', this.getDescargas.FormatosNA);

      this.updateFunctions();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  updateFunctions() {
    Promise.all([this.fnListarPeriodo()]).then(() => {
      //Si el listado de Periodo tiene datos que corra las siguientes funciones:
      if (this.lstPeriodo.length > 0) {
        //Si no hay datos de nIdPeriodo en el session storage aplicar lo siguiente:

        if (!this.sharedData.itemPeriodo) {
          //Si no existe itemPeriodo, que se seleccione el ultimo objeto del año más cercano al actual:
          this.selectedPeriod = this.sortedPeriods.find((periodo: { nAnio: number; }) => periodo.nAnio <= this.currentYear) || this.sortedPeriods[this.sortedPeriods.length - 1];
          this.model.oPeriodo.nIdPeriodo = this.selectedPeriod?.nIdPeriodo;
        }
        //Si hay datos de nIdPeriodo del Session Storage,asignar el periodo al select:
        else {
          this.selectedPeriod = this.sortedPeriods.find((periodo: { nIdPeriodo: any; }) => periodo.nIdPeriodo === this.sharedData.itemPeriodo.nIdPeriodo);
          this.model.oPeriodo.nIdPeriodo = parseInt(this.sharedData.itemPeriodo.nIdPeriodo!);
        }

        //this.model.oPeriodo.nAnio = this.selectedPeriod?.nAnio;
        this.model.nCodEstado = this.selectedPeriod?.nCodEstado;
        this.model.boConNA = this.selectedPeriod?.boConNA;

        //Al momento de que termine de cargar toda la función de Listar Mes, que corran las siguientes funciones:
        Promise.all([this.fnListarMes()]).then(() => {
          this.fnListarNivelActividad();
          this.fnListarFuenteEmision();
        });

      } else {
        this.toastr.success("No hay periodos.", 'Advertencia');
        this.disabledForNoIdPeriodo = true;
        this.lstNivelActividad = [];
        this.fShowSkeleton = false;
      }
    });
  }
  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {

        this.lstPeriodo = data.datoAdicional.map((obj: { nIdPeriodo: any; nAnio: any; nCodEstado: any; boConNA: any }) => ({
          nIdPeriodo: obj.nIdPeriodo, nAnio: obj.nAnio, nCodEstado: obj.nCodEstado, boConNA: obj.boConNA
        }));
        //console.log('this.lstPeriodo', this.lstPeriodo);

        const now = new Date();
        this.currentYear = now.getFullYear();
        this.sortedPeriods = this.lstPeriodo.sort((a, b) => b.nAnio - a.nAnio);

        //this.selectedPeriod = this.sortedPeriods.find((periodo: { nAnio: number; }) => periodo.nAnio <= this.currentYear) || this.sortedPeriods[this.sortedPeriods.length - 1];
        this.selectedPeriod = this.lstPeriodo.find((periodo: { nIdPeriodo: any; }) => periodo.nIdPeriodo === this.model.oPeriodo.nIdPeriodo);
        //this.model.oPeriodo.nAnio = this.selectedPeriod?.nAnio;
        this.model.nCodEstado = this.selectedPeriod?.nCodEstado;
        this.model.boConNA = this.selectedPeriod?.boConNA;


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

  changePeriodo() {
    this.fnListarNivelActividad();
    const periodoSeleccionado = this.lstPeriodo.find((periodo: { nIdPeriodo: any; }) => periodo.nIdPeriodo === this.model.oPeriodo.nIdPeriodo);
    //console.log('periodoSeleccionado', periodoSeleccionado);
    this.model.nCodEstado = periodoSeleccionado.nCodEstado;
    this.model.boConNA = periodoSeleccionado.boConNA;
  }


  openRegistrarActividad(contentRegistrarActividad: any) {
    const modalRef = this.modalService.open(contentRegistrarActividad, { centered: true, windowClass: "modal-lg", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      //Al cerrar el modal Limpiar las casillas
      setTimeout(() => {
        this.uploadNActividad = null!;
        this.uploadUnMixer = null!;
        this.model.nIdFuenteEmision = null!;
        this.fShowProduccion = false;
        this.noFormatUnMixer = false;
        this.noFormatNActividad = false;
      }, 200);
    });
  }

  openConfirmacion(contentConfirmacion: any) {
    this.modalConfirmacion = this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  openRegistrarIncertidumbre(contentRegistrarIncertidumbre: any) {
    this.pageA_modal = 1;
    this.isSameLevel = false;
    this.modalConfirmacion.dismiss();
    this.fnListarIncertidumbreXFuente();
    this.lstIncerXFuente = [];
    this.modalService.open(contentRegistrarIncertidumbre, { centered: true, windowClass: "modal-xl", backdrop: 'static' });
  }

  openRegistrarEvidencia(contentRegistrarEvidencia: any, item: any) {
    this.model.nIdNivelActividad = item.nIdNivelActividad;
    this.lstEvidencia = [];
    this.fnListarEvidencia();
    const modalRef = this.modalService.open(contentRegistrarEvidencia, { centered: true, windowClass: "modal-md", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      this.noFormatMfDoc = false;
    });
  }

  openEliminar(contentEliminar: any, item: any) {
    //console.log('item', item);

    this.model.nIdNivelActividad = item.nIdNivelActividad;
    this.modal.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;

    //console.log(this.model.nIdNivelActividad, this.modal.nIdFuenteEmision);
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  //Abrir modal de observación
  async openObservacion(contentObservacion: any, item: any) {
    //console.log('item', item);
    this.model.oFuenteEmision.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;
    this.model.nIdNivelActividad = item.nIdNivelActividad;
    this.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;

    Promise.all([this.fnListarTramoNoConfig()]).then(async () => {
      if (this.lstTramoNoConfig.length <= 0) {
        let data: IDataResponse = await lastValueFrom(this.nivelActividadService.calcularGei(this.model.nIdNivelActividad));
        //console.log('fnListarNivelActividad', data);
        if (data.exito) {
          this.toastr.success(data.mensajeUsuario, 'Éxito');
          this.fnListarNivelActividad();
        } else {
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        }
      } else {
        if (!this.observarAbierto) {
          this.observarAbierto = true;
          this.modalService.open(contentObservacion, { centered: true, windowClass: "modal-xl", backdrop: 'static' });
        }
      };
    });

  }

  async fnListarMes() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('MES'));
    if (data.exito) {
      this.lstMes = data.datoAdicional.map((obj: { sCodigo: any; sValor: any; }) => ({ sCodigo: obj.sCodigo, sValor: obj.sValor }));

      const mesActual = new Date().getMonth();
      let mesAnterior: number;

      if (mesActual === 0) {
        // Si es enero, mantener el valor en "ENE"
        mesAnterior = 0;
      } else {
        mesAnterior = mesActual - 1;
      }
      // Asignar el valor correspondiente al mes anterior a sCodMes
      this.model.sCodMes = this.lstMes[mesAnterior].sCodigo;
      this.model.sCodMes_Reg = this.lstMes[mesAnterior].sCodigo;

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }

  }

  async fnListarNivelActividad() {
    let data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarNivelActividad(this.model.oPeriodo.nIdPeriodo, this.model.sCodMes));
    if (data.exito) {
      this.page = 1;
      this.lstNivelActividad = data.datoAdicional;
      this.fShowSkeleton = false;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarFuenteEmision() {
    let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarFuenteEmision());
    if (data.exito) {
      this.lstFuenteEmision = data.datoAdicional;
      //console.log('this.lstFuenteEmision', this.lstFuenteEmision);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarIncertidumbreXFuente() {
    this.fShowSkIncerXFuente = true;
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarIncertidumbreXFuente(this.model.oPeriodo.nIdPeriodo));
    if (data.exito) {
      this.lstIncerXFuente = data.datoAdicional;
      this.fnListarNivelIncertidumbre();
      //console.log('this.lstIncerXFuente', this.lstIncerXFuente);
    } else {
      this.fShowSkIncerXFuente = false;
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarTramoNoConfig() {
    this.fShowSkObservacion = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarTramoNoConfig(this.model.nIdNivelActividad, this.model.oFuenteEmision.nIdFuenteEmision));

      if (data.exito) {
        this.lstTramoNoConfig = data.datoAdicional;
        this.lstTramoNoConfig.forEach(item => {
          item.bdDistacia = 0;
        });
        //console.log('this.lstTramoNoConfig', this.lstTramoNoConfig);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkObservacion = false;
  }

  async fnListarNivelIncertidumbre() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('NIVEL_INCERTIDUMBRE'));
      if (data.exito) {
        this.lstNivelIncer = data.datoAdicional;
        //console.log('this.lstNivelIncer', this.lstNivelIncer);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkIncerXFuente = false;
  }

  async fnEliminarNivelActividad() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdNivelActividad', this.model.nIdNivelActividad);
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.eliminarNivelActividad(this.model.nIdNivelActividad, this.modal.nIdFuenteEmision));
      //console.log('fnListarNivelActividad', data);
      if (data.exito) {

        this.lstNivelActividad = []
        this.fnListarNivelActividad();
        //Lista el Periodo para obtener de nuevo el valor del flag boConNA:
        this.fnListarPeriodo();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;
  }

  async fnDescargarNActividad(item: any) {
    this.loadingDescargar = true;
    try {
      //console.log('item.sRefXlxNivelActividad-->', item.sRefXlxNivelActividad);
      let data = await lastValueFrom(this.archivoService.descargarArchivo(item.sRefXlxNivelActividad));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = item.sXlxNivelActividad;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();

    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    } this.loadingDescargar = false;
  }

  async fnDescargarPMixer(item: any) {
    this.loadingDescargar = true;
    try {
      //console.log('item.sRefXlxProduccionMixer-->', item.sRefXlxProduccionMixer);
      let data = await lastValueFrom(this.archivoService.descargarArchivo(item.sRefXlxProduccionMixer));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = item.sXlxProduccionMixer;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    } this.loadingDescargar = false;
  }

  async fnDescargarFormatoProd() {
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.getDescargas.FormatoProdConcretoMixer));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = 'FormatoProdConcretoMixer.xlsx';
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }

  redictResultadosGei() {

    let sendArray = {
      nIdPeriodo: this.model.oPeriodo.nIdPeriodo,
      sCodMes: this.model.sCodMes
    }
    //console.log('sendArray', sendArray);
    this.sharedData.setPeriodo(sendArray);
    //console.log('SET nIdPeriodo -->', this.sharedData.itemPeriodo);

    this.router.navigate(["/resultados-gei"]);
  }

  changeMes() {
    this.model.sCodMes_Reg = this.model.sCodMes;
    this.fnListarNivelActividad();
  }

  changeFuentesEmision() {
    //console.log('this.model.nIdFuenteEmision', this.model.nIdFuenteEmision);
    this.model.nIdFuenteEmision == 7 ? this.fShowProduccion = true : this.fShowProduccion = false;
  }

  changeFileNActividad($event: any) {
    const labelElement: HTMLElement = document.querySelector('label[for="fileNActividad"]')!;
    let filetemp = $event.target.files[0];

    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx')) {
      this.uploadNActividad = $event.target.files[0];
      labelElement.innerText = this.uploadNActividad.name;
      this.noFormatNActividad = false;
    } else {
      this.uploadNActividad = null!;
      labelElement.innerText = "Seleccionar archivo...";
      this.noFormatNActividad = true;
    }
    $event.target.value = null;
  }

  changeFileUnMixer($event: any) {
    const labelElement: HTMLElement = document.querySelector('label[for="fileUnMixer"]')!;
    let filetemp = $event.target.files[0];

    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx')) {
      this.uploadUnMixer = $event.target.files[0];
      labelElement.innerText = this.uploadUnMixer.name;
      this.noFormatUnMixer = false;
    } else {
      this.uploadUnMixer = null!;
      labelElement.innerText = "Seleccionar archivo...";
      this.noFormatUnMixer = true;
    }
    $event.target.value = null;
  }

  changeFileMfDocumento($event: any) {
    const labelElement: HTMLElement = document.querySelector('label[for="fileMfDocumento"]')!;
    let filetemp = $event.target.files[0];

    if (filetemp.name.endsWith('pdf') || filetemp.name.endsWith('png') || filetemp.name.endsWith('jpg')
      || filetemp.name.endsWith('PNG') || filetemp.name.endsWith('JPG')) {
      this.ulpoadMfDocumento = $event.target.files[0];
      labelElement.innerText = this.ulpoadMfDocumento.name;
      this.noFormatMfDoc = false;
    } else {
      this.ulpoadMfDocumento = null!;
      //this.ulpoadMfDocumento.nativeElement.value = null;
      labelElement.innerText = "Seleccionar archivo...";
      // this.toastr.warning('Inserte un archivo en formato .xls o .xlsx', 'Advertencia');
      this.noFormatMfDoc = true;
    }
    $event.target.value = null;
  }

  changeSameLevel() {
    //console.log(this.isSameLevel);
    if (this.isSameLevel) {
      const firstValue = this.lstIncerXFuente[0].sCodIncertidumbre;
      this.lstIncerXFuente.forEach((item) => item.sCodIncertidumbre = firstValue);
    }
  }

  changeFirstSelect() {
    //console.log(this.isSameLevel);
    if (this.isSameLevel) {
      const firstValue = this.lstIncerXFuente[0].sCodIncertidumbre;
      this.lstIncerXFuente.forEach((item) => item.sCodIncertidumbre = firstValue);
    }
  }

  async fnDescargarEvidencia(item: any) {
    this.loadingDescargar = true;
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(item.sRefDocumento));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = item.sNombreDocumento;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
    this.loadingDescargar = false;
  }

  async fnRegistrarNActividad(form: NgForm) {
    //console.log('Periodo-->', this.model.oPeriodo.nIdPeriodo);
    //console.log('Mes-->', this.model.sCodMes_Reg);
    //console.log('Fuentes Emisión-->', this.model.nIdFuenteEmision);
    //console.log('Nivel Actividad-->', this.uploadNActividad);
    //console.log('Unidad Mixer-->', this.uploadUnMixer);

    if (form.invalid || !this.model.oPeriodo.nIdPeriodo || !this.model.sCodMes_Reg! || !this.model.nIdFuenteEmision || !this.uploadNActividad) {
      return
    }

    if (this.model.nIdFuenteEmision == 7 && !this.uploadUnMixer) {
      //console.log('---Falta el archivo de Unidad Mixer--- ')
      return
    }
    this.loadRegistrarNA = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.registrarNivelActividad(this.uploadNActividad, this.uploadUnMixer, this.model.oPeriodo.nIdPeriodo, this.model.sCodMes_Reg
        , this.model.nIdFuenteEmision));

      if (data.exito) {
        this.fnListarNivelActividad();
        //Lista el Periodo para obtener de nuevo el valor del flag boConNA:
        this.fnListarPeriodo();
        this.modalService.dismissAll();
        this.loadRegistrarNA = false;

        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.loadRegistrarNA = false;
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
      this.loadRegistrarNA = false;
    }
  }

  async fnListarEvidencia() {
    this.fShowSkEvidencia = true;
    let data: IDataResponse = await lastValueFrom(this.evidenciaService.listarEvidencia(this.model.nIdNivelActividad));
    if (data.exito) {
      this.fShowSkEvidencia = false;
      this.lstEvidencia = data.datoAdicional;
      //console.log('this.lstEvidencia', this.lstEvidencia);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnEliminarEvidencia(item: any) {
    let data: IDataResponse = await lastValueFrom(this.evidenciaService.eliminarEvidencia(item.nIdEvidencia));
    if (data.exito) {
      this.lstEvidencia = [];
      this.fnListarEvidencia();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnRegistrarEvidencia(form: NgForm) {
    // Detectar si el nombre ya se encuentra en el listado:
    const existeDocumento = this.lstEvidencia.some(documento => documento.sNombreDocumento === this.ulpoadMfDocumento?.name);
    if (existeDocumento) {
      this.toastr.warning('El nombre del documento ya existe en el listado.', 'Advertencia');
      return
    }
    const labelElement: HTMLElement = document.querySelector('label[for="fileMfDocumento"]')!;
    if (!this.ulpoadMfDocumento || this.noFormatMfDoc) {
      this.noFormatMfDoc = true;
      return
    }
    this.loadRegistrarEV = true;
    try {
      //console.log(this.ulpoadMfDocumento, this.model.nIdNivelActividad);
      let data: IDataResponse = await lastValueFrom(this.evidenciaService.registrarEvidencia(this.ulpoadMfDocumento, this.model.nIdNivelActividad));

      if (data.exito) {
        labelElement.innerText = "Seleccionar archivo...";
        this.ulpoadMfDocumento = null;
        this.fnListarEvidencia();
        this.lstEvidencia = [];
        this.toastr.success('Evidencia registrada exitosamente.', 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadRegistrarEV = false;
  }

  async fnRegistrarNIncertidumbre(form: NgForm) {
    if (!this.lstIncerXFuente.every(item => item.sCodIncertidumbre)) {

      this.toastr.warning("Seleccione todos los campos de fuentes de emisión.", 'Advertencia');
    } else {

      this.loadNIcertidumbre = true;
      let resultados = [];

      for (let i = 0; i < this.lstIncerXFuente.length; i++) {
        let sCodIncertidumbre = this.lstIncerXFuente[i].sCodIncertidumbre;
        let nIdFuenteEmision = this.lstIncerXFuente[i].oFuenteEmision.nIdFuenteEmision;

        if (sCodIncertidumbre && nIdFuenteEmision) {
          let objeto = {
            sCodigo: sCodIncertidumbre,
            nIdFuenteEmision: nIdFuenteEmision
          };
          resultados.push(objeto);
        }
      }
      let oNInceridumbre = {
        oPeriodo: {
          nIdPeriodo: this.model.oPeriodo.nIdPeriodo
        },
        liFuenteEmision: resultados
      }
      //console.log('oNInceridumbre', oNInceridumbre);

      let data: IDataResponse = await lastValueFrom(this.periodoService.registrarIncertidumbre(oNInceridumbre));

      if (data.exito) {
        this.modalService.dismissAll();
        this.toastr.success("Periodo de datos finalizado con éxito.", 'Éxito');
        this.model.oPeriodo.nIdPeriodo = null;
        this.model.sCodMes = null!;
        this.updateFunctions();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadNIcertidumbre = false;
    }
  }

  async fnRegistrarObservacion(form: NgForm) {
    if (this.lstTramoNoConfig.every(item => item.bdDistacia === 0)) {
      this.toastr.warning("Ingrese datos en al menos una distancia.", 'Advertencia');
    } else if (!this.lstTramoNoConfig.every(item => {
      const regex = /^(0+|\d{1,5}(.\d{1,2})?)$/;
      return regex.test(item.bdDistacia);
    })) {
      this.toastr.warning("Ingrese un máximo de 5 unidades y 2 decimales.", 'Advertencia');
    } else {
      this.loadObservacion = true;
      //console.log('this.model.nIdNivelActividad', this.model.nIdNivelActividad);

      let oIdNivelActividad: string = '';
      let resultados = [];

      //console.log('nIdFuenteEmision', this.nIdFuenteEmision);

      if (this.nIdFuenteEmision == 27) {
        oIdNivelActividad = 'A';
      } else {
        oIdNivelActividad = 'T';
      }

      for (let i = 0; i < this.lstTramoNoConfig.length; i++) {
        let oOrigen = this.lstTramoNoConfig[i].sOrigen;
        let oDestino = this.lstTramoNoConfig[i].sDestino;
        let oDistacia = this.lstTramoNoConfig[i].bdDistacia;
        let oTipoRecorrido = oIdNivelActividad;

        let objeto = {
          sOrigen: oOrigen,
          sDestino: oDestino,
          bdDistacia: oDistacia,
          sTipoRecorrido: oTipoRecorrido
        };
        resultados.push(objeto);
      }
      //console.log('resultados', resultados);

      let oTramo = {
        nIdNivelActividad: this.model.nIdNivelActividad,
        liDistanciaTramo: resultados
      }

      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.registrarTramo(oTramo));

      if (data.exito) {
        this.fnListarNivelActividad();
        this.observarAbierto = false;
        this.modalService.dismissAll();
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadObservacion = false;
    }
  }


  openObservar(contentObservar: any) {
    this.obtenerObservar();
    this.modalService.open(contentObservar, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  async obtenerObservar() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.obtenerObservar(this.model.oPeriodo.nIdPeriodo));

      if (data.exito) {
        //console.log(this.model.oPeriodo.nAnio);
        const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.model.oPeriodo.nIdPeriodo);
        //console.log('periodoEncontrado', periodoEncontrado.nAnio);
        this.modelObs.nAnio = periodoEncontrado.nAnio;
        this.modelObs.sXlsObservacion = data.datoAdicional.sXlsObservacion;
        this.modelObs.sRefXlsObservacion = data.datoAdicional.sRefXlsObservacion;
        this.modelObs.sObservacion = data.datoAdicional.sObservacion;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }
  async fnDescargarDocObs() {
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.modelObs.sRefXlsObservacion));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = this.modelObs.sXlsObservacion;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }

  onInputChanged(index: number) {
    if (!this.lstTramoNoConfig[index].bdDistacia) {
      this.lstTramoNoConfig[index].bdDistacia = 0;
    }
  }

  async fnDescargarFNA() {
    //console.log('this.getDescargas.FormatosNA', this.getDescargas.FormatosNA);
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.getDescargas.FormatosNA));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = 'Formatos_FNA.zip';
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 99) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }
}
