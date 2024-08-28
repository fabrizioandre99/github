import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { IDataResponse } from '../../../models/IDataResponse';
import { FactoresCalculoMtoService } from '../../../services/huella-service/maestros/factores-calculo-mto.service';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { iParametro } from '../../../models/parametro';
import { ErrorService } from '../../../services/error.service';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-factor-calculo',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AlertComponent
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './factor-calculo.component.html',
  styleUrl: './factor-calculo.component.css'
})
export class FactorCalculoComponent implements OnInit {

  filtroFuentes: string = '';
  factorForm: FormArray = this.fb.array([]);
  factorConversionForm: FormArray = this.fb.array([]);
  factorTransporteForm: FormArray = this.fb.array([]);
  factorInsumosForm: FormArray = this.fb.array([]);
  factorEnergiaForm: FormArray = this.fb.array([]);

  lstFConversion: any[] = [];
  lstFEstacionaria: any[] = [];
  lstFMovil: any[] = [];
  lstFTransporte: any[] = [];
  lstFInsumos: any[] = [];
  lstFEnergia: any[] = [];

  tFConversion = new MatTableDataSource<any>(this.lstFConversion);
  tEstacionaria = new MatTableDataSource<any>(this.lstFEstacionaria);
  tMovil = new MatTableDataSource<any>(this.lstFMovil);
  tTransporte = new MatTableDataSource<any>(this.lstFTransporte);
  tInsumos = new MatTableDataSource<any>(this.lstFInsumos);
  tEnergia = new MatTableDataSource<any>(this.lstFEnergia);

  hTablaFConversion: string[] = ['combustible', 'valor', 'acciones'];
  hTablaFEstacionaria: string[] = ['tipofactor', 'dioxidocarbono', 'metano', 'oxidonitroso', 'unidad'];
  hTablaFEMovil: string[] = ['tipotransporte', 'tipofactor', 'dioxidocarbono', 'metano', 'oxidonitroso', 'unidad'];
  hTablaEnergia: string[] = ['anio', 'dioxidocarbono', 'metano', 'oxidonitroso', 'acciones']
  hTablaInsumos: string[] = ['tipofactor', 'dioxidocarbono', 'dioxidocarbonoeq', 'trifloruronitrogeno', 'unidad', 'acciones']
  hTablaFTransporte: string[] = ['tipofactor', 'dioxidocarbono', 'metano', 'oxidonitroso', 'unidad', 'acciones'];


  selectedFuenteEnergia: any = {};
  selectedSector: any = {};
  lstSector: iParametro[] = [];
  selectedFuente: any = {};

  lstFuenteGEI: any[] = [
    { sCodFuente: 'C41F1CPA', sNombre: 'Consumo de papel' },
    { sCodFuente: 'C41F2CPL', sNombre: 'Consumo de plástico' },
    { sCodFuente: 'C41F3CPP', sNombre: 'Compras de pantallas plasma' },
    { sCodFuente: 'C45F1CAP', sNombre: 'Consumo de agua de la red pública' }
  ];

  lstFuenteEnergia: any[] = [
    { sCodFuente: 'C21F1CEN', sNombre: 'Consumo de electricidad de la red' },
    { sCodFuente: 'C21F2PTD', sNombre: 'Pérdidas y Transmisión de electricidad' }
  ];

  selectedTipoTransporte: any = {};
  lstTransporte: any[] =
    [
      { sCodTipo: 'T-CARGA', sNombre: 'Transporte de carga' },
      { sCodTipo: 'T-TERRESTRE', sNombre: 'Transporte terrestre' },
      { sCodTipo: 'T-AEREO', sNombre: 'Transporte aéreo' }
    ];

