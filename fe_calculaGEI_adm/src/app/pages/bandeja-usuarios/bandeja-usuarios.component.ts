import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { Usuario } from 'src/app/models/usuario';
import { LocalDataService } from 'src/app/services/local-data.service';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-bandeja-usuarios',
  templateUrl: './bandeja-usuarios.component.html',
  styleUrls: ['./bandeja-usuarios.component.css']
})
export class BandejaUsuariosComponent implements OnInit {
  page = 1;
  pageSize = 10;
  total = 0;
  lstUsuario: any[] = [];
  lstRol: any[] = [];
  isEditUsuario: Boolean = false;
  loadingModal: Boolean = false;
  fShowSkeleton: boolean = false;
  paramPipe: any;

  lstSkeleton = Array(10);
  model: Usuario = new Usuario();
  nombre: any;

  constructor(private modalService: NgbModal, private usuarioService: UsuarioService, private toastr: ToastrService,
    private rolService: RolService, private localDataService: LocalDataService) { }

  ngOnInit(): void {
    this.fnListarUsuario();
    this.fnListarRol();

    // Obtener el array guardado en localStorage
    const rutasGuardadas = JSON.parse(localStorage.getItem('Rutas') || '[]');
    //console.log(rutasGuardadas);
    //console.log('RUTAS GUARDADAS', rutasGuardadas[0])
    //console.log('sessionLogin', sessionStorage.getItem('SessionLogin') == null);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData!.getData('text');
    const pattern = /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+/;
    if (!pattern.test(pastedText)) {
      return false;
    }
    this.nombre = pastedText.trim();
  }

  async fnListarUsuario() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuarios());
      if (data.exito) {
        this.lstUsuario = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  async fnListarRol() {
    try {
      let data: IDataResponse = await lastValueFrom(this.rolService.listarRol());
      if (data.exito) {
        this.lstRol = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  editarUsuario(item: any, contentRegistrar: any) {
    this.isEditUsuario = true;
    this.modalService.open(contentRegistrar, { centered: true });
    this.model.nIdUsuario = item.nIdUsuario;
    this.model.sNombre = item.sNombre.trim();
    this.model.sApellPaterno = item.sApellPaterno.trim();
    this.model.sApellMaterno = item.sApellMaterno.trim();
    this.model.sCorreo = item.sCorreo.trim();
    this.model.oRol.nIdRol = item.oRol.nIdRol;
    this.model.boCodEstado = item.boCodEstado;
    if (item.boCodEstado == true) {
      this.model.nCodEstado = 1
    } else {
      this.model.nCodEstado = 0
    }

  }


  ToogleModal() {
    if (this.model.boCodEstado == true) {
      this.model.nCodEstado = 1
    } else {
      this.model.nCodEstado = 0
    }
  }

  async toogleTable(event: any, item: any) {
    if (event.currentTarget.checked == true) {
      item.nCodEstado = 1
    } else {
      item.nCodEstado = 0
    }

    let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuario(item.nIdUsuario, item.oRol.nIdRol, item.sNombre, item.sApellPaterno
      , item.sApellMaterno, item.sCorreo, item.nCodEstado, localStorage.getItem('SessionIdUsuario')!));
    if (data.exito) {
      this.toastr.success('Se cambió el estado con éxito', 'Éxito');
    } else {
      this.toastr.error(data.mensajeUsuario, 'Error');
    }

  }
  async guardarUsuario(form: NgForm) {
    if (form.invalid) {
      return;
    }
    //console.log('139', localStorage.getItem('SessionIdUsuario') == String(this.model.nIdUsuario));
    this.loadingModal = true;
    //console.log('this.isEditUsuario', this.isEditUsuario);
    if (this.isEditUsuario) {
      //console.log('---ESTÁ EN ACTUALIZAR---');
      let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuario(this.model.nIdUsuario, this.model.oRol.nIdRol, this.model.sNombre.replace(/\s{2,}/g, ' '), this.model.sApellPaterno.replace(/\s{2,}/g, ' ')
        , this.model.sApellMaterno.replace(/\s{2,}/g, ' '), this.model.sCorreo, this.model.nCodEstado, localStorage.getItem('SessionIdUsuario')!));
      if (data.exito) {
        this.fnListarUsuario();
        this.modalService.dismissAll();
        this.isEditUsuario = false;
        this.loadingModal = false;

        if (localStorage.getItem('SessionIdUsuario') == String(this.model.nIdUsuario)) {
          this.toastr.success('Tendrá acceso a las nuevas funcionalidades desde el próximo inicio de sesión.', 'Éxito');
        }

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.loadingModal = false;
      }
    }
    else {
      //console.log('---ESTÁ EN INSERTAR---');
      let data: IDataResponse = await lastValueFrom(this.usuarioService.insertarUsuario(this.model.oRol.nIdRol, this.model.sNombre.replace(/\s{2,}/g, ' '), this.model.sApellPaterno.replace(/\s{2,}/g, ' ')
        , this.model.sApellMaterno.replace(/\s{2,}/g, ' '), this.model.sCorreo, this.model.nCodEstado, localStorage.getItem('SessionIdUsuario')!));
      if (data.exito) {
        this.fnListarUsuario();
        this.modalService.dismissAll();
        this.isEditUsuario = false;
        this.loadingModal = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
        this.loadingModal = false;
      }
    }
  }

  openModalRegistrar(contentRegistrar: any) {
    this.model = new Usuario;
    this.isEditUsuario = false;
    //console.log('this.isEditUsuario', this.isEditUsuario);
    this.model.nCodEstado = 1;
    this.modalService.open(contentRegistrar, { centered: true });
  }

}
