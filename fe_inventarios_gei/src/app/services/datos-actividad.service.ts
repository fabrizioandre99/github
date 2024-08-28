import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DatosActividad } from '../models/datosActividad';
import { IDataResponse } from '../models/IDataResponse';

@Injectable({
  providedIn: 'root'
})
export class DatosActividadService {
  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlInsertarDatosActividad = environment.baseUrl + '/rest/datos-actividad/insertarDatosActividad';
  urlListarHistorial = environment.baseUrl + '/rest/datos-actividad/historial';
  urlActualizarDatosActividad = environment.baseUrl + '/rest/datos-actividad/actualizar';
  urlEliminarDatosActividad = environment.baseUrl + '/rest/datos-actividad/eliminar';
  urlInsertarEvidencia = environment.baseUrl + '/rest/datos-actividad/insertarEvidencia';
  urlEliminarEvidencia = environment.baseUrl + '/rest/datos-actividad/eliminarEvidencia';

  constructor(private http: HttpClient) { }

  listarHistorial(idPeriodo: Number) {
    let filtro = {
      nIdPeriodo: idPeriodo
    }
    return this.http.post<IDataResponse>(this.urlListarHistorial, JSON.stringify(filtro), this.options);
  }

  insertarDatosActividad(idPeriodo: Number, idSector: Number, nombreFna: String, uidDocumento: String, nombreDocumento: any) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      oFuenteEmision: {
        nIdFuenteEmision: idSector,
        sNombreFna: nombreFna
      },
      oDocumento: {
        sUidDocumento: uidDocumento,
        sNombreDocumento: nombreDocumento
      }
    }

    //console.log('Filtro - Insertar Datos Actividad', filtro);
    return this.http.post<IDataResponse>(this.urlInsertarDatosActividad, JSON.stringify(filtro), this.options);
  }

  actualizarDatosActividad(idDatosActividad: Number, idPeriodo: Number, idFuenteEmision: Number, nombreFna: String, boEstado: boolean, uidDocumento: String, nombreDocumento: String) {
    let filtro = {
      nIdDatosActividad: idDatosActividad,
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
      oFuenteEmision: {
        nIdFuenteEmision: idFuenteEmision,
        sNombreFna: nombreFna

      },
      boEstado: boEstado,
      oDocumento: {
        sUidDocumento: uidDocumento,
        sNombreDocumento: nombreDocumento
      }
    }

    //console.log('Filtro - ActualizarDatosActividad:', filtro)
    return this.http.post<IDataResponse>(this.urlActualizarDatosActividad, JSON.stringify(filtro), this.options);
  }

  eliminarDatosActividad(oDatosActividad: DatosActividad) {
    return this.http.post<IDataResponse>(this.urlEliminarDatosActividad, JSON.stringify(oDatosActividad), this.options);
  }

  insertarEvidencia(idDatosActividad: Number, evidencia: any) {
    let filtro = {
      nIdDatosActividad: idDatosActividad,
      liEvidencia: evidencia
    }
    //console.log('Filtro - Insertar Evidencia:', filtro);
    return this.http.post<IDataResponse>(this.urlInsertarEvidencia, JSON.stringify(filtro), this.options);
  }

  eliminarEvidencia(idDocumento: Number, uidDocumento: String) {
    let filtro = {
      nIdDocumento: idDocumento,
      sUidDocumento: uidDocumento
    }
    //console.log('Filtro - Eliminar Evidencia:', filtro);
    return this.http.post<IDataResponse>(this.urlEliminarEvidencia, JSON.stringify(filtro), this.options);
  }
}
