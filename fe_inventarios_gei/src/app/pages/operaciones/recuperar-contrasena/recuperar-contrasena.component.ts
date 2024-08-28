import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { AlertService } from 'src/app/services/alert.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent implements OnInit {
  codigo: any;
  loading: Boolean = false;

  constructor(private modalService: NgbModal, private solicitudUsuarioService: SolicitudUsuarioService, private alertService: AlertService) { }

  ngOnInit(): void {
  }

  async fnRecuperarContrasena(form: NgForm, contentGuardar: any) {
    try {
      //console.log('this.codigo', this.codigo);
      if (form.invalid) {
        this.loading = false;
        return;
      }
      this.loading = true;
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.enviarMail(this.codigo));
      //console.log(data);
      if (data.exito) {
        this.loading = false;
        this.modalService.open(contentGuardar, { centered: true, backdrop: 'static', keyboard: false, windowClass: "modal-contrasena" });
      } else {
        this.loading = false;
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.loading = false;
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

}
