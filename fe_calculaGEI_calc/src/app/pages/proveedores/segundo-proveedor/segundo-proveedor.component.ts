import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-segundo-proveedor',
  templateUrl: './segundo-proveedor.component.html',
  styleUrls: ['./segundo-proveedor.component.css']
})
export class SegundoProveedorComponent implements OnInit {
  proveedor2Form!: FormGroup;
  proveedor2: any = {};
  consumo: any = {};
  submitted = false;
  lstProveedor: any;
  fShow = false;
  numero = this.sharedData.itemConsumo.numero;

  constructor(private formBuilder: FormBuilder, private dataService: DataService, private sharedData: SharedDataService, private router: Router) { }

  ngOnInit(): void {
    this.proveedor2Form = this.formBuilder.group({
      proveedorEnergiaDto: [null],
      check: [''],
      consumo_prom_ee: ['', [Validators.required, Validators.min(0), Validators.max(999999999999999.99)]],
      decision: ['', Validators.required],
      cert_renovable: [''],
    },);

    this.proveedor2.proveedorEnergiaDto = 1;

    this.fnProveedor();

    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.proveedor2Form.disable();
    }

    if (this.sharedData.itemProveedor2 != null) {
      this.proveedor2 = this.sharedData.itemProveedor2;
    }
    if (this.proveedor2.check == true) {
      this.fShow = true;
      this.proveedor2Form.controls["proveedorEnergiaDto"].clearValidators();
      this.proveedor2Form.controls["proveedorEnergiaDto"].updateValueAndValidity();
    }

  }

  get f() { return this.proveedor2Form.controls; }

  decision() {
    if (this.proveedor2.decision == 'Si') {
      this.proveedor2Form.controls["cert_renovable"].setValidators([Validators.required]);
      this.proveedor2Form.controls["cert_renovable"].updateValueAndValidity();
    } else if (this.proveedor2.decision == 'No') {
      this.proveedor2Form.controls["cert_renovable"].clearValidators();
      this.proveedor2Form.controls["cert_renovable"].updateValueAndValidity();
    }
  }

  fnSearch(term: string, item: any) {

    return item.nombre.toLowerCase().startsWith(term.toLowerCase())
  }


  onSubmit() {
    this.submitted = true;
    if (this.proveedor2Form.invalid) {
      return;
    }
    if (this.proveedor2.decision == 'No') {
      this.proveedor2.cert_renovable = 'No'
    }

    this.sharedData.setProveedor2(this.proveedor2);

    //Routerlink Condición
    if (this.numero == 3) {
      this.router.navigate(["/datos-consumo/3"]);
    } else {
      this.router.navigate(["/datos-contacto"]);
    }
  }

  fnProveedor() {
    this.dataService.listarProveedor().subscribe(
      {
        next: data => {
          //Eliminar dato repetido de prov 1 y 2
          if (data.exito) {
            this.lstProveedor = data.datoAdicional;
            if (this.sharedData.itemProveedor1.proveedorEnergiaDto !== 1) {
              this.lstProveedor = this.lstProveedor.filter((dato: { id_proveedor_ee: number; }) => dato.id_proveedor_ee != this.sharedData.itemProveedor1.proveedorEnergiaDto);
            }
          }
          //Limpiar casilla si el usuario retorna al prov 1 y 2, e ingresa el valor de prov 3
          if (((this.proveedor2.proveedorEnergiaDto == this.sharedData.itemProveedor1.proveedorEnergiaDto)
            || (this.proveedor2.proveedorEnergiaDto == this.sharedData.itemProveedor3?.proveedorEnergiaDto))
            && (this.sharedData.itemProveedor1.proveedorEnergiaDto !== 1)
          ) {
            this.proveedor2.proveedorEnergiaDto = null;
          }
        },
      })
  }

  retornar() {
    this.sharedData.setProveedor2(this.proveedor2);
    this.router.navigate(["/datos-consumo"]);
  }
}
