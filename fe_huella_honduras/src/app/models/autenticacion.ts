export interface IAutenticacion {
    sUsuario?: string;
    sContrasenia?: string;
    nIdSesion?: number;
    nIdSesionReg?: number;
    sCodigoValidacion?: string;
    nIdUsuario?: number;
    sCorreo?: string;
    sDireccionIp?: string | null;
    sServidorApp?: string;
    sSistemaOperativo?: string;
    sUrlApp?: string;
}
