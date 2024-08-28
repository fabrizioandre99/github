import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-datos-empresa',
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.css']
})
export class DatosEmpresaComponent implements OnInit {
  empresaForm!: FormGroup;
  submitted = false;
  empresa: any = {};
  lstSector: any;

  constructor(private formBuilder: FormBuilder, private sharedData: SharedDataService, private router: Router,
    private dataService: DataService) { }

  ngOnInit() {
    this.empresaForm = this.formBuilder.group({
      razon_social: ['', [Validators.required, Validators.maxLength(250)]],
      ruc: ['', [Validators.required, Validators.min(9999999999), Validators.minLength(11),
      Validators.pattern("^[0-9]{11}$")]],
      sectorDto: [null, Validators.required],
    },);

    //Si shared data no es null
    if (this.sharedData.itemEmpresa != null) {
      this.empresa = this.sharedData.itemEmpresa;
      if (this.sharedData.itemEmpresa?.disabled == true) {
        this.empresaForm.disable();
      }
    }

    this.fnSector();
  }
  get f() { return this.empresaForm.controls; }

  fnSearch(term: string, item: any) {
    return item.nombre.toLowerCase().startsWith(term.toLowerCase())
  }

  onSubmit() {
    this.submitted = true;
    if (this.empresaForm.invalid) {
      return;
    }
    this.sharedData.setEmpresa(this.empresa);
    this.router.navigate(["/datos-consumo"]);
  }

  fnSector() {
    this.dataService.listarSector().subscribe(
      {
        next: data => {
          if (data.exito) {
            this.lstSector = data.datoAdicional;
          }
        },
      })
  }
  retornar() {
    this.sharedData.setEmpresa(this.empresa);
    this.router.navigate([""]);
  }

}
