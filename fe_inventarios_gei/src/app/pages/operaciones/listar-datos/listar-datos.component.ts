import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatosActividad } from 'src/app/models/datosActividad';
import { Periodo } from 'src/app/models/periodo';
import { AlertService } from 'src/app/services/alert.service';
import { DatosActividadService } from 'src/app/services/datos-actividad.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { IUsuario } from 'src/app/models/usuario';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Location } from '@angular/common';
import { FuentesEmisionService } from 'src/app/services/fuentes-emision.service';
import { ModalDescargaComponent } from '../modal-descarga/modal-descarga.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-listar-datos',
  templateUrl: './listar-datos.component.html',
  styleUrls: ['./listar-datos.component.css']
})
export class ListarDatosComponent implements OnInit {
  isShown: boolean = false;
  loading: boolean = false;
  disabled: boolean = false;
  disabledForm: boolean = false;
  submitForm: boolean = false;
  submitEvidencia: boolean = false;
  loadingTable: Boolean = true;
  noHayEvidencias: Boolean = false;
  lstHistorial: any[] = [];
  lstEvidencias: any[] = [];
  lstSector: any;
  lstIncertidumbre: any;
  oPeriodo: Periodo;
  oUsuario: IUsuario;
  nIdPeriodo: any;
  nEstado: any;
  routePrevious: any;
  oNombreFna: any;

  model: DatosActividad = new DatosActividad();

  //Paginación
  page = 1;
  pageSize = 10;
  total = 0;

  //Documentos
  documentos: any;
  filePdf: any;
  uploadFilePdf: any[];
  fileExcel: any;
  fileExcelActual: any;

  listOfFiles: any[] = [];
  arrayEvidenicas: any[] = [];

  @ViewChild('myInputPdf', { static: false }) myInputPdfVariable: ElementRef;
  @ViewChild('myInputExcel', { static: false }) myInputExcelVariable: ElementRef;
  getDescargas: any = {};

  constructor(private datosActividadService: DatosActividadService, private sharedData: SharedDataService, private alertService: AlertService,
    private seguridadService: SeguridadService, private fuentesEmisionService: FuentesEmisionService,
    private fileService: FileService, private location: Location, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();   
    if (this.oUsuario.sUsuario != undefined) {

      this.getDescargas.FDA_Codigo = environment.sDescargaCodigo.FormatoFDA;
      this.getDescargas.FDA_Nombre = environment.sDescargaNombre.FormatoFDA;

      this.nIdPeriodo = this.sharedData.itemPeriodo.nIdPeriodo;
      //console.log('this.nIdPeriodo', this.nIdPeriodo);
      this.nEstado = this.sharedData.itemPeriodo.nEstadoActual;
      //Si el estado es 1 o 3 deshabilitar la página,
      if (this.nEstado == 1 || this.nEstado == 3) {
        this.disabledForm = true;
      }
      this.model.nIdFuenteEmision = 'Seleccionar';
      //this.model.nIdIncertidumbre = 'Seleccionar';
      this.fnListarHistorial();
      this.fnListarSector();
      //this.fnListarIcertidumbre();
    }
  }

