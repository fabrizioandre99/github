import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EstadoPeriodo } from '../models/estadoPeriodo';
import { IDataResponse } from '../models/IDataResponse';
import { Periodo } from '../models/periodo';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }
    )
  };

  urlCambiarEstadoActual = environment.baseUrl + '/rest/periodo/cambiarEstadoActual';
  urlHistorialAprobados = environment.baseUrl + '/rest/periodo/historialAprobados';
  urlHistorialByPeriodo = environment.baseUrl + '/rest/periodo/historialByPeriodo';
  urlListarAniosRGei = environment.baseUrl + '/rest/periodo/listarAniosRGei';
  urlListarParticionSectorRGei = environment.baseUrl + '/rest/periodo/listarGasPorSector';
  urlListarPorcentajeSector = environment.baseUrl + '/rest/periodo/listarPorcentajeSector';
  urlListarPeriodoByMuni = environment.baseUrl + '/rest/periodo/porMunicipalidad';
  urlListarEstado = environment.baseUrl + '/rest/periodo/listarEstado';
  urlListarCompletos = environment.baseUrl + '/rest/periodo/listarCompletos';
  urlListarParticionSubsectorRGei = environment.baseUrl + '/rest/periodo/listarPorcentajeSubsector';
  urlListarGasPorSubsector = environment.baseUrl + '/rest/periodo/listarGasPorSubsector';
  urlReaperturar = environment.baseUrl + '/rest/periodo/reaperturar';
  urlRegistrarPeriodo = environment.baseUrl + '/rest/periodo/registrar';
  urlRegistrarEstadoPeriodo = environment.baseUrl + '/rest/periodo/registrarEstado';

  constructor(private http: HttpClient) { }

  cambiarEstadoActual(periodo: EstadoPeriodo) {
    //console.log('filtro CambiarEstadoActual:', periodo)
    return this.http.post<IDataResponse>(this.urlCambiarEstadoActual, JSON.stringify(periodo), this.options);
  }

  historialAprobados(idDep?: String, idProv?: String, idDist?: String) {
    let filtro = {
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist
    };
    //console.log('filtro historialAprobados:', filtro)
    return this.http.post<IDataResponse>(this.urlHistorialAprobados, JSON.stringify(filtro), this.options);
  }

  listarAniosRGei(idDep?: String, idProv?: String, idDist?: String) {
    let filtro = {
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist
    };
    //console.log('filtro listarAniosRGei:', filtro);
    return this.http.post<IDataResponse>(this.urlListarAniosRGei, JSON.stringify(filtro), this.options);
  }

  listarParticionSectorRGei(idDep: String, idProv: String, idDist: String, anio: String) {
    let filtro = {
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist,
      nAnio: anio
    };
    //console.log('filtro listarParticionSectorRGei:', filtro)
    return this.http.post<IDataResponse>(this.urlListarParticionSectorRGei, JSON.stringify(filtro), this.options);
  }


  listarPorcentajeSector(idDep: String, idProv: String, idDist: String, anio: String) {
    let filtro = {
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist,
      nAnio: anio
    };
    //console.log('filtro listarPorcentajeSector:', filtro)
    return this.http.post<IDataResponse>(this.urlListarPorcentajeSector, JSON.stringify(filtro), this.options);
  }

  listarGasPorSubsector(idSector: any, idDep: String, idProv: String, idDist: String, anio: String) {
    let filtro = {
      nIdSector: idSector,
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist,
      nAnio: anio
    };
    console.log('filtro listarGasPorSubsector:', filtro)
    return this.http.post<IDataResponse>(this.urlListarGasPorSubsector, JSON.stringify(filtro), this.options);
  }

  listarParticionSubsectorRGei(idSector: any, idDep: String, idProv: String, idDist: String, anio: String) {
    let filtro = {
      nIdSector: idSector,
      nIdDep: idDep,
      nIdProv: idProv,
      nIdDist: idDist,
      nAnio: anio
    };
    //console.log('filtro lstSubsector:', filtro)
    return this.http.post<IDataResponse>(this.urlListarParticionSubsectorRGei, JSON.stringify(filtro), this.options);
  }

  historialByPeriodo(idPeriodo: Number) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo
      },
    };
    //console.log('filtro historialByPeriodo:', filtro)
    return this.http.post<IDataResponse>(this.urlHistorialByPeriodo, JSON.stringify(filtro), this.options);
  }


  listarByMunicipalidad(idMunicipalidad: any) {
    let filtro = {
      nIdMunicipalidad: idMunicipalidad
    };
    //console.log('filtro listar por Municipalidad:', filtro)
    return this.http.post<IDataResponse>(this.urlListarPeriodoByMuni, JSON.stringify(filtro), this.options);
  }

  listarEstado(idMunicipalidad: Number, fecha: String) {
    let filtro = {
      nIdMunicipalidad: idMunicipalidad,
      sFechaInicio: fecha,
    };
    //console.log('filtro listar por listarEstado:', filtro)
    return this.http.post<IDataResponse>(this.urlListarEstado, JSON.stringify(filtro), this.options);
  }

  listarCompletos() {
    return this.http.post<IDataResponse>(this.urlListarCompletos, '', this.options);
  }

  reaperturar(idPeriodo: Number, anio: Number, idMunicipalidad: Number, nombre: String, descripcion: String) {
    let filtro = {
      oPeriodo: {
        nIdPeriodo: idPeriodo,
        nAnio: anio,
        oMunicipalidad: {
          nIdMunicipalidad: idMunicipalidad,
          sNombre: nombre
        }
      },
      sDescripcion: descripcion
    };

    //console.log('filtro reaperturar:', filtro)
    return this.http.post<IDataResponse>(this.urlReaperturar, JSON.stringify(filtro), this.options);
  }

  registrar(oPeriodo: Periodo) {
    //console.log('filtro - Registrar:', oPeriodo);
    return this.http.post<IDataResponse>(this.urlRegistrarPeriodo, JSON.stringify(oPeriodo), this.options);
  }

  registrarEstado(oEstadoPeriodo: any) {
    //console.log('filtro - Finalizar Registro:', oEstadoPeriodo);
    return this.http.post<IDataResponse>(this.urlRegistrarEstadoPeriodo, JSON.stringify(oEstadoPeriodo), this.options);
  }
}
