import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Periodo } from 'src/app/models/periodo';
import { IUsuario } from 'src/app/models/usuario';
import { EmpresaService } from 'src/app/services/empresa.service';
import { FuenteEmisionService } from 'src/app/services/fuente-emision.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-periodos-calculo',
  templateUrl: './periodos-calculo.component.html',
  styleUrls: ['./periodos-calculo.component.css']
})
export class PeriodosCalculoComponent implements OnInit, OnDestroy {
  oUsuario: IUsuario;
  page = 1;
  pageSize = 10;
  total = 0;

  page_modal = 1;
  pageSize_modal = 5;

  sfNuevoPeriodo: boolean = false;
  isRegistrar: boolean = false;
  isLoadingReg: boolean = false;
  loadModal: boolean = false;
  loadEliminar: boolean = false;
  loadDesLocacion: boolean = false;
  esAdmin: boolean = false;
  selectSector: boolean = false;

  selectedItems: any[] = [];
  lstFuenteEmision: any[] = [];
  lstPeriodos: any[] = [];
  lstDetalle: any[] = [];
  lstDetalleSP: any[] = [];
  lstSector: any[] = [];
  lstEmpresas: any[] = [];
  lstInactivas: any[] = [];

  nIdEmpresa: any;
  modal: any = {};
  idsFuenteEmisionTrue: any;
  selectedItem: any;
  nIdPeriodo: any

  sector: any;
  empresa: any;
  porcentajeProgreso: any;
  model: Periodo = new Periodo();

  showLocXPeriodo: boolean = true;
  loadingRegLocXPerido: boolean = false;

  constructor(private modalService: NgbModal, private toastr: ToastrService, private seguridadService: SeguridadService,
    private fuenteEmision: FuenteEmisionService, private periodoService: PeriodoService,
    private empresaService: EmpresaService, private locacionService: LocacionService,
    private router: Router, private activatedRoute: ActivatedRoute,
    private parametroService: ParametroService) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.nIdEmpresa = localStorage.getItem('LocalIdEmpresa_intercorp');
      const localSector = localStorage.getItem('sectorPeriodo_intercorp');
      const localEmpresa = localStorage.getItem('empresaPeriodo_intercorp');

      const isRoute = this.activatedRoute.snapshot.routeConfig?.path === 'gestionar-periodo';
      if (isRoute) {
        this.esAdmin = true;
      }
      if (this.esAdmin) {
        this.fnListarSector();

      } else {
        this.fnListarByIDEmpresa();
        this.fnListarFuenteEmision();
      }

      //Si se han preseleccionado los datos asignarlos de nuevo al dar click sobre el botón Regresar
      if (localSector && localEmpresa) {
        this.sector = localSector;
        this.fnListarEmpresa();
        this.empresa = Number(localEmpresa);
        this.fnListarByIDEmpresa();
      }

    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  /* --------------Truncar los números----------- */
  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  formatWithCommas(value: number): string {
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }



