import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./pages/shared/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterModule, HeaderComponent, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'fe_huella_honduras';

  public isBackgroundImage: boolean = false;
  public showHeader: boolean = true;
  public isLoginRoute: boolean = false;

  private backgroundImageRoutes = ['codigo-verificacion', 'nueva-contrasena', 'solicitud-participacion'];
  private hideHeaderRoutes = [''];  // Aquí agregas todas las rutas donde no quieres mostrar el header

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = this.router.url.split('/')[1];
        this.isBackgroundImage = this.backgroundImageRoutes.includes(currentRoute);
        this.showHeader = !this.hideHeaderRoutes.includes(currentRoute);
        this.isLoginRoute = currentRoute === '';
        console.log('Current Route:', currentRoute);
        console.log('Background Image:', this.isBackgroundImage);
        console.log('Show Header:', this.showHeader);
      }
    });
  }
}
