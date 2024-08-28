import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})

export class FuentesEmisionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarSectores = environment.baseUrl + '/rest/fuentesEmision/listarSectores';
  urlListarFuentes = environment.baseUrl + '/rest/fuentesEmision/listarFuentes';
  urlActualizarFuente = environment.baseUrl + '/rest/fuentesEmision/actualizarFuente';

  constructor(private http: HttpClient) { }

  listarSectores() {
    return this.http.post<IDataResponse>(this.urlListarSectores, '', this.options);
  }

  listarFuentes() {
    return this.http.post<IDataResponse>(this.urlListarFuentes, '', this.options);
  }

  actualizarFuente(idFuenteEmision: Number, nombre: String, descripcion: String) {
    let filtro = {
      nIdFuenteEmision: idFuenteEmision,
      sNombre: nombre,
      sDescripcion: descripcion
    }
    //console.log('filtro actualizarFuente', filtro)
    return this.http.post<IDataResponse>(this.urlActualizarFuente, JSON.stringify(filtro), this.options);
  }

}
