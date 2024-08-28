import { Component, ViewEncapsulation } from '@angular/core';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { IUsuario } from '../../../models/usuario';
import { FuenteEmisionMtoService } from '../../../services/huella-service/maestros/fuente-emision-mto.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArchivoService } from '../../../services/archivo.service';
import { iParametro } from '../../../models/parametro';
import { ErrorService } from '../../../services/error.service';
import { ParametroService } from '../../../services/configuracion-service/parametro.service';
import { IFuenteEmision } from '../../../models/fuenteEmision';

@Component({
  selector: 'app-fuentes-emision',
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
    ToastrModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './fuentes-emision.component.html',
  styleUrls: ['./fuentes-emision.component.css']
})
export class FuentesEmisionComponent {

  lstFuente: any[] = [];
  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  hFEmision: string[] = [
    'sCategoria', 'descripcion', 'documento', 'accion'
  ];

  nIdUsuario: number = 0;
  lstUsuario: any = {};

  constructor(
    private sharedDataService: SharedDataService,
    private usuarioService: UsuarioService,
    private fuenteEmisionService: FuenteEmisionMtoService,
    private archivoService: ArchivoService,
    private alert: ToastrService,
    private parametroService: ParametroService,
    private errorService: ErrorService
  ) { }

  async ngOnInit() {
    this.nIdUsuario = this.sharedDataService.itemMenu?.nIdUsuario || 0;
    await this.fnObtenerUsuario();
    await this.fnListarFuenteEmision();
  }

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

  async fnListarFuenteEmision() {
    try {

      const data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarFuenteEmision());

      if (data.boExito) {
        this.lstFuente = data.oDatoAdicional;

        console.log('this.lstFuente', this.lstFuente);
        this.buildDataSource(this.lstFuente);
        this.filteredDataSource = this.getFilteredDataSource();

      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

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
      const parent = this.dataSource.find(parent => parent.isParent && parent.sCodCategoria === element.parentId);
      return parent ? parent.isCollapsed : true;
    }
    if (type === 'child') {
      const child = this.dataSource.find(child => child.isChild && child.sCodSubcategoria === element.parentId);
      return child ? child.isCollapsed : true;
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

  editar(item: any) {
    item.editing = true;
    item.selectedFileName = '';
    item.selectedFile = null;

  }

  async registrarFuente(item: any) {

    console.log('item', item);
    item.touched = true;
    if (!item.selectedFile) {
      this.alert.warning('Complete los campos.', 'Advertencia');
      return;
    }
    item.loading = true;

    console.log('dataSource', this.dataSource);
    // Buscar el objeto padre correspondiente
    let parentElement = this.dataSource.find(parent => parent.isParent && this.isParentOf(parent, item));

    try {
      let oFuente: IFuenteEmision = {
        sCodigoFuente: item.sCodigoFuente,
        sNombre: item.sNombre,
        nIdDocComprimido: parentElement.nIdDocComprimido,
        oFormato: {
          nIdDocumento: item.oFormato.nIdDocumento,
          sCodigoDocumento: item.oFormato.sCodigoDocumento,
          boEsFormato: item.oFormato.boEsFormato,
          sExtension: item.oFormato.sExtension,
        }
      };
      console.log('oFuente', oFuente);


      let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.actualizarFuenteEmision(item.selectedFile, oFuente));
      item.loading = false;
      console.log(data);
      if (data.boExito) {
        this.alert.success(data.sMensajeUsuario, 'Éxito');
        item.oFormato.sNombre = item.selectedFileName;
        //TODO:cambiar cod de documento 
        // item.oFormato.sCodigoDocumento=data.oDatoAdicional;
        item.touched = false;
        item.editing = false;

        item.oFormato.sCodigoDocumento = item.selectedFileName;

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
  isParentOf(parent: any, child: any): boolean {
    if (child.isChild && child.parentId === parent.sCodCategoria) {
      return true;
    }
    if (child.isGrandchild) {
      let subParent = this.dataSource.find(sub => sub.isChild && sub.sCodSubcategoria === child.parentId);
      return subParent ? subParent.parentId === parent.sCodCategoria : false;
    }
    return false;
  }


  cancelar(item: any) {
    item.editing = false;
    item.touched = false;
    item.selectedFileName = '';
    item.selectedFile = null;

  }

  /* ---------- Funciones de descarga de archivos -------------- */
  async fnDescargaArchivo(codigoDocumento: string) {
    await this.archivoService.descargaArchivo(codigoDocumento, codigoDocumento);
  }

  async fnDescargarZIP() {
    let oParametro: iParametro = { sTipo: 'SISTEMA', sCodigo: 'FORMATOS-NA' };
    let data: IDataResponse = await lastValueFrom(this.parametroService.obtenerParametro(oParametro));
    console.log(data);
    if (data.boExito) {
      await this.archivoService.descargaArchivo(data.oDatoAdicional.sValor, data.oDatoAdicional.sValor);
    } else {
      this.alert.warning(data.sMensajeUsuario, 'Advertencia');
    }

  }

  /* ---------- Funciones de archivos -------------- */
  onFileSelected(event: Event, item: any) {

    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {

      const file = fileInput.files[0];
      item.selectedFileName = file.name;
      item.selectedFile = file;

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
    }
  }

}
