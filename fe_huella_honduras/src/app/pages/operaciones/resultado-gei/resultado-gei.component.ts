import { Component, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertComponent } from "../../../utils/alert/alert.component";
import { ToastrModule } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { SharedDataService } from '../../../services/shared-data.service';
import { IEmision } from '../../../models/emision';
import { EmisionService } from '../../../services/huella-service/emision';
import { ISede } from '../../../models/SEDE';
import { SedeService } from '../../../services/huella-service/sede';
import { Router } from '@angular/router';
import { IUsuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';

@Component({
  selector: 'app-resultados-gei',
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
    AlertComponent,
    ToastrModule
  ],
  templateUrl: './resultado-gei.component.html',
  styleUrls: ['./resultado-gei.component.css']
})
export class ResultadoGeiComponent {
  lstSede: any[] = [];
  lstEmision: any = {};
  lstInformativa: any = {};
  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  selectedSede: number = 0;

  hEmisiones: string[] = [
    'sCategoria',
    'bdTotalCo2eq',
    'bdTotalCo2',
    'bdTotalCh4',
    'bdTotalN2o',
    'bdTotalHfc',
    'bdTotalPfc',
    'bdTotalSf6',
    'bdTotalNf3'
  ];

  hInformativas: string[] = [
    'sTipoCombustible',
    'bdTotalCo2',
    'bdTotalHcfc',
    'bdTotalCo2eq'
  ];

  totalEmisiones: any = {};
  getPeriodo: any = {};
  lstUsuario: any = {};
  totals: any = {};
  nIdUsuario: number = 0;
  esUsuarioInterno: boolean = false;

  constructor(
    private router: Router,
    private emisionService: EmisionService,
    private sedeService: SedeService,
    private sharedDataService: SharedDataService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    this.getPeriodo = this.sharedDataService.itemPeriodoLimite;
    if (!this.getPeriodo) {
      //this.router.navigate(['/home']);
      return;
    }
    //Si es usuario interno 
    if (this.getPeriodo.esUsuarioInterno) {
      this.esUsuarioInterno = true;
    }

    this.nIdUsuario = this.sharedDataService.itemMenu?.nIdUsuario || 0;

    await this.fnObtenerUsuario();
    await this.fnListarSede();
    await this.fnListarEmision();
    await this.fnListarInformativas();
  }

