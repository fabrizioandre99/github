import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { AlertService } from 'src/app/services/alert.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolicitudUsuario } from 'src/app/models/solicitud';
import { Municipalidad } from 'src/app/models/municipalidad';
import { EstadoPeriodo } from 'src/app/models/estadoPeriodo';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-registrar-solicitud',
  templateUrl: './registrar-solicitud.component.html',
  styleUrls: ['./registrar-solicitud.component.css']
})

export class RegistrarSolicitudComponent implements OnInit {
  getDescargas: any = {};

  disabledForm: boolean = false;
  disabledRuc: boolean = false;
  disabledDNI: boolean = false;

  loading: Boolean = false;
  loadingRUC: Boolean = false;
  loadingDNI: Boolean = false;
  loadingCambiarRuc: Boolean = false;
  loadingCambiarDNI: Boolean = false;

  fShowCambiarRuc: boolean = false;
  fShowCambiarDNI: boolean = false;
  //Validaciones
  isValidDoc: Boolean = false;
  isValidDocPdf: Boolean = false;
  isValidDNI: boolean = false;
  isValidUbigeo: boolean = false;
  submitForm: Boolean = false;
  InsertarSolicitud: Boolean = false;

  solicitud = new SolicitudUsuario;
  oMunicipalidad = new Municipalidad;
  estadoperiodo = new EstadoPeriodo;

  sUidDocumento: string;
  sNombreDocumento: string;

  lstDepartamento: any;
  lstProvincia: any;
  lstDistrito: any;

  mensajeModal: any = '';

  //Archivo
  fileToUpload: File;

  //Obtener Token
  getToken: any;

  @ViewChild('InputPdf', { static: false })
  InputPdf: ElementRef;

