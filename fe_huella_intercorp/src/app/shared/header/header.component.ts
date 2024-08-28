import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any;
  rol: any;
  nombreComercial: any;
  unidadNegocio: any;
  hasNombreComercial: any;

  @ViewChild('dropMenu') dropMenu: NgbDropdown; // Obtener referencia local del dropdown
  constructor(public router: Router, private seguridadService: SeguridadService) {
  }

  ngOnInit(): void {
    this.getLocalStorage();
    //Se obtienen los datos adicionalmente, cuando se está disparando desde el inicio-sesión.
    this.seguridadService.disparadorDeListado.subscribe(data => {
      this.getLocalStorage();
    });
  }

  getLocalStorage() {
    this.user = localStorage.getItem('LocalUser_intercorp');
    this.nombreComercial = localStorage.getItem('LocalNombreComercial_intercorp');
  }

  logout() {
    this.seguridadService.logout();
  }
  openDropdown() {
    this.dropMenu.open(); // Abrir el dropdown
  }
}