  async fnListarHistorial() {
    try {

      let data: IDataResponse = await lastValueFrom(this.datosActividadService.listarHistorial(this.nIdPeriodo));
      //console.log('89', data);
      if (data.exito) {
        this.lstHistorial = data.datoAdicional;
        //console.log('this.lstHistorial', this.lstHistorial);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    } this.loadingTable = false;
  }

  async fnListarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.fuentesEmisionService.listarSectores());
      if (data.exito) {
        this.lstSector = data.datoAdicional;
        //console.log('this.lstSector', this.lstSector);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  changeSector() {
    let search = this.lstSector.filter((item: { nIdFuenteEmision: any; }) => item.nIdFuenteEmision == this.model.nIdFuenteEmision);
    this.oNombreFna = search[0].sNombreFna;
    let oSearch = this.lstSector.find((elemento: { nIdFuenteEmision: number; }) => elemento.nIdFuenteEmision === this.model.nIdFuenteEmision);
    this.model.sNombreFna = oSearch.sNombreFna;
  }

  onFileChangeExcel($event: any) {
    this.fileExcel = $event.target.files[0];
    if (this.fileExcel) {
      const fileNameLowercased = this.fileExcel.name.toLowerCase();

      if (fileNameLowercased.endsWith('.xls') || fileNameLowercased.endsWith('.xlsx')) {
        //console.log(this.fileExcel.name);
        this.myInputExcelVariable.nativeElement.innerText = this.fileExcel.name;
        this.alertService.close("");
      } else {
        this.myInputExcelVariable.nativeElement.value = "";
        this.alertService.error("El documento a cargar debe tener formato XLS ó XLSX");
      }
    }
  }


  async onFileChangePdf($event: any) {
    var newArrayFile = Array.from($event.target.files) as any;

    let repetido = this.documentos.filter((item: { sNombreDocumento: any; }) => item.sNombreDocumento == newArrayFile[0]?.name);
    if (repetido.length >= 1) {
      this.alertService.error('El nombre del archivo a seleccionar ya está adjunto.');
      return;
    }

    this.filePdf = newArrayFile[0];
    this.uploadFilePdf = newArrayFile;

    if (this.filePdf) {
      const fileNameLowercased = this.filePdf.name.toLowerCase();
      if (fileNameLowercased.endsWith('.pdf') || fileNameLowercased.endsWith('.xls') || fileNameLowercased.endsWith('.xlsx')) {
        this.myInputPdfVariable.nativeElement.innerText = this.filePdf.name;
        this.alertService.close("");
      } else {
        this.myInputPdfVariable.nativeElement.value = "";
        this.alertService.error("El documento a cargar debe tener formato XLS, XLSX ó PDF");
      }
    }

    $event.target.value = null;
  }

  async agregarDocumento() {
    this.submitEvidencia = true;
    if (this.filePdf) {
      const fileNameLowercased = this.filePdf.name.toLowerCase();
      if (fileNameLowercased.endsWith('.pdf') || fileNameLowercased.endsWith('.xls') || fileNameLowercased.endsWith('.xlsx')) {
        for (var i = 0; i <= this.uploadFilePdf.length - 1; i++) {
          this.listOfFiles.push(this.uploadFilePdf[i]);
        }
        //console.log('this.listOfFiles -->', this.listOfFiles);
        this.documentos.push({ "sNombreDocumento": this.filePdf.name });
        this.filePdf = null;
        this.myInputPdfVariable.nativeElement.value = "";
        this.myInputPdfVariable.nativeElement.innerText = "Seleccionar archivo...";
        this.submitEvidencia = false;
      }
      //console.log('documentos', this.documentos);
    }
  }


  async eliminarDocumento(item: any, index: number) {
    try {
      //Si se obtiene nIdDocumento y sUidDocumento (Está registrado), llama al servicio.
      if (item.nIdDocumento && item.sUidDocumento) {
        item.loadingEliminar = true;
        let data = await lastValueFrom(this.datosActividadService.eliminarEvidencia(item.nIdDocumento, item.sUidDocumento));
        if (data.exito) {
          //console.log('this.documentos -->', this.documentos);
          const index = this.documentos.indexOf(item);
          if (index > -1) {
            this.documentos.splice(index, 1);

          }
          //console.log('this.listOfFiles -->', this.listOfFiles);
          //console.log('this.documentos -->', this.documentos);
          this.fnListarHistorial();
          item.loadingEliminar = false;
        } else {
          this.alertService.error(data.mensajeUsuario);
        }

        //Si no es es así solo se elimina el seleccionado.
      } else {

        //console.log('item', index);
        const indexDocSubidos = this.documentos.indexOf(item);

        if (indexDocSubidos > -1) {
          this.documentos.splice(indexDocSubidos, 1);
        }
        // Filtrar objetos con 'sUidDocumento' y 'sNombreDocumento' definidos
        const docSubidos = this.documentos.filter((documento: { hasOwnProperty: (arg0: string) => any; }) =>
          documento.hasOwnProperty('sUidDocumento') && documento.hasOwnProperty('sNombreDocumento')
        );

        // Obtener la cantidad de objetos que cumplen con las condiciones
        const cantidadDocSubidos = docSubidos.length;

        this.listOfFiles.splice(index - cantidadDocSubidos, 1);

        //console.log('this.listOfFiles', this.listOfFiles);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async guardarRegistro() {
    let modalRef = this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
    try {
      //this.loading = true;
      if (this.model.nIdDatosActividad == -1) {

        this.submitForm = true;
        this.noHayEvidencias = true;
        if (this.fileExcel == null || this.model.nIdFuenteEmision == 'Seleccionar') {
          // this.loading = false;
          modalRef.close();
          return;
        }

        let repitiendo = this.lstHistorial.filter(item => item.oFuenteEmision.nIdFuenteEmision == this.model.nIdFuenteEmision);

        if (repitiendo.length >= 1) {
          this.alertService.error('El sector seleccionado, ya existe en el listado.');
          // this.loading = false;
          modalRef.close();
          return;
        }

        if (this.documentos.length <= 0) {
          modalRef.close();
          return
        }
        //El archivo debe coincidir con el FNA.
        //console.log('NombreFna de select >>>', this.oNombreFna);
        //console.log('Nombre de archivo >>>', this.fileExcel.name);

        let textRegex = "(" + this.oNombreFna?.toString() + ")"

        if (!new RegExp(textRegex).test(this.fileExcel.name)) {
          //console.log("El nombre de archivo NO INCLUYE el nombre de FNA");
          this.alertService.error('Nombre de archivo incorrecto.');
          //this.loading = false;
          modalRef.close();
          return;
        }

        //Registrar Datos
        this.alertService.close('');
        let dataExcel = await lastValueFrom(this.fileService.uploadFile(this.fileExcel));
        //console.log('dataExcel', dataExcel);
        if (dataExcel.exito) {
          let dataBloque1 = await lastValueFrom(this.datosActividadService.insertarDatosActividad(this.nIdPeriodo, this.model.nIdFuenteEmision, this.model.sNombreFna, dataExcel.datoAdicional.sUidDocumento, dataExcel.datoAdicional.sNombreDocumento));
          //console.log(dataBloque1.exito);
          if (dataBloque1.exito) {
            let idDatosActividad = dataBloque1.datoAdicional;
            if (this.listOfFiles.length !== 0) {
              for (var i = 0; i < this.listOfFiles.length; i++) {
                let dataEvidencia = await lastValueFrom(this.fileService.uploadFile(this.listOfFiles[i]));
                if (dataEvidencia.exito) {
                  this.arrayEvidenicas.push({
                    sUidDocumento: dataEvidencia.datoAdicional.sUidDocumento,
                    sNombreDocumento: dataEvidencia.datoAdicional.sNombreDocumento
                  });
                } else {
                  //console.log(dataEvidencia);
                  this.alertService.error(dataEvidencia.mensajeUsuario);
                  // this.loading = false;
                  modalRef.close();
                  return
                }
              }
              let dataInsertarEvidencia = await lastValueFrom(this.datosActividadService.insertarEvidencia(idDatosActividad, this.arrayEvidenicas));
              if (dataInsertarEvidencia.exito) {
                this.fnListarHistorial();
                this.isShown = false;
                this.submitForm = false;
                this.fileExcel = null;
              } else {
                this.alertService.warning(dataInsertarEvidencia.mensajeUsuario);
                // this.loading = false;
                modalRef.close();
                return
              }
            } else {
              this.fnListarHistorial();
              this.isShown = false;
              this.submitForm = false;
              this.fileExcel = null;
            }
          } else {
            //console.log('dataBloque1', dataBloque1)
            this.alertService.error(dataBloque1.mensajeUsuario);
            //this.loading = false;
            modalRef.close();
            return
          }
        } else {
          this.alertService.error(dataExcel.mensajeUsuario);
          //this.loading = false;
          modalRef.close();
          return
        }
      }
      else {
        this.noHayEvidencias = true;
        //Actualizar Datos
        if (this.model.nIdFuenteEmision == 'Seleccionar') {
          //this.loading = false;
          modalRef.close();
          return;
        }

        if (this.fileExcel.length !== 0) {
          if (!new RegExp(this.model.sNombreFna).test(this.fileExcel.name)) {
            this.alertService.error('Nombre de archivo incorrecto.');
            modalRef.close();
            return;
          }
        }

        if (this.documentos.length <= 0) {
          modalRef.close();
          return
        }
        //this.loading = true;
        //const modalRef = this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });

        //Se actualiza sin subir el excel boEstado= false
        if (this.fileExcel.length == 0) {
          let dataActualizar = await lastValueFrom(this.datosActividadService.actualizarDatosActividad(this.model.nIdDatosActividad, this.nIdPeriodo, this.model.nIdFuenteEmision, this.model.sNombreFna, false, this.fileExcelActual.sUidDocumento, this.fileExcelActual.sNombreDocumento));
          if (dataActualizar.exito) {
            this.fileExcel = [];
            this.fileExcel.name = [];
            if (this.listOfFiles.length != 0) {
              for (var i = 0; i < this.listOfFiles.length; i++) {
                let dataEvidencia = await lastValueFrom(this.fileService.uploadFile(this.listOfFiles[i]));
                if (dataEvidencia.exito) {
                  this.arrayEvidenicas.push({
                    sUidDocumento: dataEvidencia.datoAdicional.sUidDocumento,
                    sNombreDocumento: dataEvidencia.datoAdicional.sNombreDocumento
                  });
                } else {
                  this.alertService.error(dataEvidencia.mensajeUsuario);
                  //this.loading = false;
                  modalRef.close();
                }
              }
              let dataInsertarEvidencia = await lastValueFrom(this.datosActividadService.insertarEvidencia(this.model.nIdDatosActividad, this.arrayEvidenicas));
              if (dataInsertarEvidencia.exito) {
                this.fnListarHistorial();
                this.isShown = false;
                this.submitForm = false;
                this.fileExcel = null;
              } else {
                this.alertService.error(dataInsertarEvidencia.mensajeUsuario);
                //this.loading = false;
                modalRef.close();
              }
            } else {
              this.fnListarHistorial();
              this.isShown = false;
              this.submitForm = false;
              this.fileExcel = null;
            }
          } else {
            this.alertService.error(dataActualizar.mensajeUsuario);
            //this.loading = false;
            modalRef.close();
          }

        } else {
          //Se actualiza agregando un nuevo excel boEstado= true
          let dataExcel = await lastValueFrom(this.fileService.uploadFile(this.fileExcel));
          if (dataExcel.exito) {
            let dataUpdateExcel = await lastValueFrom(this.fileService.updatedFile(this.fileExcel, dataExcel.datoAdicional.sUidDocumento));
            let dataActualizar = await lastValueFrom(this.datosActividadService.actualizarDatosActividad(this.model.nIdDatosActividad, this.nIdPeriodo, this.model.nIdFuenteEmision, this.model.sNombreFna, true, dataExcel.datoAdicional.sUidDocumento, dataExcel.datoAdicional.sNombreDocumento));
            if (dataActualizar.exito) {
              if (this.listOfFiles.length != 0) {
                for (var i = 0; i < this.listOfFiles.length; i++) {
                  let dataEvidencia = await lastValueFrom(this.fileService.uploadFile(this.listOfFiles[i]));
                  if (dataEvidencia.exito) {
                    this.arrayEvidenicas.push({
                      sUidDocumento: dataEvidencia.datoAdicional.sUidDocumento,
                      sNombreDocumento: dataEvidencia.datoAdicional.sNombreDocumento
                    });
                  } else {
                    this.alertService.error(dataEvidencia.mensajeUsuario);
                    //this.loading = false;
                    modalRef.close();
                  }
                }
                let dataInsertarEvidencia = await lastValueFrom(this.datosActividadService.insertarEvidencia(this.model.nIdDatosActividad, this.arrayEvidenicas));
                if (dataInsertarEvidencia.exito) {
                  this.fnListarHistorial();
                  this.isShown = false;
                  this.submitForm = false;
                  this.fileExcel = null;
                } else {
                  this.alertService.error(dataInsertarEvidencia.mensajeUsuario);
                  //this.loading = false;
                  modalRef.close();
                }
              } else {
                this.fnListarHistorial();
                this.isShown = false;
                this.submitForm = false;
                this.fileExcel = null;
              }
            } else {
              this.alertService.error(dataActualizar.mensajeUsuario);
              //this.loading = false;
              modalRef.close();
            }
          } else {
            this.alertService.error(dataExcel.mensajeUsuario);
            //this.loading = false;
            modalRef.close();
          }
        }
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.noHayEvidencias = false;
    this.fileExcel = [];
    this.fileExcel.name = [];
    this.listOfFiles = [];
    this.arrayEvidenicas = [];
    //this.loading = false;
    modalRef.close();
  }


  Editar(item: any) {
    //console.log(item)
    this.alertService.close('');
    this.noHayEvidencias = false;
    this.documentos = [];
    this.isShown = true;
    this.disabled = true;
    this.submitForm = false;
    this.fileExcel = [];
    this.fileExcel.name = [];
    this.listOfFiles = [];
    this.arrayEvidenicas = [];
    this.fileExcelActual = {
      sUidDocumento: item.oDocumento.sUidDocumento,
      sNombreDocumento: item.oDocumento.sNombreDocumento
    }
    this.model.sUidDocumento = item.oDocumento.sUidDocumento;
    this.model.sNombreDocumento = item.oDocumento.sUidDocumento;
    this.model.nIdDatosActividad = item.nIdDatosActividad;
    this.model.nIdFuenteEmision = item.oFuenteEmision.nIdFuenteEmision;
    this.model.sNombreFna = item.oFuenteEmision.sNombreFna;
    this.submitEvidencia = false;

    item.liEvidencia.forEach((e: any) => {
      this.documentos.push(e);
    });


  }

  async Eliminar(item: any) {
    try {
      let datosActividad = new DatosActividad;
      datosActividad.nIdDatosActividad = item.nIdDatosActividad;
      let data: IDataResponse = await lastValueFrom(this.datosActividadService.eliminarDatosActividad(datosActividad));
      if (data.exito) {
        //console.log(data);
        this.lstHistorial = []
        this.fnListarHistorial();
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDescargarEvidencia(oEvidencia: any) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.fileService.downloadFile(oEvidencia.sUidDocumento));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = oEvidencia.sNombreDocumento;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }

  async fnDescargarDatosActividad(item: any) {
    try {
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.fileService.downloadFile(item.oDocumento.sUidDocumento));
      const blob = new Blob([data], { type: "application/xls" })
      let filename = item.oDocumento.sNombreDocumento;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }

  registrarDatos() {
    this.submitForm = false;
    this.noHayEvidencias = false;
    this.isShown = true;
    this.disabled = false;
    this.model.nIdFuenteEmision = 'Seleccionar';
    this.model.nIdDatosActividad = -1;
    this.documentos = []
  }

  cancelarRegistro() {
    this.isShown = false;
    this.loading = false;
    this.submitEvidencia = false;
  }

  redictVolver() {
    this.location.back()
  }

  async fnDescargarFormato() {
    console.log(this.getDescargas.FDA_Codigo, this.getDescargas.FDA_Nombre)
    try {
      let data = await lastValueFrom(this.fileService.downloadFile(this.getDescargas.FDA_Codigo));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = this.getDescargas.FDA_Nombre;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }
}
