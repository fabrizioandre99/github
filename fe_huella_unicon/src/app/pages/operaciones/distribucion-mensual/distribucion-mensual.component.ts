import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { DistribucionMensual } from 'src/app/models/distribucionMensual';
import { IUsuario } from 'src/app/models/usuario';
import { ArchivoService } from 'src/app/services/archivo.service';
import { DistribucionFuenteService } from 'src/app/services/distribucion-fuente.service';
import { FuenteEmisionService } from 'src/app/services/fuente-emision.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { ProduccionPlantaService } from 'src/app/services/produccion-planta.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-distribucion-mensual',
  templateUrl: './distribucion-mensual.component.html',
  styleUrls: ['./distribucion-mensual.component.css']
})
export class DistribucionMensualComponent implements AfterViewChecked, OnInit, OnDestroy {
  oUsuario: IUsuario;
  lstPeriodo: any[] = [];
  lstMes: any[] = [];
  lstFuentesEmision: any[] = [];
  lstDistFuente: any[] = [];
  lstDFByLocacion: any[] = [];
  lstActivos: any[] = [];
  lstDistPlanta: any[] = [];
  lstDistPlanta_mod: any[] = [];
  lstNoDistribuidas: any[] = [];
  lstSkeleton = Array(3);
  sumaValores: number;
  uploadDoc: any;
  eliminar: any = {};

  isEditarDistribucion: boolean = false;
  fShowSkDistFuente: boolean = false;
  fShowSkDistPlanta: boolean = false;
  fShowDFByLocacion: boolean = false;
  loadRegDist: boolean = false;
  loadOpenModal: boolean = false;
  loadDocument: boolean = false;
  loadEliminar: boolean = false;
  loadProcesar: boolean = false;
  procesarGlobal: boolean = true;
  todosProcesados: boolean = false;
  esFinalizado: boolean = false;

  page = 1;
  pageSize = 7;
  total = 0;

  pageB = 1;
  pageSizeB = 7;

  page_modal = 1;
  pageSize_modal = 5;
  oIdFuenteEmision: any;

  model: DistribucionMensual = new DistribucionMensual();
  getDescargas: any = {};

  @ViewChild('fileDoc', { static: true }) fileDoc: ElementRef;
  constructor(private router: Router, private seguridadService: SeguridadService,
    private toastr: ToastrService, private modalService: NgbModal, private periodoService: PeriodoService, private parametroService: ParametroService,
    private fuenteEmisionService: FuenteEmisionService, private distribucionFuenteService: DistribucionFuenteService,
    private locacionService: LocacionService, private produccionPlantaService: ProduccionPlantaService,
    private archivoService: ArchivoService,
    public sharedData: SharedDataService) {

  }

  dragOverHandler(ev: DragEvent) {
    // Previene el comportamiento por defecto para permitir soltar el archivo
    ev.preventDefault();
  }

  dropHandler(ev: DragEvent, index: number) {
    // Previene el comportamiento por defecto del navegador
    ev.preventDefault();

    // Obtiene el item específico de la lista basado en el índice
    const item = this.lstDistPlanta[index];

    if (ev.dataTransfer?.items) {
      // Si se arrastraron archivos, accede al primer archivo
      if (ev.dataTransfer.items[0].kind === 'file') {
        const file = ev.dataTransfer.items[0].getAsFile();
        if (file) {
          this.changeFile({ target: { files: [file] } }, item);
        }
      }
    } else {
      // Usa la lista de archivos si items no está disponible
      this.changeFile({ target: { files: ev.dataTransfer?.files } }, item);
    }

    // Limpia el drag data para el próximo evento de arrastre y soltar
    this.clearDragData(ev);
  }

  clearDragData(ev: DragEvent) {
    if (ev.dataTransfer?.items) {
      // Usa la interfaz DataTransferItemList para remover los items (para Chrome)
      ev.dataTransfer.items.clear();
    } else {
      // Usa la interfaz DataTransfer para remover los archivos (para otros navegadores)
      ev.dataTransfer?.clearData();
    }
  }


  onInputChanged(index: number) {
    if (!this.lstDFByLocacion[index].bdValorDistribucion) {
      this.lstDFByLocacion[index].bdValorDistribucion = 0;
    }
  }

