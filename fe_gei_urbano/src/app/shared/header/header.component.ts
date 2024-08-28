import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeguridadService } from '../../services/seguridad.service';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user: any;
  rol: any;
  unidadNegocio: any;

  constructor(public router: Router, private headerService: HeaderService, private seguridadService: SeguridadService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getLocalStorage();
    //Se obtienen los datos adicionalmente, cuando se está disparando desde el inicio-sesión.
    this.seguridadService.disparadorDeListado.subscribe(data => {
      this.getLocalStorage();
    });
  }
  
  onMenuButtonClick() {
    this.headerService.toggleMenu();
  }

  getLocalStorage() {
    this.user = localStorage.getItem('LocalUser');
    this.rol = localStorage.getItem('LocalRol');
  }

  hasQueryParams(): boolean {
    return Object.keys(this.activatedRoute.snapshot.queryParams).length !== 0;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(["/"]);
  }
}
