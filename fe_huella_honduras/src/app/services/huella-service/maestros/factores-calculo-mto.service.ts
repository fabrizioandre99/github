import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IDataResponse } from '../../../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class FactoresCalculoMtoService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarFactorEmisionMto = environment.baseUrl + '/rest/huella/factor/v1/listar-factor';
  urlListarFactorConversionMto = environment.baseUrl + '/rest/huella/factor/v1/listar-conversion';
  urlActualizarFactorEmisionMto=environment.baseUrl + '/rest/huella/factor/v1/actualizar-factor';
  urlRegistrarFactorEnergiaMto=environment.baseUrl + '/rest/huella/factor/v1/registrar-electricidad';
  urlActualizarFactorConversion=environment.baseUrl + '/rest/huella/factor/v1/registrar-electricidad';

  constructor(private http: HttpClient) { }

  
  listarFactorEmision(oFiltro:any) {
    return this.http.post<IDataResponse>(this.urlListarFactorEmisionMto, JSON.stringify(oFiltro), this.options);
  }

  listarFactorConversion() {
    return this.http.post<IDataResponse>(this.urlListarFactorConversionMto, "", this.options);
  }

  actualizarFactorEmision(oFactor:any){
    return this.http.post<IDataResponse>(this.urlActualizarFactorEmisionMto,JSON.stringify(oFactor), this.options);
  }

  registrarFactorEnergia(oFactor:any){
    return this.http.post<IDataResponse>(this.urlRegistrarFactorEnergiaMto,JSON.stringify(oFactor), this.options);
  }

  actualizarFactorConversion(oFactor:any){
    return this.http.post<IDataResponse>(this.urlActualizarFactorConversion,JSON.stringify(oFactor), this.options);
  }


}
