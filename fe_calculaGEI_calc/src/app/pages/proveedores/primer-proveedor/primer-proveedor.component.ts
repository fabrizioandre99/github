import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-primer-proveedor',
  templateUrl: './primer-proveedor.component.html',
  styleUrls: ['./primer-proveedor.component.css']
})
export class PrimerProveedorComponent implements OnInit {
  proveedor1Form!: FormGroup;
  proveedor1: any = {};
  consumo: any = {};
  submitted = false;
  lstProveedor: any;
  fShow = false;
  numero = this.sharedData.itemConsumo.numero;
  fshow: any;

  isOpen: Boolean = false;

  constructor(private formBuilder: FormBuilder, private dataService: DataService, private sharedData: SharedDataService, private router: Router) { }

  ngOnInit(): void {
    this.proveedor1Form = this.formBuilder.group({
      proveedorEnergiaDto: [null],
      check: [''],
      consumo_prom_ee: ['', [Validators.required, Validators.min(0), Validators.max(999999999999999.99)]],
      decision: ['', Validators.required],
      cert_renovable: [''],
      disabled: [''],
    },);

    this.proveedor1.proveedorEnergiaDto = 1;

    this.fnProveedor();

    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.proveedor1Form.disable();
    }
    if (this.sharedData.itemProveedor1 != null) {
      this.proveedor1 = this.sharedData.itemProveedor1;
    }
    if (this.proveedor1.check == true) {
      this.fShow = true;
      this.proveedor1Form.controls["proveedorEnergiaDto"].clearValidators();
      this.proveedor1Form.controls["proveedorEnergiaDto"].updateValueAndValidity();
    }
  }
  get f() { return this.proveedor1Form.controls; }

  decision() {
    if (this.proveedor1.decision == 'Si') {
      this.proveedor1Form.controls["cert_renovable"].setValidators([Validators.required]);
      this.proveedor1Form.controls["cert_renovable"].updateValueAndValidity();
    } else if (this.proveedor1.decision == 'No') {
      this.proveedor1Form.controls["cert_renovable"].clearValidators();
      this.proveedor1Form.controls["cert_renovable"].updateValueAndValidity();
    }
  }

  fnSearch(term: string, item: any) {
    return item.nombre.toLowerCase().startsWith(term.toLowerCase());
  }

  onSubmit() {
    this.submitted = true;
    if (this.proveedor1Form.invalid) {
      return;
    }
    this.proveedor1.disabled = false;

    if (this.proveedor1.decision == 'No') {
      this.proveedor1.cert_renovable = 'No';
    }

    if (this.proveedor1.check == true) {
      this.proveedor1.proveedorEnergiaDto = 1;
    }

    this.sharedData.setProveedor1(this.proveedor1);

    //Routerlink
    if (this.numero == 1) {
      this.router.navigate(["/datos-contacto"]);
    } else {
      this.router.navigate(["/datos-consumo/2"]);
    }

    //console.log('this.proveedor1', this.proveedor1)
  }

  fnProveedor() {
    this.dataService.listarProveedor().subscribe(
      {
        next: data => {
          if (data.exito) {
            this.lstProveedor = data.datoAdicional;
          }
        },
      })
  }

  retornar() {
    this.sharedData.setProveedor1(this.proveedor1);
    this.router.navigate(["/datos-consumo"]);
  }
}
