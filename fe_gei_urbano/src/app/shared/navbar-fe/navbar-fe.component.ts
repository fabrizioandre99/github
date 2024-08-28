import { Component } from '@angular/core';
import { IUsuario } from '../../models/usuario';
import { Router, UrlTree } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { SeguridadService } from '../../services/seguridad.service';

@Component({
  selector: 'app-navbar-fe',
  templateUrl: './navbar-fe.component.html',
  styleUrl: './navbar-fe.component.css'
})
export class NavbarFeComponent {
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
        return this.router.isActive("/factor-emision", true);
      case 2:
        return this.router.isActive("/factor-emision-nivel2", true);
    }
    return false;
  }

}
