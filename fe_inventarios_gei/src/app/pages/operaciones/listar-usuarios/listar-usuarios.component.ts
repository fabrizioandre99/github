import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UsuarioMinam } from 'src/app/models/usuario-minam';
import { IUsuario } from 'src/app/models/usuario';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { AlertService } from 'src/app/services/alert.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalDescargaComponent } from '../modal-descarga/modal-descarga.component';

@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.css']
})
export class ListarUsuariosComponent implements OnInit {
  fileName: any;
  lstUsuarioMinam: any[] = [];
  lstUsuarioExterno: any[];
  lstRol: any[];
  busqueda: any;
  oUsuario: IUsuario;
  page = 1;
  pageSize = 10;
  total = 0;
  regexCorreo = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
  regexPhone = /^\d{6,9}$/
  model: UsuarioMinam = new UsuarioMinam();
  blob: Blob;
  submit: boolean = false;
  loadingTable: Boolean = true;
  modalReference: NgbModalRef;

  @ViewChild("contentCargando", { static: true }) contentCargando: ElementRef;
  constructor(private usuarioService: UsuarioService, private seguridadService: SeguridadService,
    private alertService: AlertService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.model.nIdRol = 'seleccionar';
      this.fnUsuarioMinam();
      this.fnUsuarioExterno();
      this.fnRol();
    }
  }

  openModalCargando(contentCargando: any) {
    this.modalReference = this.modalService.open(contentCargando, { centered: true, backdrop: 'static', keyboard: false });
  }

  async fnUsuarioMinam() {
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuarioMinam());
      if (data.exito) {
        this.lstUsuarioMinam = data.datoAdicional;
        //console.log('this.lstUsuarioMinam', data);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnUsuarioExterno() {
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.listarUsuarioExterno());
      if (data.exito) {
        this.lstUsuarioExterno = data.datoAdicional;
        //console.log('this.lstUsuarioExterno', data);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.loadingTable = false;
  }

  async fnRol() {
    try {
      let data: IDataResponse = await lastValueFrom(this.seguridadService.listarRol());
      if (data.exito) {
        this.lstRol = data.datoAdicional;
        //console.log('this.lstRol', data);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnBuscarUsuario() {
    try {
      //console.log('this.model.sUsuario', this.model.sUsuario)
      let data: IDataResponse = await lastValueFrom(this.usuarioService.buscarUsuario(this.model.sUsuario));
      if (data.exito) {
        this.busqueda = data.datoAdicional;
        //console.log('this.busqueda.length', this.busqueda, this.busqueda?.toString().length);

      } else {
        this.busqueda = 0;
        //console.log('this.busqueda.length', this.busqueda, this.busqueda?.toString().length);
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnAgregarUsuario() {

    //this.alertService.error('Existen problemas en el servidor.');
    try {
      this.submit = true;


      if (!this.model.sUsuario || this.model.nIdRol == 'seleccionar') {
        return;
      }

      //Llamar buscar para obtenerel valor de this.busqueda y pueda llegar al servicio de Asginación.
      let firstData: IDataResponse = await lastValueFrom(this.usuarioService.buscarUsuario(this.model.sUsuario));
      if (firstData.exito) {
        //console.log('firstData', firstData);
        this.busqueda = firstData.datoAdicional;
        //console.log('this.busqueda', this.busqueda);
        //console.log('this.busqueda.length', this.busqueda, this.busqueda?.toString().length);
        let secondData: IDataResponse = await lastValueFrom(this.usuarioService.asignarRol(this.busqueda, this.model.nIdRol, 'A'));
        //console.log(this.busqueda);
        //console.log(this.model.nIdRol);
        if (secondData.exito) {
          this.model.sUsuario = '';
          this.model.nIdRol = 'seleccionar';
          this.submit = false;
          this.busqueda = [];
          this.fnUsuarioMinam();
          this.alertService.close("");
        } else {


          this.alertService.error(secondData.mensajeUsuario);
        }
      } else {
        this.busqueda = 0;
        this.alertService.error(firstData.mensajeUsuario);
      }
    } catch (error) {

      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnEliminarUsuario(item: any) {
    try {
      let data: IDataResponse = await lastValueFrom(this.usuarioService.asignarRol(item.nIdUsuario, item.nIdRol, 'D'));
      if (data.exito) {
        this.fnUsuarioMinam();
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  editarUsuario(item: any) {
    item.sCorreo_mod = item.sCorreo;
    item.sTelefono1_mod = item.sTelefono1;
    item.sEstadoRegistro_mod = item.sEstadoRegistro;
    item.edit = true;
  }
  async actualizarUsuario(item: any) {
    try {
      //console.log(!item.sCorreo_mod.trim());
      if (!item.sCorreo_mod.trim() || !item.sTelefono1_mod.trim() || !item.sEstadoRegistro_mod.trim()) {
        this.alertService.warning('Complete todos los campos');
        return
      }
      if (!this.regexCorreo.test(item.sCorreo_mod)) {
        this.alertService.warning('Ingrese un correo correcto.');
        return
      }

      if (!this.regexPhone.test(item.sTelefono1_mod)) {
        this.alertService.warning('Ingrese un número de teléfono de 6-9 dígitos.');
        return
      }

      item.sCorreo = item.sCorreo_mod.trim();
      item.sTelefono1 = item.sTelefono1_mod.trim();
      item.sEstadoRegistro = item.sEstadoRegistro_mod;


      const { sNombreInstitucion, sEstado, sCambiaClave, nIdRol, ...filteredObject } = item;
      //console.log('editado', filteredObject);
      let data: IDataResponse = await lastValueFrom(this.usuarioService.actualizarUsuario(filteredObject));
      if (!data.exito) {
        this.alertService.error(data.mensajeUsuario);
      }
      item.edit = false;
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDescargarUsuarios() {
    try {
      /*   this.openModalCargando(this.contentCargando); */
      this.modalService.open(ModalDescargaComponent, { centered: true, backdrop: 'static' });
      let data = await lastValueFrom(this.usuarioService.descargarUsuario());
      const blob = new Blob([data as BlobPart], { type: "application/xlsx" })
      let filename = 'Usuarios.xlsx';
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      // this.modalService.dismissAll();
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
    this.modalService.dismissAll();
  }
}
