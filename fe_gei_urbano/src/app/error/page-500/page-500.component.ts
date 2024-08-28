import { Component } from '@angular/core';
import { IUsuario } from '../../models/usuario';
import { Router } from '@angular/router';
import { SeguridadService } from '../../services/seguridad.service';
import { IDataResponse } from '../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-page-500',
  templateUrl: './page-500.component.html',
  styleUrl: './page-500.component.css'
})
export class Page500Component {
  oUsuario: IUsuario;
  lstMenu: any[] = [];

  constructor(public router: Router, private seguridadService: SeguridadService, private menuService: MenuService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    this.llamarServicio();
  }

  async llamarServicio() {
    this.lstMenu = JSON.parse(localStorage.getItem('LocalMenu')!);
    let data: IDataResponse = await lastValueFrom(this.menuService.menuRol(localStorage.getItem('LocalCodRol')!));
    if (data.exito) {
      console.log(data);
      this.redireccionar();
    }
  }


  redireccionar() {

    console.log('HERE');
    for (const menu of this.lstMenu) {
      if (menu.sAppUrl) {
        console.log('menu.sAppUrl', menu.sAppUrl);
        this.router.navigateByUrl(menu.sAppUrl);
        return;
      }

      if (menu.liSubMenu) {
        for (const submenu of menu.liSubMenu) {
          if (submenu.sAppUrl) {
            console.log('submenu.sAppUrl', submenu.sAppUrl);
            this.router.navigateByUrl(submenu.sAppUrl);
            return;
          }
        }
      }
    }

  }
}
