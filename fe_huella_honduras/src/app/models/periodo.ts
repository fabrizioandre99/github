export interface IPeriodo {
    boTieneIndicador?: boolean;
    nIdPeriodo?: number;
    nIdEmpresa?: number;
    oMetodologia?: {
        nIdMetodologia?: number;
        nAnioPublicacion?: number;
        sDescripcion?: string;
    };
    bdIncertidumbre?: number;
    nAnio?: number;
    nEstadoPeriodo?: number;
    sEstadoPeriodo?: string;
    sCodReconocimientoActual?: string;
    nReconocimientoActual?: number;
    sFechaUltimaModificacion?: string;
    bdTotalEmisiones?: number;
    boAnioBase?: boolean;
    nIdSesionReg?: number;
    oVerificacion?: any;
    nEstadoReduccion?: number;
    boReportePublico?: boolean;
    boSoloReapertura?: boolean;
    nEstadoNeutralizacion?: number;
    boProcesoReapertura?: boolean;
    boActualizarMetodologia?: boolean;
    boSegundoReconocimientoActivo?: boolean;
    boTercerCuartoReconocimientoActivo?: boolean;
    liReporteGEI?: any;
    oInstitucion?: any;
}