  constructor(private route: ActivatedRoute, private router: Router, private fileService: FileService, private alertService: AlertService, private modalService: NgbModal,
    private solicitudUsuarioService: SolicitudUsuarioService, private sharedData: SharedDataService, private cdref: ChangeDetectorRef) {

  }
  async ngOnInit() {

    this.getDescargas.FDJ_Codigo = environment.sDescargaCodigo.FormatoFDJ;
    this.getDescargas.FDJ_Nombre = environment.sDescargaNombre.FormatoFDJ;

    try {
      this.fnDepartamento();
      this.defaultUbigeo();
      this.InsertarSolicitud = true;

      //Obtener Token
      if (this.route.snapshot.params['token'] != undefined) {
        this.getToken = this.route.snapshot.params['token'];

        let data = await lastValueFrom(this.solicitudUsuarioService.obtenerDatos(this.getToken));
        //console.log(data);

        if (data.exito) {
          this.InsertarSolicitud = false;
          this.oMunicipalidad = data.datoAdicional.oMunicipalidad;
          this.sUidDocumento = data.datoAdicional.sUidDocumento;
          this.sNombreDocumento = data.datoAdicional.sNombreDocumento;

          this.solicitud = data.datoAdicional;
          //console.log('this.solicitud', this.solicitud);
          this.fnProvincia();
          this.fnDistrito();

          this.disabledForm = true;
          this.disabledRuc = true;
          this.disabledDNI = true;

          this.fShowCambiarRuc = true;
          this.fShowCambiarDNI = true;
        } else {
          this.sharedData.setAlertMessage(data.mensajeUsuario);
          //console.log(this.sharedData.itemAlertMessage)
          this.router.navigate(['/registrar-solicitud']);
        }
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  ngAfterViewInit() {
    if (this.sharedData.itemAlertMessage !== null) {
      this.alertService.warning(this.sharedData.itemAlertMessage);
      if (this.sharedData.itemAlertMessage == '') {
        this.alertService.close("");
      }
      this.sharedData.setAlertMessage('');
      this.cdref.detectChanges();
    }
  }

  async fnVerificarRuc() {
    try {
      if (this.oMunicipalidad.nRuc == undefined) {
        this.alertService.warning("Ingrese un número de RUC válido.");
        return;
      }

      this.loadingRUC = true;

      let data = await lastValueFrom(this.solicitudUsuarioService.verificarRuc(this.oMunicipalidad.nRuc));
      //this.solicitud = new SolicitudUsuario;
      this.submitForm = false;
      this.isValidDoc = false;
      this.isValidDocPdf = false;

      //Ruc no se encuentra en la BD_MINAM

      if (!data.exito && data.codMensaje == '2') {
        this.oMunicipalidad = new Municipalidad;

        this.oMunicipalidad.nRuc = data.datoAdicional.nRuc;
        this.oMunicipalidad.sNombre = data.datoAdicional.sNombre;

        this.oMunicipalidad.sTipo = "";
        this.defaultUbigeo();

        this.isValidUbigeo = true;
        this.disabledForm = true;

        this.lstProvincia = [];
        this.lstDistrito = [];

        this.alertService.warning(data.mensajeUsuario);
      }
      //Condiciones que impiden registrar la solicitud
      else if (!data.exito && (data.codMensaje == '1' || data.codMensaje == '4' || data.codMensaje == '3')) {

        this.submitForm = false;
        this.oMunicipalidad.sNombre = "";
        this.defaultUbigeo();
        this.alertService.warning(data.mensajeUsuario);

        this.isValidUbigeo = false;
        this.disabledForm = false;
      } else {
        this.alertService.close("");

        let codDepart = data.datoAdicional?.sUbigeo?.substring(0, 2);
        let codProv = data.datoAdicional?.sUbigeo?.substring(2, 4);
        let codDist = data.datoAdicional?.sUbigeo?.substring(4, 6);

        this.oMunicipalidad = data.datoAdicional;

        this.oMunicipalidad.sDepartamento = codDepart;

        this.fnProvincia();
        this.oMunicipalidad.sProvincia = codProv;

        this.fnDistrito();

        this.oMunicipalidad.sDistrito = codDist;

        //Deshabilitar ruc
        this.disabledRuc = true;
        this.fShowCambiarRuc = true;

        this.alertService.success(data.mensajeUsuario);

        this.disabledForm = true;
        this.isValidUbigeo = false;

      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loading = false;
    this.loadingRUC = false;
  }

  //Verificar DNI
  async fnVerificarDNI() {
    this.loadingDNI = true;
    let data = await lastValueFrom(this.solicitudUsuarioService.verificarDni(this.solicitud.sDNI));
    //console.log('data DNI:', data);
    if (!data.exito) {
      this.alertService.warning(data.mensajeUsuario);

      this.solicitud.sNombre = "";
      this.solicitud.sApellidoPaterno = "";
      this.solicitud.sApellidoMaterno = "";

    } else {
      this.alertService.close("");
      this.solicitud.sNombre = data.datoAdicional.sNombre;
      this.solicitud.sApellidoMaterno = data.datoAdicional.sApellidoMaterno;
      this.solicitud.sApellidoPaterno = data.datoAdicional.sApellidoPaterno;
      //Deshabilitar ruc
      this.disabledDNI = true;
      this.fShowCambiarDNI = true;
      //console.log('this.disabledDNI', this.disabledDNI);

    }
    this.loadingDNI = false;
  }

  onFileChange($event: any) {
    let filetemp = $event.target.files[0];

    //console.log('filetemp.name', filetemp.name);
    //console.log('filetemp.name.length', filetemp.name.length);
    if (filetemp.name.length < 26) {
      if (filetemp.type.endsWith('pdf')) {
        this.fileToUpload = $event.target.files[0];
        this.InputPdf.nativeElement.innerText = this.fileToUpload.name;
        this.alertService.close("");
        this.isValidDoc = false;
        this.isValidDocPdf = false;
      } else {
        this.InputPdf.nativeElement.value = null;
        this.InputPdf.nativeElement.innerText = "Seleccionar archivo...";
        this.isValidDoc = true;
        this.isValidDocPdf = true;
      }
    } else {
      this.alertService.warning("El nombre del documento debe tener menos de 26 caracteres.");
    }
    //console.log('this.fileToUpload', this.fileToUpload);
  }


  async fnRegistrar(form: NgForm, contentGuardar: any, contentActualizar: any) {
    //console.log('this.fileToUpload', this.fileToUpload);
    this.loading = true;
    this.submitForm = true;

    if (this.oMunicipalidad.nIdMunicipalidad == -1) {
      this.solicitud.oMunicipalidad = this.oMunicipalidad;
    } else {
      this.solicitud.oMunicipalidad!.nIdMunicipalidad = this.oMunicipalidad.nIdMunicipalidad;
    }


    //INSERTAR
    if (this.InsertarSolicitud == true) {
      //console.log('ESTÁ EN INSERTAR');
      if (this.fileToUpload == undefined) {
        this.loading = false;
        this.isValidDoc = true;
        return;
      }

      if (form.invalid || !this.solicitud.sNombre || !this.solicitud.sApellidoPaterno || !this.solicitud.sApellidoMaterno) {
        //this.isValidDoc = true;
        this.loading = false;
        this.alertService.warning("Ingrese los datos obligatorios del formulario.");
        return;
      }
      //console.log('NO RETORNA')
      //Subir archivo pdf
      let data = await lastValueFrom(this.fileService.uploadFile(this.fileToUpload));
      if (data.exito) {
        this.solicitud.sNombreDocumento = data.datoAdicional.sNombreDocumento;
        this.solicitud.sUidDocumento = data.datoAdicional.sUidDocumento;

        //console.log('1 Está en insertar solicitud', this.solicitud);
        //Registra solicitud
        this.solicitudUsuarioService.registrar(this.solicitud).subscribe({
          next: data => {
            if (data.exito) {
              //console.log('2 Está en insertar solicitud', this.solicitud);
              //console.log('registrar', data);
              this.mensajeModal = data.mensajeUsuario;
              this.modalService.open(contentGuardar, { centered: true, backdrop: 'static' });
            } else {
              this.alertService.error(data.mensajeUsuario);
            }
            this.loading = false;
          },
          error: err => {
            this.loading = false;
            this.alertService.error(err.error.mensajeUsuario);
          }
        })
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
      //ACTUALZIAR
    } else if ((this.InsertarSolicitud == false)) {
      //console.log('ESTÁ EN ACTUALIZAR');
      if (form.invalid || !this.solicitud.sNombre || !this.solicitud.sApellidoPaterno || !this.solicitud.sApellidoMaterno) {
        //this.isValidDoc = true;
        this.submitForm = true;
        this.loading = false;
        this.alertService.warning("Ingrese los datos obligatorios del formulario.");
        return;
      }

      if (this.fileToUpload !== undefined) {
        //console.log('Se está subiendo pdf en Actualizar');
        //Subir archivo pdf
        let data = await lastValueFrom(this.fileService.uploadFile(this.fileToUpload));
        if (data.exito) {
          this.solicitud.sNombreDocumento = data.datoAdicional.sNombreDocumento;
          this.solicitud.sUidDocumento = data.datoAdicional.sUidDocumento;

          if (this.oMunicipalidad.nIdMunicipalidad == -1) {
            this.solicitud.oMunicipalidad = this.oMunicipalidad;
          } else {
            this.solicitud.oMunicipalidad!.nIdMunicipalidad = this.oMunicipalidad.nIdMunicipalidad;
          }
        }
      }
      delete this.solicitud.oMunicipalidad;
      //console.log('Actualizar this.solicitud:', this.solicitud);
      this.solicitudUsuarioService.actualizar(this.solicitud).subscribe({
        next: data => {
          //console.log(data)
          if (data.exito) {
            //console.log('registrar', data);
            this.mensajeModal = data.mensajeUsuario;
            this.modalService.open(contentActualizar, { centered: true, backdrop: 'static' });
          } else {
            this.alertService.error(data.mensajeUsuario);
          }
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.alertService.error(err.error.mensajeUsuario);
        }
      })
    }
  }

  async fnCambiarRuc() {
    this.disabledRuc = false;
    this.loadingCambiarRuc = true;
    this.fShowCambiarRuc = false;
    this.oMunicipalidad.nRuc = '';
    this.oMunicipalidad.sNombre = '';
    this.oMunicipalidad.sTipo = '';
    this.defaultUbigeo();
    this.loadingCambiarRuc = false;
  }

  async fnCambiarDNI() {
    this.disabledDNI = false;
    this.loadingCambiarDNI = true;
    this.fShowCambiarDNI = false;
    this.solicitud.sDNI = null!;
    this.solicitud.sNombre = '';
    this.solicitud.sApellidoMaterno = '';
    this.solicitud.sApellidoPaterno = '';
    this.loadingCambiarDNI = false;
  }

  async fnDescargarFormato() {
    //console.log(this.getDescargas.FDJ_Codigo, this.getDescargas.FDJ_Nombre)
    try {
      let data = await lastValueFrom(this.fileService.downloadFile(this.getDescargas.FDJ_Codigo));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = this.getDescargas.FDJ_Nombre;
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  fnClose(modalSolicitud: any) {
    modalSolicitud.close();
    this.router.navigate(['/']);
  }

  async fnDepartamento() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDepartamento());
      if (data.exito) {
        this.lstDepartamento = data.datoAdicional;
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnProvincia() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarProvincia(this.oMunicipalidad?.sDepartamento));
      if (data.exito) {
        this.lstProvincia = data.datoAdicional;
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  changeDepartamento() {
    this.fnProvincia();
    this.oMunicipalidad.sProvincia = "Provincia";
    this.oMunicipalidad.sDistrito = "Distrito";
  }

  async fnDistrito() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDistrito(this.oMunicipalidad?.sDepartamento, this.oMunicipalidad?.sProvincia));
      if (data.exito) {
        this.lstDistrito = data.datoAdicional;
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }

  }

  changeProvincia() {
    this.fnDistrito();
    this.oMunicipalidad.sDistrito = "Distrito";
  }

  async fnDescargarDocumento() {
    try {
      //console.log('this.sUidDocumento', this.sUidDocumento);
      let data = await lastValueFrom(this.fileService.downloadFile(this.sUidDocumento));
      const blob = new Blob([data], { type: "application/pdf" })
      let filename = this.sNombreDocumento;

      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  defaultUbigeo() {
    this.oMunicipalidad.sDepartamento = "Departamento";
    this.oMunicipalidad.sProvincia = "Provincia";
    this.oMunicipalidad.sDistrito = "Distrito";
  }
}



