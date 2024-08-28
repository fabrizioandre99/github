import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { factorEmision } from 'src/app/models/factorEmision';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { FactorEmisionService } from 'src/app/services/factor-emision.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-factor-emision',
  templateUrl: './factor-emision.component.html',
  styleUrls: ['./factor-emision.component.css']
})
export class FactorEmisionComponent implements OnInit {
  page = 1;
  pageSize = 10;
  total = 0;
  fileToUpload: any;
  regex = /^(?!\.)(\d{1,2}|\d{1,2}[.]|\d{0,2}\.\d{0,10}?)$/;

  loadingCargar: Boolean = false;
  loadingEliminar: Boolean = false;
  fnHiddenAnio: Boolean = false;
  loadingDescargar: Boolean = false;

  lstFactores: any[] = [];
  lstTableFactores: any[] = [];
  lstAnio: any[] = [];
  lstProveedor: any[] = [];
  lstSkeleton = Array(8);
  fShowSkeleton: boolean = true;
  model: factorEmision = new factorEmision();

  fShow: boolean = false;

  @ViewChild('fileExcel', { static: false })
  fileExcel: ElementRef;

  constructor(private toastr: ToastrService, private factorEmisionService: FactorEmisionService, private localDataService: LocalDataService) { }

  ngOnInit(): void {
    this.model.oProveedorEnergia.nIdProveedor = -1;
    this.fnListarAnio();
  }

  async fnListarFactores() {
    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarAdm(this.model.oProveedorEnergia.nIdProveedor, this.model.nAnio));
    if (data.exito) {
      this.lstFactores = data.datoAdicional;
      this.lstTableFactores = this.lstFactores;
      this.lstProveedor = data.datoAdicional;
      this.fShowSkeleton = false;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarAnio() {
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarAnio());
      if (data.exito) {
        this.lstAnio = data.datoAdicional;
        this.model.nAnio = this.lstAnio[this.lstAnio.length - 1];
        this.fnListarFactores();
        if (this.lstAnio.length == 1) {
          this.fnHiddenAnio = true;
        } else {
          this.fnHiddenAnio = false;
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }

  changeAnio() {
    this.model.oProveedorEnergia.nIdProveedor = -1;
    this.fnListarFactores();
  }

  changeProveedor() {
    if (this.model.oProveedorEnergia.nIdProveedor === -1) {
      this.lstTableFactores = this.lstFactores;
    } else {
      this.lstTableFactores = this.lstFactores.filter(item => item.oProveedorEnergia.nIdProveedor === this.model.oProveedorEnergia.nIdProveedor);
    }
  }

  async fnEliminarAnio() {
    this.loadingEliminar = true;
    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.eliminarAnio(this.model.nAnio, localStorage.getItem('SessionIdUsuario')!));
    if (data.exito) {
      this.fnListarAnio();
      this.fnListarFactores();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    this.loadingEliminar = false;
  }

  async fnCargarFactorEmision() {
    if (!this.fileToUpload) {
      this.toastr.warning('Suba un archivo', 'Advertencia');
      return
    }
    let today = new Date();
    this.loadingCargar = true;
    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.cargarArchivo(this.fileToUpload));
    if (data.exito) {
      this.fnListarAnio();
      this.toastr.success('Archivo cargado', 'Éxito');
      this.fileToUpload = null;
      this.fileExcel.nativeElement.innerText = "Seleccionar archivo...";
      this.fShow = false;

    } else {
      this.toastr.error(data.mensajeUsuario, 'Error');
    }
    this.loadingCargar = false;
  }

  async fnDescargarSinData() {
    this.loadingDescargar = true;
    let data = await lastValueFrom(this.factorEmisionService.descargarFormato(0, 0));
    const blob = new Blob([data as BlobPart], { type: "application/xlsx" })
    let filename = 'ListaFactoresEmision_' + String(this.lstAnio[this.lstAnio.length - 1] + 1) + '.xlsx';
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    this.loadingDescargar = false;
  }

  async fnDescargarConData() {
    this.loadingDescargar = true;
    let data = await lastValueFrom(this.factorEmisionService.descargarFormato(1, this.model.nAnio));
    const blob = new Blob([data as BlobPart], { type: "application/xlsx" })
    let filename = 'ListaFactoresEmision_' + String(this.model.nAnio) + '.xlsx';
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    this.loadingDescargar = false;
  }

  onFileChange($event: any) {
    let filetemp = $event.target.files[0];
    if (filetemp.name.endsWith('xls') || filetemp.name.endsWith('xlsx')) {
      this.fileToUpload = $event.target.files[0];
      this.fileExcel.nativeElement.innerText = this.fileToUpload.name

    } else {
      this.fileExcel.nativeElement.value = null;
      this.fileExcel.nativeElement.innerText = "Seleccionar archivo...";
      this.toastr.warning('El archivo debe ser en formato .xls o .xlsx', 'Advertencia');
    }
  }

  fnAgregarAnio() {
    this.fShow = true;
  }

  editarFactor(item: any) {
    item.sFeCO2_mod = item.sFeCO2;
    item.sFeCH4_mod = item.sFeCH4;
    item.sFeN2O_mod = item.sFeN2O;
    item.sFeCO2eq_mod = item.sFeCO2eq;
    item.edit = true;
  }

  async actualizarFactor(item: any) {
    if (!this.regex.test(item.sFeCO2_mod) || !this.regex.test(item.sFeCH4_mod) || !this.regex.test(item.sFeN2O_mod) || !this.regex.test(item.sFeCO2eq_mod)) {
      this.toastr.warning('Solo se permiten un máximo de 2 unidades y 10 decimales', 'Advertencia');
      return
    }

    if (!item.sFeCO2_mod?.toString().trim() || !item.sFeCH4_mod?.toString().trim() || !item.sFeN2O_mod?.toString().trim() || !item.sFeCO2eq_mod?.toString().trim()
    ) {
      this.toastr.warning('Complete todos los campos', 'Advertencia');
      return
    }

    item.sFeCO2 = item.sFeCO2_mod;
    item.sFeCH4 = item.sFeCH4_mod;
    item.sFeN2O = item.sFeN2O_mod;
    item.sFeCO2eq = item.sFeCO2eq_mod;

    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarAdm(item.nIdFactorEmision, item.sFeCO2, item.sFeCH4, item.sFeN2O, item.sFeCO2eq,
      localStorage.getItem('SessionIdUsuario')!));
    if (!data.exito) {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
    item.edit = false;

  }
}
