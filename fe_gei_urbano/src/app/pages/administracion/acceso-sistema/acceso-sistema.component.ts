import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { MenuService } from '../../../services/menu.service';
import { ParametroService } from '../../../services/parametro.service';
import { SeguridadService } from '../../../services/seguridad.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-acceso-sistema',
  templateUrl: './acceso-sistema.component.html',
  styleUrl: './acceso-sistema.component.css'
})
export class AccesoSistemaComponent {

  lstRol: any[] = [];
  lstMenu: any[] = [];
  model: any = {}

  oUsuario: IUsuario;
  loadingGuardar: boolean = false;
  fShowSkeleton: boolean = true;

  constructor(private router: Router, private toastr: ToastrService,
    private seguridadService: SeguridadService,
    private parametroService: ParametroService,
    private menuService: MenuService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarRol();
    }
  }

  async fnListarRol() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo('ROL'));
      if (data.exito) {

        this.lstRol = data.datoAdicional;
        this.model.sCodRol = this.lstRol[0].sCodigo;
        this.fnListarMenu();

        //console.log('this.lstRol', this.lstRol);
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      console.log('error', error.error.mensajeUsuario);
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout(error.error.mensajeUsuario);

      } else {
        this.router.navigate(['/error-500']);
      }
    }

  }

  async fnListarMenu() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.menuService.menuRolCompleto(this.model.sCodRol));

      console.log('data', data);
      if (data.exito) {
        this.lstMenu = data.datoAdicional;
        this.fShowSkeleton = false;
      } else {
        this.lstMenu = [];
        this.fShowSkeleton = false;
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

  changeFather(event: any, rol: any, i: any) {
    if (event.currentTarget.checked == true) {
      rol[i].liSubMenu.forEach((item: { boCodEstado: boolean; }) => {
        item.boCodEstado = true;
      });
    } else {
      rol[i].liSubMenu.forEach((item: { boCodEstado: boolean; }) => {
        item.boCodEstado = false;
      });
    }
  }

  changeChildren(event: any, item: any, secondItem: any) {
    if (event.currentTarget.checked == true) {
      item.check = true;
    }
    const contieneValueTrue = secondItem.find((item: { boCodEstado: boolean; }) => item.boCodEstado === true);
    if (contieneValueTrue) {
      item.boCodEstado = true;
    } else {
      item.boCodEstado = false;
    }
  }

  async fnActualizarEstado() {
    try {

      this.loadingGuardar = true;
      let liMenu: { nIdMenuRol: any; nIdMenu: any; sCodRol: any; boCodEstado: number; }[] = [];
      this.lstMenu.forEach(item => {
        let oMenu = {
          nIdMenuRol: item.nIdMenuRol,
          nIdMenu: item.nIdMenu,
          sCodRol: this.model.sCodRol,
          boCodEstado: item.boCodEstado
        };
        liMenu.push(oMenu);
        if (item.liSubMenu) {
          item.liSubMenu.forEach((secondItem: { nIdMenuRol: any; nIdMenu: any; sCodRol: any; boCodEstado: any; }) => {
            let oMenu = {
              nIdMenuRol: secondItem.nIdMenuRol,
              nIdMenu: secondItem.nIdMenu,
              sCodRol: this.model.sCodRol,
              boCodEstado: secondItem.boCodEstado
            };
            liMenu.push(oMenu);
          });
        }
      });

      let oMenujson = {
        liMenu: liMenu
      };
      //console.log('oMenujson', oMenujson);
      let data: IDataResponse = await lastValueFrom(this.menuService.actualizarMenu(oMenujson));
      if (data.exito) {
        this.fnListarMenu();
        this.toastr.success('Se actualizaron los accesos con éxito', 'Éxito');
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
      this.loadingGuardar = false;

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

}
