import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class NivelActividadService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlRegistrarNivelActividad = environment.baseUrl + '/rest/datosActividad/registrar';
  urlListarNivelActividad = environment.baseUrl + '/rest/datosActividad/listar';
  urlEliminarNivelActividad = environment.baseUrl + '/rest/datosActividad/eliminar';
  urlCambiarEstado = environment.baseUrl + '/rest/datosActividad/cambiarEstado';

  constructor(private http: HttpClient) { }

  registrarNivelActividad(mfXlxDac: File, oDatoActividad: any) {
    const headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('mfXlxDac', mfXlxDac);
    formData.append('oDatoActividad', new Blob([JSON.stringify(oDatoActividad)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data'); // añadir el tipo de media

    return this.http.post<IDataResponse>(this.urlRegistrarNivelActividad, formData, { headers });
  }

  listarNivelActividad(idPeriodo: Number, codMes: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes
    }
    return this.http.post<IDataResponse>(this.urlListarNivelActividad, JSON.stringify(filtro), this.options);
  }

  eliminarNivelActividad(idDatosActividad: Number, idBiogenica: any) {
    let filtro = {
      nIdDatosActividad: idDatosActividad,
      nIdBiogenica: idBiogenica
    }
    return this.http.post<IDataResponse>(this.urlEliminarNivelActividad, JSON.stringify(filtro), this.options);
  }

  cambiarEstado(oDatosActividad: any) {
    return this.http.post<IDataResponse>(this.urlCambiarEstado, JSON.stringify(oDatosActividad), this.options);
  }

}

