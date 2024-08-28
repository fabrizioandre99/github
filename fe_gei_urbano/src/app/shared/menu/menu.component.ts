
import { Component, OnInit } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { IUsuario } from '../../../app/models/usuario';
import { SeguridadService } from '../../services/seguridad.service';
import { SharedDataService } from '../../services/shared-data.service';
import { Subscription, retry } from 'rxjs';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  oUsuario: IUsuario | undefined;

  isAuth = false;
  isCollapsed: boolean[] = [];
  showBackdrop: boolean = false;
  activeCircles: boolean = false;

  lstMenu: any[] = [];
  sAccions: string[] = [];
  rutasSubindice: any[] = [];
  openMenu: boolean = false;

  isCollapsedMenu = false;
  private toggleSubscription: Subscription;

  openSubmenus: { [key: number]: boolean } = {};

  menuIsOpening = false;

  constructor(public router: Router, private seguridadService: SeguridadService,
    private sharedData: SharedDataService, private headerService: HeaderService) {

    this.toggleSubscription = this.headerService.getToggleObservable().subscribe(state => {
      this.isCollapsedMenu = state;
    });

  }

  ngOnInit(): void {

    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.lstMenu = JSON.parse(localStorage.getItem('LocalMenu')!);
      //console.log('this.lstMenu', this.lstMenu);
    }
  }

  ngOnDestroy() {
    this.toggleSubscription.unsubscribe();
  }

  toggleSubmenu(nIdMenu: number, event: Event): void {
    event.preventDefault();

    if (this.isCollapsedMenu) {
      this.isCollapsedMenu = false;
      this.openSubmenus[nIdMenu] = true; // Abrir el submenu correspondiente
    } else {
      let submenu = document.getElementById(`submenu${nIdMenu}`);
      if (submenu) {
        let isOpen = this.openSubmenus[nIdMenu];
        this.openSubmenus[nIdMenu] = !isOpen;
      } else {
        // Manejar la navegación si el ítem del menú no tiene submenús
        let menu = this.lstMenu.find(m => m.nIdMenu === nIdMenu);
        if (menu && menu.sAppUrl) this.router.navigate([menu.sAppUrl]);
      }
    }
  }


  isSubmenuOpen(nIdMenu: number): boolean {
    return this.openSubmenus[nIdMenu];
  }

  isMenuActive(menu: any): boolean {
    if((this.router.url === '/dashboard-resumenAnual' || this.router.url === '/dashboard-ruta') && menu.nIdMenu === 11)
      return true;
    else if (this.router.url === '/factor-emision-nivel2' && menu.nIdMenu === 6)
      return true;
    else return menu.liSubMenu.some((submenu: { sAppUrl: string | UrlTree; }) => this.router.isActive(submenu.sAppUrl, true));
    
  }

  isSubenuActive(submenu: any): boolean {
    if((this.router.url === '/dashboard-resumenAnual' || this.router.url === '/dashboard-ruta') && submenu.nIdMenu === 12)
      return true;
    else if(this.router.url === '/factor-emision-nivel2' && submenu.nIdMenu === 7) return true;
    else return this.router.isActive(submenu.sAppUrl, true);
  }

  onOpenMenu() {
    if (!this.menuIsOpening) {
      this.menuIsOpening = true;
      this.headerService.OpenMenu();

      setTimeout(() => this.menuIsOpening = false, 100);
    }
  }

  onCLoseMenu() {
    if (!this.menuIsOpening) {
      this.menuIsOpening = true;
      this.headerService.CloseMenu();

      setTimeout(() => this.menuIsOpening = false, 100);
    }
  }

}