import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDataResponse } from '../../models/IDataResponse';
import { IMitigacion } from '../../models/mitigacion';
import { IOrganizacion } from '../../models/organizacion';

@Injectable({
  providedIn: 'root'
})
export class MitigacionService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarMitigacion = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/listar';
  urlRegistrarPlan = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/registrarPlan';
  urlRegistrarMedida = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/registrarMedida';
  urlEliminarPlan = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/eliminarPlan';
  urlEliminarMedida = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/eliminarMedida';
  urlListarGlobal = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/listar-global';
  urlListarDetalle = environment.baseUrl + '/rest/huella/medida-mitigacion/v1/listar-detalle';

  constructor(private http: HttpClient) { }

  listarMitigacion(oMitigacion: IMitigacion) {
    console.log('oMitigacion', oMitigacion);
    return this.http.post<IDataResponse>(this.urlListarMitigacion, JSON.stringify(oMitigacion), this.options);
  }

  registrarPlan(mfDocumento: File) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfDocumento', mfDocumento);
    headers.set('Content-Type', 'multipart/form-data');

    return this.http.post<IDataResponse>(this.urlRegistrarPlan, formData, { headers });
  }

  registrarMedida(oMitigacion: IMitigacion) {
    console.log('oMitigacion', oMitigacion);
    return this.http.post<IDataResponse>(this.urlRegistrarMedida, JSON.stringify(oMitigacion), this.options);
  }

  eliminarPlan(oMitigacion: IMitigacion) {
    console.log('oMitigacion', oMitigacion);
    return this.http.post<IDataResponse>(this.urlEliminarPlan, JSON.stringify(oMitigacion), this.options);
  }

  eliminarMedida(oMitigacion: IMitigacion) {
    console.log('oMitigacion', oMitigacion);
    return this.http.post<IDataResponse>(this.urlEliminarMedida, JSON.stringify(oMitigacion), this.options);
  }

  listarGlobal(oMitigacion: IMitigacion) {
    console.log('oMitigacion', oMitigacion);
    return this.http.post<IDataResponse>(this.urlListarGlobal, JSON.stringify(oMitigacion), this.options);
  }

  listarDetalle(oOrganizacion: IOrganizacion) {
    console.log('oOrganizacion', oOrganizacion);
    return this.http.post<IDataResponse>(this.urlListarDetalle, JSON.stringify(oOrganizacion), this.options);
  }
}
