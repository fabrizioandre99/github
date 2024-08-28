export interface INivelActividad {
  nIdNivelActividad?: number;
  oNivelActividad?: any;
  oPeriodo?: {
    nIdPeriodo?: number;
  };
  nIdSede?: number;
  oFuenteEmision?: {
    sCodigoFuente?: string;
  };
  bdTotalCo2?: string | number;
  bdTotalCh4?: string | number;
  bdTotalN2o?: string | number;
  bdTotalHfc?: string | number;
  bdTotalNf3?: string | number;
  bdTotalPfc?: string | number;
  bdTotalsf6?: string | number;
  bdTotalCo2eq?: string | number;
}
