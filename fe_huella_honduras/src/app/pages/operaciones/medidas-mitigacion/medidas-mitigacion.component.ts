
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ArchivoService } from '../../../services/archivo.service';
import { ErrorService } from '../../../services/error.service';
import { IOrganizacion } from '../../../models/organizacion';
import { MatExpansionModule } from '@angular/material/expansion';
import { CustomPaginatorIntl } from '../../../utils/customPaginatorIntl';

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
    MatPaginatorModule,
    MatExpansionModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './medidas-mitigacion.component.html',
  styleUrl: './medidas-mitigacion.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class MedidasMitigacionComponent implements OnInit {
  organizaciones: IOrganizacion[] = [];
  displayedColumns: string[] = ['sRazonSocial', 'sPlanMitigacion', 'bdReduccionTotal', 'acciones'];
  tReduccion = new MatTableDataSource<IOrganizacion>();
  expandedElement: IOrganizacion | null = null;
  expandedAnoElement: any | null = null;
  isLoadingDetail: boolean = false;

  @ViewChild('paginator', { static: false }) paginator!: MatPaginator;

  constructor(
    private mitigacionService: MitigacionService,
    public dialog: MatDialog,
    private archivoService: ArchivoService
  ) { }

  async ngOnInit() {
    await this.listarGlobal();
  }

  ngAfterViewInit() {
    this.tReduccion.paginator = this.paginator;
  }

  async listarGlobal() {
    try {
      const data: IDataResponse = await lastValueFrom(this.mitigacionService.listarGlobal({}));
      if (data.boExito) {
        console.log(data.oDatoAdicional);
        this.organizaciones = data.oDatoAdicional.map((item: any) => ({
          nIdInstitucion: item.oInstitucion?.nIdInstitucion,
          sRazonSocial: item.oInstitucion?.sRazonSocial,
          sPlanMitigacion: item.oDocumento?.sNombre,
          sCodigoDocumento: item.oDocumento?.sCodigoDocumento,
          bdReduccionTotal: item.bdReduccion || 0,
          anios: []  // Inicialmente vacío, se llenará al expandir
        }));

        this.tReduccion.data = this.organizaciones;
      }
    } catch (error) {
      console.error('Error al listar las organizaciones:', error);
    }
  }

  async listarDetalle(organizacion: IOrganizacion) {
    this.isLoadingDetail = true;
    try {
      const oOrganizacion: Partial<IOrganizacion> = { nIdInstitucion: organizacion.nIdInstitucion };
      const data: IDataResponse = await lastValueFrom(this.mitigacionService.listarDetalle(oOrganizacion));
      if (data.boExito) {
        organizacion.anios = data.oDatoAdicional.map((item: any) => ({
          nAnio: item.nAnio,
          bdReduccion: item.bdReduccion,
          medidasMitigacion: item.liMedidasMitigacion || [],
          expanded: false
        }));
      } else {
        organizacion.anios = [];
      }
    } catch (error) {
      console.error('Error al listar el detalle de la organización:', error);
      organizacion.anios = [];
    } finally {
      this.isLoadingDetail = false;
    }
  }

  async toggleRow(organizacion: IOrganizacion) {
    if (this.expandedElement === organizacion) {
      this.expandedElement = null;
    } else {
      this.expandedElement = organizacion;
      if (!organizacion.anios || organizacion.anios.length === 0) {
        await this.listarDetalle(organizacion);
      }
    }
  }

  toggleAnoExpand(ano: any): void {
    this.expandedAnoElement = this.expandedAnoElement === ano ? null : ano;
  }

  isAnoExpanded(ano: any): boolean {
    return this.expandedAnoElement === ano;
  }

  isExpanded(organizacion: IOrganizacion): boolean {
    return this.expandedElement === organizacion;
  }

  /* ---------- Descargar Archivo -------------- */
  async fnDescargaArchivo(item: any) {
    await this.archivoService.descargaArchivo(item.sCodigoDocumento, item.sPlanMitigacion);
  }

  /* ---------- Formateo -------------- */
  formatearComaMiles(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}