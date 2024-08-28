import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-datos-consumo',
  templateUrl: './datos-consumo.component.html',
  styleUrls: ['./datos-consumo.component.css']
})
export class DatosConsumoComponent implements OnInit {
  consumoForm!: FormGroup;
  submitted = false;
  consumo: any = {};
  lstProveedor: any;

  constructor(private formBuilder: FormBuilder, private sharedData: SharedDataService, private router: Router) { }

  ngOnInit(): void {

    if (this.sharedData.itemConsumo != null) {
      this.consumo = this.sharedData.itemConsumo;
    }
    this.consumoForm = this.formBuilder.group({
      numero: ['', [Validators.required]],
    },);

    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.consumoForm.disable();
    }
  }
  get f() { return this.consumoForm.controls; }


  onSubmit() {
    this.submitted = true;
    if (this.consumoForm.invalid) {
      return;
    }
    if (this.consumo.numero == 1) {
      this.sharedData.setProveedor2(null);
      this.sharedData.setProveedor3(null);
    }
    else if (this.consumo.numero == 2) {
      this.sharedData.setProveedor3(null);
    }

    this.sharedData.setConsumo(this.consumo);
    this.router.navigate(["/datos-consumo/1"]);
  }

  retornar() {
    this.sharedData.setConsumo(this.consumo);
    this.router.navigate(["/datos-empresa"]);
  }

}
