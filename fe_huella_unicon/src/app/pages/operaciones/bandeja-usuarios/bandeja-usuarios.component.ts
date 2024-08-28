import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription, lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { BackCloseService } from 'src/app/services/back-close.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { BandejaUsuario } from 'src/app/models/bandeja-usuario';
import { ParametroService } from 'src/app/services/parametro.service';
import { ArchivoService } from 'src/app/services/archivo.service';
import { UnidadNegocioService } from 'src/app/services/unidad-negocio.service';
import { environment } from 'src/environments/environment';
import { CargaMasivaService } from 'src/app/services/carga-masiva.service';

@Component({
  selector: 'app-bandeja-usuarios',
  templateUrl: './bandeja-usuarios.component.html',
  styleUrls: ['./bandeja-usuarios.component.css']
})
export class BandejaUsuariosComponent implements OnInit, OnDestroy {

  lstListarUsuario: any[] = [];
  lstPerfilUsuario: any[] = [];
  lstTipoDocumento: any[] = [];
  lstUnidadNegocio: any[] = [];

  page = 1;
  pageSize = 10;
  total = 0;

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  lstSkeleton = Array(4);

  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;
  loadRegistrarCM: boolean = false;
  isEditarUsuario: boolean = false;
  noFormatCargaMasiva: boolean = false;
  loadCargaMasiva: boolean = false;

  oUsuario: IUsuario;
  model: BandejaUsuario = new BandejaUsuario();
  labelCargaMasiva: any;
  //Archivo
  uploadCargaMasiva: File;
  getDescargas: any = {};
  private suscripcionCarga: Subscription;

  @ViewChild('fileCargaMasiva', { static: true }) fileCargaMasiva: ElementRef;
  subscription: Subscription;

  constructor(private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService, private backCloseService: BackCloseService,
    private usuarioService: UsuarioService, private parametroService: ParametroService,
    private unidadNegocioService: UnidadNegocioService,
    private archivoService: ArchivoService,
    public cargaMasivaService: CargaMasivaService
  ) {

    this.suscripcionCarga = this.cargaMasivaService.estaCargando().subscribe(
      (estadoCarga) => {
        this.loadCargaMasiva = estadoCarga;
      }
    );
  }

  dragOverHandler(ev: DragEvent) {
    ev.preventDefault();
  }

  dropHandler(ev: DragEvent) {
    ev.preventDefault();

    if (ev.dataTransfer?.items) {
      if (ev.dataTransfer.items[0].kind === 'file') {
        const file = ev.dataTransfer.items[0].getAsFile();
        if (file) {
          this.changeCargaMasiva({ target: { files: [file] } });
        }
      }
    } else {
      this.changeCargaMasiva({ target: { files: ev.dataTransfer?.files } });
    }

    this.clearDragData(ev);
  }

