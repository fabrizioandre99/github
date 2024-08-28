export interface IFuenteEmision {
  nIdPeriodo?: number;
  nIdDocComprimido?: number;
  liFuenteEmision?: any;
  selected?: boolean;
  sCodigoFuente?: string;
  sNombre?: string;
  sDescripcion?: string;
  boExcluida?: boolean;
  oNivelActividad?: {
    nIdNivelActividad?: number;
    oDocumento?: {
      sCodigoDocumento?: string;
      sNombre?: string;
      sExtension?: string;
    };
  };
  oEmisionGei?: {
    bdTotalCo2?: number;
    bdTotalCh4?: number;
    bdTotalN2o?: number;
    bdTotalHfc?: number;
    bdTotalPfc?: number;
    bdTotalsf6?: number;
    bdTotalNf3?: number;
    bdTotalCo2eq?: number;
  };
  oFormato?: {
    nIdDocumento?: number,
    sCodigoDocumento?: string,
    boEsFormato?: boolean,
    sExtension?: string
  };
  editing?: boolean;
}
