import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { MitigacionService } from '../../../services/huella-service/medida-mitigacion.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { IMitigacion } from '../../../models/mitigacion';
import { iParametro } from '../../../models/parametro';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ArchivoService } from '../../../services/archivo.service';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-acciones-mitigacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './acciones-mitigacion.component.html',
  styleUrls: ['./acciones-mitigacion.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class AccionesMitigacionComponent implements OnInit, AfterViewInit {
  medidaForm: FormGroup;
  lstMedidasMitigacion: any[] = [];
  lstArchivosMitigacion: any[] = [];
  lstSector: any[] = [];
  anioMayor: string = '';
  selectMedida: any = null;
  selectMedidaPorAnio: any = null;
  itemToDelete: any = null;

  hPlan: string[] = ['nAnio', 'bdReduccion', 'acciones'];
  hReduccion: string[] = ['sector', 'descripcion', 'reduccion', 'acciones'];

  tReduccion = new MatTableDataSource<any>();

  expandedElement: any = null;
  selectedFileName: string = '';

  editMode: boolean = false;
  loading: boolean = false;
  loadingModal: boolean = false;
  loadingFile: boolean = false;
  esEdit: boolean = false;
  touched: boolean = false;
  file: any = {};

  @ViewChild('modalMedidaMitigacion') modalMedidaMitigacion: any;
  @ViewChild('modalDepurar') modalDepurar: any;
  @ViewChild('paginator', { static: false }) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private alert: ToastrService,
    private router: Router,
    private mitigacionService: MitigacionService,
    private parametroService: ParametroService,
    private archivoService: ArchivoService,
    private cdr: ChangeDetectorRef,
    private errorService: ErrorService
  ) {
    this.medidaForm = this.fb.group({
      sector: ['', Validators.required],
      descripcion: ['', Validators.required],
      reduccion: ['', [Validators.required, this.validarUnidades(6, 2),
      Validators.pattern(/^\d{1,6}(\.\d{1,2})?$/), Validators.min(1)]]
    });
  }

  async ngOnInit() {

    await this.fnListarMitigacion();
    await this.fnListarSector();
  }

  ngAfterViewInit() {
    this.tReduccion.paginator = this.paginator;
  }

  /* ---------- Llamar a servicios -------------- */
  async fnListarMitigacion() {
    try {
      let data: IDataResponse = await lastValueFrom(this.mitigacionService.listarMitigacion({}));
      if (data.boExito) {
        this.lstMedidasMitigacion = data.oDatoAdicional.liMedidasMitigacion;
        this.lstArchivosMitigacion = data.oDatoAdicional.liArchivosMitigacion;

        console.log(' this.lstMedidasMitigacion ', this.lstMedidasMitigacion);
        console.log(' this.lstArchivosMitigacion ', this.lstArchivosMitigacion);
        // Asignar datos a dataSource
        this.tReduccion.data = this.lstMedidasMitigacion;

        //Seleccionar el año mayor
        this.anioMayor = this.lstMedidasMitigacion.reduce((max, item) => {
          return item.nAnio > max ? item.nAnio : max;
        }, this.lstMedidasMitigacion[0].nAnio);
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarSector() {
    try {
      let oParametro: iParametro = {
        sTipo: 'SECTOR-MITIGACION'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));
      if (data.boExito) {
        this.lstSector = data.oDatoAdicional;
      } else {
        // Manejar error
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnRegistrarPlan() {
    this.loadingFile = true;
    this.touched = true;

    console.log('this.file.selectedFile', this.file.selectedFile);
    if (this.file.selectedFile) {
      try {
        const data: IDataResponse = await lastValueFrom(this.mitigacionService.registrarPlan(this.file.selectedFile));

        if (data.boExito) {

          console.log('167 data', data);
          this.alert.success(data.sMensajeUsuario, 'Éxito');

          // Agregar el nuevo archivo a la lista y actualizar la referencia
          this.lstArchivosMitigacion = [
            ...this.lstArchivosMitigacion,
            {
              nIdMitigacion: data.oDatoAdicional,
              oDocumento: {
                sNombre: this.file.selectedFileName,
                sExtension: 'pdf'
              }
            }
          ];

          this.touched = false;
          this.file.selectedFileName = '';
          this.file.selectedFile = null!;
        } else {
          this.touched = false;
          this.alert.warning(data.sMensajeUsuario, 'Advertencia');
        }
      } catch (error) {
        this.touched = false;
        this.errorService.enviar(error);
      }
    } else {
      this.alert.warning('No se ha seleccionado ningún archivo.', 'Advertencia');
    }

    this.loadingFile = false;
  }

  async fnEliminarPlan(item: any) {
    item.loading = true;
    try {
      let oMitigacion: IMitigacion = {
        nIdMitigacion: item.nIdMitigacion,
      };

      let data: IDataResponse = await lastValueFrom(this.mitigacionService.eliminarPlan(oMitigacion));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');

        // Eliminar el archivo de la lista y actualizar la referencia
        this.lstArchivosMitigacion = this.lstArchivosMitigacion.filter(archivo => archivo.nIdMitigacion !== item.nIdMitigacion);
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
    item.loading = false;
  }

  async fnRegistrarMedida() {

    console.log(this.selectMedidaPorAnio);
    console.log(this.selectMedida);

    if (this.medidaForm.valid) {
      this.loadingModal = true;

      const medida = this.medidaForm.value;
      const oMitigacion = {
        nIdMitigacion: this.esEdit ? this.selectMedidaPorAnio.nIdMitigacion : -1,
        nAnio: this.esEdit ? this.selectMedidaPorAnio.nAnio : this.selectMedida.nAnio,
        sCodSector: medida.sector,
        sDescripcion: medida.descripcion,
        bdReduccion: parseFloat(medida.reduccion)
      };

      try {
        let data: IDataResponse = await lastValueFrom(this.mitigacionService.registrarMedida(oMitigacion));

        if (data.boExito) {
          this.alert.success(data.sMensajeUsuario, 'Éxito');

          //Está registrando
          if (!this.esEdit) {
            const nuevaMedida = {
              nIdMitigacion: data.oDatoAdicional,
              nAnio: oMitigacion.nAnio,
              sCodSector: oMitigacion.sCodSector,
              sSector: this.lstSector.find(sector => sector.sCodigo === oMitigacion.sCodSector)?.sValor || '',
              sDescripcion: oMitigacion.sDescripcion,
              bdReduccion: oMitigacion.bdReduccion
            };

            this.selectMedida.liMedidasMitigacion = [...this.selectMedida.liMedidasMitigacion, nuevaMedida];

          } else {
            //Está actualizando
            const index = this.selectMedida.liMedidasMitigacion.findIndex((medida: any) => medida.nIdMitigacion === this.selectMedidaPorAnio.nIdMitigacion);

            if (index !== -1) {
              // Actualiza los valores
              this.selectMedida.liMedidasMitigacion[index].sCodSector = oMitigacion.sCodSector;
              this.selectMedida.liMedidasMitigacion[index].sSector = this.lstSector.find(sector => sector.sCodigo === oMitigacion.sCodSector)?.sValor || '';
              this.selectMedida.liMedidasMitigacion[index].sDescripcion = oMitigacion.sDescripcion;
              this.selectMedida.liMedidasMitigacion[index].bdReduccion = oMitigacion.bdReduccion;
            }
          }

          // Actualizar la reducción total en la segunda tabla
          this.actualizarReduccionTotal();

          this.cdr.detectChanges();

          this.dialog.closeAll();
          this.dialog.afterAllClosed.subscribe(() => {
            this.medidaForm.reset();
          });
        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia');
        }
      } catch (error) {
        this.errorService.enviar(error);
      } finally {
        this.loadingModal = false;
      }
    } else {
      console.error('Formulario no válido');
    }
  }

  async fnEliminarMedida(item: any) {
    this.itemToDelete = item;
    this.dialog.open(this.modalDepurar, {
      width: '400px',
    });
  }

  confirmEliminarMedida() {
    this.loadingModal = true;
    if (this.itemToDelete) {
      this.itemToDelete.loading = true;
      this.mitigacionService.eliminarMedida(this.itemToDelete).subscribe({
        next: (data: IDataResponse) => {
          if (data.boExito) {
            this.alert.success(data.sMensajeUsuario, 'Éxito');
            this.selectMedida.liMedidasMitigacion = this.selectMedida.liMedidasMitigacion.filter(
              (archivo: { nIdMitigacion: any }) => archivo.nIdMitigacion !== this.itemToDelete.nIdMitigacion
            );
            this.actualizarReduccionTotal();
            this.cdr.detectChanges();
          } else {
            this.alert.warning(data.sMensajeUsuario, 'Advertencia');
          }
        },
        error: () => {
          this.alert.error('Ocurrió un error al eliminar el plan', 'Error');
        },
        complete: () => {
          this.itemToDelete.loading = false;
          this.itemToDelete = null;
          this.loadingModal = false;
          this.dialog.closeAll();
        }
      });
    }
  }

  isExpanded(item: any): boolean {
    return this.expandedElement === item;
  }

  toggleRow(item: any) {
    this.expandedElement = this.expandedElement === item ? null : item;
    this.selectMedida = this.expandedElement;
  }

  editarMedida(item: any) {
    this.selectMedidaPorAnio = item;
    this.openDialog(item);
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  /* ---------- Funciones de archivo -------------- */
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.file.selectedFileName = file.name;
      this.file.selectedFile = file;

      if (!this.validarFormatoArchivo(file)) {
        this.alert.warning('El formato del archivo no es válido. Solo se permiten archivos PDF.', 'Advertencia');
        this.file.selectedFileName = '';
        fileInput.value = '';
        return;
      } else {

        this.fnRegistrarPlan().then(() => {
          fileInput.value = '';
        }).catch(() => {
          fileInput.value = '';
        });

      }

    }
  }

  /* ---------- Modales -------------- */
  openDialog(item: any = null): void {
    if (!this.selectMedida) {
      this.alert.warning('Primero debe seleccionar una fila', 'Advertencia');
      return;
    }

    if (item) {
      this.esEdit = true;
      this.medidaForm.patchValue({
        sector: item.sCodSector,
        descripcion: item.sDescripcion,
        reduccion: item.bdReduccion
      });
    } else {
      this.esEdit = false;
      this.medidaForm.reset();
    }

    this.dialog.open(this.modalMedidaMitigacion, {
      width: '510px',
      autoFocus: false,
    });
  }

  /* ---------- Descargar Archivo -------------- */
  async fnDescargaArchivo(item: any) {
    await this.archivoService.descargaArchivo(item.oDocumento.sCodigoDocumento, item.oDocumento.sNombre);
  }

  /* ---------- Obtener el valor total de reducción -------------- */
  getTotalReduccion(): string {
    const total = this.lstMedidasMitigacion.reduce((total, item) => total + item.bdReduccion, 0);
    return this.formatNumber(total);
  }

  /* ---------- Actualiza el valor de la Reducción total del padre -------------- */
  actualizarReduccionTotal(): void {
    if (this.selectMedida) {
      const totalReduccion = this.selectMedida.liMedidasMitigacion.reduce((total: number, medida: any) => total + parseFloat(medida.bdReduccion), 0);
      const selectedAnio = this.selectMedida.nAnio;
      const medida = this.lstMedidasMitigacion.find(item => item.nAnio === selectedAnio);
      if (medida) {
        medida.bdReduccion = parseFloat(totalReduccion.toFixed(2));
      }
    }
  }
  /* ---------- Redirecciones -------------- */
  redirectMisHc() {
    this.router.navigate(["/mis-hc"]);
  }

  /* ---------- Validaciones -------------- */
  validarFormatoArchivo(file: File): boolean {
    return file.type === 'application/pdf';
  }

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

  formatNumber(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

}
