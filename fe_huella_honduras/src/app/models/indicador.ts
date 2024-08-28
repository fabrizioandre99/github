export interface iIndicador {
  nIdIndicadorPeriodo?: number; // colocar id del indicador_periodo para actualizar.
  nIdIndicador?: number;
  oPeriodo?: {
    nIdPeriodo?: number;
  };
  sCodUnidad?: string;
  bdValor?: string;
  boEstado?: boolean;
}
