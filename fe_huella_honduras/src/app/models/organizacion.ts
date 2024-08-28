import { IMitigacion } from "./mitigacion";
export interface IOrganizacion {
    expanded?: boolean;
    nIdInstitucion?: number;
    sRazonSocial?: string;
    sPlanMitigacion?: string;
    bdReduccionTotal?: number;
    anios?: Array<{
        expanded?: boolean;
        nAnio?: number;
        bdReduccion?: number;
        medidasMitigacion?: IMitigacion[];
    }>;
}
