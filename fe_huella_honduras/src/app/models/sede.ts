export interface ISede {
  nIdSede?: number;
  nIdPeriodo?: number;
  sNombre?: string;
  sCodDepartamento?: string;
  oInstitucion?: {
    nIdInstitucion?: number;
    sNumeroRtn?: string;
  };
  nIdInstitucion?: number;
  oCiiu?: {
    nIdCiiu?: number;
  };
  sRazonSocial?: string;
  sDescripcion?: string;
  sNumeroRtn?: string;
  sDireccion?: string;
  sDocRepresentante?: string;
  sNombreRepresentante?: string;
  sApellidosRepresentante?: string;
  sGenero?: string;
  boPertenecePiah?: boolean;
  nIdSedeNoReportada?: number;
  sJustificacion?: string;
}
