import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarBitacora = environment.baseUrl + '/rest/log/listar';
  urlObtenerFecha = environment.baseUrl + '/rest/log/numRegistros';

  constructor(private http: HttpClient) { }

  listarBitacora(DFechaRegistro: String, maxPag: Number, minPag: Number) {
    let filtro = {
      dFechaRegistro: DFechaRegistro,
      nMaxPagina: maxPag,
      nMinPagina: minPag
    };
    return this.http.post<IDataResponse>(this.urlListarBitacora, JSON.stringify(filtro), this.options);
  }
  numRegistros(DFechaRegistro: String) {
    let filtro = {
      dFechaRegistro: DFechaRegistro
    };
    return this.http.post<IDataResponse>(this.urlObtenerFecha, JSON.stringify(filtro), this.options);
  }
}
