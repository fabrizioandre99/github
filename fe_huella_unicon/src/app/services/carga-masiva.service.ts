import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })

export class CargaMasivaService {

  private cargaMasivaEnProgreso = new BehaviorSubject<boolean>(false);

  constructor(private toastr: ToastrService) { }

  iniciarCarga() {
    this.cargaMasivaEnProgreso.next(true);
  }

  finalizarCarga() {
    this.cargaMasivaEnProgreso.next(false);
  }

  estaCargando(): Observable<boolean> {
    return this.cargaMasivaEnProgreso.asObservable();
  }

  mostrarExito(mensaje: string) {
    this.toastr.success(mensaje, 'Éxito');
  }

  mostrarAdvertencia(mensaje: string) {
    this.toastr.warning(mensaje, 'Advertencia');
  }

  mostrarError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }
}
