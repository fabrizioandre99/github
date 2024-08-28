import { Municipalidad } from "./municipalidad";

export class SolicitudUsuario {
  nIdSolicitudUsuario: Number = -1;
  oMunicipalidad?: Municipalidad = new Municipalidad;
  sDNI: Number;
  sNombre: String;
  sApellidoPaterno: String;
  sApellidoMaterno: String;
  sCargo: String;
  sArea: String;
  sCorreo: String;
  sTelefono: String;
  sContrasenia: string;
  sNombreDocumento: string;
  sUidDocumento: String;
  dFechaRegistro: Date;
  sEstadoActual: string;
  nIdSesion: Number;
  nIdUsuario: Number;
  sObservacion: String;
}