  verificarProcesados(): void {
    if (this.lstDistFuente.length === 0) {
      this.todosProcesados = true;
      this.procesarGlobal = false;

    } else {
      this.todosProcesados = this.lstDistFuente.every((item) => item.boProcesado);

      if (!this.todosProcesados) {
        this.procesarGlobal = false;
      } else {
        this.procesarGlobal = true;
      }
    }

    //console.log('this.todosProcesados', this.todosProcesados);
  }

  ngOnInit(): void {
    this.getDescargas.ProduccionPlanta = environment.descargas.ProduccionPlanta;
    //console.log('this.getDescarga.ProduccionPlanta', this.getDescargas.ProduccionPlanta);

    if (this.sharedData.itemPeriodo == null) {
      this.router.navigate(['/bandeja-periodos']);
    } else {

      this.fnListarPeriodo();
      this.fnListarMes();
      this.fnListarFuentesEmision();
      this.fnListarActivos();
      this.verificarProcesados();
    }
  }

  ngOnDestroy() {
    this.sharedData.setPeriodo(null);
    this.modalService.dismissAll();
  }

  ngAfterViewChecked() {
    this.calcularSuma();
  }

  calcularSuma(): void {
    this.sumaValores = this.lstDFByLocacion.reduce((total, item) => total + Number(item.bdValorDistribucion), 0);
  }

  async openEditarDistribucion(contentRegistrarDistribucion: any, item: any) {

    this.fnListarActivos();
    this.isEditarDistribucion = true;
    this.model.oLocacion.nIdLocacion = item.oLocacion.nIdLocacion;
    this.oIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;
    this.modalService.open(contentRegistrarDistribucion, { centered: true, windowClass: "modal-md", backdrop: 'static' });
    this.fShowDFByLocacion = true;
    let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.listarPorLocacion(this.model.oPeriodo.nIdPeriodo,
      this.model.sCodMes, item.oFuenteEmision.nIdFuenteEmision, item.oLocacion.nIdLocacion));

    if (data.exito) {
      this.lstDFByLocacion = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.fShowDFByLocacion = false;
  }

