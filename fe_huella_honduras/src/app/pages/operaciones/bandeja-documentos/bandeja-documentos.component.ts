import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { iArchivo } from '../../../models/archivo';
import { ArchivoConfigService } from '../../../services/configuracion-service/archivos.service';
import { IDataResponse } from '../../../models/IDataResponse';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertComponent } from '../../../utils/alert/alert.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArchivoService } from '../../../services/archivo.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-bandeja-documentos',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AlertComponent,
    ToastrModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './bandeja-documentos.component.html',
  styleUrls: ['./bandeja-documentos.component.css']
})
export class BandejaDocumentosComponent implements OnInit {

  hDocumentos: string[] = ['item', 'sNombre', 'sDescripcion', 'sFecha', 'sUsuario', 'accion'];
  tDocumentos = new MatTableDataSource<iArchivo>();

  editingDocument: iArchivo | null = null;
  originalFileBlob: Blob | null = null;
  originalFileName: string | null = null;
  form: FormGroup;

  constructor(
    private archivosConfigService: ArchivoConfigService,
    private archivoService: ArchivoService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private alert: ToastrService
  ) {
    this.form = this.fb.group({
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fnListarDocumentos();
  }

  /* ---------- LLamada de servicios -------------- */
  async fnListarDocumentos() {
    try {
      let oArchivo: iArchivo = {
        boEsFormato: true
      };
      const response: IDataResponse = await lastValueFrom(this.archivosConfigService.listar(oArchivo));
      if (response.boExito) {
        this.tDocumentos.data = response.oDatoAdicional;
      } else {
        this.alert.warning(response.sMensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async editar(documento: iArchivo) {
    this.editingDocument = documento;
    this.form.patchValue({
      descripcion: documento.sDescripcion
    });

    // Descargar y almacenar el archivo original en Blob y su nombre
    const blob = await lastValueFrom(this.archivoService.postDescargarArchivo(documento.sCodigoDocumento!));
    this.originalFileBlob = blob;
    this.originalFileName = documento.sNombre!;

    // Resetear selectedFile al original en caso de no haber cambios
    this.editingDocument.selectedFileName = null!;
    this.editingDocument.selectedFile = null;
  }

  cancelarEdicion() {
    if (this.editingDocument) {
      // Restaurar el archivo original si se cancela la edición
      this.editingDocument.selectedFileName = this.originalFileName!;
      this.editingDocument.selectedFile = this.originalFileBlob ? new File([this.originalFileBlob], this.originalFileName || '') : null;
    }
    this.editingDocument = null;
    this.originalFileBlob = null; // Limpiar el blob original
    this.originalFileName = null; // Limpiar el nombre original
    this.form.reset();
  }

  async guardarEdicion(element: iArchivo) {
    if (this.editingDocument && this.form.valid) {
      try {
        let mfDocumento: File;
        const oArchivo: iArchivo = {
          nIdDocumento: element.nIdDocumento,
          sDescripcion: this.form.get('descripcion')?.value,
          sCodigoDocumento: element.sCodigoDocumento
        };


        if (this.editingDocument.selectedFile) {
          // Si hay un nuevo archivo seleccionado, utilizarlo.
          mfDocumento = this.editingDocument.selectedFile;
        } else if (this.originalFileBlob) {
          // Si no hay un nuevo archivo y tenemos el archivo original, usarlo
          mfDocumento = new File([this.originalFileBlob], this.originalFileName || 'documento', { type: this.originalFileBlob.type });
        } else {
          // Fallback por si no hay archivo (no debería llegar aquí en teoría)
          this.alert.error('Error inesperado: archivo no encontrado.', 'Error');
          return;
        }

        const data: IDataResponse = await lastValueFrom(this.archivosConfigService.actualizar(mfDocumento, oArchivo));

        if (data.boExito) {
          this.alert.success('Documento actualizado correctamente.', 'Éxito');
          this.fnListarDocumentos();
          this.cancelarEdicion();
        } else {
          this.alert.warning(data.sMensajeUsuario, 'Advertencia');
        }
      } catch (error) {
        this.errorService.enviar(error);
      }
    }
  }

  /* ---------- Funciones de archivo -------------- */
  onFileSelected(event: Event, item: any) {
    this.originalFileBlob = null;
    this.originalFileName = null;

    console.log('event', event);
    console.log('item', item);

    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {

      const file = fileInput.files[0];

      if (!this.validarFormatoArchivo(file)) {
        this.alert.warning('El formato del archivo no es válido', 'Advertencia');
        item.selectedFileName = '';
        fileInput.value = '';
        return;
      }

      item.selectedFileName = file.name;
      item.selectedFile = file;

      //Asignar el archivo
      this.editingDocument!.selectedFile = file;

    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    if (!container.classList.contains('disabled')) {
      container.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    if (!container.classList.contains('disabled')) {
      container.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, item: any) {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget as HTMLElement;
    container.classList.remove('drag-over');
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      item.selectedFileName = file.name;
      item.selectedFile = file;

      // Limpiar el archivo original almacenado ya que hay un nuevo archivo
      this.originalFileBlob = null;
      this.originalFileName = null;
    }
  }

  /* ---------- Funciones de descarga de archivos -------------- */
  async fnDescargaArchivo(sCodigoDocumento: string, sNombre: string) {
    await this.archivoService.descargaArchivo(sCodigoDocumento, sNombre);
  }

  /* ---------- Validaciones -------------- */
  validarFormatoArchivo(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    return allowedTypes.includes(file.type);
  }

}
