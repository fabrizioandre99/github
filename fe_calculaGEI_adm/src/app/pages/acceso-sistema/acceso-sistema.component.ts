import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { LocalDataService } from 'src/app/services/local-data.service';
import { MenuService } from 'src/app/services/menu.service';
import { RolService } from 'src/app/services/rol.service';

@Component({
  selector: 'app-acceso-sistema',
  templateUrl: './acceso-sistema.component.html',
  styleUrls: ['./acceso-sistema.component.css']
})
export class AccesoSistemaComponent implements OnInit {
  lstRol: any[] = [];
  lstMenu: any[] = [];
  model: any = {}

  loadingSkeleton: boolean = true;
  loadingGuardar: boolean = false;
  checkedChildren: boolean = false;

  constructor(private rolService: RolService, private menuService: MenuService, private toastr: ToastrService,
    private localDataService: LocalDataService) { }

  ngOnInit(): void {
    this.fnListarRol();
  }

  async fnListarRol() {
    try {
      let data: IDataResponse = await lastValueFrom(this.rolService.listarRol());
      if (data.exito) {
        this.lstRol = data.datoAdicional;
        this.model.nIdRol = this.lstRol[0].nIdRol;
        this.fnListarMenu();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  async fnListarMenu() {
    try {
      let data: IDataResponse = await lastValueFrom(this.menuService.listarMenu(this.model.nIdRol));
      if (data.exito) {
        this.lstMenu = data.datoAdicional;
        this.loadingSkeleton = false;
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  changeFather(event: any, rol: any, i: any) {
    if (event.currentTarget.checked == true) {
      rol[i].liSeccion.forEach((item: { boCodEstado: boolean; }) => {
        item.boCodEstado = true;
      });
    } else {
      rol[i].liSeccion.forEach((item: { boCodEstado: boolean; }) => {
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

  async fnActualizarMenu() {
    this.loadingGuardar = true;
    let liMenu: { nIdMenu: any; nCodEstado: number; }[] = [];
    this.lstMenu.forEach(item => {
      let oMenu = {
        nIdMenu: item.nIdMenu,
        nCodEstado: item.boCodEstado ? 1 : 0
      };
      liMenu.push(oMenu);
      if (item.liSeccion) {
        item.liSeccion.forEach((secondItem: { nIdMenu: any; boCodEstado: any; }) => {
          let oMenu = {
            nIdMenu: secondItem.nIdMenu,
            nCodEstado: secondItem.boCodEstado ? 1 : 0
          };
          liMenu.push(oMenu);
        });
      }
    });

    let oMenujson = {
      oRol: {
        nIdRol: this.model.nIdRol
      },
      liMenu: liMenu,
      nIdUsuarioMod: localStorage.getItem('SessionIdUsuario')!
    };

    let data: IDataResponse = await lastValueFrom(this.menuService.actualizarMenu(oMenujson));
    if (data.exito) {
      this.fnListarMenu();
      //this.menuService.disparadorDeListado.emit();
      this.toastr.success('Se actualizaron los accesos con éxito', 'Éxito');
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.loadingGuardar = false;
  }
}
