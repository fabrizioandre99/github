import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { FactorEmision } from '../../../models/factorEmision';
import { IUsuario } from '../../../models/usuario';
import { FactorEmisionService } from '../../../services/factor-emision.service';
import { SeguridadService } from '../../../services/seguridad.service';

@Component({
  selector: 'app-factor-emision',
  templateUrl: './factor-emision.component.html',
  styleUrl: './factor-emision.component.css'
})
export class FactorEmisionComponent {
  oUsuario: IUsuario;
  lstFactorEmision: any[] = [];
  esRegexFactores = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;
  regexUnidadVC = /^(?!\.)(\d{1,8}|\d{1,8}[.]|\d{0,8}\.\d{0,10}?)$/;

  page = 1;
  pageSize = 10;
  total = 0;

  fShowSkeleton: boolean = false;
  loading: boolean = false;
  loadEliminar: boolean = false;
  loadGuardar: boolean = false;
  showCalcularGEI: boolean = false;

  lstSkeleton = Array(3);

  model: FactorEmision = new FactorEmision();
  modal: any = {};

  constructor(private seguridadService: SeguridadService, private toastr: ToastrService, private factorEmisionService: FactorEmisionService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      this.fnListarFactorEmision();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    // Formatear solo los decimales sin comas en las unidades
    const formattedDecimals = truncatedValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '');

    return formattedDecimals;
  }

  openConfirmacion(contentConfirmacion: any) {
    this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }


  async fnListarFactorEmision() {
    this.fShowSkeleton = true;
    try {
      let data: IDataResponse = await lastValueFrom(this.factorEmisionService.listarFactorEmision());
      if (data.exito) {
        this.page = 1;
        this.lstFactorEmision = data.datoAdicional;
        console.log('lstFactorEmision', this.lstFactorEmision);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    this.fShowSkeleton = false;
  }

  openEliminar(contentEliminar: any) {
    this.modalService.open(contentEliminar, { centered: true, windowClass: "modal-confirmacion", backdrop: 'static' });
  }

  editarFactor(item: any) {
    item.bdFeCO2_mod = item.bdFeCO2;
    item.bdFeCH4_mod = item.bdFeCH4;
    item.bdFeN2O_mod = item.bdFeN2O;   
    item.bdVCNCombustible_mod = item.bdVCNCombustible
    item.bdVCNMasa_mod = item.bdVCNMasa;;
    item.edit = true;
  }

  async actualizarFactorEmision(item: any) {
    if ((item.bdFeCO2 !== undefined && !this.esRegexFactores.test(item.bdFeCO2_mod)) ||
      (item.bdFeCH4 !== undefined && !this.esRegexFactores.test(item.bdFeCH4_mod)) ||
      (item.bdFeN2O !== undefined && !this.esRegexFactores.test(item.bdFeN2O_mod)) ||    
      (item.bdVCNCombustible !== undefined && !this.esRegexFactores.test(item.bdVCNCombustible_mod)) ||
      (item.bdVCNMasa !== undefined && !this.esRegexFactores.test(item.bdVCNMasa_mod))
      ) {
      this.toastr.warning('Solo se permiten un máximo de 8 unidades y 10 decimales en los factores de emisión.', 'Advertencia');
      return;
    }
    console.log(item.bdVCNMasa_mod);
    if (!item.bdFeCO2_mod?.toString().trim() ||
      !item.bdFeCH4_mod?.toString().trim() ||
      !item.bdFeN2O_mod?.toString().trim() ||    
      !item.bdVCNCombustible_mod?.toString().trim() || 
      (item.bdVCNMasa_mod !== undefined && !item.bdVCNMasa_mod?.toString().trim())
      ) {
      this.toastr.warning('Complete todos los campos', 'Advertencia');
      return;
    }

    const haCambiado = (
      item.bdFeCO2.toString() !== item.bdFeCO2_mod.toString() ||
      item.bdFeCH4.toString() !== item.bdFeCH4_mod.toString() ||
      item.bdFeN2O.toString() !== item.bdFeN2O_mod.toString() ||     
      item.bdVCNCombustible.toString() !== item.bdVCNCombustible_mod.toString() ||
      item.bdVCNMasa.toString() !== item.bdVCNMasa_mod.toString()
    );


    item.bdFeCO2 = item.bdFeCO2_mod;
    item.bdFeCH4 = item.bdFeCH4_mod;
    item.bdFeN2O = item.bdFeN2O_mod;  
    item.bdVCNCombustible = item.bdVCNCombustible_mod;
    item.bdVCNMasa = item.bdVCNMasa_mod;
    item.edit = false;


    let data: IDataResponse = await lastValueFrom(this.factorEmisionService.actualizarFactorEmision(
      item.sCodFactor,
      item.bdFeCO2_mod,
      item.bdFeCH4_mod,
      item.bdFeN2O_mod,      
      item.bdVCNCombustible_mod,
      item.bdVCNMasa_mod
    ));

    if (data.exito) {
      if (haCambiado) {
        this.showCalcularGEI = true;
        this.toastr.success(data.mensajeUsuario, 'Éxito');
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

}
