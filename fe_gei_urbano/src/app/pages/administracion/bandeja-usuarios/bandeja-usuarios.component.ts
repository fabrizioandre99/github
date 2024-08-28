import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { SeguridadService } from '../../../services/seguridad.service';
import { UsuarioService } from '../../../services/usuario.service';
import { BandejaUsuario } from '../../../models/bandeja-usuario';
import { ParametroService } from '../../../services/parametro.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bandeja-usuarios',
  templateUrl: './bandeja-usuarios.component.html',
  styleUrls: ['./bandeja-usuarios.component.css']
})
export class BandejaUsuariosComponent implements OnInit, OnDestroy {

  lstUsuario: any[] = [];
  lstPerfilUsuario: any[] = [];
  lstTipoDocumento: any[] = [];

  page = 1;
  pageSize = 10;
  total = 0;

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  lstSkeleton = Array(4);

  loadEliminar: boolean = false;
  loadRegOEdit: boolean = false;
  isEditarUsuario: boolean = false;
  boMostrarLoading: boolean = false;

  oUsuario: IUsuario;
  model: BandejaUsuario = new BandejaUsuario();

  constructor(private router: Router, private toastr: ToastrService, private modalService: NgbModal,
    private seguridadService: SeguridadService,
    private usuarioService: UsuarioService, private parametroService: ParametroService,
  ) {

  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarUsuarios();
      this.fnListarPerfilUsuario();
      this.fnListarTipoDocumento();
    }
  }

  ngOnDestroy() {
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
        this.lstUsuario = data.datoAdicional;

        console.log('lstUsuario', this.lstUsuario);
        this.fShowSkeleton = false;
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


  async actualizarUsuario(item: any) {

    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuario(item.nIdUsuario, !item.boEstado));
      if (data.exito) {
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        item.boEstado = !item.boEstado
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


  async fnListarPerfilUsuario() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo('ROL'));
    if (data.exito) {
      this.lstPerfilUsuario = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarTipoDocumento() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarActivosPorTipo('TIPO_DOCUMENTO'));
    if (data.exito) {
      this.lstTipoDocumento = data.datoAdicional;
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

  async fnEliminarUsuario() {
    try {
      this.loadEliminar = true;
      //console.log('this.model.nIdUsuario', this.model.nIdUsuario);
      let data: IDataResponse = await lastValueFrom(this.usuarioService.eliminarUsuario(this.model.nIdUsuario));
      if (data.exito) {
        this.lstUsuario = []
        this.fnListarUsuarios();
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

  async fnReenviarCodigo(item: any) {
    this.boMostrarLoading = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.reenviarMail(item));
      if (data.exito) {
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      } else {
        item.boEstado = !item.boEstado
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
    this.boMostrarLoading = false;
  }

}
