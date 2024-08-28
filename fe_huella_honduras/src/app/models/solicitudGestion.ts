export interface iSolicitudGestion {
  nIdSolicitudUsuario?: number;
  nEstadoSolicitud?: number;
  sObservacion?: string;
  oInstitucion?: {
    sRazonSocial?: string;
    sNumeroRtn?: string;
  };
  oUsuario?: {
    sNombre?: string;
    sApellidos?: string;
    sCorreo?: string;
  };
}
