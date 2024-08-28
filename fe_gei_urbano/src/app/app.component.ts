import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HeaderService } from './services/header.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fe_gei_urbano';


  constructor(public router: Router, private activatedRoute: ActivatedRoute, private headerService: HeaderService
    ) {

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

  }

  hasQueryParams(): boolean {
    return Object.keys(this.activatedRoute.snapshot.queryParams).length !== 0;
  }
}


