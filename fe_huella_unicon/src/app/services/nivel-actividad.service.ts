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

  urlListarNivelActividad = environment.baseUrl + '/rest/nivelActividad/listar';
  urlListarTramoNoConfig = environment.baseUrl + '/rest/nivelActividad/listarTramoNoConfig';
  urlEliminarNivelActividad = environment.baseUrl + '/rest/nivelActividad/eliminar';
  urlRegistrarNivelActividad = environment.baseUrl + '/rest/nivelActividad/registrar';
  urlRegistrarTramo = environment.baseUrl + '/rest/nivelActividad/registrarTramos';
  urlCalcularGei = environment.baseUrl + '/rest/nivelActividad/calcularGei';
  urlRecalcularByAnio = environment.baseUrl + '/rest/nivelActividad/recalcularByAnio';

  constructor(private http: HttpClient) { }

  listarNivelActividad(idPeriodo: any, codMes: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      sCodMes: codMes
    }
    return this.http.post<IDataResponse>(this.urlListarNivelActividad, JSON.stringify(filtro), this.options);
  }

  listarTramoNoConfig(idNivelActividad: Number, idFuenteEmision: Number) {
    let filtro = {
      nIdNivelActividad: idNivelActividad,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      }
    }
    return this.http.post<IDataResponse>(this.urlListarTramoNoConfig, JSON.stringify(filtro), this.options);
  }

  eliminarNivelActividad(idNivelActividad: Number, idFuenteEmision: Number) {
    let filtro = {
      nIdNivelActividad: idNivelActividad,
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision
      }
    }
    return this.http.post<IDataResponse>(this.urlEliminarNivelActividad, JSON.stringify(filtro), this.options);
  }

  registrarNivelActividad(fileNActividad: File, filePMixer: File, idPeriodo: Number,
    codMes: String, idFuenteEmision: Number) {

    const headers = new HttpHeaders();

    let filtro = {
      oPeriodo: { nIdPeriodo: idPeriodo },
      sCodMes: codMes,
      oFuenteEmision: { nIdFuenteEmision: idFuenteEmision }
    }

    const formData = new FormData();
    formData.append('mfXlxNivelActividad', fileNActividad);

    if (filePMixer) {
      formData.append('mfXlxProduccionMixer', filePMixer);
    } else {
      formData.append('mfXlxProduccionMixer', new Blob(), 'emptyFile');
    }

    formData.append('oNivelActividad', new Blob([JSON.stringify(filtro)], { type: 'application/json' }));
    headers.set('Content-Type', 'multipart/form-data'); // añadir el tipo de media

    return this.http.post<IDataResponse>(this.urlRegistrarNivelActividad, formData, { headers });
  }

  registrarTramo(oTramo: any) {
    return this.http.post<IDataResponse>(this.urlRegistrarTramo, JSON.stringify(oTramo), this.options);
  }

  calcularGei(idNivelActividad: Number) {
    let filtro = {
      nIdNivelActividad: idNivelActividad
    }
    return this.http.post<IDataResponse>(this.urlCalcularGei, JSON.stringify(filtro), this.options);
  }

  reCalcularGei(anio: Number, idFuenteEmision: Number) {
    let filtro = {
      nAnio: anio,
      nIdFuenteEmision: idFuenteEmision
    }
    return this.http.post<IDataResponse>(this.urlRecalcularByAnio, JSON.stringify(filtro), this.options);
  }

}
