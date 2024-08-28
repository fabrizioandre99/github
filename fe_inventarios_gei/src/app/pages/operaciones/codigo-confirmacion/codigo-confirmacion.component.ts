import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { AlertService } from 'src/app/services/alert.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-codigo-confirmacion',
  templateUrl: './codigo-confirmacion.component.html',
  styleUrls: ['./codigo-confirmacion.component.css']
})

export class CodigoConfirmacionComponent implements OnInit {
  codigo: any;
  loading: Boolean = false;

  constructor(private router: Router, private modalService: NgbModal,
    private solicitudUsuarioService: SolicitudUsuarioService,
    private sharedDataService: SharedDataService, private alertService: AlertService) {
  }

  ngOnInit(): void {
  }

  onOtpChange(otp: any) {
    this.codigo = otp;
    //console.log(this.codigo);
  }

  openModalConfirmacion(contentObservar: any) {
    this.modalService.open(contentObservar, { centered: true });
  }

  async fnCodigoContrasena() {
    try {
      this.loading = true;
      if (this.codigo?.length == 8) {
        //console.log("igual a 8");
        //console.log(this.codigo % 10 == 2);
        if (this.codigo % 10 == 2) {
          let dataVCodigo: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.validarCodigo(this.codigo));
          if (dataVCodigo.exito) {
            this.alertService.close('');
            let codigoConfirmar = dataVCodigo.datoAdicional;
            //console.log('codigoConfirmar', codigoConfirmar);
            this.sharedDataService.setNuevaContrasena(codigoConfirmar);
            this.router.navigate(['/nueva-contrasena']);
          } else {
            this.alertService.error(dataVCodigo.mensajeUsuario);
          }
        } else {
          let dataVContrasena: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.validarContrasenaCodigo(this.codigo));
          if (dataVContrasena.exito) {
            this.alertService.close('');
            let codigoConfirmar = dataVContrasena.datoAdicional;
            //console.log('codigoConfirmar', codigoConfirmar);
            this.sharedDataService.setNuevaContrasena(codigoConfirmar);
            this.router.navigate(['/nueva-contrasena']);
          } else {
            this.alertService.error(dataVContrasena.mensajeUsuario);
          }
        }
      } else {
        this.alertService.error('Ingrese el código de confirmación de 8 dígitos.');
      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
  }
}
