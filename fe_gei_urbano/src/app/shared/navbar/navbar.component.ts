import { Component } from '@angular/core';
import { IUsuario } from '../../models/usuario';
import { Router, UrlTree } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { SeguridadService } from '../../services/seguridad.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  oUsuario: IUsuario;
  loading: boolean = false;

  constructor(public router: Router, private seguridadService: SeguridadService, private headerService: HeaderService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
  }

  isSubmenuActive(nIdMenu: any): boolean {
    switch(nIdMenu) {
      case 1:
        return this.router.isActive("/dashboard-historico", true);
      case 2:
        return this.router.isActive("/dashboard-resumenAnual", true);
      case 3:
        return this.router.isActive("/dashboard-ruta", true);
    }
    return false;
  }

}
