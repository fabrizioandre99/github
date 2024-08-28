import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { EmisionGeiService } from 'src/app/services/emision-gei.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resultado-gei',
  templateUrl: './resultado-gei.component.html',
  styleUrls: ['./resultado-gei.component.css']
})
export class ResultadoGeiComponent implements OnInit {

  idUsuario: Number;
  oUsuario: IUsuario;
  lstResultadoGei: any;
  totalEmisiones: any;

  lstBiomasa: any;
  totalBiomasa: any;

  isCollapsed: boolean[] = [];
  isCollapsedBiomasa: boolean[] = [];

  loading_resulGei: Boolean = true;
  loading_biomasa: Boolean = true;

  suma_resulGei: any;
  suma_biomasa: any;
  sector: any;
  comboSelect: any;

  constructor(private alertService: AlertService, private sharedData: SharedDataService, private emisionGeiService: EmisionGeiService, private seguridadService: SeguridadService, private location: Location) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      //Preseleccionar Select
      this.sector = -1;
      this.fnListarResultadoGei();
      this.fnListarBiomasa();
    }
    //console.log('nIdPeriodo', this.sharedData.itemPeriodo?.nIdPeriodo);
  }


  truncateValue(value: number, decimals: number): string {
    // Si el valor es -1, retorna una cadena vacía
    if (value === -1) {
      return '';
    }

    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  esNaN(valor: number): boolean {
    return isNaN(valor);
  }

  async fnListarResultadoGei() {
    //console.log('nIdPeriodo', this.sharedData.itemPeriodo.nIdPeriodo);
    try {
      let data: IDataResponse = await lastValueFrom(this.emisionGeiService.listarResultado(this.sharedData.itemPeriodo.nIdPeriodo));
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      } else {
        this.lstResultadoGei = data.datoAdicional;
        //console.log('lstResultadoGei', this.lstResultadoGei);
      }
      //Iniciar suma de valores bdTotalCo2eq
      let sum = this.lstResultadoGei?.reduce((accumulator: any, object: { bdTotalCo2eq: any; }) => {
        return accumulator + object.bdTotalCo2eq;
      }, 0);

      this.suma_resulGei = sum;
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    } this.loading_resulGei = false;
  }


  async fnListarBiomasa() {
    //console.log('nIdPeriodo', this.sharedData.itemPeriodo.nIdPeriodo);
    try {
      let data: IDataResponse = await lastValueFrom(this.emisionGeiService.listarBiomasa(this.sharedData.itemPeriodo.nIdPeriodo));
      //console.log(data);
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      } else {
        this.lstBiomasa = data.datoAdicional;
        //console.log('this.lstBiomasa', this.lstBiomasa);
      }
      //Iniciar suma de valores bdTotalCo2eq
      let sum = this.lstBiomasa?.reduce((accumulator: any, object: { bdTotalCo2: any; }) => {
        return accumulator + object.bdTotalCo2;
      }, 0);

      this.suma_biomasa = sum;
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    } this.loading_biomasa = false;
  }


  secondCollapsed(second: any) {
    second.collapse = !second.collapse;
  }

  thirdCollapsed(third: any) {
    third.collapse = !third.collapse;
  }

  redictVolver() {
    this.location.back()
  }

}
