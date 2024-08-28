import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Bloqueados } from 'src/app/models/bloqueados';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { AlertService } from 'src/app/services/alert.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-usuarios-bloqueados',
  templateUrl: './usuarios-bloqueados.component.html',
  styleUrls: ['./usuarios-bloqueados.component.css']
})
export class UsuariosBloqueadosComponent implements OnInit {

  lstUsuariosBloqueados: any[];
  oUsuario: IUsuario;
  page = 1;
  pageSize = 10;
  total = 0;
  model: Bloqueados = new Bloqueados();
  loadingTable: Boolean = true;

  constructor(private seguridadService: SeguridadService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnUsuariosBloqueados();
    }
  }

  async fnUsuariosBloqueados() {
    try {
      let data: IDataResponse = await lastValueFrom(this.seguridadService.listarBloqueados());
      //console.log('this.lstUsuarioBloqueados', data);
      if (data.exito) {
        this.lstUsuariosBloqueados = data.datoAdicional;
      } else {
        //this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  async fnDesbloquearUsuario(item: any) {
    try {
      //console.log('item.nIdUsuarioBloqueado', item.nIdUsuario)
      let data: IDataResponse = await lastValueFrom(this.seguridadService.desbloquearUsuario(item.nIdUsuario));
      //console.log('fnDesbloquearUsuario', data.datoAdicional);
      if (data.exito) {
        this.lstUsuariosBloqueados = [];
        this.fnUsuariosBloqueados();
        this.alertService.success('Usuario desbloqueado.');
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }

  }
}
