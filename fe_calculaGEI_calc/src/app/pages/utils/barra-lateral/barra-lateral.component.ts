import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-barra-lateral',
  templateUrl: './barra-lateral.component.html',
  styleUrls: ['./barra-lateral.component.css']
})

export class BarraLateralComponent implements OnInit {
  empresa: any = {};
  consumo: any = {};
  personales: any = {};
  proveedor1: any = {};
  proveedor2: any = {};
  proveedor3: any = {};

  url1 = this.router.url === '/datos-empresa';
  url2 = this.router.url === '/datos-consumo';
  url3 = this.router.url === '/datos-contacto';

  prov1 = this.router.url === '/datos-consumo/1';
  prov2 = this.router.url === '/datos-consumo/2';
  prov3 = this.router.url === '/datos-consumo/3';

  constructor(private router: Router, private sharedData: SharedDataService) {

  }

  ngOnInit() {

  }

}