  async fnListarActivos() {
    let data: IDataResponse = await lastValueFrom(this.locacionService.listarActivos());
    if (data.exito) {
      this.lstActivos = data.datoAdicional;
      //console.log('this.lstActivos', this.lstActivos);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  async fnListarNoDistribuidas() {
    let data: IDataResponse = await lastValueFrom(this.locacionService.listarNoDistribuidas(this.model.sCodMes, this.model.oPeriodo.nIdPeriodo,
      this.model.oFuenteEmision.nIdFuenteEmision));
    if (data.exito) {
      this.lstActivos = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async openRegistrarDistribucion(contentRegistrarDistribucion: any) {
    this.loadOpenModal = true;
    Promise.all([this.fnListarNoDistribuidas()]).then(async () => {
      this.isEditarDistribucion = false;
      this.modalService.open(contentRegistrarDistribucion, { centered: true, windowClass: "modal-md", backdrop: 'static' });
      this.loadOpenModal = false;
      this.fShowDFByLocacion = true;
      this.oIdFuenteEmision = this.model.oFuenteEmision.nIdFuenteEmision;
      this.model.oLocacion.nIdLocacion = null;
      let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.listarPorLocacion(this.model.oPeriodo.nIdPeriodo,
        this.model.sCodMes, this.oIdFuenteEmision, this.model.oLocacion.nIdLocacion));
      if (data.exito) {
        this.lstDFByLocacion = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.fShowDFByLocacion = false;
    });
  }

  async changeLocacion() {
    this.fShowDFByLocacion = true;
    let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.listarPorLocacion(this.model.oPeriodo.nIdPeriodo,
      this.model.sCodMes, this.oIdFuenteEmision, this.model.oLocacion.nIdLocacion));
    if (data.exito) {
      this.lstDFByLocacion = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.fShowDFByLocacion = false;
  }

  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;

        if (this.sharedData.itemPeriodo) {
          this.model.oPeriodo.nIdPeriodo = parseInt(this.sharedData.itemPeriodo.nIdPeriodo!);
          this.fShowSkDistFuente = true;
        }
        this.fnListarDistFuente();
        //this.fnListarDistPlanta();

        const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.model.oPeriodo.nIdPeriodo);
        if (periodoEncontrado) {
          this.esFinalizado = periodoEncontrado.nCodEstado === 3 ? true : false;
        }

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
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarFuentesEmision() {
    let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarFuenteEmision());
    if (data.exito) {
      this.lstFuentesEmision = data.datoAdicional;
      this.model.oFuenteEmision.nIdFuenteEmision = -1;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarDistFuente() {

    this.fShowSkDistFuente = true;
    try {
      let idFuenteEmision = this.model.oFuenteEmision.nIdFuenteEmision;
      if (this.model.oFuenteEmision.nIdFuenteEmision == -1) { idFuenteEmision = null! }
      let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.listarDistFuente(this.model.oPeriodo.nIdPeriodo, this.model.sCodMes, idFuenteEmision));
      if (data.exito) {
        this.lstDistFuente = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkDistFuente = false;
    this.verificarProcesados();
  }


  async fnListarDistPlanta() {
    // Esperar a que nIdPeriodo esté disponible
    while (!this.model.oPeriodo.nIdPeriodo) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.fShowSkDistPlanta = true;
    let data: IDataResponse = await lastValueFrom(this.produccionPlantaService.listarByPeriodo(this.model.oPeriodo.nIdPeriodo));
    if (data.exito) {
      this.lstDistPlanta = data.datoAdicional;
      //console.log('this.lstDistPlanta', this.lstDistPlanta);

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.fShowSkDistPlanta = false;
  }


  async eliminarProdPlanta(item: any) {

    try {
      let data: IDataResponse = await lastValueFrom(this.produccionPlantaService.eliminarProdPlanta(item.nIdProduccionPlanta, this.model.oPeriodo.nIdPeriodo, item.sCodMes));
      if (data.exito) {
        item.sXlsProduccion = '';
        item.boProcesado = false;
        item.nIdProduccionPlanta = -1;

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async procesarDistMensual(item: any) {
    if (item.nIdProduccionPlanta == -1 && this.lstDistPlanta_mod.length > 0) {

      const objetoEncontrado = this.lstDistPlanta_mod.find(obj => obj.sCodMes === item.sCodMes);
      item.sCodMes = objetoEncontrado?.nIdProduccionPlanta;

    }
    try {
      let data: IDataResponse = await lastValueFrom(this.produccionPlantaService.procesarProdPlanta(
        item.nIdProduccionPlanta
      ));

      if (data.exito) {

        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  limpiarValores(): void {
    this.lstDFByLocacion.forEach(item => {
      item.bdValorDistribucion = 0;
    });
  }

  async fnRegistrarDistribucion(form: NgForm) {

    if (!this.model.oLocacion.nIdLocacion) {
      return;
    }
    let sumaValores = 0;
    for (let i = 0; i < this.lstDFByLocacion.length; i++) {
      sumaValores += Number(this.lstDFByLocacion[i].bdValorDistribucion);
    }

    if (!this.lstDFByLocacion.every(item => {
      const regex = /^(100(.0+)?|\d{1,2}(.\d+)?|)$/;
      return regex.test(item.bdValorDistribucion);
    })) {
      this.toastr.warning("Ingrese un porcentaje válido.", 'Advertencia');
    } else if (sumaValores !== 100) {
      this.toastr.warning("La suma total debe ser el 100%.", 'Advertencia');
      return
    }
    else {
      //console.log('this.lstDistFuente', this.lstDistFuente);
      this.loadRegDist = true;

      let resultados = [];

      for (let i = 0; i < this.lstDFByLocacion.length; i++) {
        let oIdDistribucionFuente = this.lstDFByLocacion[i].nIdDistribucionFuente;
        let oIdUnidadNegocio = this.lstDFByLocacion[i].oUnidadNegocio.nIdUnidadNegocio;
        let oValorDistribucion = this.lstDFByLocacion[i].bdValorDistribucion;

        if (this.lstDFByLocacion[i].bdValorDistribucion === '') {
          oValorDistribucion = 0; // Asigna 0 si el input está vacío
        }

        let objeto = {
          nIdDistribucionFuente: oIdDistribucionFuente,
          oUnidadNegocio: {
            nIdUnidadNegocio: oIdUnidadNegocio
          },
          bdValorDistribucion: oValorDistribucion,
        };
        resultados.push(objeto);
      }

      let oRegistro = {
        oPeriodo: {
          nIdPeriodo: this.model.oPeriodo.nIdPeriodo
        },
        sCodMes: this.model.sCodMes,
        oFuenteEmision: {
          nIdFuenteEmision: this.oIdFuenteEmision
        },
        oLocacion: {
          nIdLocacion: this.model.oLocacion.nIdLocacion
        },
        liDistribucion: resultados
      }

      let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.registrarDistFuente(oRegistro));

      if (data.exito) {
        this.fnListarDistFuente();
        this.modalService.dismissAll();
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadRegDist = false;
    }
  }

  async fnDescargarFormato() {
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.getDescargas.ProduccionPlanta));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = 'ProduccionPlanta.xlsx';
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
  async fnDescargarDocumento(item: any) {
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(item.sRefXlsProduccion));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = item.sXlsProduccion;
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

  subirArchivo(item: any) {
    item.edit = true;
    item.sXlsProduccion_modDocName = 'Seleccionar archivo';
    item.sXlsProduccion_mod = null;
    item.sXlsProduccion_modDoc = null;
  }

  changeFile($event: any, item: any) {
    //console.log('item', item);
    let filetemp = $event.target.files[0];
    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx')) {
      item.sXlsProduccion_modDoc = $event.target.files[0];
      item.sXlsProduccion_modDocName = item.sXlsProduccion_modDoc.name;
      item.noFormat = false;

    } else {
      item.sXlsProduccion_modDoc = null!;
      this.toastr.warning('Inserte un archivo en formato xls o xlsx.', 'Advertencia');
      item.noFormat = true;
    }
  }

  async registrarProdPlanta(item: any) {

    if (!item.sXlsProduccion_modDoc) {
      item.noFormat = true;
      this.toastr.warning('Inserte un archivo.', 'Advertencia');
      return
    }
    item.loadDocument = true;

    try {
      let data: IDataResponse = await lastValueFrom(this.produccionPlantaService.registrarProdPlanta(item.sXlsProduccion_modDoc, this.model.oPeriodo.nIdPeriodo, item.sCodMes));

      if (data.exito) {
        let dataProdPlan: IDataResponse = await lastValueFrom(this.produccionPlantaService.listarByPeriodo(this.model.oPeriodo.nIdPeriodo));
        if (dataProdPlan.exito) {
          this.lstDistPlanta_mod = dataProdPlan.datoAdicional;

          this.lstDistPlanta.forEach((plantaItem) => {
            const modItem = this.lstDistPlanta_mod.find(modItem => modItem.sCodMes === plantaItem.sCodMes);
            if (modItem) {
              plantaItem.nIdProduccionPlanta = modItem.nIdProduccionPlanta;
            }
          });

          item.sXlsProduccion = item.sXlsProduccion_modDocName;
          item.edit = false;
          item.boProcesado = true;

          //console.log('item', item);
          this.toastr.success(data.mensajeUsuario, 'Éxito');
        }
      } else {
        item.noFormat = true;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    item.loadDocument = false;
  }

  cancelarProdPlanta(item: any) {
    item.edit = false;
    item.noFormat = false;
    item.sXlsProduccion_modDoc = null!;
  }

  openEliminar(contentEliminar: any, item: any) {
    this.eliminar.nIdPeriodo = this.model.oPeriodo.nIdPeriodo;
    this.eliminar.sCodMes = this.model.sCodMes;
    this.eliminar.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;
    this.eliminar.nIdLocacion = item.oLocacion.nIdLocacion;

    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async eliminarDistFuente() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.eliminarDistFuent(
        this.eliminar.nIdPeriodo, this.eliminar.sCodMes, this.eliminar.nIdFuenteEmision, this.eliminar.nIdLocacion));
      if (data.exito) {
        this.fnListarDistFuente();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;
  }


  async openProcesarF(contentProcesarF: any) {
    this.loadProcesar = true;
    this.modalService.open(contentProcesarF, { centered: true, windowClass: "modal-procesar", backdrop: 'static' });
    try {
      let data: IDataResponse = await lastValueFrom(this.distribucionFuenteService.procesarDistFuente(this.model.oPeriodo.nIdPeriodo,
        this.model.sCodMes));
      if (data.exito) {
        this.fnListarDistFuente();
        this.fnListarDistPlanta();
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.modalService.dismissAll();
    this.loadProcesar = false;
  }


}
