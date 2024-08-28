import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IReporte } from '../../models/reporte';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarParticipantes = environment.baseUrl + '/rest/reporte/institucion/v1/listar-historico';
  urlListarCompIndicadores = environment.baseUrl + '/rest/reporte/institucion/v1/listar-comparacion-indicadores';


  constructor(private http: HttpClient) { }

  listarParticipantes(oReporte: IReporte) {
    return this.http.post<IDataResponse>(this.urlListarParticipantes, JSON.stringify(oReporte), this.options);
  }

  listarCompIndicadores(oReporte: IReporte) {

    return this.http.post<IDataResponse>(this.urlListarCompIndicadores, JSON.stringify(oReporte), this.options);
  }
}
