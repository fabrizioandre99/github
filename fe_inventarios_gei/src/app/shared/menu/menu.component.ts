import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { IUsuario } from 'src/app/models/usuario';
import { Menu } from 'src/app/models/menu';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  isAuth = false;
  oUsuario: IUsuario;
  lstMenu: Menu[] = [];

  isNavbarCollapsed = true;

  constructor(public router: Router, private seguridadService: SeguridadService) {
    this.oUsuario = this.seguridadService.obtenerUsuarioActual;


  }

  ngOnInit() {

    if (this.oUsuario != null) {
      this.fnListarMenu();
      this.isAuth = true;
    } else {
      this.isAuth = false;
      this.router.navigate(['/']);
    }
  }

  fnListarMenu() {
    this.seguridadService.obtenerMenuRol(this.oUsuario.nIdRol!).subscribe({
      next: data => {
        if (data.exito) {
          this.lstMenu = data.datoAdicional;
          //console.log('this.lstMenu', this.lstMenu);
        }
      }
    })
  }

  logout() {
    this.seguridadService.logout();
    this.isAuth = false;
    this.router.navigate(['/']);
  }

}

