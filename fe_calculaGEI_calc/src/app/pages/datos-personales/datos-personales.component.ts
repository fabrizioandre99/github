import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-datos-personales',
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css']
})
export class DatosPersonalesComponent implements OnInit {
  personalForm!: FormGroup;
  submitted = false;
  personales: any = {};
  obj: any;

  constructor(private formBuilder: FormBuilder, private dataService: DataService, private sharedData: SharedDataService, private router: Router) { }

  ngOnInit() {

    if (this.sharedData.itemPersonales != null) {
      this.personales = this.sharedData.itemPersonales;
    }

    this.personalForm = this.formBuilder.group({
      nomb_apell_contacto: ['', [Validators.required, Validators.maxLength(250),
      Validators.pattern('^[a-zñA-ZÑÀ-ÿ ]*$')]],
      area_contacto: ['', [Validators.required, Validators.maxLength(200),
      Validators.pattern('^[a-zñA-ZÑÀ-ÿ ]*$')]],
      correo_contacto: ['', [Validators.required, Validators.maxLength(150),
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      id_cliente: [''],
    },);


    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.personalForm.disable();
    }
  }
  get f() { return this.personalForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.personalForm.invalid) {
      return;
    }

    let obj = {
      ruc: this.sharedData.itemEmpresa.ruc,
      razon_social: this.sharedData.itemEmpresa.razon_social,
      sectorDto: this.sharedData.itemEmpresa.sectorDto,
      otro_sector: this.sharedData.itemEmpresa.otro_sector,
      proveedorEnergiaDto: this.sharedData.itemConsumo.proveedorEnergiaDto,
      consumo_prom_ee: this.sharedData.itemConsumo.consumo_prom_ee,
      cert_renovable: this.sharedData.itemConsumo.cert_renovable,
      nomb_apell_contacto: this.personales.nomb_apell_contacto,
      area_contacto: this.personales.area_contacto,
      correo_contacto: this.personales.correo_contacto,
      emisionGeiDto: [
        {
          proveedorEnergiaDto: this.sharedData.itemProveedor1.proveedorEnergiaDto,
          consumo_prom_ee: this.sharedData.itemProveedor1.consumo_prom_ee,
          cert_renovable: this.sharedData.itemProveedor1.cert_renovable,
        },
        {
          proveedorEnergiaDto: this.sharedData.itemProveedor2?.proveedorEnergiaDto,
          consumo_prom_ee: this.sharedData.itemProveedor2?.consumo_prom_ee,
          cert_renovable: this.sharedData.itemProveedor2?.cert_renovable,
        },
        {
          proveedorEnergiaDto: this.sharedData.itemProveedor3?.proveedorEnergiaDto,
          consumo_prom_ee: this.sharedData.itemProveedor3?.consumo_prom_ee,
          cert_renovable: this.sharedData.itemProveedor3?.cert_renovable,
        },
      ]
    }


    obj.emisionGeiDto = obj.emisionGeiDto.filter((dato: { proveedorEnergiaDto: any; }) => dato.proveedorEnergiaDto != undefined);

    this.sharedData.setPersonales(this.personales);

    if (this.personales.id_cliente == undefined) {
      this.dataService.InsertarCliente(obj).subscribe(
        {
          next: data => {
            this.sharedData.itemPersonales.id_cliente = data.datoAdicional;
            this.sharedData.setPersonales(this.personales);
          },
        })
    }
    this.router.navigate(["/emision-anual"]);
  }


  retornar() {
    this.sharedData.setPersonales(this.personales);
    this.router.navigate(["/datos-consumo"]);
  }

}
