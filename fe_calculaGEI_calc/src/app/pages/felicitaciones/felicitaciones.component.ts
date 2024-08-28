import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-felicitaciones',
  templateUrl: './felicitaciones.component.html',
  styleUrls: ['./felicitaciones.component.css']
})
export class FelicitacionesComponent implements OnInit {

  Mayor = false;
  constructor(private sharedData: SharedDataService) {
  }

  ngOnInit(): void {

    if (this.sharedData.itemProveedor2?.consumo_prom_ee != null) {
      var item2 = this.sharedData.itemProveedor2.consumo_prom_ee;
    } else {
      item2 = 0;
    }
    if (this.sharedData.itemProveedor3?.consumo_prom_ee != null) {
      var item3 = this.sharedData.itemProveedor3.consumo_prom_ee;
    } else {
      item3 = 0;
    }
    if (this.sharedData.itemProveedor1?.consumo_prom_ee + item2 + item3 > 500000) {
      //console.log('item1', this.sharedData.itemProveedor1?.consumo_prom_ee);
      //console.log('item2', item2);
      //console.log('item3', item3);
      //console.log('Suma', this.sharedData.itemProveedor1?.consumo_prom_ee + item2 + item3);
      this.Mayor = true;
      //console.log('Es Mayor?', this.Mayor);
    } else {
      //console.log('item1', this.sharedData.itemProveedor1?.consumo_prom_ee);
      //console.log('item2', item2);
      //console.log('item3', item3);
      //console.log('Suma', this.sharedData.itemProveedor1?.consumo_prom_ee + item2 + item3);
      this.Mayor = false;
      //console.log('Es Mayor?', this.Mayor);
    }
  }

  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.com/', "_self");
  }
}
