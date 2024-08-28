import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NgxPhosphorIconsModule } from 'ngx-phosphor-icons';
import { SharedDataService } from '../../../services/shared-data.service';
import { SeguridadService } from '../../../services/seguridad.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, NgxPhosphorIconsModule, RouterOutlet, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public mostrarMenu: boolean = false;
  public lstMenu: any = [];

  private rutasAuth = [
    'solicitud-participacion',
    'codigo-verificacion',
    'nueva-contrasena'];

  //Agregar la ruta donde se quiere mostrar el menú
  private rutasVisibles = [
    'inicio-org',
    'inicio',
    'gestion-participacion',
    'gestion-usuarios',
    'perfil-organizacional',
    'mis-hc',
    'limites-informe',
    'resultado-gei',
    'mis-exclusiones',
    'indicadores-desempeno',
    'acciones-mitigacion',
    'hc-organizacional',
    'fuentes-emision',
    'potencial-calentamiento',
    'factor-calculo',
    'solicitudes-reconocimiento',
    'bitacora-incidencias',
    'comparativo-historico',
    'parametros-sistema',
    'bandeja-documentos',
    'medidas-mitigacion'
  ];

  constructor(private router: Router, private sharedDataService: SharedDataService,
    private seguridadService: SeguridadService
  ) { }

  private checkRouteVisibility(route: string) {
    this.mostrarMenu = this.rutasVisibles.includes(route.split('/')[1]);
  }

  private _currentRoute!: string;
  set currentRoute(value: string) {
    this._currentRoute = value;
    this.checkRouteVisibility(value);
  }

  get currentRoute(): string {
    return this._currentRoute;
  }

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    // Suscribirse a los cambios en SharedDataService
    this.sharedDataService.menu.subscribe(menu => {
      this.lstMenu = menu;
    });
  }

  logout() {
    this.seguridadService.logout();
  }

  tieneRutasAuth(): boolean {
    return this.rutasAuth.some(ruta => this.currentRoute.includes(ruta));
  }
}
