import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { iParametro } from '../../models/parametro';
import { SesionService } from '../sesion.service';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlRegistrar = environment.baseUrl + '/rest/configuracion/parametro/v1/registrar';
  urlListarTipos = environment.baseUrl + '/rest/configuracion/parametro/v1/listar-tipos';
  urlListarDetalle = environment.baseUrl + '/rest/configuracion/parametro/v1/listar-detalle';
  urlActualizarEstado = environment.baseUrl + '/rest/configuracion/parametro/v1/actualizar-estado';
  urlListarPorTipo = environment.baseUrl + '/rest/configuracion/parametro/v1/listar-por-tipo';
  urlObtenerParametro = environment.baseUrl + '/rest/configuracion/parametro/v1/obtener-parametro';
  urlEliminar = environment.baseUrl + '/rest/configuracion/parametro/v1/eliminar';

  constructor(private http: HttpClient, private sesionService: SesionService) { }

  listarPorTipo(oParametro: iParametro) {
    return this.http.post<IDataResponse>(this.urlListarPorTipo, JSON.stringify(oParametro), this.options);
  }

  obtenerParametro(oParametro: iParametro) {
    oParametro.nIdSesionReg = this.sesionService.getSesion()!;
    console.log('oParametro', oParametro);
    return this.http.post<IDataResponse>(this.urlObtenerParametro, JSON.stringify(oParametro), this.options);
  }

  listarDetalle(oParametro: iParametro) {
    return this.http.post<IDataResponse>(this.urlListarDetalle, JSON.stringify(oParametro), this.options);
  }

  actualizarEstado(oParametro: iParametro) {
    return this.http.post<IDataResponse>(this.urlActualizarEstado, JSON.stringify(oParametro), this.options);
  }

  eliminar(oParametro: iParametro) {
    return this.http.post<IDataResponse>(this.urlEliminar, JSON.stringify(oParametro), this.options);
  }

  registrar(oParametro: iParametro) {
    return this.http.post<IDataResponse>(this.urlRegistrar, JSON.stringify(oParametro), this.options);
  }

  listarTipos() {
    return this.http.post<IDataResponse>(this.urlListarTipos, '', this.options);
  }
}
