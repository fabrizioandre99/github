import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Periodo } from 'src/app/models/periodo';
import { IUsuario } from 'src/app/models/usuario';
import { ArchivoService } from 'src/app/services/archivo.service';
import { BackCloseService } from 'src/app/services/back-close.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-bandeja-periodos',
  templateUrl: './bandeja-periodos.component.html',
  styleUrls: ['./bandeja-periodos.component.css']
})
export class BandejaPeriodosComponent implements OnInit {

  oUsuario: IUsuario | undefined;
  lstPeriodo: any[] = [];
  lstRol: any[] = [];
  model: Periodo = new Periodo();
  modelObs: any = {};
  itemReiniciar: any = {};

  page = 1;
  pageSize = 7;
  total = 0;

  loadingGuardar: boolean = false;
  loadingConf: boolean = false;
  fShowSkeleton: boolean = false;
  fShowButton: boolean = false;
  submitGuardar: boolean = false;
  fShow: boolean = false;
  loadObservar: boolean = false;
  noFormatObservar: boolean = false;
  lstSkeleton = Array(4);

  //Archivo
  uploadObservar: File;

  constructor(private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService, private periodoService: PeriodoService, private archivoService: ArchivoService,
    private router: Router, private backCloseService: BackCloseService,
    private sharedData: SharedDataService, private cdr: ChangeDetectorRef) { }

  dragOverHandler(ev: DragEvent) {
    // Previene el comportamiento por defecto para permitir soltar el archivo
    ev.preventDefault();
  }

  dropHandler(ev: DragEvent) {
    // Previene el comportamiento por defecto del navegador
    ev.preventDefault();

    // Usa el DataTransfer del evento para acceder a los archivos
    if (ev.dataTransfer?.items) {
      // Si se arrastraron archivos, accede al primer archivo
      if (ev.dataTransfer.items[0].kind === 'file') {
        const file = ev.dataTransfer.items[0].getAsFile();
        if (file) {
          this.changeFileObservar({ target: { files: [file] } });
        }
      }
    } else {
      // Usa la lista de archivos si items no está disponible
      this.changeFileObservar({ target: { files: ev.dataTransfer?.files } });
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


  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarPeriodo();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }


  async fnListarPeriodo() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodo());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        this.fShowButton = this.lstPeriodo.every(element => element.nCodEstado === 3);
        //console.log('this.lstPeriodo', this.lstPeriodo);
        this.fShowSkeleton = false;
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

