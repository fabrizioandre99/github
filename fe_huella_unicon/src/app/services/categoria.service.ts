import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})

export class CategoriaService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarByTipoYPadre = environment.baseUrl + '/rest/categoria/listarByTipoYPadre';
  urlListarByPadre = environment.baseUrl + '/rest/categoria/listarByPadre';
  urlRegistrarCategoria = environment.baseUrl + '/rest/categoria/registrar';
  urlEliminarCategoria = environment.baseUrl + '/rest/categoria/eliminar';

  constructor(private http: HttpClient) { }

  listarByTipoYPadre(idPadre: Number, tipo: String) {
    let filtro = {
      nIdPadre: idPadre,
      sTipo: tipo
    }
    return this.http.post<IDataResponse>(this.urlListarByTipoYPadre, JSON.stringify(filtro), this.options);
  }

  listarByPadre(idPadre: Number, tipo: String) {
    let filtro = {
      nIdPadre: idPadre,
      sTipo: tipo
    }
    return this.http.post<IDataResponse>(this.urlListarByPadre, JSON.stringify(filtro), this.options);
  }

  registrarCategoria(idCategoria: Number, nombre: String, tipo: String, idPadre: Number, codEstado: Boolean,
    nombreModificado: Boolean) {
    let filtro = {
      nIdCategoria: idCategoria,
      sNombre: nombre,
      sTipo: tipo,
      nIdPadre: idPadre,
      boCodEstado: codEstado,
      boNombreModificado: nombreModificado
    }

    //console.log('registrarCategoria', filtro);
    return this.http.post<IDataResponse>(this.urlRegistrarCategoria, JSON.stringify(filtro), this.options);
  }

  eliminarCategoria(idCategoria: Number) {
    let filtro = {
      nIdCategoria: idCategoria
    }
    return this.http.post<IDataResponse>(this.urlEliminarCategoria, JSON.stringify(filtro), this.options);
  }
}
