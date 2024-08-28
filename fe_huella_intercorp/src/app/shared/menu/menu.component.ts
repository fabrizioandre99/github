
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  isAuth = false;
  isCollapsed: boolean[] = [];
  showBackdrop: boolean = false;
  activeCircles: boolean = false;
  lstMenu: any[] = [];
  oUsuario: IUsuario | undefined;
  sAccions: string[] = [];
  rutasSubindice: any[] = [];
  openMenu: boolean = false;

  constructor(public router: Router, private toastr: ToastrService, private seguridadService: SeguridadService,
  ) {
  }

  ngOnInit(): void {

    if (!localStorage.getItem('LocalMenu_intercorp')!) {
      this.pintarCuadros();
    } else {
      this.lstMenu = JSON.parse(localStorage.getItem('LocalMenu_intercorp')!);
      this.pintarCuadros();
    }
  }

  firstCollapse() {
    //Abrir Sidebar y cerrar sidebar
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.toggle("close");
    //Cerrar todos los Hijos
    for (let i = 0; i < this.isCollapsed.length; i++) {
      this.isCollapsed[i] = false;
    }
    //Si el Sidebar no contiene la clase close pintar todos los círculos de azul
    if (!elemento.classList.contains('close')) {
      this.activeCircles = true;
    } else {
      this.activeCircles = false;
    }
    this.showBackdrop = !this.showBackdrop;
  }

  secondCollapse(i: number) {
    //Cerrar sidebar al hacer click a cada item
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.remove("close");
    //Cerrar y abrir cada item
    this.isCollapsed[i] = !this.isCollapsed[i];
    //Abrir Backdrop
    this.showBackdrop = true;
  }

  closeSidebar() {
    //Cerrar Sidebar
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.toggle("close");
    //Cerrar todos los Hijos
    for (let i = 0; i < this.isCollapsed.length; i++) {
      this.isCollapsed[i] = false;
    }
    this.activeCircles = false;
    //Cerrar Backdrop
    this.showBackdrop = false;
    this.openMenu = false;

    if (this.router.url === '/gestionar-periodo') {
      localStorage.removeItem('sectorPeriodo_intercorp');
      localStorage.removeItem('empresaPeriodo_intercorp');
    }
  }

  redictFather(i: any) {
    //Cerrar sidebar al hacer click a cada item
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.remove("close");
    //Cerrar y abrir cada item
    this.isCollapsed[i] = !this.isCollapsed[i];
    //AbrirBackdrop
    this.showBackdrop = true;

    if (this.lstMenu[i].sAccion.startsWith('/')) {
      this.router.navigate([this.lstMenu[i].sAccion]);
      //Cerrar el sidebar
      elemento.classList.add("close");
      //Cerrar todos los Hijos
      for (let i = 0; i < this.isCollapsed.length; i++) {
        this.isCollapsed[i] = false;
      }
      this.activeCircles = false;
      this.showBackdrop = false;
    }

  }

  pintarCuadros() {
    //Pintar de azul cada cuadro del menú, si la ruta pertenece a los subindices.
    this.lstMenu.forEach((obj) => {
      if (obj.liSubmenu.length > 0) {
        const seccionRutas = obj.liSubmenu.map((seccion: { sAccion: any; }) => seccion.sAccion);
        if (obj.sNombre === "Gestión de información") {
          seccionRutas.push("/datos-actividad");
        }
        this.rutasSubindice.push(seccionRutas);
      } else {
        this.rutasSubindice.push(obj.sAccion);
      }
    });
  }


  backdropCollapse() {
    this.firstCollapse();
    //Abrir y cerrar Backdrop
    this.showBackdrop = false;
    this.openMenu = !this.openMenu;
  }

}


