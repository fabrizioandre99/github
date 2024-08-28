import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SeguridadService } from './seguridad.service';  // Ajusta la ruta según tu estructura de proyecto

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private shownMessages: Set<string> = new Set();
  private logoutWarningShown: boolean = false;

  constructor(private alert: ToastrService, private seguridadService: SeguridadService) { }

  enviar(error: any): void {
    console.error('Error:', error);
    this.alert.error(error.error.sMensajeUsuario || 'Existen problemas en el servidor.', 'Advertencia', {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: true,
      tapToDismiss: false
    });
  }

  resetServerError() {
    this.logoutWarningShown = false;
  }
}