  @ViewChild('paginatorFMovil', { static: false }) paginatorFMovil!: MatPaginator;
  @ViewChild('paginatorFEnergia', { static: false }) paginatorFEnergia!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private factorService: FactoresCalculoMtoService,
    private alert: ToastrService,
    private parametroService: ParametroService,
    private errorService: ErrorService) {

    this.fnListarFConversion();
    this.fnListarSector();
    this.fnListarFMovil();
  }

  async ngOnInit() {

    if (this.lstFuenteEnergia.length > 0) {
      this.selectedFuenteEnergia = this.lstFuenteEnergia[0];
      this.fnListarFEnergia();
    }
    if (this.lstFuenteGEI.length > 0) {
      this.selectedFuente = this.lstFuenteGEI[0];
      this.fnListarFInsumos();
    }
    if (this.lstTransporte.length > 0) {
      this.selectedTipoTransporte = this.lstTransporte[0];
      this.fnListarFTransporte();
    }
  }

  ngAfterViewInit() {
    this.tMovil.paginator = this.paginatorFMovil;
    this.tEnergia.paginator = this.paginatorFEnergia;
  }


  getControl(index: number, fieldName: string): FormControl {
    return this.factorForm.at(index).get(fieldName) as FormControl;
  }

  /* Factor conversion */
  getControlFConversion(index: number, fieldName: string): FormControl {
    return this.factorConversionForm.at(index).get(fieldName) as FormControl;
  }

  createConversionFormArray() {
    this.lstFConversion.forEach(item => {
      const bdValorConversionControl = new FormControl({ value: item.bdValorConversion || '', disabled: false }, this.validarUnidades(2, 8))
      this.factorConversionForm.push(this.fb.group({
        bdValorConversion: bdValorConversionControl
      }));
    });
  }

  async fnListarFConversion() {
    try {

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorConversion());
      if (data.boExito) {
        this.lstFConversion = data.oDatoAdicional;
        this.tFConversion.data = this.lstFConversion;
        this.createConversionFormArray();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnActualizarFactorConversion(index: number) {
    console.log("ingresa");
    const formGroup = this.factorConversionForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }
    try {
      const formValue = formGroup.value;
      let oFactor = {
        nIdFactorEmision: this.lstFConversion[index].nIdFactorEmision,
        bdValorConversion: formValue.bdValorConversion
      };
      let data: IDataResponse = await lastValueFrom(this.factorService.actualizarFactorConversion(oFactor));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarFConversion();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }

    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* Fuentes Estacionarias */
  async fnListarSector() {
    let oParametro: iParametro = { sTipo: 'SECTOR-ESTACIONARIO' };
    let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));
    this.lstSector = data.oDatoAdicional;
    if (this.lstSector.length > 0) {
      this.selectedSector = this.lstSector[0];

      this.fnListarFEstacionaria();
    }

  }

  async fnListarFEstacionaria() {
    try {
      let oFiltro = {
        oMetodologia: {
          nIdMetodologia: 1
        },
        sCodGrupo: 'C1_1Estacionaria',
        sCodSector: this.selectedSector.sCodigo,
        boElectricidad: false
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorEmision(oFiltro));
      if (data.boExito) {
        this.lstFEstacionaria = data.oDatoAdicional;
        this.tEstacionaria.data = this.lstFEstacionaria;
        //this.createFormArray();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  editar(item: any) {
    item.editing = true;
  }

  cancelar(item: any) {
    item.editing = false;
  }

  async fnActualizarFEstacionaria(index: number) {
    const formGroup = this.factorForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }

    try {
      const formValue = formGroup.value;

      let oFactor = {
        nIdFactorEmision: this.lstFEstacionaria[index].nIdFactorEmision,
        bdFeCO2: formValue.bdFeCO2,
        bdFeCH4: formValue.bdFeCH4,
        bdFeN2O: formValue.bdFeN2O,
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.actualizarFactorEmision(oFactor));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarFEstacionaria();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* Fuentes Movil */
  applyFilterMovil(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tMovil.filter = filterValue.trim().toLowerCase();
  }

  async fnListarFMovil() {
    try {
      let oFiltro = {
        oMetodologia: {
          nIdMetodologia: 1
        },
        sCodGrupo: 'C1_2Movil',
        boElectricidad: false
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorEmision(oFiltro));
      if (data.boExito) {
        this.lstFMovil = data.oDatoAdicional;
        this.tMovil.data = this.lstFMovil;
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* Fuentes Transporte */

  createTransporteFormArray() {
    this.lstFTransporte.forEach(item => {
      const bdFeCO2Control = new FormControl({ value: item.bdFeCO2 || '', disabled: false }, this.validarUnidades(2, 10));
      const bdFeCH4Control = new FormControl({ value: item.bdFeCH4 || '', disabled: false }, this.validarUnidades(2, 10));
      const bdFeN2OControl = new FormControl({ value: item.bdFeN2O || '', disabled: false }, this.validarUnidades(2, 10));
      this.factorTransporteForm.push(this.fb.group({
        bdFeCO2: bdFeCO2Control,
        bdFeCH4: bdFeCH4Control,
        bdFeN2O: bdFeN2OControl
      }));
    });
  }

  getControlTransporte(index: number, fieldName: string): FormControl {
    return this.factorTransporteForm.at(index).get(fieldName) as FormControl;
  }


  async fnListarFTransporte() {

    try {
      let oFiltro = {
        oMetodologia: {
          nIdMetodologia: 1
        },
        sCodGrupo: 'C3_Transporte',
        sCodSector: this.selectedTipoTransporte.sCodTipo,
        boElectricidad: false
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorEmision(oFiltro));
      if (data.boExito) {
        console.log(data.oDatoAdicional);
        this.lstFTransporte = data.oDatoAdicional;
        this.lstFTransporte.map(item => {
          item.bdFeCO2 = Number(item.bdFeCO2).toFixed(8);
          item.bdFeCH4 = Number(item.bdFeCH4).toFixed(8);
          item.bdFeN2O = Number(item.bdFeN2O).toFixed(8);

        });

        this.tTransporte.data = this.lstFTransporte;
        this.factorTransporteForm = this.fb.array([]);
        this.createTransporteFormArray();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnActualizarFTransporte(index: number) {
    const formGroup = this.factorTransporteForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }

    try {
      const formValue = formGroup.value;

      let oFactor = {
        nIdFactorEmision: this.lstFTransporte[index].nIdFactorEmision,
        bdFeCO2: formValue.bdFeCO2,
        bdFeCH4: formValue.bdFeCH4,
        bdFeN2O: formValue.bdFeN2O,
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.actualizarFactorEmision(oFactor));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarFTransporte();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* Fuentes Insumos */
  createInsumosFormArray() {
    this.lstFInsumos.forEach(item => {
      const bdFeCO2Control = new FormControl({ value: item.bdFeCO2 || '', disabled: false }, this.validarUnidades(8, 6));
      const bdFeCO2eControl = new FormControl({ value: item.bdFeCO2e || '', disabled: false }, this.validarUnidades(8, 6));
      const bdFeNF3Control = new FormControl({ value: item.bdFeNF3 || '', disabled: false }, this.validarUnidades(8, 6));
      this.factorInsumosForm.push(this.fb.group({
        bdFeCO2: bdFeCO2Control,
        bdFeCO2e: bdFeCO2eControl,
        bdFeNF3: bdFeNF3Control
      }));
    });
  }

  getControlInsumos(index: number, fieldName: string): FormControl {
    return this.factorInsumosForm.at(index).get(fieldName) as FormControl;
  }

  async fnListarFInsumos() {
    try {
      let oFiltro = {
        oMetodologia: {
          nIdMetodologia: 1
        },
        sCodFactor: this.selectedFuente.sCodFuente,
        boElectricidad: false
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorEmision(oFiltro));
      if (data.boExito) {
        this.lstFInsumos = data.oDatoAdicional;
        this.tInsumos.data = this.lstFInsumos;
        this.factorInsumosForm = this.fb.array([]);
        this.createInsumosFormArray();

      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnActualizarFInsumos(index: number) {
    const formGroup = this.factorInsumosForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }

    try {
      const formValue = formGroup.value;

      let oFactor = {
        nIdFactorEmision: this.lstFInsumos[index].nIdFactorEmision,
        bdFeCO2: formValue.bdFeCO2,
        bdFeCO2e: formValue.bdFeCO2e,
        bdFeNF3: formValue.bdFeNF3,
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.actualizarFactorEmision(oFactor));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarFInsumos();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* Fuentes Energia */

  createEnergiaFormArray() {
    this.lstFEnergia.forEach(item => {
      const bdFeCO2Control = new FormControl({ value: item.bdFeCO2 || '', disabled: false }, this.validarUnidades(2, 7));
      const bdFeCH4Control = new FormControl({ value: item.bdFeCH4 || '', disabled: false }, this.validarUnidades(2, 7));
      const bdFeN2OControl = new FormControl({ value: item.bdFeN2O || '', disabled: false }, this.validarUnidades(2, 7));
      this.factorEnergiaForm.push(this.fb.group({
        bdFeCO2: bdFeCO2Control,
        bdFeCH4: bdFeCH4Control,
        bdFeN2O: bdFeN2OControl
      }));
    });
  }

  getControlEnergia(index: number, fieldName: string): FormControl {
    return this.factorEnergiaForm.at(index).get(fieldName) as FormControl;
  }

  async fnListarFEnergia() {
    console.log(this.selectedFuenteEnergia.sCodFuente);

    try {
      let oFiltro = {
        oMetodologia: {
          nIdMetodologia: 1
        },
        sCodFactor: this.selectedFuenteEnergia.sCodFuente,
        boElectricidad: true
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.listarFactorEmision(oFiltro));
      console.log(data);
      if (data.boExito) {
        this.lstFEnergia = data.oDatoAdicional;
        this.tEnergia.data = this.lstFEnergia;
        this.factorEnergiaForm = this.fb.array([]);
        this.createEnergiaFormArray();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnActualizarFEnergia(index: number) {
    const formGroup = this.factorEnergiaForm.at(index) as FormGroup;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched(); // Marca todos los controles del grupo como tocados
      return;
    }

    try {
      const formValue = formGroup.value;

      let oFactor = {
        nIdFactorEmision: this.lstFEnergia[index].nIdFactorEmision,
        bdFeCO2: formValue.bdFeCO2,
        bdFeCH4: formValue.bdFeCH4,
        bdFeN2O: formValue.bdFeN2O,
      };

      let data: IDataResponse = await lastValueFrom(this.factorService.registrarFactorEnergia(oFactor));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarFEnergia();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* ---------- Validaciones -------------- */
  validarUnidades(maxUnits: number, maxDecimals: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === null || control.value === '') {
        return null; // No validar si el campo está vacío
      }

      const regex = new RegExp(`^\\d{0,${maxUnits}}(\\.\\d{0,${maxDecimals}})?$`);
      const valid = regex.test(control.value);

      return valid ? null : { 'maxUnits': { value: control.value } };
    };
  }


}
