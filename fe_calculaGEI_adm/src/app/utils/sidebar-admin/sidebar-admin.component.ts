
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.css']
})
export class SidebarAdminComponent implements OnInit {
  isCollapsed: boolean[] = [];
  showBackdrop: boolean = false;
  activeCircles: boolean = false;
  lstMenu: any[];
  sRutas: string[] = [];
  rutasSubindice: any[] = [];
  arrayGuardado: any;

  constructor(public router: Router, private menuService: MenuService, private toastr: ToastrService) {
  }

  ngOnInit(): void {

    this.menuService.disparadorDeListado.subscribe(data => {
      this.fnListarMenu();
    });

    //console.log(JSON.parse(localStorage.getItem('ArrayMenu')!));
    if (JSON.parse(localStorage.getItem('ArrayMenu')!) == null) {
      this.fnListarMenu();
    } else {
      this.lstMenu = JSON.parse(localStorage.getItem('ArrayMenu')!);
      //console.log('this.lstMenu', this.lstMenu);
      this.pintarCircles();
    }

  }

  async fnListarMenu() {
    //console.log('Session', localStorage.getItem('SessionRol'));
    let data: IDataResponse = await lastValueFrom(this.menuService.listarActivos(localStorage.getItem('SessionRol')!));
    if (data.exito) {
      localStorage.setItem('ArrayMenu', JSON.stringify(data.datoAdicional));
      //Insertar array guardado en localstorage a la tabla
      this.arrayGuardado = JSON.parse(localStorage.getItem('ArrayMenu')!);

      this.lstMenu = this.arrayGuardado;
      this.pintarCircles();
      //Asignar todas las rutas a un array
      const rutas = this.lstMenu
        .map((item: any) => [item.sRuta, ...item.liSeccion.map((sec: any) => sec.sRuta)])
        .flat()
        .filter((ruta: string) => ruta.startsWith('/'));
      //console.log('RUTAS', rutas);
      localStorage.setItem('Rutas', JSON.stringify(rutas));
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  firstCollapse() {
    //Abrir Sidebar y cerrar sidebar
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.toggle("close");
    //Abrir y cerrar Backdrop
    this.showBackdrop = !this.showBackdrop;
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
  }

  redictFather(i: any) {
    //Cerrar sidebar al hacer click a cada item
    var elemento = document.getElementById('sidebar')!;
    elemento.classList.remove("close");
    //Cerrar y abrir cada item
    this.isCollapsed[i] = !this.isCollapsed[i];
    //AbrirBackdrop
    this.showBackdrop = true;

    if (this.lstMenu[i].sRuta.startsWith('/')) {
      //console.log(this.lstMenu[i].sRuta);
      this.router.navigate([this.lstMenu[i].sRuta]);
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

  pintarCircles() {
    //Pintar de azul cada circulo si la ruta pertenece a los subindices
    this.lstMenu.forEach((obj) => {
      if (obj.liSeccion.length > 0) {
        const seccionRutas = obj.liSeccion.map((seccion: { sRuta: any; }) => seccion.sRuta);
        this.rutasSubindice.push(seccionRutas);
      } else {
        this.rutasSubindice.push(obj.sRuta);
      }
    });
  }
}


