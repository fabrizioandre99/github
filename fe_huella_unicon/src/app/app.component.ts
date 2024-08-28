import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CargaMasivaService } from './services/carga-masiva.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fe_huella_unicon';
  cargaEnProgreso: boolean = false;
  pantallaAncho: number = window.innerWidth;
  pantallaAltura: number = window.innerHeight;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallaAncho = event.target.innerWidth;
    this.pantallaAltura = event.target.innerHeight;
  }

  constructor(public router: Router, private activatedRoute: ActivatedRoute, private cargaMasivaService: CargaMasivaService) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects.split('?')[0]; // Obtener la porción de la URL antes del signo de interrogación

        // Verificar si la URL es la ruta de inicio de sesión
        if (url === '/' || url === '/#/' || url === '/#') {
          // Redirigir a la misma ruta sin parámetros de consulta
          this.router.navigate(['/']);
        }
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cargaMasivaService.estaCargando().subscribe(enProgreso => {
        this.cargaEnProgreso = enProgreso;
        // Puedes usar la variable cargaEnProgreso para mostrar u ocultar un indicador de carga.
      });
    });

  }

  hasQueryParams(): boolean {
    return Object.keys(this.activatedRoute.snapshot.queryParams).length !== 0;
  }
}


