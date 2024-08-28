import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-tercer-proveedor',
  templateUrl: './tercer-proveedor.component.html',
  styleUrls: ['./tercer-proveedor.component.css']
})
export class TercerProveedorComponent implements OnInit {
  proveedor3Form!: FormGroup;
  proveedor3: any = {};
  consumo: any = {};
  submitted = false;
  lstProveedor: any;
  fShow = false;
  numero = this.sharedData.itemConsumo.numero;

  constructor(private formBuilder: FormBuilder, private dataService: DataService, private sharedData: SharedDataService, private router: Router) { }

  ngOnInit(): void {
    this.proveedor3Form = this.formBuilder.group({
      proveedorEnergiaDto: [''],
      check: [''],
      consumo_prom_ee: ['', [Validators.required, Validators.min(0), Validators.max(999999999999999.99)]],
      decision: ['', Validators.required],
      cert_renovable: [''],
    },);

    this.proveedor3.proveedorEnergiaDto = 1;

    this.fnProveedor();

    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.proveedor3Form.disable();
    }

    if (this.sharedData.itemProveedor3 != null) {
      this.proveedor3 = this.sharedData.itemProveedor3;
    }
    if (this.proveedor3.check == true) {
      this.fShow = true;
      this.proveedor3Form.controls["proveedorEnergiaDto"].clearValidators();
      this.proveedor3Form.controls["proveedorEnergiaDto"].updateValueAndValidity();
    }

  }
  get f() { return this.proveedor3Form.controls; }

  decision() {
    if (this.proveedor3.decision == 'Si') {
      this.proveedor3Form.controls["cert_renovable"].setValidators([Validators.required]);
      this.proveedor3Form.controls["cert_renovable"].updateValueAndValidity();
    } else if (this.proveedor3.decision == 'No') {
      this.proveedor3Form.controls["cert_renovable"].clearValidators();
      this.proveedor3Form.controls["cert_renovable"].updateValueAndValidity();
    }
  }

  fnSearch(term: string, item: any) {
    return item.nombre.toLowerCase().startsWith(term.toLowerCase())
  }

  onSubmit() {

    this.submitted = true;
    if (this.proveedor3Form.invalid) {
      return;
    }
    if (this.proveedor3.decision == 'No') {
      this.proveedor3.cert_renovable = 'No'
    }
    if (this.proveedor3.check == true) {
      this.proveedor3.proveedorEnergiaDto = 1;
    }

    this.sharedData.setProveedor3(this.proveedor3);
    //Routerlink
    this.router.navigate(["/datos-contacto"]);
  }

  fnProveedor() {
    this.dataService.listarProveedor().subscribe(
      {
        next: data => {
          //Eliminar dato repetido de prov 1 y 2
          if (data.exito) {
            this.lstProveedor = data.datoAdicional;
            if (this.sharedData.itemProveedor2.proveedorEnergiaDto !== 1) {
              this.lstProveedor = this.lstProveedor.filter((dato: any) => dato.id_proveedor_ee != this.sharedData.itemProveedor1.proveedorEnergiaDto && dato.id_proveedor_ee != this.sharedData.itemProveedor2.proveedorEnergiaDto);
            }
          }
          //Limpiar casilla si el usuario retorna al prov 1 y 2, e ingresa el valor de prov 3
          if (((this.proveedor3.proveedorEnergiaDto == this.sharedData.itemProveedor1.proveedorEnergiaDto)
            || (this.proveedor3.proveedorEnergiaDto == this.sharedData.itemProveedor2?.proveedorEnergiaDto))
          ) {
            this.proveedor3.proveedorEnergiaDto = null;
          }
        },
      })
  }
  retornar() {
    this.sharedData.setProveedor3(this.proveedor3);
    this.router.navigate(["/datos-consumo"]);
  }
}
