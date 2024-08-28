import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarUsuario = environment.baseUrl + '/rest/usuario/listar';
  urlEliminarUsuario = environment.baseUrl + '/rest/usuario/eliminar';
  urlRegistrarUsuario = environment.baseUrl + '/rest/usuario/registrar';
  urlCargaMasiva = environment.baseUrl + '/rest/usuario/cargaMasiva';
  urlLogUsuario = environment.baseUrl + '/rest/usuario/logUsuario';


  constructor(private http: HttpClient) { }

  listarUsuario() {
    return this.http.post<IDataResponse>(this.urlListarUsuario, '', this.options);
  }

  eliminarUsuario(idUsuario: Number) {
    let filtro = {
      nIdUsuario: idUsuario
    }
    return this.http.post<IDataResponse>(this.urlEliminarUsuario, JSON.stringify(filtro), this.options);
  }

  registrarUsuario(oUsuario: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarUsuario, JSON.stringify(oUsuario), this.options);
  }

  cargaMasiva(fileXlxUsuarios: File) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfXlxUsuarios', fileXlxUsuarios);
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post<IDataResponse>(this.urlCargaMasiva, formData, { headers });
  }

  logUsuario(fechaReg: String, idUsuario: Number) {
    let filtro = {
      sFechaReg: fechaReg,
      nIdUsuario: idUsuario
    }
    return this.http.post<IDataResponse>(this.urlLogUsuario, JSON.stringify(filtro), this.options);
  }
}
