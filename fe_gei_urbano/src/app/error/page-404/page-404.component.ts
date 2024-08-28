import { Component } from '@angular/core';
import { IUsuario } from '../../models/usuario';
import { Router } from '@angular/router';
import { SeguridadService } from '../../services/seguridad.service';

@Component({
  selector: 'app-page-404',
  templateUrl: './page-404.component.html',
  styleUrl: './page-404.component.css'
})
export class Page404Component {
  oUsuario: IUsuario;
  lstMenu: any[] = [];

  constructor(public router: Router, private seguridadService: SeguridadService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.lstMenu = JSON.parse(localStorage.getItem('LocalMenu')!);
      console.log('this.lstMenu', this.lstMenu);
    }
  }

  redireccionar(): void {
    for (const menu of this.lstMenu) {
      if (menu.sAppUrl) {
        this.router.navigateByUrl(menu.sAppUrl);
        return;
      }

      if (menu.liSubMenu) {
        for (const submenu of menu.liSubMenu) {
          if (submenu.sAppUrl) {
            this.router.navigateByUrl(submenu.sAppUrl);
            return;
          }
        }
      }
    }

  }
}
