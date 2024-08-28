import { IUsuario } from "./usuario";

export interface iArchivo {
  selectedFileName?: string | undefined;
  selectedFile?: File | null;
  nIdDocumento?: number;
  sCodigoDocumento?: string;
  sNombre?: string;
  boEsFormato?: boolean;
  sDescripcion?: string;
  sExtension?: string;
  nIdSesionReg?: number;
  nTipoArchivo?: number;
  sFecha?: string;
  oUsuario?: IUsuario;
}