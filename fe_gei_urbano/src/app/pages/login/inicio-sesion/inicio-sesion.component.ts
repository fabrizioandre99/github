import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICredencial } from '../../../models/credencial';
import { Router } from '@angular/router';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { SeguridadService } from '../../../services/seguridad.service';
import { ToastrService } from 'ngx-toastr';
import { ContrasenaService } from '../../../services/contrasena.service';
import { MenuService } from '../../../services/menu.service';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css'],

})
export class InicioSesionComponent {
  model: ICredencial = {};
  loading: boolean = false;
  loadingModal: boolean = false;
  isFirstPasswordVisible: boolean = false;
  rutaRedict: any;
  lstMenu: any;

  constructor(private modalService: NgbModal, private router: Router, private seguridadService: SeguridadService, private toastr: ToastrService,
    private menuService: MenuService, private contrasenaService: ContrasenaService) {
  }

  ngOnInit(): void {
  }

  openModalRecuperarContrasena(contentRecuperarContrasena: any) {
    this.modalService.open(contentRecuperarContrasena, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  redictConfirmacion() {
    this.modalService.dismissAll();
    this.router.navigate(['/codigo-confirmacion']);
  }

  async recuperarContrasena(form: NgForm, contentNotificacion: any) {
    try {
      this.loadingModal = true;
      if (form.invalid) {
        this.loadingModal = false;
        return
      }
      let data: IDataResponse = await lastValueFrom(this.contrasenaService.validarUsuario(this.model.sUsuarioRep!));
      console.log('49 data', data);

      if (data.exito) {
        this.modalService.open(contentNotificacion, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadingModal = false;
    } catch (error) {

      console.log('error', error);
      this.loadingModal = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }


  async iniciarSesion(form: NgForm) {
    try {
      this.loading = true;
      if (form.invalid) {
        this.loading = false;
        return
      }
      let data: IDataResponse = await lastValueFrom(this.seguridadService.login(this.model.sUsuario!, this.model.sContrasena!));
      console.log('iniciarSesion', data);

      if (data.exito) {
        console.log('data', data.datoAdicional);

        localStorage.setItem('LocalUser', data.datoAdicional.sNombres + " " + data.datoAdicional.sApellidos);
        //console.log('LocalUser', localStorage.getItem('LocalUser'));

        localStorage.setItem('LocalRol', data.datoAdicional.sRol);
        //console.log('LocalRol', localStorage.getItem('LocalRol'));

        localStorage.setItem('LocalCodRol', data.datoAdicional.sCodRol);
        //console.log('LocalCodRol', localStorage.getItem('LocalCodRol'));

        this.seguridadService.disparadorDeListado.emit();

        this.fnListarMenu();

      } else {
        this.loading = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.loading = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }


  async fnListarMenu() {
    let data: IDataResponse = await lastValueFrom(this.menuService.menuRol(localStorage.getItem('LocalCodRol')!));

    console.log('data fnListarMenu', data);

    if (data.exito) {
      this.lstMenu = data.datoAdicional;

      if (this.lstMenu.length > 0) {
        for (let i = 0; i < this.lstMenu.length; i++) {
          const menu = this.lstMenu[i];
          if (menu.sAppUrl?.startsWith('/')) {
            this.rutaRedict = menu.sAppUrl;
            continue;
          } else if (menu.liSubMenu.length > 0) {
            this.rutaRedict = menu.liSubMenu[0].sAppUrl;
            break;
          }
        }


        localStorage.setItem('LocalCodRol', this.lstMenu.sCodRol);
        localStorage.setItem('LocalMenu', JSON.stringify(this.lstMenu));
        localStorage.setItem('LocalRutaInicial', this.rutaRedict);

        //Asignar todas las rutas a un array
        const rutas = this.lstMenu
          .map((item: any) => [item.sAppUrl, ...item.liSubMenu.map((sec: any) => sec.sAppUrl)])
          .flat()
          .filter((ruta: string) => ruta?.startsWith('/'));
        //console.log('Rutas', rutas);
        localStorage.setItem('Rutas', JSON.stringify(rutas));

        this.router.navigate([this.rutaRedict]);

        this.loading = false;
      } else {
        this.toastr.warning('El rol de usuario no tiene acceso al sistema.', 'Advertencia');
        this.loading = false;
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  showFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'text';
    this.isFirstPasswordVisible = true;
    //console.log('mostrar');
  }

  hideFirstPassword(firstPassword: HTMLInputElement) {
    firstPassword.type = 'password';
    this.isFirstPasswordVisible = false;
    //console.log('ocultar');
  }

}