  async fnGuardarAnio(form: NgForm) {
    try {
      this.submitGuardar = true;
      this.loadingGuardar = true;
      if (form.invalid) {
        this.loadingGuardar = false;
        return
      }

      this.loadingGuardar = true;
      let data: IDataResponse = await lastValueFrom(this.periodoService.registraroActualizar(null, this.model.nAnio));

      if (data.exito) {
        this.model.nAnio = null!;
        this.fnListarPeriodo();
        this.fShow = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadingGuardar = false;
      this.submitGuardar = false;
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  editarPeriodo(item: any) {
    item.nAnio_mod = item.nAnio;
    item.edit = true; this.cdr.detectChanges();

  }

  async fnActualizarAnio(form: NgForm, item: any) {
    try {
      // console.log(item.nIdPeriodo, item.nAnio_mod);
      if (!item.nAnio_mod) {
        this.toastr.warning('Ingrese un año.', 'Advertencia');
        return
      }
      if (!/^(19\d\d|20\d\d|21\d{2})$/.test(item.nAnio_mod)) {
        this.toastr.warning('Ingrese un año válido.', 'Advertencia');
        return
      }

      let data: IDataResponse = await lastValueFrom(this.periodoService.registraroActualizar(item.nIdPeriodo, item.nAnio_mod));

      if (!data.exito) {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      } else {
        item.nAnio = item.nAnio_mod;
      }
      item.edit = false;
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnfinalizaroReiniciar(item: any) {
    try {

      item.loadingTable = true;
      let data: IDataResponse = await lastValueFrom(this.periodoService.finalizaroReiniciar(item.nIdPeriodo, 1));
      if (data.exito) {

        this.fnListarPeriodo();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      item.loadingTable = false;
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnFinalizaroReinicar(item: any) {
    try {
      item.loadingTable = true;

      let data: IDataResponse = await lastValueFrom(this.periodoService.finalizaroReiniciar(item.nIdPeriodo, 3));
      if (data.exito) {

        this.fnListarPeriodo();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      item.loadingTable = false;
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  redictNivelAct(item: any) {
    if (item.nCodEstado == 2) {
      let sendArray = {
        nIdPeriodo: item.nIdPeriodo,
        disDatCompl: true
      }
      this.sharedData.setPeriodo(sendArray);
    } else {
      let sendArray = {
        nIdPeriodo: item.nIdPeriodo
      }
      this.sharedData.setPeriodo(sendArray);
    }
    this.router.navigate(["/nivel-actividad"]);
  }

  redictDistMensual(item: any) {
    let disab = false;
    if (item.nCodEstado == 3) {
      disab = true;
    }
    let sendArray = {
      nIdPeriodo: item.nIdPeriodo,
      disabled: disab
    }

    this.sharedData.setPeriodo(sendArray);

    this.router.navigate(["/distribucion-mensual"]);
  }

  redictResultadosGei(item: any) {
    this.sharedData.setPeriodo(item.nIdPeriodo);

    let sendArray = {
      nIdPeriodo: item.nIdPeriodo
    }

    this.sharedData.setPeriodo(sendArray);

    this.router.navigate(["/resultados-gei"]);
  }

  async fnDescargarFormato(item: any, cod: number) {
    try {
      let archivo = '';
      if (cod == 1) {
        archivo = item.sRptHuellaCO2;
      } else if (cod == 2) {
        archivo = item.sRptHuellaGeneral;
      }

      let data = await lastValueFrom(this.archivoService.descargarArchivo(archivo));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = archivo;
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


  changeFileObservar($event: any) {
    const labelElement: HTMLElement = document.querySelector('label[for="fileNActividad"]')!;
    let filetemp = $event.target.files[0];

    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx') ||
      filetemp.name.endsWith('doc') || filetemp.name.endsWith('docx') || filetemp.name.endsWith('pdf')
    ) {
      this.uploadObservar = $event.target.files[0];
      labelElement.innerText = this.uploadObservar.name;
      this.noFormatObservar = false;
    } else {
      this.uploadObservar = null!;
      labelElement.innerText = "Seleccionar archivo...";
      this.noFormatObservar = true;
    }
    $event.target.value = null;
  }

  async fnRegistrarObservar(form: NgForm) {

    if (form.invalid || !this.modelObs.sObservacion) {
      return
    }

    this.loadObservar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.registrarObservacion(this.modelObs.nIdPeriodo, this.uploadObservar,
        this.modelObs.sObservacion));

      if (data.exito) {

        this.fnListarPeriodo();
        this.modalService.dismissAll();
        this.loadObservar = false;

        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.loadObservar = false;
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
      this.loadObservar = false;
    }
  }


  openObservar(item: any, contentObservar: any) {
    //console.log('item', item);
    this.modelObs = {
      nAnio: item.nAnio,
      nIdPeriodo: item.nIdPeriodo,
    }
    this.modalService.open(contentObservar, { centered: true, windowClass: "modal-md", backdrop: 'static' });

  }


  openReiniciar(item: any, contentConfirmacion: any) {
    this.itemReiniciar.nIdPeriodo = item.nIdPeriodo;
    this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnReinicar() {
    try {
      this.loadingConf = true;
      let data: IDataResponse = await lastValueFrom(this.periodoService.finalizaroReiniciar(this.itemReiniciar.nIdPeriodo, 1));
      if (data.exito) {

        this.fnListarPeriodo();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    } this.loadingConf = false;
  }

}
