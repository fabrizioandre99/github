import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IndicadorService } from '../../../services/huella-service/indicador';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { iIndicador } from '../../../models/indicador';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { iParametro } from '../../../models/parametro';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-indicadores-desempeno',
  standalone: true,
  imports: [
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './indicadores-desempeno.component.html',
  styleUrls: ['./indicadores-desempeno.component.css']
})
export class IndicadoresDesempenoComponent implements OnInit {
  lstIndicador: any[] = [];
  indicadoresForm: FormArray = this.fb.array([]);
  haySolicitudActiva: boolean = false;
  esUsuarioInterno: boolean = false;
  lstUnidades: any[] = [];

  getPeriodo: any = {};
  modal_msg: string = '';

  hIndicador: string[] = ['select', 'tipo', 'unidad', 'valor', 'resultado', 'acciones'];
  tIndicador = new MatTableDataSource<any>(this.lstIndicador);

  @ViewChild('modalInformacion') modalInformacion: any;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private alert: ToastrService,
    private router: Router,
    private indicadorService: IndicadorService,
    private parametroService: ParametroService,
    private sharedDataService: SharedDataService,
    private errorService: ErrorService
  ) { }

  async ngOnInit() {
    this.getPeriodo = this.sharedDataService.itemPeriodoLimite;

    if (!this.getPeriodo) {
      //this.router.navigate(['/inicio-org']);
      return;
    }


    if (this.getPeriodo.nEstadoReduccion == 2) {
      this.haySolicitudActiva = true;
    }

    if (this.getPeriodo.esUsuarioInterno)
      this.esUsuarioInterno = true;

    await this.fnListarIndicadores();
    await this.fnListarParametro();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }
  /* ---------- Llamar a servicios -------------- */

  async fnListarIndicadores() {
    try {
      let oIndicador = {
        oPeriodo: {
          nIdPeriodo: this.getPeriodo.nIdPeriodo
        },
        oInstitucion: {
          nIdInstitucion: this.getPeriodo.nIdInstitucion
        }
      };

      let data: IDataResponse = await lastValueFrom(this.indicadorService.listarIndicador(oIndicador));

      console.log('data fnListarIndicadores', data);

      if (data.boExito) {
        this.lstIndicador = data.oDatoAdicional;
        this.tIndicador.data = this.lstIndicador;

        this.createFormArray();
        this.lstIndicador.forEach((_, index) => this.calcularResultado(index));
      } else {
        this.modal_msg = data.sMensajeUsuario;

        this.dialog.open(this.modalInformacion, {
          width: '400px',
          disableClose: true
        });
      }

      console.log(this.lstIndicador);
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarParametro() {
    try {
      let oParametro: iParametro = {
        sTipo: 'UNIDAD-INDICADOR'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));

      if (data.boExito) {
        this.lstUnidades = data.oDatoAdicional;
        console.log('this.lstUnidades', this.lstUnidades);
      } else {
        // Manejar error
      }
    } catch (error) {
      // Manejar error
    }
  }
  changeCambiarEstado(index: number, item: any) {
    const element = this.lstIndicador[index];
    const sCodUnidadControl = this.getControl(index, 'sCodUnidad');
    const bdValorControl = this.getControl(index, 'bdValor');

    if (element.boEstado) {
      this.fnCambiarEstado(item, true);
      sCodUnidadControl.enable();
      bdValorControl.enable();
    } else {
      this.fnCambiarEstado(item, false);
      sCodUnidadControl.disable();
      bdValorControl.disable();
      sCodUnidadControl.reset();
      bdValorControl.reset();
      item.resultado = null;
    }
  }

  async fnCambiarEstado(item: any, boEstado: boolean) {
    try {
      let oIndicador: iIndicador = {
        nIdIndicadorPeriodo: item.nIdIndicadorPeriodo,
        boEstado: item.boEstado
      }

      let data: IDataResponse = await lastValueFrom(this.indicadorService.actualizarEstado(oIndicador));
      if (data.boExito) {
        if (!boEstado) {
          item.bdValor = '';
          item.sUnidad = '';
        }

        // this.alert.success(data.sMensajeUsuario, 'Éxito');
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

  async fnRegistrarIndicador(index: number) {
    const formGroup = this.indicadoresForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }

    try {
      const formValue = formGroup.value;

      let oSede: iIndicador = {
        nIdIndicadorPeriodo: this.lstIndicador[index].nIdIndicadorPeriodo,
        nIdIndicador: this.lstIndicador[index].nIdIndicador,
        oPeriodo: {
          nIdPeriodo: this.getPeriodo.nIdPeriodo
        },
        sCodUnidad: formValue.sCodUnidad,
        bdValor: formValue.bdValor,
        boEstado: true,
      };

      let data: IDataResponse = await lastValueFrom(this.indicadorService.registrarIndicador(oSede));

      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarIndicadores();
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
  /* ---------- Agregar formulario a cada item -------------- */
  createFormArray() {
    this.lstIndicador.forEach(indicador => {
      const sCodUnidadControl = new FormControl({ value: indicador.sCodUnidad || '', disabled: !indicador.boEstado || this.haySolicitudActiva || this.esUsuarioInterno }, Validators.required);
      const bdValorControl = new FormControl({ value: indicador.bdValor || '', disabled: !indicador.boEstado || this.haySolicitudActiva || this.esUsuarioInterno }, Validators.required);
      this.indicadoresForm.push(this.fb.group({
        sCodUnidad: sCodUnidadControl,
        bdValor: bdValorControl,
      }));
    });
  }

  getControl(index: number, fieldName: string): FormControl {
    return this.indicadoresForm.at(index).get(fieldName) as FormControl;
  }


  /* ---------- Calcular resultado al tipear -------------- */
  calcularResultado(index: number) {
    const formGroup = this.indicadoresForm.at(index) as FormGroup;
    const valorControl = formGroup.get('bdValor');
    const valor = parseFloat(valorControl?.value);
    const element = this.lstIndicador[index];

    if (!isNaN(valor) && valor !== 0) {
      element.resultado = parseFloat((element.bdTotalEmisiones / valor).toFixed(2));
    } else {
      element.resultado = null;
    }

    console.log(element);
  }

  getFilteredUnidades(sIndicador: string) {
    const prefixMap: any = {
      'Prod': 'PROD',
      'Pers': 'PERS',
      'Supe': 'AREA',
      'Vent': 'VENTA'
    };

    const prefix = prefixMap[sIndicador.slice(0, 4)] || '';

    return this.lstUnidades.filter(unidad => unidad.sCodigo.startsWith(prefix));
  }

  /* ---------- Redireccionar-------------- */
  redictLimitesInforme() {
    this.router.navigate(["/limites-informe"]);
  }

  redictHuellaCarbono() {
    this.router.navigate(["/mis-hc"]);
  }

  /* ---------- Restringir tipeo de datos en valor si es Persona o no lo es-------------- */
  restringirValor(event: any, sIndicador: string) {
    let value = event.target.value;
    if (sIndicador.slice(0, 4) === 'Pers') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    } else {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts[0].length > 10) {
        parts[0] = parts[0].slice(0, 10);
      }
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      } else if (parts.length === 2 && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts.join('.');
      }
    }
    event.target.value = value;
  }
}
