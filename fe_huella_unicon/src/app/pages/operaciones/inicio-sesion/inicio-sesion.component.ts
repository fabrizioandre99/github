import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { ICredencial } from 'src/app/models/credencial';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ContrasenaService } from 'src/app/services/contrasena.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent implements OnInit {

  model: ICredencial = {};
  loading: boolean = false;
  loadingModal: boolean = false;
  rutaRedict: any;
  lstMenu: any;


  constructor(private modalService: NgbModal, private router: Router, private toastr: ToastrService,
    private seguridadService: SeguridadService, private contrasenaService: ContrasenaService) { }


  ngOnInit(): void {
    //console.log('LocalRutaInicial', localStorage.getItem('LocalRutaInicial'));
    if (localStorage.getItem('LocalCodRol') !== null) {
      this.router.navigate([localStorage.getItem('LocalRutaInicial')]);
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  openModalRecuperarContrasena(contentRecuperarContrasena: any) {
    this.modalService.open(contentRecuperarContrasena, { centered: true, windowClass: "modal-md", backdrop: 'static' });
  }

  openModalNotificacion(contentNotificacion: any) {
    this.modalService.open(contentNotificacion, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
  }

  async fnIniciarSesion(form: NgForm) {
    try {
      this.loading = true;
      if (form.invalid) {
        this.loading = false;
        return
      }
      let data: IDataResponse = await lastValueFrom(this.seguridadService.login(this.model.sUsuario!, this.model.sContrasena!));
      //console.log('fnIniciarSesion', data);
      if (data.exito) {
        //console.log('data', data.datoAdicional);
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
  async fnRecuperarContrasena(form: NgForm, contentNotificacion: any) {
    try {
      this.loadingModal = true;
      if (form.invalid) {
        this.loadingModal = false;
        return
      }
      let data: IDataResponse = await lastValueFrom(this.contrasenaService.validarUsuario(this.model.sUsuarioRep!));

      if (data.exito) {
        this.modalService.open(contentNotificacion, { centered: true, windowClass: "modal-sm", backdrop: 'static' });
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadingModal = false;
    } catch (error) {
      this.loadingModal = false;
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  redictConfirmacion() {
    this.modalService.dismissAll();
    this.router.navigate(['/codigo-confirmacion']);
  }

  async fnListarMenu() {
    let data: IDataResponse = await lastValueFrom(this.seguridadService.menuRol(localStorage.getItem('LocalCodRol')!));

    if (data.exito) {
      this.lstMenu = data.datoAdicional;

      const objHome = {
        "nIdMenu": 23,
        "nIdPadre": -1,
        "sNombre": "Inicio",
        "sAccion": "/home",
        "sIcono": "assets/images/icon-home",
        "liSubMenu": []
      };

      // Agregar el nuevo objeto home al inicio del array
      this.lstMenu.unshift(objHome);
      if (this.lstMenu.length > 0) {

        for (let i = 0; i < this.lstMenu.length; i++) {
          const menu = this.lstMenu[i];
          if (menu.sAccion.startsWith('/')) {
            this.rutaRedict = menu.sAccion;
            continue;
          } else if (menu.liSubMenu.length > 0) {
            this.rutaRedict = menu.liSubMenu[0].sAccion;
            break;
          }
        }
        localStorage.setItem('LocalCodRol', this.lstMenu.sCodRol);
        localStorage.setItem('LocalMenu', JSON.stringify(this.lstMenu));
        localStorage.setItem('LocalRutaInicial', this.rutaRedict);

        //Asignar todas las rutas a un array
        const rutas = this.lstMenu
          .map((item: any) => [item.sAccion, ...item.liSubMenu.map((sec: any) => sec.sAccion)])
          .flat()
          .filter((ruta: string) => ruta.startsWith('/'));
        //console.log('Rutas', rutas);
        localStorage.setItem('Rutas', JSON.stringify(rutas));

        //this.router.navigate([this.rutaRedict]);
        this.router.navigate(['/home']);
        this.loading = false;
      } else {
        this.toastr.warning('El rol de usuario no tiene acceso al sistema.', 'Advertencia');
        this.loading = false;
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

}
