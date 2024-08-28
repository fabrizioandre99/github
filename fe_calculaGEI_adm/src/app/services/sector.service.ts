import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlListarIndustria = '/rest/administrativo/sector/listarCli';

  constructor(private http: HttpClient) { }

  listarIndustria(fechaInicio: String, fechaFin: String) {
    let filtro = {
      FechaInicio: fechaInicio,
      FechaFin: fechaFin
    };
    return this.http.post<IDataResponse>(this.urlListarIndustria, JSON.stringify(filtro), this.options);
  }
}
