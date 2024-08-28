import { Component, NgZone, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IDataResponse } from '../../../models/IDataResponse';
import { Subscription, lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ArchivoService } from '../../../services/archivo.service';
import { SesionService } from '../../../services/sesion.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { IUsuario } from '../../../models/usuario';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedDataService } from '../../../services/shared-data.service';
import { SedeService } from '../../../services/huella-service/sede';
import { ISede } from '../../../models/SEDE';
import { MatCardModule } from '@angular/material/card';
import { NivelActividadService } from '../../../services/huella-service/nivel-actividad';
import { INivelActividad } from '../../../models/nivelActividad';
import { Router } from '@angular/router';
import { PeriodoService } from '../../../services/huella-service/periodo.service';
import { IPeriodo } from '../../../models/periodo';
import confetti from 'canvas-confetti';
import { iParametro } from '../../../models/parametro';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';

@Component({
  selector: 'app-limites-informe',
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
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatCardModule,
    AlertComponent,
    MatProgressBarModule,
    CdkTextareaAutosize,
    ToastrModule
  ],
  templateUrl: './limites-informe.component.html',
  styleUrls: ['./limites-informe.component.css']
})
export class LimitesInformeComponent {
  selectedCategory: any;
  hLimites: string[] = ['boExcluida', 'sNombre', 'archivo', 'sede', 'accion'];
  groupedCategories: any[] = [];
  resizeSubscription: Subscription | undefined;
  resizeListener: (() => void) | undefined;

  lstSede: any[] = [];
  lstCategoria: any[] = [];
  lstNoRerpotadas: any[] = [];
  lstIncertidumbre: any[] = [];
  lstUsuario: any = {};

  nIdUsuario: number = 0;
  checkClicked: boolean = false;
  emisionForms: { [key: string]: FormGroup } = {};

  sedesform = this.fb.group({
    sedes: this.fb.array([])
  });
  sesion: any = null;

  getPeriodo: any = {};
  selectSede: number = 0;

  porcentajeSedesNoReportadas: number = 0;

  esCompletoFinalizado: boolean = false;
  esIniciado: boolean = false;
  esUsuarioInterno: boolean = false;

  loadingCards: boolean = true;
  loadingModal: boolean = false;
  sinSeleccionarSede: boolean = false;

  animationFrameId: number | undefined;

