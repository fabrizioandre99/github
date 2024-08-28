import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],

})
export class InicioComponent implements OnInit {

  constructor(private sharedData: SharedDataService) {
  }

  ngOnInit(): void {
    if (this.sharedData.itemEmpresa?.disabled == true) {
      this.sharedData.setEmpresa(null);
      this.sharedData.setConsumo(null);
      this.sharedData.setProveedor1(null);
      this.sharedData.setProveedor2(null);
      this.sharedData.setProveedor3(null);
      this.sharedData.setPersonales(null);
    }
  }
}
