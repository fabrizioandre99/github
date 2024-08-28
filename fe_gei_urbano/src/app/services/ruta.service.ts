import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class RutaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarRuta = environment.baseUrl + '/rest/ruta/listar';
  urlListarActivas = environment.baseUrl + '/rest/ruta/listarActivas';
  urlListarByPeriodo = environment.baseUrl + '/rest/ruta/listarByPeriodo';
  urlActualizarRuta = environment.baseUrl + '/rest/ruta/actualizarEstado';
  urlEditOrRegisRuta = environment.baseUrl + '/rest/ruta/registrar';
  urlEliminarRuta = environment.baseUrl + '/rest/ruta/eliminar';

  constructor(private http: HttpClient) { }

  listarRuta() {
    return this.http.post<IDataResponse>(this.urlListarRuta, '', this.options);
  }

  listarRutasActivas(){
    return this.http.post<IDataResponse>(this.urlListarActivas, '', this.options);
  }

  listarByPeriodo(nIdPeriodo: number){
    let filtro = {
      nIdPeriodo: nIdPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarByPeriodo, JSON.stringify(filtro), this.options);
  }

  actualizarRuta(idRuta: Number, codEstado: Boolean) {
    let filtro = {
      nIdRuta: idRuta,
      boCodEstado: codEstado
    }
    return this.http.post<IDataResponse>(this.urlActualizarRuta, JSON.stringify(filtro), this.options);
  }

  editOrRegisRuta(oRuta: any) {
    console.log('oRuta', oRuta);
    return this.http.post<IDataResponse>(this.urlEditOrRegisRuta, JSON.stringify(oRuta), this.options);
  }


  eliminarRuta(idRuta: Number) {
    let filtro = {
      nIdRuta: idRuta
    }
    return this.http.post<IDataResponse>(this.urlEliminarRuta, JSON.stringify(filtro), this.options);
  }

}
