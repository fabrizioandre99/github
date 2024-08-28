import { Municipalidad } from "./municipalidad";

export class Periodo {
  nIdPeriodo: Number = -1;
  oMunicipalidad: Municipalidad;
  nAnio: number;
  nPoblacion: Number;
  nTemperatura: Number;
  sNivelRep: String;
  sFechaInicio: String;
  sFechaFin: String;
  nEstadoActual: Number;
  sEstadoActual: String
  sUIDReporteGEI: String;
  sReporteGEI: String
  nIdUsuarioReg: Number;
  nIdSession: Number;
  fShow: boolean;
  fShowAnio: boolean;
  sNombreReporteGEI: string;
  boIncluirData: boolean = false;
}
