import { OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ParametroService } from 'src/app/services/parametro.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { Component } from '@angular/core';
import { IUsuario } from 'src/app/models/usuario';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-indicadores-gei',
  templateUrl: './indicadores-gei.component.html',
  styleUrls: ['./indicadores-gei.component.css']
})
export class IndicadoresGeiComponent implements OnInit {

  oUsuario: IUsuario;
  prevUrl: any;
  searchUrl: any;
  rutaPowerBi: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  rutaPowerBiButton: any;

  rutaCorrecta: boolean = true;
  loading: boolean = true;

  constructor(private toastr: ToastrService, private sanitizer: DomSanitizer, private seguridadService: SeguridadService,
    private parametroService: ParametroService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.getReportIndicadores();
    }
  }

  async getReportIndicadores() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerPorTipo('ARCHIVOS', 'INDICADORES'));
    this.prevUrl = data.datoAdicional.sValor;
    this.searchUrl = data.datoAdicional.sValor;

    if (/^www\.[\w-]+\.\w{2,}$/i.test(this.prevUrl)) {
      this.searchUrl = `https://${this.prevUrl}`;
      this.rutaCorrecta = false;
    }

    if (this.esUrlValida(this.searchUrl)) {
      if (data.exito) {
        this.rutaPowerBi = this.sanitizer.bypassSecurityTrustResourceUrl(this.searchUrl);
        //console.log('this.rutaPowerBi', this.rutaPowerBi);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } else {
      this.rutaCorrecta = false;
    }
    this.loading = false;
  }


  async fnObtenerPorTipo() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerPorTipo('ARCHIVOS', 'DASHBOARD'));
    if (data.exito) {
      this.rutaPowerBiButton = data.datoAdicional.sValor;
      window.open(this.rutaPowerBiButton, '_blank');
      //console.log(' this.rutaPowerBi ',  this.rutaPowerBi);
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  esUrlValida(ruta: string): boolean {
    try {
      new URL(ruta);
      return true;
    } catch (_) {
      return false;
    }
  }

}


