import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { ICredencial } from 'src/app/models/credencial';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent implements OnInit {

  model: ICredencial = {};
  loading: boolean = false;
  rutaRedict: any;


  constructor(private router: Router, private toastr: ToastrService,
    private seguridadService: SeguridadService) { }

  ngOnInit(): void {
  }

  async fnIniciarSesion() {
    this.loading = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.seguridadService.validarToken());
      if (!data.exito) {
        window.open(data.mensajeUsuario, '_self');
      } else {
        this.router.navigate([localStorage.getItem('LocalRutaInicial_intercorp')]);
      }
    } catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89) {
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
        this.loading = false;
      }
    }

  }

}
