import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { lastValueFrom } from 'rxjs';
import { PotencialGwpMtoService } from '../../../services/huella-service/maestros/potencial-gwp-mto.service';
import { IDataResponse } from '../../../models/IDataResponse';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-potencial-atmosferico',
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
  templateUrl: './potencial-atmosferico.component.html',
  styleUrl: './potencial-atmosferico.component.css'
})
export class PotencialAtmosfericoComponent {

  lstPotencial: any[] = [];
  lstOtros: any[] = [];
  tPotencial = new MatTableDataSource<any>(this.lstPotencial);
  tOtros = new MatTableDataSource<any>(this.lstOtros);
  formOtros: FormGroup;

  hTablaGEI: string[] = ['tipogas', 'descripcion', 'valor'];
  hTablaOtros: string[] = ['tipogas', 'descripcion', 'valor', 'acciones'];

  lstTipoGWP: any[] = [
    { sCodTipo: 'HFC', sDescripcion: 'Refrigerantes (HFC)' },
    { sCodTipo: 'HCFC', sDescripcion: 'Refrigerantes (HCFC)' },
    { sCodTipo: 'PFC', sDescripcion: 'Perfluorocarbonos (PFC)' }
  ];

  selectedTipoGWP = this.lstTipoGWP[0];

  constructor(
    private fb: FormBuilder,
    private potencialService: PotencialGwpMtoService,
    private alert: ToastrService,
    private errorService: ErrorService
  ) {
    this.formOtros = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.fnListarPotencialGEI();
    this.fnListarPotencialOtros();
  }

  onTabChange(event: any): void {
    this.fnListarPotencialGEI();
  }

  async fnListarPotencialGEI() {
    try {
      let data: IDataResponse = await lastValueFrom(this.potencialService.listarPotencialporTipo('GEI'));
      if (data.boExito) {
        this.lstPotencial = data.oDatoAdicional;
        this.tPotencial.data = this.lstPotencial;
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarPotencialOtros() {
    try {
      let data: IDataResponse = await lastValueFrom(this.potencialService.listarPotencialporTipo(this.selectedTipoGWP.sCodTipo));
      if (data.boExito) {
        this.lstOtros = data.oDatoAdicional;
        this.tOtros.data = this.lstOtros;
        this.createOtrosFormArray();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  createOtrosFormArray() {
    const control = this.formOtros.get('items') as FormArray;
    control.clear();
    this.lstOtros.forEach(item => {
      const group = this.fb.group({
        bdValor: new FormControl(item.bdValor, [Validators.required])
      });
      control.push(group);
    });
  }

  getControlOtros(item: any, fieldName: string): FormControl {
    const index = this.lstOtros.indexOf(item);
    const control = (this.formOtros.get('items') as FormArray).at(index).get(fieldName) as FormControl;
    return control;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tOtros.filter = filterValue.trim().toLowerCase();
  }

  editar(item: any) {
    item.editing = true;
  }

  cancelar(item: any) {
    item.editing = false;
  }

  async fnActualizarPotencialOtros(item: any) {
    const index = this.lstOtros.indexOf(item);
    const control = (this.formOtros.get('items') as FormArray).at(index) as FormGroup;

    if (control.invalid) {
      control.markAllAsTouched();
      return;
    }

    try {
      const formValue = control.value;

      console.log(this.lstOtros[index]);
      let oGWP = {
        nIdPotencial: this.lstOtros[index].nIdPotencial,
        bdValor: formValue.bdValor
      };

      //console.log('oGWP', oGWP);

      let data: IDataResponse = await lastValueFrom(this.potencialService.actualizarPotencialMto(oGWP));
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        this.fnListarPotencialOtros();
      } else {
        this.alert.warning(data.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }
}