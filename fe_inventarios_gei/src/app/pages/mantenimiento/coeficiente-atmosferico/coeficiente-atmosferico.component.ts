import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { GwpService } from 'src/app/services/gwp.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-coeficiente-atmosferico',
  templateUrl: './coeficiente-atmosferico.component.html',
  styleUrls: ['./coeficiente-atmosferico.component.css']
})
export class CoeficienteAtmosfericoComponent implements OnInit {
  oUsuario: IUsuario;
  lstPotencial: any[] = [];
  loadingTable: Boolean = true;
  regexAllowDecimals = /^(\d{1,3}|\d{1,3}[.]|\d{0,3}\.\d{0,6}?)$/;

  constructor(private seguridadService: SeguridadService, private gwpService: GwpService,
    private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarGWP();
    }
  }

  async fnListarGWP() {
    try {
      let data: IDataResponse = await lastValueFrom(this.gwpService.listarPotencial());
      if (data.exito) {
        this.lstPotencial = data.datoAdicional;
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  editarGWP(item: any) {
    item.nIdPotencial_mod = item.nIdPotencial;
    item.sTipoGas_mod = item.sTipoGas;
    item.bdGWP_mod = item.bdGWP;

    item.edit = true;
  }

  async actualizarGWP(item: any) {
    try {
      if (item.bdGWP_mod == null || item.bdGWP_mod == '') {
        this.alertService.warning('Ingrese un texto.');
        return
      }

      if (!this.regexAllowDecimals.test(item.bdGWP_mod)) {
        this.alertService.warning('Ingrese un máximo de 3 unidades y 6 decimales.');
        return
      }

      item.nIdPotencial = item.nIdPotencial_mod;
      item.sTipoGas = item.sTipoGas_mod;
      item.bdGWP = parseFloat(item.bdGWP_mod);

      //console.log('item.bdGWP_mod', parseFloat(item.bdGWP_mod));
      let data: IDataResponse = await lastValueFrom(this.gwpService.actualizarPotencial(item.nIdPotencial_mod, item.sTipoGas_mod,
        item.bdGWP_mod));
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      }
      item.edit = false;
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }

  }
}