  validateNumbers(event: KeyboardEvent): void {
    const pattern = /[0-9]/; // Permite solo números
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // Si no es un número, evita la entrada
      event.preventDefault();
    }
  }

  validateUnitAndDecimals(event: KeyboardEvent, index: number): void {
    const pressedKey = event.key;
    const inputElement = event.target as HTMLInputElement;

    // Obtener la posición actual del cursor, el valor actual del input y el rango de selección.
    const cursorPosition = inputElement.selectionStart || 0;
    const endSelectionPosition = inputElement.selectionEnd || 0;
    let currentValue = inputElement.value;

    // Construir el valor anticipado teniendo en cuenta el rango de selección.
    const anticipatedValue = currentValue.slice(0, cursorPosition) + pressedKey + currentValue.slice(endSelectionPosition);

    const isNumber = (pressedKey >= '0' && pressedKey <= '9');
    const isDot = (pressedKey === '.');

    if ((!isNumber && !isDot) || (isDot && currentValue.includes('.'))) {
      event.preventDefault();
      return;
    }

    // Validar el valor anticipado.
    const [integerPart = '', decimalPart = ''] = anticipatedValue.split('.');

    if (isNumber) {
      // Si la parte entera del valor anticipado tiene más de 10 dígitos, previene la entrada.
      if (integerPart.length > 10) {
        event.preventDefault();
        return;
      }

      // Si la parte decimal del valor anticipado tiene más de 2 dígitos, previene la entrada.
      if (decimalPart.length > 2) {
        event.preventDefault();
        return;
      }
    }
  }

  async fnListarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('SECTOR'));
      if (data.exito) {
        this.lstSector = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
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

  async fnListarEmpresa() {
    this.empresa = null;
    this.selectSector = true;

    let data: IDataResponse = await lastValueFrom(this.empresaService.listarEmpresa([this.sector]));
    if (data.exito) {
      this.lstEmpresas = data.datoAdicional;

      if (!this.empresa) {
        this.lstPeriodos = [];
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  changeEmpresa() {
    if (this.empresa) {
      this.fnListarByIDEmpresa();
    }
  }

  async fnListarFuenteEmision() {
    let data: IDataResponse = await lastValueFrom(this.fuenteEmision.listarFuenteEmision());
    if (data.exito) {
      this.lstFuenteEmision = data.datoAdicional;

    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarByIDEmpresa() {
    let idEmpresa = this.nIdEmpresa;
    if (this.esAdmin) {
      idEmpresa = this.empresa;
    }
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarByIDEmpresa(idEmpresa));
      if (data.exito) {
        this.lstPeriodos = data.datoAdicional;
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

  async fnListarDetalle() {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarDetalle(this.modal.nIdPeriodo));
      if (data.exito) {
        this.lstDetalle = data.datoAdicional;
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

  async fnListarInactivas() {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarInactivas(this.modal.nIdPeriodo));
      if (data.exito) {
        this.lstInactivas = data.datoAdicional;
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

  isSelected(item: any): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  toggleSelection(item: any): void {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    } else {
      this.selectedItems.push(item);
    }
  }

  openDetalle(item: any, contentLocacion: any) {
    this.modal.nIdPeriodo = item.nIdPeriodo;
    this.modal.nAnio = item.nAnio;
    this.modal.nCodEstado = item.nCodEstado;
    this.porcentajeProgreso = item.nPorcentaje;
    /* this.porcentajeProgreso = 100; */

    this.fnListarDetalle();
    this.fnListarInactivas();
    this.modalService.open(contentLocacion, { centered: true, windowClass: "modal-xxl", backdrop: 'static' });
  }

  openEditar(item: any) {
    this.isRegistrar = false;
    this.selectedItem = item.nIdPeriodo;
    this.modal.nIdPeriodo = item.nIdPeriodo;
    this.modal.nCodEstado = item.nCodEstado;
    this.modal.nAnio = item.nAnio;
    this.model.nAnio = item.nAnio;
    this.sfNuevoPeriodo = true;

    this.idsFuenteEmisionTrue = item.liFuenteEmision
      .filter((fuente) => fuente?.boCodEstado) // Filtrar solo los objetos con boCodEstado en true
      .map((fuente) => fuente?.nIdFuenteEmision); // Obtener los valores de nIdFuenteEmision

    this.model.liFuenteEmision = this.idsFuenteEmisionTrue;
  }

  async registrarPeriodo(form: NgForm) {
    const regex = /^[0-9]+$/;
    if (!this.model.nAnio || this.model.liFuenteEmision?.length <= 0) {
      this.toastr.warning('Complete los campos.', 'Advertencia');
      return
    }

    //Si el año del item es igual al año del input no ocurre la siguiente restricción
    if (this.modal.nAnio !== this.model.nAnio) {
      const existeAnio = this.lstPeriodos.some(item => item.nAnio === parseInt(this.model.nAnio));
      if (existeAnio) {
        this.toastr.warning('El periodo ya se encuentra registrado.', 'Advertencia');
        return
      }
    }

    if (this.model.nAnio < 2000 || this.model.nAnio > 2200 || !regex.test(this.model.nAnio)) {
      this.toastr.warning('Ingrese un año con un valor correcto.', 'Advertencia');
      return
    }

    this.isLoadingReg = true;
    let object: any = {};
    let liFuenteEmision: any;

    liFuenteEmision = this.model?.liFuenteEmision?.map((nIdFuenteEmision: number) => ({
      nIdFuenteEmision,
      boCodEstado: true
    }));

    if (this.isRegistrar) {
      object = {
        nIdPeriodo: -1,
        nAnio: this.model.nAnio,
        oEmpresa: {
          nIdEmpresa: this.nIdEmpresa
        },
        liFuenteEmision: liFuenteEmision,
        boActualizarFecha: false
      }
    } else {

      let oActualizarFecha = true;
      if (this.modal.nAnio == this.model.nAnio) {
        oActualizarFecha = false;
      }

      // Inicializamos la propiedad liFuenteEmision como un array vacío
      object = {
        nIdPeriodo: this.modal.nIdPeriodo,
        nAnio: this.model.nAnio,
        oEmpresa: {
          nIdEmpresa: this.nIdEmpresa
        },
        liFuenteEmision: liFuenteEmision,
        boActualizarFecha: oActualizarFecha
      }

      object.liFuenteEmision = [];

      // Recorremos los elementos de this.idsFuenteEmisionTrue
      for (const id of this.idsFuenteEmisionTrue) {
        const boCodEstado = this.model.liFuenteEmision.includes(id);
        object.liFuenteEmision.push({
          nIdFuenteEmision: id,
          boCodEstado: boCodEstado
        });
      }

      // Agregamos los elementos de this.model.liFuenteEmision que no están en this.idsFuenteEmisionTrue
      for (const id of this.model.liFuenteEmision) {
        if (!this.idsFuenteEmisionTrue.includes(id)) {
          object.liFuenteEmision.push({
            nIdFuenteEmision: id,
            boCodEstado: true
          });
        }
      }
    }

    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.insertOActual(object));
      if (data.exito) {

        this.sfNuevoPeriodo = false;
        this.selectedItem = null!;
        this.fnListarByIDEmpresa();
        this.model = new Periodo();
        this.modal = {};
        this.isLoadingReg = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.isLoadingReg = false;
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
    this.isLoadingReg = false;
  }
  nuevoPeriodo() {
    this.modal.nCodEstado = null;
    this.sfNuevoPeriodo = true;
    this.selectedItem = null!;
    this.isRegistrar = true;
  }

  closePanel() {
    this.sfNuevoPeriodo = false;
    this.selectedItem = null!;
    this.model = new Periodo();
    this.modal = {};

  }
  // Función para calcular la página del error y cambiar 'page_modal'
  navigateToErrorPage(itemIndex: number) {
    // Calcula la página basándote en el índice del elemento y el tamaño de página
    const pageWithError = Math.floor(itemIndex / this.pageSize_modal) + 1; // Asumiendo que 'pageSize_modal' es el número de elementos por página

    this.page_modal = pageWithError; // Actualiza la página actual con la página del error
    // Si es necesario, asegúrate de que el cambio en la paginación se refleje en la UI. Esto puede depender de cómo esté estructurada tu paginación.
  }


  async fnInsertarDetalle(form: NgForm) {
    const regexNum = /^\d{0,4}$/; // para nNumColaboradores
    const regexDecimals = /^(\d{1,10})(\.\d{1,2})?$|^$/; // para bdAreaTotal y bdMontoVentas

    for (let [index, item] of this.lstDetalle.entries()) { // Usamos 'entries' para tener acceso al índice
      if (!regexNum.test(item.nNumColaboradores)) {
        this.toastr.warning('Solo se permiten números enteros para los colaboradores.', 'Advertencia');
        this.navigateToErrorPage(index);
        return;
      }

      if (!regexDecimals.test(item.bdAreaTotal) || !regexDecimals.test(item.bdMontoVentas)) {
        this.toastr.warning('El área total y el monto de ventas deben tener hasta 10 dígitos y hasta 2 decimales.', 'Advertencia');
        this.navigateToErrorPage(index);
        return;
      }
    }

    this.loadModal = true;
    let resultados: any = [];

    for (let i = 0; i < this.lstDetalle.length; i++) {
      let oNumColaboradores = this.lstDetalle[i].nNumColaboradores ? this.lstDetalle[i].nNumColaboradores : 0;
      let oAreaTotal = this.lstDetalle[i].bdAreaTotal ? this.lstDetalle[i].bdAreaTotal : 0;
      let oMontoVentas = this.lstDetalle[i].bdMontoVentas ? this.lstDetalle[i].bdMontoVentas : 0;
      let liDetalle = {
        nIdDetalleLocacion: this.lstDetalle[i].nIdDetalleLocacion,
        nNumColaboradores: oNumColaboradores,
        bdAreaTotal: oAreaTotal,
        bdMontoVentas: oMontoVentas,
        oLocacion: {
          nIdLocacion: this.lstDetalle[i].oLocacion.nIdLocacion
        },
      };
      resultados.push(liDetalle);
    }


    let oDetalleLocacion = {
      liDetalle: resultados
    }

    let data: IDataResponse = await lastValueFrom(this.locacionService.actDetalleLocacioncacion(oDetalleLocacion));
    if (data.exito) {

      this.fnListarByIDEmpresa();
      this.modalService.dismissAll();
      this.showLocXPeriodo = true;
      this.page_modal = 1;
      //this.toastr.success(data.mensajeUsuario, 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }

    this.loadModal = false;
  }


  openEliminarPeriodo(item: any, contentEliminar: any) {
    this.nIdPeriodo = item.nIdPeriodo;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async eliminarPeriodo() {
    this.loadEliminar = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.eliminarPeriodo(this.nIdPeriodo));
      if (data.exito) {
        if (this.nIdPeriodo == this.modal.nIdPeriodo) {
          this.sfNuevoPeriodo = false;
        }
        this.fnListarByIDEmpresa();
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
    this.modalService.dismissAll();
    this.loadEliminar = false;
  }


  async cambiarEstado(item: any, id: number) {
    item.loading = true;

    let codEstado = 2;

    if (item.nCodEstado == 2) {
      codEstado = 1;
    }

    let oPeriodo =
    {
      nIdPeriodo: item.nIdPeriodo,
      oEmpresa: {
        nIdEmpresa: this.nIdEmpresa
      },
      nAnio: item.nAnio,
      nCodEstado: codEstado //Reiniciar o Finalizar
    };

    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.actualizarEstado(oPeriodo));
      if (data.exito) {
        this.fnListarByIDEmpresa();
        item.loading = false;
      } else {
        item.loading = false;
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
        item.loading = false;
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  redictDatosActividad(item: any) {
    localStorage.setItem('idPeriodo_intercorp', item.nIdPeriodo);

    localStorage.setItem('sectorPeriodo_intercorp', this.sector);

    localStorage.setItem('empresaPeriodo_intercorp', this.empresa);


    //Buscar empresa por nIdEmpresa
    const buscarEmpresa = this.lstEmpresas.find(item => item.nIdEmpresa === this.empresa);

    let modelDA: any = {};
    modelDA.nIdPeriodo = item.nIdPeriodo;
    modelDA.sCodEmpresa = buscarEmpresa.sCodEmpresa;
    modelDA.sNombreComercial = buscarEmpresa.sNombreComercial;
    modelDA.nIdEmpresa = buscarEmpresa.nIdEmpresa;
    modelDA.sCodigoSector = this.sector;


    localStorage.setItem('modelDA_intercorp', JSON.stringify(modelDA));

    this.router.navigate(["/datos-actividad"]);

  }

  //Descargar Detalle de Locación
  async fnDescargarDetLocacion() {
    this.loadDesLocacion = true;
    const buscarEmpresa = this.lstEmpresas.find(item => item.nIdEmpresa === this.empresa);
    try {
      let data = await lastValueFrom(this.periodoService.descargarArchivo(this.modal.nIdPeriodo, this.modal.nAnio));
      const blob = new Blob([data as unknown as BlobPart]);
      let filename = 'Locaciones ' + buscarEmpresa.sNombreComercial + ' ' + this.modal.nAnio + '.xlsx';
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
    this.loadDesLocacion = false;
  }


  async fnEliminarDetXLoc(item: any) {

    let data: IDataResponse = await lastValueFrom(this.locacionService.actualizarEstado(item.nIdDetalleLocacion, false));
    if (data.exito) {
      const index = this.lstDetalle.findIndex(i => i.nIdDetalleLocacion === item.nIdDetalleLocacion);
      if (index !== -1) {
        this.lstDetalle.splice(index, 1);
      }
      //this.fnListarDetalle();
      this.fnListarInactivas();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }



  async fnRegistrarDetXLoc() {
    this.loadingRegLocXPerido = true;

    let oDetalleLocacion: any = {
      oPeriodo: {
        // Asumiendo que tienes un valor fijo o dinámico para 'nIdPeriodo'
        nIdPeriodo: this.modal.nIdPeriodo  // reemplaza con tu lógica correspondiente
      },
      liDetalle: []
    };

    // Verificar si 'this.modal.liLocaciones' existe y tiene elementos
    if (this.modal.liLocaciones && this.modal.liLocaciones.length > 0) {
      // Si hay locaciones, las agregamos al array 'liDetalle'
      this.modal.liLocaciones.forEach(locacionId => {
        let locacionObj = {
          oLocacion: {
            nIdLocacion: locacionId
          }
        };
        oDetalleLocacion.liDetalle.push(locacionObj);
      });
    }


    let data: IDataResponse = await lastValueFrom(this.locacionService.regDetalleLocacion(oDetalleLocacion));
    if (data.exito) {
      this.showLocXPeriodo = true;
      this.modal.liLocaciones = [];
      this.fnListarInactivas();
      /*  this.fnListarDetalle(); */

      let data: IDataResponse = await lastValueFrom(this.locacionService.listarDetalle(this.modal.nIdPeriodo));
      if (data.exito) {
        this.lstDetalleSP = data.datoAdicional;

        // Mapa para saber qué elementos de lstDetalleSP existen en lstDetalle
        const mapDetalleSP = new Map<number, any>();
        for (const item of this.lstDetalleSP) {
          mapDetalleSP.set(item.nIdDetalleLocacion, item);
        }

        // Copiamos lstDetalle a newLstDetalle
        const newLstDetalle: any = [...this.lstDetalle];

        // Agregar nuevos al inicio si no existen y no sobrescribir los existentes
        for (const item of this.lstDetalleSP) {
          const existingItemIndex: number = newLstDetalle.findIndex(detalle => detalle.nIdDetalleLocacion === item.nIdDetalleLocacion);
          if (existingItemIndex === -1) {
            newLstDetalle.unshift(item);  // Agregar al inicio si no existe
          }
          // Si ya existe, no hacemos nada para no sobrescribir la información actual
        }

        // Eliminar elementos que no existen en lstDetalleSP
        for (const item of newLstDetalle) {
          if (!mapDetalleSP.has(item.nIdDetalleLocacion)) {
            const index = newLstDetalle.findIndex(detalle => detalle.nIdDetalleLocacion === item.nIdDetalleLocacion);
            if (index > -1) {
              newLstDetalle.splice(index, 1);
            }
          }
        }

        this.lstDetalle = newLstDetalle;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

      this.toastr.success(data.mensajeUsuario, 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.loadingRegLocXPerido = false;
  }

  cancelRegDetXLoc() {
    this.showLocXPeriodo = true;
    this.modal.liLocaciones = [];
    this.page_modal = 1;
  }
}

