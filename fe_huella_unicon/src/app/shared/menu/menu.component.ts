
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

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
  constructor(public router: Router, private seguridadService: SeguridadService,
    private sharedData: SharedDataService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      if (!localStorage.getItem('LocalMenu')!) {
        this.pintarCuadros();
      } else {
        this.lstMenu = JSON.parse(localStorage.getItem('LocalMenu')!);
        //console.log('this.lstMenu', this.lstMenu);
        this.pintarCuadros();
      }
    }
  }

  firstCollapse() {
    //Abrir Sidebar y cerrar sidebar
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.toggle("close");
    //Abrir y cerrar Backdrop
    this.showBackdrop = !this.showBackdrop;

    /*  this.showBackdrop = false; */
    this.openMenu = !this.openMenu;

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

  }
  secondCollapse(i: number) {
    //Cerrar sidebar al hacer click a cada item
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.remove("close");
    //Cerrar y abrir cada item
    this.isCollapsed[i] = !this.isCollapsed[i];
    //Abrir Backdrop
    this.showBackdrop = true;
    this.openMenu = true;


    if (this.lstMenu[i].sAccion.startsWith('/home')) {
      //console.log(this.lstMenu[i].sAccion);
      this.router.navigate([this.lstMenu[i].sAccion]);
      //Cerrar el sidebar
      elemento.classList.add("close");
      //Cerrar todos los Hijos
      for (let i = 0; i < this.isCollapsed.length; i++) {
        this.isCollapsed[i] = false;
      }
      this.activeCircles = false;
      this.showBackdrop = false; this.openMenu = !this.openMenu;
    }
  }

  closeSidebar() {
    this.sharedData.setPeriodo(null);
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

  }

  pintarCuadros() {
    //Pintar de azul cada cuadro del menú, si la ruta pertenece a los subindices.
    this.lstMenu.forEach((obj) => {
      if (obj.liSubMenu.length > 0) {
        const seccionRutas = obj.liSubMenu.map((seccion: { sAccion: any; }) => seccion.sAccion);
        if (obj.sNombre === "Gestión de información") {
          seccionRutas.push("/distribucion-mensual");
        }
        if (obj.sNombre === "Monitor GEI") {
          seccionRutas.push("/dashboard");
        }
        this.rutasSubindice.push(seccionRutas);
      } else {
        this.rutasSubindice.push(obj.sAccion);
      }
    });
  }


  backdropCollapse() {
    this.firstCollapse();
  }
}