  clearDragData(ev: DragEvent) {
    if (ev.dataTransfer?.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.dataTransfer?.clearData();
    }
  }


  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.getDescargas.FormatoCargaMasiva = environment.descargas.FormatoCargaMasiva;
      this.fnListarUsuarios();
      this.fnListarPerfilUsuario();
      this.fnListarTipoDocumento();
    }
  }

  ngOnDestroy() {
    if (this.suscripcionCarga) {
      this.suscripcionCarga.unsubscribe();
    }
    this.modalService.dismissAll();
  }

  openRegistrarUsuario(contentRegistrarUsuario: any) {
    this.model = new BandejaUsuario;
    this.modalService.open(contentRegistrarUsuario, { centered: true, windowClass: "modal-lg", backdrop: 'static' });

  }


  openEditarUsuario(contentRegistrarUsuario: any, item: any) {
    this.isEditarUsuario = true;
    //console.log('item', item);
    let object = Object.assign({}, item);
    this.model = object;
    const modalRef = this.modalService.open(contentRegistrarUsuario, { centered: true, windowClass: "modal-lg", backdrop: 'static' });
    modalRef.result.then((result) => {
    }, (reason) => {
      setTimeout(() => {
        this.isEditarUsuario = false;
      }, 200);

    });
  }

  openEliminar(contentEliminar: any, item: any) {
    this.model.nIdUsuario = item.nIdUsuario;
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  async fnListarUsuarios() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuario());
      if (data.exito) {
        this.lstListarUsuario = data.datoAdicional;
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

  async fnListarPerfilUsuario() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('ROL'));
    if (data.exito) {
      this.lstPerfilUsuario = data.datoAdicional;
      //console.log('this.lstPerfilUsuario', this.lstPerfilUsuario);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarTipoDocumento() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('TIPO_DOCUMENTO'));
    if (data.exito) {
      this.lstTipoDocumento = data.datoAdicional;
      //console.log('this.lstTipoDocumento', this.lstTipoDocumento);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarUnidadNegocio() {
    let data: IDataResponse = await lastValueFrom(this.unidadNegocioService.listarUnidadNegocioPadre());
    if (data.exito) {
      this.lstUnidadNegocio = data.datoAdicional;
      //console.log('this.lstUnidadNegocio', this.lstUnidadNegocio);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnRegistrarUsuario(form: NgForm) {
    try {
      if (form.invalid) {
        return
      }
      this.loadRegOEdit = true;
      if (this.isEditarUsuario) {
        let objetEditar = {
          nIdUsuario: this.model.nIdUsuario,
          sNombres: this.model.sNombres?.replace(/\s+/g, ' ').trim(),
          sApellidoPat: this.model.sApellidoPat?.replace(/\s+/g, ' ').trim(),
          sApellidoMat: this.model.sApellidoMat?.replace(/\s+/g, ' ').trim(),
          sGerencia: this.model.sGerencia?.replace(/\s+/g, ' ').trim(),
          sArea: this.model.sArea?.replace(/\s+/g, ' ').trim(),
          sCargo: this.model.sCargo?.replace(/\s+/g, ' ').trim(),
          sCodRol: this.model.sCodRol,
          sCorreo: this.model.sCorreo?.replace(/\s+/g, ' ').trim(),
          sTelefono: this.model.sTelefono?.replace(/\s+/g, ' ').trim(),
          boEstado: this.model.boEstado
        }

        let data: IDataResponse = await lastValueFrom(this.usuarioService.registrarUsuario(objetEditar));

        if (data.exito) {
          this.loadRegOEdit = false;
          this.fnListarUsuarios();
          this.modalService.dismissAll();
        } else {
          this.loadRegOEdit = false;
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        }
      } else {
        let objetRegistrar = {
          nIdUsuario: -1,
          sCodTipoDocumento: this.model.sCodTipoDocumento,
          sNumDocumento: this.model.sNumDocumento,
          sNombres: this.model.sNombres?.replace(/\s+/g, ' ').trim(),
          sApellidoPat: this.model.sApellidoPat?.replace(/\s+/g, ' ').trim(),
          sApellidoMat: this.model.sApellidoMat?.replace(/\s+/g, ' ').trim(),
          sGerencia: this.model.sGerencia?.replace(/\s+/g, ' ').trim(),
          sArea: this.model.sArea?.replace(/\s+/g, ' ').trim(),
          sCargo: this.model.sCargo?.replace(/\s+/g, ' ').trim(),
          sCodRol: this.model.sCodRol,
          sCorreo: this.model.sCorreo?.replace(/\s+/g, ' ').trim(),
          sTelefono: this.model.sTelefono?.replace(/\s+/g, ' ').trim(),
        }

        let data: IDataResponse = await lastValueFrom(this.usuarioService.registrarUsuario(objetRegistrar));

        if (data.exito) {
          this.loadRegOEdit = false;
          this.fnListarUsuarios();
          this.modalService.dismissAll();

        } else {
          this.loadRegOEdit = false;
          this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        }
      }
    } catch (error) {
      this.loadRegOEdit = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async fnEliminarUsuario() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdUsuario', this.model.nIdUsuario);
      let data: IDataResponse = await lastValueFrom(this.usuarioService.eliminarUsuario(this.model.nIdUsuario));
      if (data.exito) {
        this.lstListarUsuario = []
        this.fnListarUsuarios();
        this.modalService.dismissAll();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.loadEliminar = false;

  }

  changeCargaMasiva($event: any) {
    const labelElement: HTMLElement = document.querySelector('label[for="fileCargaMasiva"]')!;
    let filetemp = $event.target.files[0];
    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx')) {
      this.uploadCargaMasiva = $event.target.files[0];
      labelElement.innerText = this.uploadCargaMasiva.name;
      this.noFormatCargaMasiva = false;
    } else {
      labelElement.innerText = "Seleccionar archivo...";
      this.noFormatCargaMasiva = true;
    }
    $event.target.value = null;
  }

  async fnRegistrarCargaMasiva() {
    this.labelCargaMasiva = document.querySelector('label[for="fileCargaMasiva"]') as HTMLElement;
    if (!this.uploadCargaMasiva || this.noFormatCargaMasiva) {
      this.noFormatCargaMasiva = true;
      return
    }

    this.cargaMasivaService.iniciarCarga();
    this.fShow = false;
    //const toastInfo = this.toastr.info('El proceso de carga masiva tardará unos segundos. El resultado lo puede visualizar en el log de usuarios.', 'Info', { disableTimeOut: true, tapToDismiss: false });
    const toastInfo = this.toastr.info('El proceso de carga masiva tardará unos segundos. El resultado lo puede visualizar en el log de usuarios.', 'Info');
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.cargaMasiva(this.uploadCargaMasiva));

      if (data.exito) {
        this.labelCargaMasiva.innerText = "Seleccionar archivo...";
        this.uploadCargaMasiva = null!;
        this.cargaMasivaService.mostrarExito('Carga masiva registrada exitosamente.');
        this.fShow = false;
        this.fnListarUsuarios();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.labelCargaMasiva.innerText = "Seleccionar archivo...";
      this.uploadCargaMasiva = null!;
      this.cargaMasivaService.mostrarError('Existen problemas en el servidor.');
    } finally {
      this.cargaMasivaService.finalizarCarga();
    }
    this.toastr.remove(toastInfo.toastId);
    this.loadRegistrarCM = false;
  }

  cancelarCargaMasiva() {
    this.fShow = false;
    this.noFormatCargaMasiva = false;
    this.uploadCargaMasiva = null!;
  }

  async fnDescargarCargaMasiva() {
    try {
      let data = await lastValueFrom(this.archivoService.descargarArchivo(this.getDescargas.FormatoCargaMasiva));
      const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
      let filename = 'Formato_CargaMasiva.xlsx';
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
