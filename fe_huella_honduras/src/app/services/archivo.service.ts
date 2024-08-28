import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, lastValueFrom, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IDataResponse } from '../models/IDataResponse';
import { SesionService } from './sesion.service';
import { ErrorService } from './error.service';
import { ParametroService } from './configuracion-service/parametro.service';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {
  sesion: any = null;
  getRuta: any = {};

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlDescargarArchivo = environment.baseUrl + '/rest/documento/v1/descargarArchivo';

  constructor(
    private http: HttpClient,
    private alert: ToastrService,
    private parametroService: ParametroService,
    private errorService: ErrorService,
    private sesionService: SesionService
  ) {
    this.sesion = this.sesionService.getSesion();
    this.getRutaValor();

    console.log('%c-----OBTIENE LA SESIÓN this.sesion-----', 'color: green; font-size: 20px;', this.sesion);
  }

  async getRutaValor() {
    try {
      let filtro = {
        sTipo: "SISTEMA",
        sCodigo: "RUTA-DATA"
      }
      let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerParametro(filtro));
      if (data.boExito) {
        this.getRuta = data.oDatoAdicional;
        console.log('this.getRuta', this.getRuta);
      }

    } catch (error: any) {
      this.alert.error(error.error.sMensajeUsuario, 'Error', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
    }
  }

  async descargaArchivo(sCodigoDoc: string, fileName: string): Promise<void> {
    console.log('Código de Documento: ' + sCodigoDoc + ' y nombre de documento: ' + fileName);

    try {
      let dataArchivo: any = await lastValueFrom(this.postDescargarArchivo(sCodigoDoc));

      if (dataArchivo.boExito === false) {
        this.alert.warning(dataArchivo.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
        return;
      }

      const blob = new Blob([dataArchivo as unknown as BlobPart]);
      let filename = fileName;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();

    } catch (error) {
      console.error('Error:', error);
      this.alert.error('Ocurrió un error al descargar el archivo.', 'Error', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
    }
  }

  postDescargarArchivo(codigoDocumento: string): Observable<any> {
    const filtro = {
      sCodigoDocumento: codigoDocumento,
      sRutaServidor: this.getRuta.sValor,
      nIdSesionReg: this.sesion
    };

    console.log('descargarArchivo filtro', filtro);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.urlDescargarArchivo, JSON.stringify(filtro), {
      headers: headers,
      responseType: 'blob'
    }).pipe(
      map(response => {
        if (response.type === 'application/json') {
          // Convertir Blob a JSON
          return response.text().then(text => JSON.parse(text));
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}