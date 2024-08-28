export interface IUsuario {
  nIdUsuario?: number;
  sNombre?: string;
  sApellidos?: string;
  sCodTipoDocumento?: string;
  sNumDocumento?: string;
  sCorreo?: string;
  sTelefono?: string;
  sUnidadNegocio?: string;
  boEstado?: boolean;
  sRol?: string;
  sUsuario?: string;
  oRol?: {
    nIdRol?: number;
  };
  oInstitucion?: {
    nIdInstitucion?: number;
    sNumeroRtn?: string;
  };
  nIdInstitucion?: any;
  oCiiu?: {
    nIdCiiu?: any;
  };
  sRazonSocial?: any;
  sDescripcion?: any;
  sNumeroRtn?: any;
  sDireccion?: any;
  sDocRepresentante?: any;
  sNombreRepresentante?: any;
  sApellidosRepresentante?: any;
  sGenero?: any;
  boPertenecePiah?: any;
}
