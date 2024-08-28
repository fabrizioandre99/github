import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { ParametroService } from 'src/app/services/parametro.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  oUsuario: IUsuario;
  prevUrl: any;
  searchUrl: any;
  rutaPowerBi: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');


  rutaCorrecta: boolean = true;
  loading: boolean = true;

  constructor(private seguridadService: SeguridadService, private sanitizer: DomSanitizer, private parametroService: ParametroService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.getReportInicio();
    }
  }

  async getReportInicio() {
    let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerPorTipo('ARCHIVOS', 'HOME'));
    this.prevUrl = data.datoAdicional.sValor;
    this.searchUrl = data.datoAdicional.sValor;

    if (/^www\.[\w-]+\.\w{2,}$/i.test(this.prevUrl)) {
      this.searchUrl = `https://${this.prevUrl}`;
      this.rutaCorrecta = false;
    }

    //console.log(this.searchUrl);
    if (this.esUrlValida(this.searchUrl)) {
      if (data.exito) {
        this.rutaPowerBi = this.sanitizer.bypassSecurityTrustResourceUrl(this.searchUrl);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } else {
      this.rutaCorrecta = false;
    }

    this.loading = false;

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
