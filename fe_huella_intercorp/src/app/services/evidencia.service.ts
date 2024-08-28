import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlRegistrarEvidencia = environment.baseUrl + '/rest/evidencia/registrar';
  urlListarEvidencia = environment.baseUrl + '/rest/evidencia/listar';
  urlEliminarEvidencia = environment.baseUrl + '/rest/evidencia/eliminar';

  constructor(private http: HttpClient) { }

  registrarEvidencia(mfDocumento: File[], oEvidencia: any) {
    const formData = new FormData();

    mfDocumento.forEach((file) => {
      formData.append('mfArchivo', file);
    });

    formData.append('oEvidencia', new Blob([JSON.stringify(oEvidencia)], { type: 'application/json' }));

    return this.http.post<IDataResponse>(this.urlRegistrarEvidencia, formData);
  }

  listarEvidencia(nIdPeriodo: Number, nIdFuenteEmision: Number,
    sCodMes: String, idLocacion: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: nIdPeriodo
      },
      oFuenteEmision: {
        nIdFuenteEmision: nIdFuenteEmision
      },
      sCodMes: sCodMes,
      oLocacion: {
        nIdLocacion: idLocacion
      }
    }

    return this.http.post<IDataResponse>(this.urlListarEvidencia, JSON.stringify(filtro), this.options);
  }

  eliminarEvidencia(idEvidencia: Number) {
    let filtro = {
      nIdEvidencia: idEvidencia
    }
    return this.http.post<IDataResponse>(this.urlEliminarEvidencia, JSON.stringify(filtro), this.options);
  }

}
