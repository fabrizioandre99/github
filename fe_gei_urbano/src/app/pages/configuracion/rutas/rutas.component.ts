import { Component, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { SeguridadService } from '../../../services/seguridad.service';
import { RutaService } from '../../../services/ruta.service';
import { Ruta } from '../../../models/ruta';
import { Router } from '@angular/router';
import { Vehiculo } from '../../../models/vehiculo';
import { VehiculoService } from '../../../services/vehiculo.service';
import { ParametroService } from '../../../services/parametro.service';
import { QueryList } from '@angular/core';
import { ElementRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FactorEmision } from '../../../models/factorEmision';
import { FactorEmisionService } from '../../../services/factor-emision.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.css'
})
export class RutasComponent {

  lstRutas: any[] = [];
  lstVehiculos: any[] = [];
  lstTipoVehiculo: any[] = [];
  lstEmpresa: any[] = [];
  lstCategoria: any[] = [];
  lstCombustible: any[] = [];

  idRutaSelected: number = -1;

  pageA = 1;
  pageSizeA = 5;
  totalA = 0;

  pageB = 1;
  pageSizeB = 10;
  totalB = 0;

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  fShowSkeletonVehiculo: boolean = false;
  lstSkeletonA = Array(5);
  lstSkeletonB = Array(5);

  fShowVehiculo: boolean = false;

  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;

  isEditarRuta: boolean = false;
  isEditarVehiculo: boolean = false;

  oUsuario: IUsuario;
  model: Ruta = new Ruta();
  moVehiculo: Vehiculo = new Vehiculo();

