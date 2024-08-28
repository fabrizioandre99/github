import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { SolicitudPeriodoService } from '../../../services/huella-service/solicitud-periodo.service';
import { lastValueFrom, Observable } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { EmisionService } from '../../../services/huella-service/emision';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedDataService } from '../../../services/shared-data.service';
import { IUsuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ArchivoService } from '../../../services/archivo.service';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  lstNotificaciones: any[] = [];
  oReconocimientos: any = {};

  mostrarAlerta: boolean = false;
  Object: any;

  nIdUsuario: number = 0;
  datosUsuario: any = {};
  nombreOrganizacion: string = '';

  obsNotifica!: Observable<any>;
  tNotifica = new MatTableDataSource<any>(this.lstNotificaciones);

  @ViewChild('paginatorNotificacion', { static: false }) paginatorNotificacion!: MatPaginator;

  constructor(
    private solicitudPeriodoService: SolicitudPeriodoService,
    private emisionService: EmisionService,
    private sharedDataService: SharedDataService,
    private usuarioService: UsuarioService,
    private router: Router,
    private archivoService: ArchivoService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.nIdUsuario = this.sharedDataService.itemMenu.nIdUsuario;
    await this.fnObtenerUsuario();
    await this.fnListarNoticaciones();
    await this.getReconocimientoOrg();
  }

  ngAfterViewInit() {
    this.tNotifica.paginator = this.paginatorNotificacion;

    // Marcar la detección de cambios después de inicializar obsNotifica
    this.obsNotifica = this.tNotifica.connect();
    this.cdr.detectChanges();
  }

  /* ---------- Llamar a servicios -------------- */
  async fnObtenerUsuario() {
    try {
      let oUsuario: IUsuario = {
        nIdUsuario: this.nIdUsuario,
      };

      let data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      if (data.boExito) {
        this.datosUsuario = data.oDatoAdicional;
        this.nombreOrganizacion = this.datosUsuario.oInstitucion.sRazonSocial;
      } else {
        // Manejar error
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }

  async getReconocimientoOrg() {
    try {
      let data: IDataResponse = await lastValueFrom(this.emisionService.otenerReconocimientoOrganizacional());

      if (data.boExito) {
        this.oReconocimientos = data.oDatoAdicional;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fnListarNoticaciones() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudPeriodoService.listarNotificaciones());

      if (data.boExito) {
        this.lstNotificaciones = data.oDatoAdicional;
        this.tNotifica.data = this.lstNotificaciones;

        // Marcar la detección de cambios después de actualizar tNotifica.data
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /* ---------- Redirecciones -------------- */
  redirectMisHc() {
    this.router.navigate(["/mis-hc"]);
  }

  /* ---------- Descarga de archivos -------------- */
  async fnDescargaArchivo(codigoDocumento: string) {
    await this.archivoService.descargaArchivo(codigoDocumento, codigoDocumento);
  }
}