  @ViewChild('modalSedesIncompletas') modalSedesIncompletas: any;
  @ViewChild('modalConfirmacion') modalConfirmacion: any;
  @ViewChild('modalFelicidades') modalFelicidades: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private alert: ToastrService,
    private usuarioService: UsuarioService,
    private sedeService: SedeService,
    private nivelActividadService: NivelActividadService,
    private sharedDataService: SharedDataService,
    private parametroService: ParametroService,
    private archivoService: ArchivoService,
    private sesionService: SesionService,
    private periodoService: PeriodoService,
    private ngZone: NgZone,
    private renderer: Renderer2,
    private errorService: ErrorService
  ) {
    this.getPeriodo = this.sharedDataService.itemPeriodoLimite;

    if (!this.getPeriodo) {
      return;
    }

    if (this.getPeriodo.nEstadoPeriodo == 2 || this.getPeriodo.nEstadoPeriodo == 3) {
      this.esCompletoFinalizado = true;
    }

    if (this.getPeriodo.nEstadoPeriodo == 0) {
      this.esIniciado = true;
    }

    if (this.getPeriodo.esUsuarioInterno) {
      this.esUsuarioInterno = true;
    }
  }

  get sedes(): FormArray {
    return this.sedesform.get('sedes') as FormArray;
  }

  async ngOnInit() {
    this.sesion = await this.sesionService.getSesion();
    this.nIdUsuario = this.sharedDataService.itemMenu?.nIdUsuario || 0;

    await this.fnObtenerUsuario();
    await this.fnListarSede();
    await this.fnListarFuente();
    await this.fnListarNoReportadas();
    await this.fnListarIncertidumbre();

    // Define el user agent para diferenciar entre dispositivos móviles y de escritorio
    const userAgent = navigator.userAgent || navigator.vendor;

    const isMobile = /android|iPad|iPhone|iPod/i.test(userAgent);

    if (isMobile) {
      this.groupCategories(); // Ejecutar directamente en dispositivos móviles
    } else {
      // Configurar el listener de redimensionamiento solo en dispositivos de escritorio
      this.ngZone.runOutsideAngular(() => {
        this.resizeListener = this.renderer.listen('window', 'resize', () => {
          this.ngZone.run(() => {
            this.groupCategories();
          });
        });
      });
    }
  }



  ngOnDestroy() {
    if (this.resizeListener) {
      this.resizeListener();
    }
    this.dialog.closeAll();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /* ---------- Servicios de listados -------------- */
  async fnObtenerUsuario() {
    try {
      const oUsuario: IUsuario = { nIdUsuario: this.nIdUsuario };
      const data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      if (data.boExito) {
        this.lstUsuario = data.oDatoAdicional;
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarFuente() {
    try {

      if (this.selectSede) {
        this.sinSeleccionarSede = false;
      }
      const oNivelActividad: INivelActividad = {
        oPeriodo: { nIdPeriodo: this.getPeriodo.nIdPeriodo },
        nIdSede: this.selectSede
      };

      const data: IDataResponse = await lastValueFrom(this.nivelActividadService.listarNivelActividad(oNivelActividad));

      if (data.boExito) {
        this.lstCategoria = data.oDatoAdicional;

        this.lstCategoria.forEach((categoria: any) => {
          categoria.liFuenteEmision.forEach((fuente: any) => {
            fuente.editing = fuente.oNivelActividad.nIdNivelActividad === -1;
            fuente.isNew = fuente.oNivelActividad.nIdNivelActividad === -1;

            // Crear un formulario para cada fuente de emisión
            this.emisionForms[fuente.sCodigoFuente] = this.crearEmissionForm(fuente.sCodigoFuente);

          });
        });


        console.log('this.lstCategoria', this.lstCategoria);

        this.groupCategories();
      }
    } catch (error) {
      this.loadingCards = false;
      this.errorService.enviar(error);
    }
  }

  async fnListarSede() {
    try {
      const oSede: ISede = {
        oInstitucion: {
          nIdInstitucion: this.esUsuarioInterno ? this.getPeriodo.nIdInstitucion : this.lstUsuario?.oInstitucion?.nIdInstitucion
        }
      };

      const data: IDataResponse = await lastValueFrom(this.sedeService.listarSede(oSede));

      if (data.boExito) {
        this.lstSede = data.oDatoAdicional;
        if (this.lstSede.length > 0) {
          this.selectSede = this.lstSede[0].nIdSede;
        }
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarNoReportadas() {
    try {
      const oSede: ISede = { nIdPeriodo: this.getPeriodo.nIdPeriodo };
      const data: IDataResponse = await lastValueFrom(this.sedeService.listarNoReportadas(oSede));

      if (data.boExito) {
        this.lstNoRerpotadas = data.oDatoAdicional;

        this.sedes.clear();

        this.lstNoRerpotadas.forEach(sede => {
          this.sedes.push(this.fb.group({
            nIdSedeNoReportada: [sede.nIdSedeNoReportada],
            nIdSede: [sede.nIdSede],
            sNombre: [sede.sNombre],
            sJustificacion: [sede.sJustificacion || '', Validators.required]
          }));
        });

        const totalSedes = this.lstSede.length;
        const sedesNoReportadas = this.lstNoRerpotadas.length;
        const porcentajeNoReportadas = (sedesNoReportadas / totalSedes) * 100;
        this.porcentajeSedesNoReportadas = porcentajeNoReportadas;
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  tooltipSedesFaltantes(): string {
    const sedesNoReportadas = this.lstNoRerpotadas.map(sede => `- ${sede.sNombre}`).join('\n');
    return `Sedes no reportadas:\n${sedesNoReportadas}`;
  }

  async fnListarIncertidumbre() {
    try {
      let oParametro: iParametro = {
        sTipo: 'INCERTIDUMBRE'
      };

      let data: IDataResponse = await lastValueFrom(this.parametroService.listarPorTipo(oParametro));

      if (data.boExito) {
        this.lstIncertidumbre = data.oDatoAdicional;
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  // Método para sincronizar tCO2 y tCO2eq de Áreas Verdes
  syncTCO2eq(sCodigoFuente: string) {
    if (sCodigoFuente === 'C15F1AVV') {
      const tCO2Control = this.emisionForms[sCodigoFuente].get('tCO2');
      const tCO2eqControl = this.emisionForms[sCodigoFuente].get('tCO2eq');

      if (tCO2Control && tCO2eqControl) {
        const value = tCO2Control.value ? parseFloat(tCO2Control.value) : null;
        const negativeValue = value !== null ? -Math.abs(value) : null;

        tCO2Control.setValue(negativeValue !== null ? negativeValue : '', { emitEvent: false });
        tCO2eqControl.setValue(negativeValue !== null ? negativeValue : '', { emitEvent: false });
      }
    }
  }


  /* ---------- Funciones de editar y registrar NA -------------- */
  crearEmissionForm(sCodigoFuente: string): FormGroup {
    const isC15F1AVV = sCodigoFuente === 'C15F1AVV';

    return this.fb.group({
      tCO2: [{ value: '', disabled: true }, [this.validarUnidades(6, 2, isC15F1AVV), ...(isC15F1AVV ? [Validators.required] : [])]],
      tCH4: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tN2O: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tHFC: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tSF6: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tPFC: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tNF3: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
      tCO2eq: [{ value: '', disabled: true }, [Validators.required, this.validarUnidades(6, 2, isC15F1AVV)]]
    });
  }


  async registrarNActividad(item: any) {
    const form = this.emisionForms[item.sCodigoFuente];
    form.markAllAsTouched();

    if (!this.selectSede) {
      this.sinSeleccionarSede = true;
      this.alert.warning('Seleccione primero una sede antes de guardar el registro.', 'Advertencia');
      return;
    }

    item.touched = true;

    if (!item.selectedFile || !item.oNivelActividad.sCodIncertidumbre) {
      this.alert.warning('Complete los campos.', 'Advertencia');
      return;
    }

    item.loading = true;
    try {
      let oNivelActividad = {
        nIdNivelActividad: item.oNivelActividad.nIdNivelActividad,
        sCodIncertidumbre: item.oNivelActividad.sCodIncertidumbre,
        oPeriodo: {
          nIdPeriodo: this.getPeriodo.nIdPeriodo,
        },
        nIdSede: this.selectSede,
        oFuenteEmision: {
          sCodigoFuente: item.sCodigoFuente,
        }
      };

      let data: IDataResponse = await lastValueFrom(this.nivelActividadService.registrarNivelActividad(item.selectedFile, oNivelActividad));

      item.loading = false;

      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        item.oNivelActividad.oDocumento.sNombre = item.selectedFileName;
        item.oNivelActividad.nIdNivelActividad = data.oDatoAdicional;

        this.fnListarNoReportadas();

        item.touched = false;
        item.editing = false;
        item.isNew = false;

        let oSharedPeriodo = {
          nIdPeriodo: this.getPeriodo.nIdPeriodo,
          nAnio: this.getPeriodo.nAnio,
          nEstadoPeriodo: 1,
          sRutaAnterior: 'mis-hc'
        }

        this.sharedDataService.setPeriodoLimite(oSharedPeriodo);

        this.esIniciado = false;
      } else {
        item.loading = false;
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      item.selectedFileName = '';
      item.loading = false;

      this.errorService.enviar(error);
    }
  }

  async registrarPersonalizado(item: any) {
    const form = this.emisionForms[item.sCodigoFuente];
    form.markAllAsTouched();


    console.log('form', form);

    if (!this.selectSede) {
      this.sinSeleccionarSede = true;
      this.alert.warning('Seleccione primero una sede antes de guardar el registro.', 'Advertencia');
      return;
    }

    item.touched = true;

    if (!item.selectedFile || !item.oNivelActividad.sCodIncertidumbre) {
      this.alert.warning('Complete los campos.', 'Advertencia');
      return;
    }

    if (form.invalid) {
      return;
    }
    item.loading = true;

    try {
      const oNivelActividad: INivelActividad = {
        oNivelActividad: {
          nIdNivelActividad: item.oNivelActividad.nIdNivelActividad,
          sCodIncertidumbre: item.oNivelActividad.sCodIncertidumbre,
          oPeriodo: { nIdPeriodo: this.getPeriodo.nIdPeriodo },
          nIdSede: this.selectSede,
          oFuenteEmision: { sCodigoFuente: item.sCodigoFuente }
        },
        bdTotalCo2: form.get('tCO2')?.value || 0,
        bdTotalCh4: form.get('tCH4')?.value || 0,
        bdTotalN2o: form.get('tN2O')?.value || 0,
        bdTotalHfc: form.get('tHFC')?.value || 0,
        bdTotalNf3: form.get('tNF3')?.value || 0,
        bdTotalPfc: form.get('tPFC')?.value || 0,
        bdTotalsf6: form.get('tSF6')?.value || 0,
        bdTotalCo2eq: form.get('tCO2eq')?.value || 0
      };

      console.log('oNivelActividad', oNivelActividad);

      const data: IDataResponse = await lastValueFrom(this.nivelActividadService.registrarPersonalizado(item.selectedFile, oNivelActividad));
      item.loading = false;

      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');

        //Deshabilita el formulario
        this.habilitarFormEmision(form);

        item.touched = false;
        item.editing = false;
        item.isNew = false;
        item.oNivelActividad.oDocumento.sNombre = item.selectedFileName;
        item.oNivelActividad.nIdNivelActividad = 1;

        this.fnListarNoReportadas();

        let oSharedPeriodo = {
          nIdPeriodo: this.getPeriodo.nIdPeriodo,
          nAnio: this.getPeriodo.nAnio,
          nEstadoPeriodo: 1,
          sRutaAnterior: 'mis-hc'
        }

        this.sharedDataService.setPeriodoLimite(oSharedPeriodo);

        this.esIniciado = false;
      } else {
        item.loading = false;
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      item.selectedFileName = '';
      item.loading = false;
      this.alert.error('Ocurrió un error al registrar la actividad', 'Error');
    }
  }

  tieneArchivo(item: any): boolean {
    return item.oNivelActividad.nIdNivelActividad !== -1;
  }

  habilitarFormEmision(form: FormGroup) {
    if (form.disabled) {
      form.enable();
    } else {
      form.disable();
    }
  }

  editarNA(item: any) {
    item.editing = true;
    item.selectedFileName = '';
    item.selectedFile = null;

    if (item?.sCodigoFuente.endsWith('OFC') || item?.sCodigoFuente === 'C42F1EBC' || item?.sCodigoFuente === 'C15F1AVV') {
      this.emisionForms[item.sCodigoFuente].enable();
    }
  }

  cancelarNA(item: any) {
    item.editing = false;
    item.touched = false;
    item.selectedFileName = '';
    item.selectedFile = null;

    if (item.isNew) {
      this.emisionForms[item.sCodigoFuente].disable();
    } else {
      if (item?.sCodigoFuente.endsWith('OFC') || item?.sCodigoFuente === 'C42F1EBC' || item?.sCodigoFuente === 'C15F1AVV') {
        this.emisionForms[item.sCodigoFuente].disable();
      }
    }
  }

  async fnEliminarNActividad(item: any) {
    try {
      const oNivelActividad: INivelActividad = { nIdNivelActividad: item.oNivelActividad.nIdNivelActividad };
      const data: IDataResponse = await lastValueFrom(this.nivelActividadService.eliminarNivelActividad(oNivelActividad));

      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');

        item.oNivelActividad.nIdNivelActividad = -1;
        item.editing = true;
        item.isNew = true;
        item.selectedFileName = '';
        item.oNivelActividad.sCodIncertidumbre = null;
        item.selectedFile = null;
        this.emisionForms[item.sCodigoFuente].reset();

        if (item.oNivelActividad.nIdNivelActividad === -1) {
          this.emisionForms[item.sCodigoFuente].enable();

          // Deshabilitar específicamente tCO2eq si es 'C15F1AVV'
          if (item.sCodigoFuente === 'C15F1AVV') {
            this.emisionForms[item.sCodigoFuente].get('tCO2eq')?.disable();
          }
        }

        item.loading = false;
        this.fnListarNoReportadas();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }
  /* ---------- Funciones de creación y selección de los cards de categorías -------------- */
  groupCategories() {
    const columnsPerRow = window.innerWidth < 576 ? 1 : window.innerWidth < 992 ? 2 : 3;
    this.groupedCategories = [];
    for (let i = 0; i < this.lstCategoria.length; i += columnsPerRow) {
      this.groupedCategories.push(this.lstCategoria.slice(i, i + columnsPerRow));
    }
    this.loadingCards = false;
  }

  seleccionarCard(category: any) {
    this.checkClicked = false;

    this.selectedCategory = category;
    this.groupedCategories.forEach(row => {
      row.forEach((cat: any) => {
        if (typeof cat !== 'boolean') {
          cat.selected = false;
        }
      });
    });
    category.selected = true;

    const fuentesOFC = category.liFuenteEmision?.filter((fe: { sCodigoFuente: string }) => fe.sCodigoFuente?.endsWith('OFC') || fe.sCodigoFuente === 'C42F1EBC' || fe.sCodigoFuente === 'C15F1AVV');

    if (fuentesOFC && fuentesOFC.length > 0) {
      fuentesOFC.forEach((fuente: any) => {
        const oEmisionGei = fuente.oEmisionGei || {};
        const form = this.emisionForms[fuente.sCodigoFuente] || this.fb.group({
          tCO2: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tCH4: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tN2O: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tHFC: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tSF6: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tPFC: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tNF3: [{ value: '', disabled: true }, this.validarUnidades(6, 2)],
          tCO2eq: [{ value: '', disabled: true }, [Validators.required, this.validarUnidades(6, 2)]]
        });
        form.patchValue({
          tCO2: oEmisionGei.bdTotalCo2 !== undefined ? oEmisionGei.bdTotalCo2 : '',
          tCH4: oEmisionGei.bdTotalCh4 !== undefined ? oEmisionGei.bdTotalCh4 : '',
          tN2O: oEmisionGei.bdTotalN2o !== undefined ? oEmisionGei.bdTotalN2o : '',
          tHFC: oEmisionGei.bdTotalHfc !== undefined ? oEmisionGei.bdTotalHfc : '',
          tSF6: oEmisionGei.bdTotalsf6 !== undefined ? oEmisionGei.bdTotalsf6 : '',
          tPFC: oEmisionGei.bdTotalPfc !== undefined ? oEmisionGei.bdTotalPfc : '',
          tNF3: oEmisionGei.bdTotalNf3 !== undefined ? oEmisionGei.bdTotalNf3 : '',
          tCO2eq: oEmisionGei.bdTotalCo2eq !== undefined ? oEmisionGei.bdTotalCo2eq : ''
        });

        this.emisionForms[fuente.sCodigoFuente] = form;

        if (fuente.oNivelActividad.nIdNivelActividad !== -1 || !fuente.editing) {
          form.disable();
        } else {

          //Deshabilitar solo el input tCO2eq de Áreas verdes
          Object.keys(form.controls).forEach(controlName => {
            if (!(controlName === 'tCO2eq' && fuente.sCodigoFuente === 'C15F1AVV')) {
              form.controls[controlName].enable();
            }
          });
        }
      });
    } else {
      category.liFuenteEmision?.forEach((fuente: any) => {
        const form = this.emisionForms[fuente.sCodigoFuente];
        if (form) {
          form.reset();
          form.enable();
        }
      });
    }

    //Cuando es usuario interio o usuario Finalizado indiferentemente se pone todo en disabled
    if (this.esUsuarioInterno || this.esCompletoFinalizado) {
      for (let key in this.emisionForms) {
        this.emisionForms[key].disable();
      }
    }
  }

  getCategoryNumber(category: any): string {
    const categoryName = category.sCategoria.split(':')[0]?.trim();
    const match = categoryName.match(/\d+/);
    return match ? match[0] : '1';
  }

  /* ---------- Funciones de archivo -------------- */

  onFileSelected(event: Event, item: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      item.selectedFileName = file.name;
      item.selectedFile = file;

      if (!this.validarFormatoArchivo(file)) {
        this.alert.warning('El formato del archivo no es válido', 'Advertencia');
        item.selectedFileName = '';
        fileInput.value = '';
        return;
      }
    }
  }

  onDragOver(event: DragEvent) {
    const container = event.currentTarget as HTMLElement;
    if (container.classList.contains('disabled')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    container.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    const container = event.currentTarget as HTMLElement;
    if (container.classList.contains('disabled')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    container.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, item: any) {
    const container = event.currentTarget as HTMLElement;
    if (container.classList.contains('disabled')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    container.classList.remove('drag-over');

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      item.selectedFileName = file.name;
      item.selectedFile = file;

      if (!this.validarFormatoArchivo(file)) {
        this.alert.warning('El formato del archivo no es válido', 'Advertencia');
        item.selectedFileName = '';
        item.selectedFile = file;
        item.loading = false;
        return;
      }
    }
  }

  /* ---------- Funciones de descarga de archivos -------------- */
  async fnDescargaArchivo(codigoDocumento: string) {
    await this.archivoService.descargaArchivo(codigoDocumento, codigoDocumento);
  }

  async fnDescargaFormato() {
    await this.archivoService.descargaArchivo('Formato.xls', 'Formato.xls');
  }

  /* ---------- Redirecciones -------------- */
  redirectMisHc() {
    this.router.navigate(["/mis-hc"]);
  }

  redirectHCOrg() {
    this.router.navigate(["/hc-organizacional"]);
  }

  redictIndicadoresD() {
    this.router.navigate(["/indicadores-desempeno"]);
  }

  redictResultadoGei() {
    this.router.navigate(["/resultado-gei"]);
  }

  redictMisExclusiones() {
    this.router.navigate(["/mis-exclusiones"]);
  }

  /* ---------- Modales -------------- */
  openCompletado() {
    if (this.lstNoRerpotadas.length > 0) {
      this.dialog.open(this.modalSedesIncompletas, {
        width: '450px',
      });
    } else {
      this.dialog.open(this.modalConfirmacion, {
        width: '450px',
        disableClose: true
      });
    }
  }

  /* ---------- Registro de sedes no reportadas -------------- */
  async fnRegistrarNoReportadas() {
    if (this.sedesform.invalid) {
      return;
    }

    this.loadingModal = true;
    const resultado: ISede[] = this.sedes.controls
      .map(control => control.value)
      .filter(sede => sede.sJustificacion)
      .map(sede => ({
        nIdSedeNoReportada: sede.nIdSedeNoReportada,
        nIdPeriodo: this.getPeriodo.nIdPeriodo,
        nIdSede: sede.nIdSede,
        sJustificacion: sede.sJustificacion
      }));

    let data: IDataResponse = await lastValueFrom(this.sedeService.registrarNoReportadas(resultado));

    if (data.boExito) {
      this.dialog.closeAll();
      this.dialog.open(this.modalConfirmacion, {
        width: '450px',
        disableClose: true
      });
    } else {
      this.dialog.closeAll();
      this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        tapToDismiss: false
      });
    }

    this.loadingModal = false;
  }

  /* ---------- Completado de periodo -------------- */
  async fnCompletarPeriodo() {
    this.loadingModal = true;
    try {
      const oSede: IPeriodo = { nIdPeriodo: this.getPeriodo.nIdPeriodo };
      const data: IDataResponse = await lastValueFrom(this.periodoService.completarPeriodo(oSede));

      if (data.boExito) {
        this.dialog.closeAll();
        this.dialog.open(this.modalFelicidades, {
          width: '450px',
          disableClose: true
        });

        this.confettiDireccional();

        this.esCompletoFinalizado = true;

        let oSharedPeriodo = {
          nIdPeriodo: this.getPeriodo.nIdPeriodo,
          nAnio: this.getPeriodo.nAnio,
          nEstadoPeriodo: 2,
          sRutaAnterior: 'mis-hc'
        }

        this.sharedDataService.setPeriodoLimite(oSharedPeriodo);
      } else {
        this.dialog.closeAll();
        this.alert.warning(data.sMensajeUsuario, 'Advertencia', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      }
    } catch (error) {
      this.dialog.closeAll();
      this.errorService.enviar(error);
    }

    this.loadingModal = false;
  }

  /* ---------- Efectos de confetti -------------- */
  confettiDireccional() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  /* ---------- Validaciones -------------- */
  validarUnidades(maxUnits: number, maxDecimals: number, allowNegative: boolean = false): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === null || control.value === '') {
        return null;
      }

      const regex = new RegExp(
        `^${allowNegative ? '-?' : ''}\\d{0,${maxUnits}}(\\.\\d{0,${maxDecimals}})?$`
      );
      const valid = regex.test(control.value);

      return valid ? null : { 'maxUnits': { value: control.value } };
    };
  }


  validarFormatoArchivo(file: File): boolean {
    const validFormats = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    return validFormats.includes(file.type);
  }


}