  patronRuta = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]+$/u;
  patronRecorrido = /^\d{1,7}(\.\d{1,2})?$/u;
  patronDecimal = /^[0-9.]+$/u;
  patronAnio = /^(1|2)(0|9){0,1}[0-9]{0,1}[0-9]{0,1}$/u;
  patronDescripcion = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ,.\-: ]*$/u;
  patronVacio = /^\s*\S[\s\S]*$/u;
  patronPlaca = /^[a-zA-Z0-9\- ]+$/u;

  xlsxCargaMasiva: any = new Vehiculo();
  selectedFileName: string | undefined = 'Seleccionar archivo';

  getDescargas: any = {};

  @ViewChildren('fileCargaMasiva') fileCargaMasiva: QueryList<ElementRef>;



  constructor(private router: Router, private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService, private rutaService: RutaService, private vehiculoService: VehiculoService,
    private parametroService: ParametroService, private factorEmisionService: FactorEmisionService
  ) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.getDescargas.FormatoCargaMasiva = environment.descargas.FormatoCargaVehiculos;
      this.xlsxCargaMasiva.loading = false;
      this.xlsxCargaMasiva.Filename = 'Seleccionar archivo';
      this.fnListarRutas();
      this.fnListarTipoVehiculo();
      this.fnListarParametros();
      this.fnListarCombustible();
    }
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  async fnListarParametros() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo("CATEGORIA_VEHICULO"));

      if (data.exito) this.lstCategoria = data.datoAdicional;
      else this.toastr.warning(data.mensajeUsuario, 'Advertencia');

      data = await lastValueFrom(this.parametroService.listarActivosPorTipo("EMPRESAS_TRANSPORTE"));

      if (data.exito) this.lstEmpresa = data.datoAdicional;
      else this.toastr.warning(data.mensajeUsuario, 'Advertencia');

      this.fShowSkeleton = false;
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  validarAlTipear(patron: RegExp, evento: KeyboardEvent): boolean {
    // Obtener la tecla presionada
    let inputChar = String.fromCharCode(evento.charCode);

    // Si es una tecla especial como backspace, dejarla pasar
    if (evento.key === "Backspace" || evento.key === "Tab") {
      return true;
    }

    // En caso contrario, verificar si el carácter ingresado está en el patrón.
    if (!patron.test(inputChar)) {
      // Prevenir la entrada del carácter no deseado
      evento.preventDefault();
      return false;
    }
    return true;
  }

  permitirNumerosYPunto(event: KeyboardEvent) {
    const inputValue = this.model.bdRecorridoTotal ? this.model.bdRecorridoTotal.toString() : '';
    const validCharacters = /^[0-9.]$/;

    if (!validCharacters.test(event.key) || (event.key === '.' && inputValue.includes('.'))) {
      // Evitar caracteres no permitidos o más de un punto
      event.preventDefault();
    }
  }


  cumpleconPatron(patron: RegExp, valor: any): boolean {
    return patron.test(valor);
  }

  openRegistrarRuta(contentRegistrarRuta: any) {
    this.model = new Ruta;
    this.modalService.open(contentRegistrarRuta, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  openEditarRuta(contentRegistrarRuta: any, item: any) {
    this.isEditarRuta = true;
    const sCodEmpresa: string = this.lstEmpresa.filter((emp) => emp.sValor == item.sCodEmpresa)[0].sCodigo;
    const sCategoria: string = this.lstCategoria.filter((cat) => cat.sValor == item.sCodCategoria)[0].sCodigo;
    let object = Object.assign({}, item);
    this.model = object;
    this.model.sEmpresa = sCodEmpresa;
    this.model.sCategoria = sCategoria;
    console.log('item', this.model);
    const modalRef = this.modalService.open(contentRegistrarRuta, { centered: true, windowClass: "modal-md", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarRuta = false;
      }, 200);

    });
  }

  openEliminar(contentEliminar: any, item: any) {
    this.model.nIdRuta = item.nIdRuta;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarRutas() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.rutaService.listarRuta());

      console.log('data rutas', data);
      if (data.exito) {
        this.lstRutas = data.datoAdicional;

        console.log('lstRutas', this.lstRutas);
        this.fShowSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async actualizarRuta(item: any) {
    try {
      let data: IDataResponse = await lastValueFrom(this.rutaService.actualizarRuta(item.nIdRuta, !item.boCodEstado));
      if (data.exito) {
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        item.boCodEstado = !item.boCodEstado;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
  }

  async fnRegistrarRuta(form: NgForm) {
    try {
      if (form.invalid) return;

      this.loadRegOEdit = true;
      let idRuta = -1;

      if (this.isEditarRuta) idRuta = this.model.nIdRuta;

      let oRuta = {
        nIdRuta: idRuta,
        sNombre: this.model.sNombre?.replace(/\s+/g, ' ').trim(),
        sDescripcion: this.model.sDescripcion,
        sCodCategoria: this.model.sCodCategoria,
        sCodEmpresa: this.model.sCodEmpresa,
        bdPromViajesMes: this.model.bdPromViajesMes,
        bdRecorridoTotal: this.model.bdRecorridoTotal,
        boCodEstado: this.model.boCodEstado
      }

      let data: IDataResponse = await lastValueFrom(this.rutaService.editOrRegisRuta(oRuta));

      if (data.exito) {
        this.loadRegOEdit = false;
        this.fnListarRutas();
        this.modalService.dismissAll();
      } else {
        this.loadRegOEdit = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);

      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

  async fnEliminarRuta() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdRuta', this.model.nIdRuta);
      let data: IDataResponse = await lastValueFrom(this.rutaService.eliminarRuta(this.model.nIdRuta));
      if (data.exito) {
        this.lstRutas = []
        this.fnListarRutas();
        this.modalService.dismissAll();
      } else {
        this.modalService.dismissAll();
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else this.router.navigate(['/error-500']);
    }
    this.loadEliminar = false;

  }

  //Vehiculos
  async fnListarVehiculos(item: any) {

    try {
      this.idRutaSelected = item.nIdRuta;
      this.fShowVehiculo = true;
      this.fShowSkeletonVehiculo = true;
      let object = Object.assign({}, item);
      this.model = object;
      let data: IDataResponse = await lastValueFrom(this.vehiculoService.listarVehiculo(this.model.nIdRuta));

      if (data.exito) {
        this.lstVehiculos = data.datoAdicional;
        this.fShowSkeletonVehiculo = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);

      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

  openRegistrarVehiculo(contentRegistrarVehiculo: any) {
    this.moVehiculo = new Vehiculo;
    this.modalService.open(contentRegistrarVehiculo, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
  }

  openEditarVehiculo(contentRegistrarVehiculo: any, item: any) {
    this.isEditarVehiculo = true;
    //console.log('item', item);
    let object = Object.assign({}, item);
    this.moVehiculo = object;
    const modalRef = this.modalService.open(contentRegistrarVehiculo, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarVehiculo = false;
      }, 200);

    });
  }

  openEliminarVehiculo(contentEliminarVehiculo: any, item: any) {
    this.moVehiculo.nIdVehiculo = item.nIdVehiculo;
    this.modalService.open(contentEliminarVehiculo, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  openCargaMasiva(contentCargaMasiva: any) {
    this.moVehiculo = new Vehiculo;
    this.modalService.open(contentCargaMasiva, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
  }

  async fnListarTipoVehiculo() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo('TIPOS_VEHICULOS'));
    if (data.exito) {
      this.lstTipoVehiculo = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnRegistrarVehiculo(form: NgForm) {
    try {
      if (form.invalid) return;
      this.loadRegOEdit = true;
      let idVehiculo = -1;

      if (this.isEditarVehiculo) idVehiculo = this.moVehiculo.nIdVehiculo;

      let oVehiculo = {
        nIdVehiculo: idVehiculo,
        oRuta: { nIdRuta: this.model.nIdRuta },
        sPlaca: this.moVehiculo.sPlaca?.replace(/\s+/g, ' ').trim(),
        nAnio: this.moVehiculo.nAnio,
        sCodCombustible: this.moVehiculo.sCodCombustible,
        sTecnologia: "",
        sCodTipoVehiculo: this.moVehiculo.sCodTipoVehiculo
      }

      let data: IDataResponse = await lastValueFrom(this.vehiculoService.editOrRegisVehiculo(oVehiculo));

      if (data.exito) {
        this.loadRegOEdit = false;
        this.fnListarVehiculos(this.model);
        this.modalService.dismissAll();
      } else {
        this.loadRegOEdit = false;
        this.modalService.dismissAll();
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);

      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

  async fnEliminarVehiculo() {
    try {
      this.loadEliminar = true;
      let data: IDataResponse = await lastValueFrom(this.vehiculoService.eliminarVehiculo(this.moVehiculo.nIdVehiculo));
      if (data.exito) {
        this.lstVehiculos = []
        this.fnListarVehiculos(this.model);
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);

      } else {
        this.router.navigate(['/error-500']);
      }
    }
    this.loadEliminar = false;

  }

  async fnCargaMasiva(form: NgForm) {
    try {

      if (form.invalid) return;
      this.loadRegOEdit = true;

      if (!this.xlsxCargaMasiva.mfXlsxVehiculo) {
        this.xlsxCargaMasiva.noFormat = true;
        this.toastr.warning('Inserte un archivo.', 'Advertencia');
        return;
      }

      this.xlsxCargaMasiva.loading = true;

      let oVehiculo = {
        oRuta: { nIdRuta: this.model.nIdRuta },
      }

      let data: IDataResponse = await lastValueFrom(this.vehiculoService
        .cargaMasiva(this.xlsxCargaMasiva.mfXlsxVehiculo, oVehiculo));

      if (data.exito) {
        this.xlsxCargaMasiva.loading = false;
        this.toastr.success(data.mensajeUsuario, 'Éxito');
        this.xlsxCargaMasiva.Filename = 'Seleccionar archivo';

        this.loadRegOEdit = false;
        this.fnListarVehiculos(this.model);
        this.modalService.dismissAll();
      } else {
        this.loadRegOEdit = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');1
      }

      this.xlsxCargaMasiva.loading = false;
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

  async fnDescargarFormato() {
    try {
      let data = await lastValueFrom(this.vehiculoService.descargarFormato());
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
  }

  //Carga masiva
  insertarCargaMasiva(event: any, xlsxCargaMasiva: any) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        xlsxCargaMasiva.mfXlsxVehiculo = file;
        xlsxCargaMasiva.noFormat = false;
        xlsxCargaMasiva.Filename = file.name;
      } else {
        xlsxCargaMasiva.mfXlsxVehiculo = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        xlsxCargaMasiva.noFormat = true;
      }
    }
  }

  triggerHiddenFileInput() {
    const fileInputElement: HTMLElement | null = document.querySelector(`[name="fileCargaMasiva"]`);
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
        xlsxCargaMasiva.mfXlsxVehiculo = file;
        xlsxCargaMasiva.noFormat = false;
        xlsxCargaMasiva.Filename = file.name;
      } else {
        xlsxCargaMasiva.mfXlsxVehiculo = null;
        this.toastr.warning('Inserte un archivo en formato .xls o .xlsx.', 'Advertencia');
        xlsxCargaMasiva.noFormat = true;
      }
    }
  }

  
  async fnListarCombustible() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarTipoCombustible());

      if (data.exito) {
        this.lstCombustible = data.datoAdicional;
        this.fShowSkeleton = false;
      } else this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    } catch (error: any) {
      if (error.error.codMensaje != undefined && (error.error.codMensaje >= 86 || error.error.codMensaje <= 99)) {
        this.seguridadService.logout(error.error.mensajeUsuario);
      } else {
        this.router.navigate(['/error-500']);
      }
    }
  }

}
