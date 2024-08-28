import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlListarVehiculosPorRuta = environment.baseUrl + '/rest/vehiculo/listar';
  urlEditOrRegisVehiculo = environment.baseUrl + '/rest/vehiculo/registrar';
  urlEliminarVehiculo = environment.baseUrl + '/rest/vehiculo/eliminar';
  urlDescargarFormato = environment.baseUrl + '/rest/vehiculo/descargarFormato';
  urlCargaMasiva = environment.baseUrl + '/rest/vehiculo/cargaMasiva';

  constructor(private http: HttpClient) { }

  listarVehiculo(idRuta: Number) {
    let filtro = {
      oRuta: {
        nIdRuta: idRuta
      }
    }
    return this.http.post<IDataResponse>(this.urlListarVehiculosPorRuta, JSON.stringify(filtro), this.options);
  }

  editOrRegisVehiculo(oVehiculo: any) {
    return this.http.post<IDataResponse>(this.urlEditOrRegisVehiculo, JSON.stringify(oVehiculo), this.options);
  }

  eliminarVehiculo(idVehiculo: Number) {
    let filtro = {
      nIdVehiculo: idVehiculo
    }

    return this.http.post<IDataResponse>(this.urlEliminarVehiculo, JSON.stringify(filtro), this.options);
  }

  descargarFormato() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.urlDescargarFormato, null, {
      headers: headers,
      responseType: 'blob'
    })
  }

  cargaMasiva(mfXlsxVehiculos: File, oVehiculo: any) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfXlsxVehiculos', mfXlsxVehiculos);
    formData.append('oVehiculo', new Blob([JSON.stringify(oVehiculo)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data'); // añadir el tipo de media

    return this.http.post<IDataResponse>(this.urlCargaMasiva, formData, { headers });
  }

}
