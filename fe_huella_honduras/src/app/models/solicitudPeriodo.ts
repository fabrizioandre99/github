export interface iSolicitudPeriodo {
    nIdSolicitudPeriodo?: number,
    oPeriodo?: {
        nIdPeriodo?: number,
        oInstitucion?: {
            nIdInstitucion?: number
        },
        nAnio?: number,
        bdReduccion?: number,
        bdTotalEmisiones?: number,
        bdPorcentaje?: number,
    },
    oInstitucion?: {
        nIdInstitucion?: number,
        sRazonSocial?: string
    },

    nEstado?: number;
    sCodTipoSolicitud?: string,
    bdBonosCarbono?: number,
    sMensaje?: string,
    sTipoSolicitud?: string
}