import { Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { NivelActividadService } from 'src/app/services/nivel-actividad.service';
import { EvidenciaService } from 'src/app/services/evidencia.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArchivoService } from 'src/app/services/archivo.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { LocacionService } from 'src/app/services/locacion.service';
import { EmpresaService } from 'src/app/services/empresa.service';

@Component({
  selector: 'app-datos-actividad',
  templateUrl: './datos-actividad.component.html',
  styleUrls: ['./datos-actividad.component.css'],

})
export class DatosActividadComponent implements OnDestroy {
  oUsuario: IUsuario | undefined;
  page = 1;
  pageSize = 10;
  total = 0;

  page_panel = 1;
  pageSize_panel = 10;

  documentos: any;
  lstSector: any[] = [];
  lstEmpresas: any[] = [];
  lstPeriodo: any[] = [];
  lstMes: any[] = [];
  lstDActividad: any[] = [];
  lstPrevDActividad: any[] = [];
  lstEvidencia: any[] = [];
  lstLocXEvidencia: any[] = [];
  nIdEmpresa: any;
  codEmpresa: any;

  sector: any;
  periodo: any;
  codMes: any;
  locXEvidencia: any;

  nombreMes: any;
  oDatoActividad: any;
  nIdFuenteEmision: any;
  nombreFuenteEmision: any;
  empresa: any;
  nEstado: any;
  codEmpresa_ModelDa: any;

  archivosEvidencia: any;
  nIdDatosActividad: any;
  nIdEvidencia: any;
  porcentajeProgreso: any;

  showPanel: boolean = false;
  collapsePanel: boolean = true;
  loadEliminar: boolean = false;
  itemNActividad: any;
  eliminarNActividad: boolean = false;
  eliminarEvidencia: boolean = false;
  esAdmin: boolean = false;
  esFinalizado: boolean = false;

  isAccordionOpen = false;
  idBiogenica = null;
  getDescargas: any = {};

  dragging: boolean = false;
  progressValue: number = 0;
  isUploading: boolean = false;

  tamanio: string;

  @ViewChildren('fileNActivisdad') fileNActividad: QueryList<ElementRef>;
  @ViewChild('fileFEvidencias') fileFEvidencias: any;

  selectedFileName: string | undefined = 'Seleccionar archivo';

  constructor(private toastr: ToastrService,
    private seguridadService: SeguridadService, private periodoService: PeriodoService, private empresaService: EmpresaService,
    private parametroService: ParametroService,
    private nivelActividadService: NivelActividadService, private evidenciaService: EvidenciaService, private locacionService: LocacionService, private modalService: NgbModal,
    private archivoService: ArchivoService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    this.getDescargas.FormatosNA = environment.descargas.FormatosNA;

    const isRoute = this.activatedRoute.snapshot.routeConfig?.path === 'datos-actividad';
    if (isRoute) {
      this.esAdmin = true;
    }

    if (this.oUsuario.sUsuario != undefined) {
      this.nIdEmpresa = localStorage.getItem('LocalIdEmpresa_intercorp');
      this.codEmpresa = localStorage.getItem('LocalCodEmpresa_intercorp');

      // Si es admin:
      if (this.esAdmin) {
        //Si es admin y hay datos mandados de Datos Actividad:
        if (JSON.parse(localStorage.getItem('modelDA_intercorp')!) !== null) {

          const modelDA = JSON.parse(localStorage.getItem('modelDA_intercorp')!);

          this.periodo = modelDA?.nIdPeriodo;
          this.codEmpresa_ModelDa = modelDA?.sCodEmpresa;
          this.empresa = modelDA?.nIdEmpresa;
          this.sector = modelDA?.sCodigoSector;

          this.fnListarSector();
          this.fnListarEmpresa();
          this.fnListarPeriodo();
          this.fnListarLocXEvidencia();
        } else {
          //Si es admin y no hay datos mandados de Datos Actividad:
          this.router.navigate(['/gestionar-periodo']);
        }
      } else {
        this.fnGetTamanio();
        this.fnListarPeriodo();
      }

      this.fnListarMes();
    }
  }

  ngOnDestroy(): void {
    localStorage.setItem('modelDA_intercorp', JSON.stringify(null));
    this.modalService.dismissAll();
  }

  handleDragOverDActividad(event: DragEvent) {
    event.preventDefault();
  }

  handleDropDActividad(event: DragEvent, item: any) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0]; // Obtén el primer archivo
      const fileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        item.mfXlxDac = file;
        item.noFormat = false;
        item.Filename = file.name;
      } else {
        item.mfXlxDac = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        item.noFormat = true;
      }
    }
  }

  handleDragOverEvidencia(event: DragEvent) {
    event.preventDefault();

    if (!Array.from(event.dataTransfer!.types).includes('Files')) {
      this.dragging = false;
      return; // Salir temprano si no es un archivo
    }

    if (!this.isUploading) {
      this.dragging = true;
    }
  }

  handleDropEvidencia(event: DragEvent) {
    event.preventDefault();

    if (!Array.from(event.dataTransfer!.types).includes('Files')) {
      this.dragging = false;
      return; // Salir temprano si no es un archivo
    }

    if (!this.isUploading) {
      this.dragging = false;
      const files: any = event.dataTransfer?.files;
      this.archivosEvidencia = Array.from(files);
      this.registrarEvidencia();
    }
  }


  handleButtonNEvidencia() {
    this.fileFEvidencias.nativeElement.click();
  }

  noResultsDueToBiogenica(): boolean {
    return this.lstDActividad.filter(item => !item.boEsBiogenica).length === 0;
  }

  async fnListarSector() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('SECTOR'));
    if (data.exito) {
      this.lstSector = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  changeSector() {
    this.empresa = null;
    this.periodo = null;
    this.lstDActividad = [];
    this.fnListarEmpresa();
  }

  changeEmpresa() {
    this.periodo = null;
    this.lstDActividad = [];
    const buscarEmpresa = this.lstEmpresas.find(item => item.nIdEmpresa === this.empresa);
    this.codEmpresa_ModelDa = buscarEmpresa.sCodEmpresa;
    this.fnListarPeriodo();
  }

  async fnListarEmpresa() {
    let data: IDataResponse = await lastValueFrom(this.empresaService.listarEmpresa([this.sector]));
    if (data.exito) {
      this.lstEmpresas = data.datoAdicional;
      this.lstPeriodo = [];

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarPeriodo() {
    let idempresa = this.nIdEmpresa;

    if (this.esAdmin) {
      idempresa = this.empresa;
    }

    let data: IDataResponse = await lastValueFrom(this.periodoService.listarByIDEmpresa(idempresa));

    if (data.exito) {
      this.lstPeriodo = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarMes() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('MES'));
      if (data.exito) {
        this.lstMes = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  async fnListarDatosActividad() {

    this.fnListarLocXEvidencia();

    const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.periodo);
    if (periodoEncontrado) {
      this.nEstado = periodoEncontrado.nCodEstado;
      this.esFinalizado = periodoEncontrado.nCodEstado === 2 ? true : false;

    }

    if (!this.periodo || !this.codMes) {
      return
    }
    try {
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarNivelActividad(this.periodo, this.codMes));

      if (data.exito) {
        this.lstDActividad = data.datoAdicional[0].liSublista;
        this.porcentajeProgreso = data.datoAdicional[0].nPorcentaje;
      } else {
        this.lstDActividad = [];

      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    this.archivosEvidencia = null!;
    this.showPanel = false;

  }


  editarNActividad(item: any) {
    item.Filename = 'Seleccionar archivo';
    item.edit = true;
  }

  cancelarNActividad(item: any) {
    item.edit = false;
    item.noFormat = false;
    item.mfXlxDac = null!;
  }


  changeFileDActividad(event: any, item: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        item.mfXlxDac = file;
        item.noFormat = false;
        item.Filename = file.name;
      } else {
        item.mfXlxDac = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        item.noFormat = true;
      }
    }
  }


  triggerHiddenFileInput(index: number) {
    const fileInputElement: HTMLElement | null = document.querySelector(`[name="fileNActividad${index}"]`);
    if (fileInputElement) {
      fileInputElement.click();
    }
  }

  async registrarNActividad(item: any) {
    try {

      if (!item.mfXlxDac) {
        item.noFormat = true;
        this.toastr.warning('Inserte un archivo.', 'Advertencia');
        return
      }

      item.loading = true;

      let idBiogenica = null;

      if (item.oFuenteEmision.sCodFuente == 'GENOE') {
        const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FFBIO");
        if (buscarFFBIO) {
          const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

          idBiogenica = nIdFuenteEmisionValue;
        }
      } else if (item.oFuenteEmision.sCodFuente == 'TRANP') {
        const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FMBIO");
        if (buscarFFBIO) {
          const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

          idBiogenica = nIdFuenteEmisionValue;
        }
      }

      //Obtener el nAnio según this.periodo
      const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.periodo);

      const oDatoActividad = {
        nIdDatosActividad: item.nIdDatosActividad,
        nIdBiogenica: idBiogenica,
        nEstado: this.nEstado,
        oFuenteEmision: {
          nIdFuenteEmision: item.oFuenteEmision.nIdFuenteEmision,
          sCodFuente: item.oFuenteEmision.sCodFuente
        },

        oPeriodo: { nIdPeriodo: this.periodo, nAnio: periodoEncontrado.nAnio, oEmpresa: { nIdEmpresa: this.nIdEmpresa } },
        sCodMes: this.codMes
      }

      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.registrarNivelActividad(item.mfXlxDac, oDatoActividad));

      if (data.exito) {
        item.edit = false;
        item.sXlsDatoActividad = item.Filename;

        Promise.all([this.getListPrevDA()]).then(() => {
          const index = this.lstDActividad.indexOf(item); // Encuentra la posición del objeto item en lstDActividad

          if (index !== -1 && this.lstPrevDActividad[index] && this.lstPrevDActividad[index].sRefXlsDatoActividad) {
            this.lstDActividad[index].nIdDatosActividad = this.lstPrevDActividad[index].nIdDatosActividad;
            this.lstDActividad[index].sRefXlsDatoActividad = this.lstPrevDActividad[index].sRefXlsDatoActividad;
            this.lstDActividad[index].sUsuario = this.lstPrevDActividad[index].sUsuario;
            this.lstDActividad[index].sFechaMod = this.lstPrevDActividad[index].sFechaMod;
            this.lstDActividad[index].bdPorcentajeLocacion = this.lstPrevDActividad[index].bdPorcentajeLocacion;

            this.lstDActividad[index].boCodEstado = this.lstPrevDActividad[index].boCodEstado;

          }

        });

        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        item.noFormat = true;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    item.loading = false;
  }

  async getListPrevDA() {

    let data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarNivelActividad(this.periodo, this.codMes));
    if (data.exito) {
      this.lstPrevDActividad = data.datoAdicional[0].liSublista;
      this.porcentajeProgreso = data.datoAdicional[0].nPorcentaje;
    }
    this.archivosEvidencia = null!;
    this.showPanel = false;
  }


  changeEvidencia(event) {

    if (!this.locXEvidencia) {
      this.toastr.warning('Seleccione una locación', 'Advertencia');
      return;
    }

    const files: FileList = event.target.files;
    this.archivosEvidencia = Array.from(files);


    this.registrarEvidencia();
  }

  async registrarEvidencia() {
    // Verificar la cantidad de archivos.
    if (this.archivosEvidencia.length > 20) {
      this.toastr.warning('No puedes subir más de 20 archivos.', 'Advertencia');
      return;
    }

    this.isUploading = true;
    this.progressValue = 0;

    // Definir el incremento del progreso
    let divisor = this.archivosEvidencia.length === 1 ? 2 : this.archivosEvidencia.length;
    const progressIncrement = 100 / divisor;
    const timeInterval = 500;

    const progressSimulation = setInterval(() => {
      if (this.progressValue < 100 - progressIncrement) {
        this.progressValue += progressIncrement;
      } else {
        clearInterval(progressSimulation);
      }
    }, timeInterval);


    const formatosPermitidos = ['.jpg', '.png', '.pdf', '.zip', '.rar'];
    const archivosNoPermitidos: string[] = [];
    this.archivosEvidencia.forEach(archivo => {
      const ext = '.' + archivo.name.split('.').pop().toLowerCase();
      if (!formatosPermitidos.includes(ext)) {
        archivosNoPermitidos.push(archivo.name);
      }
    });

    //const mensajesArchivosNoPermitidos: string[] = archivosNoPermitidos.map(nombre => `- ${nombre}: No cumple con el formato permitido.`);
    if (this.archivosEvidencia.length === archivosNoPermitidos.length) {
      let contenidoArchivos = archivosNoPermitidos.map(archivo => `<li>${archivo}: No cumple con el formato permitido.</li>`).join('');
      const mensajeFinal = `<ul style="padding-left: 20px; margin: 0;">${contenidoArchivos}</ul>`;
      this.toastr.warning(mensajeFinal, 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });

      this.isUploading = false;
      this.progressValue = 0;
      return;
    }

    this.archivosEvidencia = this.archivosEvidencia.filter(archivo => !archivosNoPermitidos.includes(archivo.name));

    try {
      const oEvidencia = {
        oPeriodo: { nIdPeriodo: this.periodo },
        oFuenteEmision: { nIdFuenteEmision: this.nIdFuenteEmision },
        sCodMes: this.codMes,
        oLocacion: { nIdLocacion: this.locXEvidencia }
      }
      let data: IDataResponse = await lastValueFrom(this.evidenciaService.registrarEvidencia(this.archivosEvidencia, oEvidencia));

      if (data.exito) {
        this.archivosEvidencia = null;
        this.fnListarEvidencia();
        this.lstEvidencia = [];

        if (archivosNoPermitidos.length <= 0) {
          this.toastr.success(data.mensajeUsuario, 'Éxito');
        }

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

      if ((data.datoAdicional && data.datoAdicional.length > 0) || archivosNoPermitidos.length > 0) {

        let contenidoArchivos = archivosNoPermitidos.map(nombre => `<li>${nombre}: No cumple con el formato permitido.</li>`).join('');
        let contenidoErrores = data.datoAdicional.map(ad => `<li>${ad.sXlsEvidencia}: ${ad.sMensaje}</li>`).join('');

        const mensaje = `<ul style="padding-left: 20px; margin: 0;">${contenidoArchivos}${contenidoErrores}</ul>`;

        this.toastr.warning(mensaje, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }

    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    } finally {
      this.isUploading = false;
      this.progressValue = 0;
    }
  }

  openEvidencia(item: any) {
    this.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;
    this.nombreFuenteEmision = item.oFuenteEmision.sNombre;

    this.locXEvidencia = null!;
    //Obtener el nAnio según this.periodo
    const mesEncontrado = this.lstMes.find(mes => mes.sCodigo === this.codMes);
    this.nombreMes = mesEncontrado.sValor;

    this.lstEvidencia = [];
    //this.fnListarEvidencia();
    this.showPanel = true;
    this.collapsePanel = true;
    if (!this.isAccordionOpen) {
      this.toggleAccordion();
    };
  }

  toggleAccordion(): void {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  async fnListarEvidencia() {
    try {
      let data: IDataResponse = await lastValueFrom(this.evidenciaService.listarEvidencia(this.periodo, this.nIdFuenteEmision, this.codMes, this.locXEvidencia));
      if (data.exito) {
        this.lstEvidencia = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  openEliminarNActividad(item: any, contentEliminar: any) {

    this.itemNActividad = item;
    this.eliminarNActividad = true;
    this.nIdDatosActividad = item.nIdDatosActividad;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });

    if (item.oFuenteEmision.sCodFuente == 'GENOE') {
      const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FFBIO");
      if (buscarFFBIO) {
        const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

        this.idBiogenica = nIdFuenteEmisionValue;
      }
    } else if (item.oFuenteEmision.sCodFuente == 'TRANP') {
      const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FMBIO");
      if (buscarFFBIO) {
        const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

        this.idBiogenica = nIdFuenteEmisionValue;
      }
    }

  }

  openEliminarEvidencia(item: any, contentEliminar: any) {
    this.eliminarEvidencia = true;
    this.nIdEvidencia = item.nIdEvidencia;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnEliminarNActividad() {
    try {
      this.loadEliminar = true;
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.eliminarNivelActividad(this.nIdDatosActividad, this.idBiogenica));
      if (data.exito) {

        Promise.all([this.getListPrevDA()]).then(() => {
          const index = this.lstDActividad.indexOf(this.itemNActividad); // Encuentra la posición del objeto item en lstDActividad

          if (index !== -1 && this.lstPrevDActividad[index]) {
            this.lstDActividad[index].nIdDatosActividad = this.lstPrevDActividad[index].nIdDatosActividad;
            this.lstDActividad[index].sXlsDatoActividad = null;
            this.lstDActividad[index].sRefXlsDatoActividad = null;
            this.lstDActividad[index].edit = null;
            this.lstDActividad[index].Filename = null;
            this.lstDActividad[index].sUsuario = this.lstPrevDActividad[index].sUsuario;
            this.lstDActividad[index].sFechaMod = this.lstPrevDActividad[index].sFechaMod;
            this.lstDActividad[index].mfXlxDac = null;
            this.lstDActividad[index].bdPorcentajeLocacion = 0;
          }
        });

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    this.modalService.dismissAll();
    this.loadEliminar = false;
    this.eliminarNActividad = false
  }

  async fnEliminarEvidencia() {
    try {
      this.loadEliminar = true;
      let data: IDataResponse = await lastValueFrom(this.evidenciaService.eliminarEvidencia(this.nIdEvidencia));
      if (data.exito) {
        this.lstEvidencia = []
        this.fnListarEvidencia();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    this.modalService.dismissAll();
    this.loadEliminar = false;
    this.eliminarEvidencia = false
  }



  async fnListarLocXEvidencia() {
    let contenedor = this.periodo;

    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarActivos(contenedor));

      if (data.exito) {
        this.lstLocXEvidencia = data.datoAdicional;

      } else {
        // this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  async fnGetTamanio() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarValor());
      if (data.exito) {
        this.tamanio = data.datoAdicional[0].sValor;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }


  async fnDescargarEvidencia(item: any) {
    let contenedor = this.codEmpresa;

    if (this.esAdmin) {
      contenedor = this.codEmpresa_ModelDa;
    }

    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(contenedor, item.sRefXlsEvidencia, false));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = item.sXlsEvidencia;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 89 ||
          body.codMensaje === 88 || body.codMensaje === 87 ||
          body.codMensaje === 86) {
          this.seguridadService.logout();
          window.open(error.error.mensajeUsuario, '_self');
        } else if (body.codMensaje) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }

  async fnDescargarFormatoFNA() {

    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.codEmpresa, this.getDescargas.FormatosNA, true));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = this.getDescargas.FormatosNA;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 89 ||
          body.codMensaje === 88 || body.codMensaje === 87 ||
          body.codMensaje === 86) {
          this.seguridadService.logout();
          window.open(error.error.mensajeUsuario, '_self');
        } else if (body.codMensaje) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }

  async fnDescargarDatoActividad(item: any) {

    let contenedor = this.codEmpresa;
    if (this.esAdmin) {
      contenedor = this.codEmpresa_ModelDa;
    }


    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(contenedor, item.sRefXlsDatoActividad, false));
      const blob = new Blob([data as unknown as BlobPart])
      let filename = item.sXlsDatoActividad;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const body = JSON.parse(event.target.result);
        if (body.codMensaje === 89 ||
          body.codMensaje === 88 || body.codMensaje === 87 ||
          body.codMensaje === 86) {
          this.seguridadService.logout();
          window.open(error.error.mensajeUsuario, '_self');
        } else if (body.codMensaje) {
          this.toastr.warning(body.mensajeUsuario, 'Advertencia');
        } else {
          this.toastr.error('Existen problemas en el servidor.', 'Error');
        }
      };
      reader.readAsText(error.error);
    }
  }


  async fnActualizarEstado(item: any) {
    this.itemNActividad = item;
    let idBiogenica = null;

    if (item.oFuenteEmision.sCodFuente == 'GENOE') {
      const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FFBIO");
      if (buscarFFBIO) {
        const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

        idBiogenica = nIdFuenteEmisionValue;
      }
    } else if (item.oFuenteEmision.sCodFuente == 'TRANP') {
      const buscarFFBIO = this.lstDActividad.find(item => item.oFuenteEmision.sCodFuente === "FMBIO");
      if (buscarFFBIO) {
        const nIdFuenteEmisionValue = buscarFFBIO.nIdDatosActividad;

        idBiogenica = nIdFuenteEmisionValue;
      }
    }

    //Obtener el nAnio según this.periodo
    const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nIdPeriodo === this.periodo);

    const oDatoActividad = {
      nIdDatosActividad: item.nIdDatosActividad,
      nIdBiogenica: idBiogenica,
      nEstado: this.nEstado,
      oFuenteEmision: {
        nIdFuenteEmision: item.oFuenteEmision.nIdFuenteEmision,
        sCodFuente: item.oFuenteEmision.sCodFuente
      },

      oPeriodo: { nIdPeriodo: this.periodo, nAnio: periodoEncontrado.nAnio, oEmpresa: { nIdEmpresa: this.nIdEmpresa } },
      sCodMes: this.codMes,
      boCodEstado: !item.boCodEstado
    }

    if (!item.boCodEstado) {
      item.bdPorcentajeLocacion = 100;

    } else {
      item.bdPorcentajeLocacion = 0;
    }

    item.sRefXlsDatoActividad = null;
    item.sXlsDatoActividad = null;

    Promise.all([this.getListPrevDA()]).then(() => {
      const index = this.lstDActividad.indexOf(this.itemNActividad); // Encuentra la posición del objeto item en lstDActividad
      if (index !== -1 && this.lstPrevDActividad[index]) {
        this.lstDActividad[index].sUsuario = this.lstPrevDActividad[index].sUsuario;
        this.lstDActividad[index].sFechaMod = this.lstPrevDActividad[index].sFechaMod;
      }
    });

    try {
      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.cambiarEstado(oDatoActividad));

      if (data.exito) {
        let data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarNivelActividad(this.periodo, this.codMes));
        if (data.exito) {
          this.porcentajeProgreso = data.datoAdicional[0].nPorcentaje;
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 97 || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  retornar() {
    this.router.navigate(['/gestionar-periodo']);
  }
}