  async fnObtenerUsuario() {
    try {
      const oUsuario: IUsuario = { nIdUsuario: this.nIdUsuario };
      const data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      if (data.boExito) {
        this.lstUsuario = data.oDatoAdicional;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fnListarSede() {
    try {
      const oSede: ISede = {
        oInstitucion: {
          nIdInstitucion: this.esUsuarioInterno ? this.getPeriodo.nIdInstitucion : this.lstUsuario?.oInstitucion?.nIdInstitucion
        }
      };

      console.log('oSede', oSede);
      let data: IDataResponse = await lastValueFrom(this.sedeService.listarSede(oSede));


      console.log('data', data);

      if (data.boExito) {
        this.lstSede = data.oDatoAdicional;
        this.lstSede.unshift({
          nIdSede: -1,
          sNombre: "Todos",
        });

        if (this.lstSede.length > 0) {
          this.selectedSede = this.lstSede[0].nIdSede;
        }
      }

      console.log(this.lstSede);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fnListarEmision() {
    try {
      let oEmision: IEmision = {
        nIdPeriodo: this.getPeriodo.nIdPeriodo,
        nIdSede: this.selectedSede
      };

      console.log('oEmision', oEmision);

      const data: IDataResponse = await lastValueFrom(this.emisionService.listarEmisiones(oEmision));

      if (data.boExito) {
        this.lstEmision = data.oDatoAdicional;
        this.buildDataSource(this.lstEmision.liCategoria);
        this.totalEmisiones = this.lstEmision.oEmisionGei;
        this.dataSource.push({ isTotal: true, oEmisionGei: this.totalEmisiones });
        this.filteredDataSource = this.getFilteredDataSource();
        console.log('this.lstEmision', this.lstEmision);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fnListarInformativas() {
    try {
      let oEmision: IEmision = {
        nIdPeriodo: this.getPeriodo.nIdPeriodo,
        nIdSede: this.selectedSede
      };
      console.log('%c-----OBJETO MANDADO-----', 'color: green; font-size: 20px;', oEmision);

      const data: IDataResponse = await lastValueFrom(this.emisionService.listarInformativas(oEmision));

      if (data.boExito) {
        this.lstInformativa = data.oDatoAdicional;
        this.totals = this.lstInformativa;

        console.log('this.totals', this.totals);
        console.log(this.lstInformativa);
      }

      console.log('this.lstInformativa', this.lstInformativa);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  onSedeChange(sedeId: number) {
    this.selectedSede = sedeId;
    this.fnListarEmision();
    this.fnListarInformativas();
  }

  /* ---------- Construir tabla con valores padres e hijos -------------- */
  buildDataSource(categories: any[]) {
    this.dataSource = [];
    categories.forEach(category => {
      category.isParent = true;
      category.isCollapsed = true;
      this.dataSource.push(category);

      category.liSubcategoria.forEach((subcategory: any) => {
        subcategory.isChild = true;
        subcategory.isCollapsed = true;
        subcategory.parentId = category.sCodCategoria;
        this.dataSource.push(subcategory);

        if (subcategory.liFuenteEmision) {
          subcategory.liFuenteEmision.forEach((source: { isGrandchild: boolean; parentId: any; }) => {
            source.isGrandchild = true;
            source.parentId = subcategory.sCodSubcategoria;
            this.dataSource.push(source);
          });
        }
      });
    });
  }

  getFilteredDataSource() {
    const filtered: any[] = [];
    this.dataSource.forEach(element => {
      if (element.isParent) {
        filtered.push(element);
      } else if (element.isChild && !this.isCollapsed(element, 'parent')) {
        filtered.push(element);
      } else if (element.isGrandchild && !this.isCollapsed(element, 'child')) {
        filtered.push(element);
      }
    });
    return filtered;
  }

  isCollapsed(element: any, type: string) {
    if (type === 'parent') {
      return this.dataSource.find(parent => parent.isParent && parent.sCodCategoria === element.parentId)?.isCollapsed;
    }
    if (type === 'child') {
      return this.dataSource.find(child => child.isChild && child.sCodSubcategoria === element.parentId)?.isCollapsed;
    }
    return false;
  }

  toggleCollapse(element: any) {
    element.isCollapsed = !element.isCollapsed;
    if (element.isCollapsed) {
      this.collapseChildren(element);
    }
    this.filteredDataSource = this.getFilteredDataSource();
  }

  collapseChildren(element: any) {
    if (element.isParent) {
      this.dataSource.forEach(child => {
        if (child.parentId === element.sCodCategoria && child.isChild) {
          child.isCollapsed = true;
          this.collapseChildren(child);
        }
      });
    } else if (element.isChild) {
      this.dataSource.forEach(grandchild => {
        if (grandchild.parentId === element.sCodSubcategoria && grandchild.isGrandchild) {
          grandchild.isCollapsed = true;
        }
      });
    }
  }

  tieneHijos(elemento: any): boolean {
    return elemento.liSubcategoria && elemento.liSubcategoria.length > 0;
  }

  tieneSubhijos(elemento: any): boolean {
    return elemento.liFuenteEmision && elemento.liFuenteEmision.length > 0;
  }

  noHayDatos(emision: any): boolean {
    if (!emision) return true;
    return Object.values(emision).every(valor => valor === 0 || valor === null);
  }

  /* ---------- Redirecciones -------------- */
  redictLimitesInforme() {
    this.router.navigate(["/limites-informe"]);
  }

  redirectReconocimiento() {
    this.router.navigate(["/solicitudes-reconocimiento"]);
  }
}
