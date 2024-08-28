import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { BackCloseService } from 'src/app/services/back-close.service';
import { MenuService } from 'src/app/services/menu.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-acceso-usuario',
  templateUrl: './acceso-usuario.component.html',
  styleUrls: ['./acceso-usuario.component.css']
})
export class AccesoUsuarioComponent implements OnInit {

  lstRol: any[] = [];
  lstMenu: any[] = [];
  model: any = {}

  oUsuario: IUsuario;
  loadingGuardar: boolean = false;

  constructor(private toastr: ToastrService,
    private seguridadService: SeguridadService, private backCloseService: BackCloseService,
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
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipoParam('ROL'));
      if (data.exito) {
        this.lstRol = data.datoAdicional;
        this.model.sCodRol = this.lstRol[0].sCodigo;
        this.fnListarMenu();
        //console.log('this.lstRol', this.lstRol);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      if (error.error.codMensaje == 11) {
        this.seguridadService.logout();
      }
    }
  }

  async fnListarMenu() {
    try {
      let data: IDataResponse = await lastValueFrom(this.menuService.listarPorRol(this.model.sCodRol));
      if (data.exito) {
        this.lstMenu = data.datoAdicional;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
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
    let data: IDataResponse = await lastValueFrom(this.menuService.actualizarEstado(oMenujson));
    if (data.exito) {
      this.fnListarMenu();
      this.toastr.success('Se actualizaron los accesos con éxito', 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.loadingGuardar = false;
  }
}
