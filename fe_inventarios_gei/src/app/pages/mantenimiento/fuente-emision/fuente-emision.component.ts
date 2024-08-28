import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { FuentesEmisionService } from 'src/app/services/fuentes-emision.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-fuente-emision',
  templateUrl: './fuente-emision.component.html',
  styleUrls: ['./fuente-emision.component.css']
})
export class FuenteEmisionComponent implements OnInit {

  idUsuario: Number;
  oUsuario: IUsuario;
  lstSector: any[] = [];

  page = 1;
  pageSize = 10;
  total = 0;
  regexOnlyLetters = /^(?!\s+$).+/;

  isCollapsed: boolean[] = [];
  loadingTable: boolean = true;

  constructor(private alertService: AlertService, private fuentesEmisionService: FuentesEmisionService, private seguridadService: SeguridadService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarFuenteEmision();
    }
  }

  editarSector(item: any, position: number): void {
    item.sNombre_mod = item.sNombre;
    item.sDescripcion_mod = item.sDescripcion;
    item.edit = true;
  }

  async fnListarFuenteEmision() {
    try {
      let data: IDataResponse = await lastValueFrom(this.fuentesEmisionService.listarFuentes());
      //console.log(data);
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      } else {
        this.lstSector = data.datoAdicional;
        console.log('this.lstSector', this.lstSector);
        this.isCollapsed = new Array(this.lstSector.length).fill(true);
        //console.log('this.lstSector', this.lstSector)
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  async actualizarSector(item: any, position: number) {
    try {
      let sDescripcion: any = null!;

      if (!item.sNombre_mod.trim()) {
        this.alertService.warning('Complete los espacios vacíos.');
        return;
      }

      if (!this.regexOnlyLetters.test(item.sNombre_mod)) {
        this.alertService.warning('No ingrese caracteres extraños.');
        return
      }

      if (item.sNombre_mod.length > 200) {
        this.alertService.warning('Límite de caracteres excedido.');
        return;
      }
      if (item.sDescripcion_mod?.length > 250) {
        this.alertService.warning('Límite de caracteres excedido.');
        return;
      }

      item.sDescripcion = item.sDescripcion_mod;
      item.sNombre = item.sNombre_mod;
      sDescripcion = item.sDescripcion_mod?.trim();

      let data: IDataResponse = await lastValueFrom(this.fuentesEmisionService.actualizarFuente(item.nIdFuenteEmision, item.sNombre_mod.trim()
        , sDescripcion));
      //console.log('data', data)
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      }
      item.edit = false;
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }


  secondCollapsed(second: any) {
    second.collapse = !second.collapse;
  }

  thirdCollapsed(third: any) {
    third.collapse = !third.collapse;
  }

}
