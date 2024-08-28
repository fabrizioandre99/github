import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { iParametro } from '../../../models/parametro';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorService } from '../../../services/error.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-parametros-sistema',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    AlertComponent,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './parametros-sistema.component.html',
  styleUrl: './parametros-sistema.component.css'
})
export class ParametrosSistemaComponent implements OnInit {
  hParametros: string[] = ['sCodigo', 'sValor', 'sDescripcion', 'boEstado', 'acciones'];
  tParametros = new MatTableDataSource<iParametro>();

  lstTipos: iParametro[] = [];
  selectedTipo: iParametro = {};

  parametroForm: FormGroup;
  esEdit: boolean = false;
  loadingModal: boolean = false;

  selectParametro: iParametro = {};

  @ViewChild('modalParametro') modalParametro: any;
  @ViewChild('modalDepurar') modalDepurar: any;
  @ViewChild('tableParametros', { static: true, read: ElementRef }) tableParametros: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('paginatorParametros', { static: false }) paginatorParametros!: MatPaginator;

  constructor(
    private parametroService: ParametroService,
    private alert: ToastrService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private errorService: ErrorService
  ) {

    this.parametroForm = this.fb.group({
      codigo: ['', Validators.required],
      valor: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: [{ value: true, disabled: true }],
    });
  }

  get estado() {
    return this.parametroForm.get('estado')?.value;
  }

  ngOnInit(): void {
    this.fnListarTipos();
  }

  ngAfterViewInit() {
    this.tParametros.paginator = this.paginatorParametros;
  }

  /* ---------- Servicios de listados -------------- */
  async fnListarTipos() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarTipos());

      if (data.boExito) {
        this.lstTipos = data.oDatoAdicional;
        console.log('lstTipos', this.lstTipos);
        if (this.lstTipos.length > 0) {
          this.selectedTipo = this.lstTipos[0];

          console.log('this.selectedTipo', this.selectedTipo);
          this.fnListarDetalle();
        }

      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }

  async fnListarDetalle() {

    console.log('selectedTipo', this.selectedTipo);
    try {
      const oParametro: iParametro = { sTipo: this.selectedTipo.sTipo };
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarDetalle(oParametro));
      if (data.boExito) {
        this.tParametros.data = data.oDatoAdicional;

        console.log('this.tParametros.data', this.tParametros.data);
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }


  editarParametro(item: any) {

    this.parametroForm.reset();

    this.esEdit = true;
    this.selectParametro = item;

    this.parametroForm.patchValue({
      codigo: item.sCodigo,
      valor: item.sValor,
      descripcion: item.sDescripcion,
      estado: item.boEstado
    });

    this.parametroForm.get('codigo')?.disable();

    this.dialog.open(this.modalParametro, {
      width: '510px',
      autoFocus: false,
    });
  }

  agregarParametro() {
    this.esEdit = false;
    this.parametroForm.reset({
      estado: true
    });

    this.parametroForm.get('codigo')?.enable();

    this.dialog.open(this.modalParametro, {
      width: '510px',
      autoFocus: false,
    });
  }


  openDepurar(item: any) {
    this.selectParametro = item;

    this.dialog.open(this.modalDepurar, {
      width: '400px',
    });
  }

  async actualizarEstado(item: any, event: any) {

    console.log('item', item);

    try {
      const oParametro: iParametro = {
        sTipo: item.sTipo,
        sCodigo: item.sCodigo,
        boEstado: event.checked
      };

      console.log('oParametro', oParametro);

      let data: IDataResponse = await lastValueFrom(this.parametroService.actualizarEstado(oParametro));
      if (data.boExito) {
        this.fnListarDetalle();
        this.alert.success(data.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
        });
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  }


  async fnRegistrarParam() {

    if (this.parametroForm.valid) {
      this.loadingModal = true;

      const param = this.parametroForm.value;

      const oParametro: iParametro = {
        nIdParametro: this.esEdit ? this.selectParametro.nIdParametro : -1,
        sTipo: this.selectedTipo.sTipo,
        sCodigo: this.parametroForm.get('codigo')?.value,
        sValor: param.valor,
        sDescripcion: param.descripcion
      };


      console.log('oParametro', oParametro);

      try {
        let data: IDataResponse = await lastValueFrom(this.parametroService.registrar(oParametro));

        if (data.boExito) {
          this.alert.success(data.sMensajeUsuario, 'Éxito');
          this.dialog.closeAll();
          this.fnListarDetalle();
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


  async fnEliminarParametro() {
    this.loadingModal = true;
    try {

      let oParametro: iParametro = {
        sTipo: this.selectParametro.sTipo,
        sCodigo: this.selectParametro.sCodigo
      };

      console.log('oParametro', oParametro);

      let data: IDataResponse = await lastValueFrom(this.parametroService.eliminar(oParametro));
      if (data.boExito) {
        this.fnListarDetalle();
        this.dialog.closeAll();
        this.alert.success(data.sMensajeUsuario, 'Éxito', {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false
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
    } catch (error) {
      this.errorService.enviar(error);
    }
    this.loadingModal = false;
  }


}
