import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { SharedDataService } from '../../../services/shared-data.service';
import { FuenteEmisionService } from '../../../services/huella-service/fuente-emision';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { iParametro } from '../../../models/parametro';
import { IFuenteEmision } from '../../../models/fuenteEmision';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-mis-exclusiones',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    AlertComponent,
    MatTooltipModule,
    CdkTextareaAutosize,
    ToastrModule
  ],
  templateUrl: './mis-exclusiones.component.html',
  styleUrls: ['./mis-exclusiones.component.css']
})
export class MisExclusionesComponent implements OnInit {
  lstExclusiones: any[] = [];
  lstCriterios: any[] = [];
  getPeriodo: any = {};

  hLimites: string[] = ['select', 'fuente', 'criterios', 'acciones'];
  tLimites = new MatTableDataSource<any>(this.lstExclusiones);

  esCompletoFinalizado: boolean = false;
  constructor(
    private router: Router,
    private alert: ToastrService,
    public dialog: MatDialog,
    private fuenteEmisionService: FuenteEmisionService,
    private sharedDataService: SharedDataService,
    private parametroService: ParametroService,
    private errorService: ErrorService
  ) { }

  async ngOnInit() {
    this.getPeriodo = this.sharedDataService.itemPeriodoLimite;

    //Si es completado o finalizado
    if (this.getPeriodo.nEstadoPeriodo == 2 || this.getPeriodo.nEstadoPeriodo == 3) {
      this.esCompletoFinalizado = true;
    }
    console.log('VALOR RECIBIDO', this.getPeriodo);
    await this.fnListarExclusiones();
    await this.fnListarCriterios();
  }

  async fnListarExclusiones() {
    try {
      let oFuenteEmmision: any = {
        nIdPeriodo: this.getPeriodo.nIdPeriodo
      };

      let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarExclusiones(oFuenteEmmision));
      console.log(data);
      if (data.boExito) {
        this.lstExclusiones = data.oDatoAdicional;
        if (this.lstExclusiones) {
          // Añadir exclusiones de liOtrasExclusiones con una propiedad adicional
          this.lstExclusiones.forEach(exclusion => {
            if (exclusion.liOtrasExclusiones) {
              exclusion.liOtrasExclusiones.forEach((subExclusion: any) => {
                subExclusion.fromOtrasExclusiones = true; // Marcar las exclusiones provenientes de liOtrasExclusiones
                this.lstExclusiones.push(subExclusion);
              });
              delete exclusion.liOtrasExclusiones;
            }
          });

          // Preselect criterios
          this.lstExclusiones.forEach(item => {
            item.criterios = [];
            if (item.sCriterio1) item.criterios.push(item.sCriterio1);
            if (item.sCriterio2) item.criterios.push(item.sCriterio2);
            if (item.sCriterio3) item.criterios.push(item.sCriterio3);
            if (item.sCriterio4) item.criterios.push(item.sCriterio4);
          });
          console.log('this.lstExclusiones', this.lstExclusiones);
          this.tLimites.data = this.lstExclusiones;
        }


      }

      console.log(this.lstExclusiones);
    } catch (error) {
      this.errorService.enviar(error);
      this.tLimites.data = [];
      this.lstExclusiones = [];
    }
  }


  async fnListarCriterios() {
    try {
      let oParametro: iParametro = {
        sTipo: 'CRITERIO-EXCLUSION'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));

      if (data.boExito) {
        this.lstCriterios = data.oDatoAdicional;
        console.log('this.lstCriterios', this.lstCriterios);
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnRegistrarExclusion(item: any) {
    try {
      if (!item.boEstado) {
        console.warn('El estado del item es falso. No se puede registrar.');
        return;
      }

      // Validar que el campo de descripción de la fuente no esté vacío
      if (!item.oFuenteEmision.sNombre && item.nIdExclusion === -1) {
        item.touched = true;
      } else {
        item.touched = false;
      }

      const criteriosSeleccionados = item.criterios || [];

      // Validar que se haya seleccionado al menos un criterio
      if (criteriosSeleccionados.length < 1 || criteriosSeleccionados.length > 4) {
        item.invalidCriterios = true;
      } else {
        item.invalidCriterios = false;
      }

      if (item.touched || item.invalidCriterios) {
        return;
      }

      const criteriosMapeados = criteriosSeleccionados.reduce((acc: any, criterio: string, index: number) => {
        acc[`sCriterio${index + 1}`] = criterio;
        return acc;
      }, {});

      let oFuente: IFuenteEmision;
      if (item.nIdExclusion === -1) {
        let sCodigoFuente = item.oFuenteEmision.sCodigoFuente;
        if (!sCodigoFuente) {
          sCodigoFuente = item.oFuenteEmision.sNombre; // Use the input value if sCodigoFuente is empty
        }

        oFuente = {
          nIdExclusion: item.nIdExclusion,
          oPeriodo: {
            nIdPeriodo: this.getPeriodo.nIdPeriodo
          },
          oFuenteEmision: {
            sCodigoFuente: sCodigoFuente
          },
          ...criteriosMapeados,
          boEstado: true
        };
      } else {
        oFuente = {
          nIdExclusion: item.nIdExclusion,
          ...criteriosMapeados,
          boEstado: true
        };
      }

      console.log('oFuente', oFuente);

      let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.registrarExclusion(oFuente));


      console.log('data', data);
      if (data.boExito) {
        item.nIdExclusion = data.oDatoAdicional;
        item.oFuenteEmision.sCodigoFuente = item.oFuenteEmision.sNombre;
        this.alert.success(data.sMensajeUsuario, 'Éxito');
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }

    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async changeCambiarEstado(item: any) {
    try {
      // Verifica si el checkbox estaba activo previamente
      if (item.boEstado === false) {

        let oFuente: any = {
          oPeriodo: {
            nIdPeriodo: this.getPeriodo.nIdPeriodo
          },
          oFuenteEmision: {
            sCodigoFuente: item.oFuenteEmision.sCodigoFuente,
          },
        };

        console.log('Datos enviados:', oFuente);

        // Envía los datos al servicio
        let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.eliminarExclusion(oFuente));

        if (data.boExito) {
          item.criterios = [];
          this.alert.success(data.sMensajeUsuario, 'Éxito');

          // Elimina la fila si pertenece a liOtrasExclusiones
          if (item.fromOtrasExclusiones) {
            this.eliminarFilaPorCodigoFuente(item.oFuenteEmision.sCodigoFuente);
          }

        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
            timeOut: 0,
            extendedTimeOut: 0,
            closeButton: true,
            tapToDismiss: false
          });
        }
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  // Nueva función para eliminar la fila por código de fuente
  eliminarFilaPorCodigoFuente(sCodigoFuente: string) {
    const index = this.lstExclusiones.findIndex(exclusion => exclusion.oFuenteEmision.sCodigoFuente === sCodigoFuente);
    if (index > -1) {
      this.lstExclusiones.splice(index, 1);
      this.tLimites.data = this.lstExclusiones;
    }
  }


  agregarNuevaFila() {
    this.lstExclusiones.push({
      nIdExclusion: -1,
      oPeriodo: {
        nReconocimientoActual: 0,
        boSegundoReconocimientoActivo: false,
        boTercerCuartoReconocimientoActivo: false
      },
      oFuenteEmision: {
        sCodigoFuente: '',
        sNombre: ''
      },
      boEstado: true,
      criterios: []
    });
    this.tLimites.data = this.lstExclusiones;
    console.log('this.lstExclusiones', this.lstExclusiones);
  }

  eliminarFila(index: number) {
    this.lstExclusiones.splice(index, 1);
    this.tLimites.data = this.lstExclusiones;
  }

  /* ---------- Redirecciones -------------- */
  redictLimitesInforme() {
    this.router.navigate(["/limites-informe"]);
  }
}