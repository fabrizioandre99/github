import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-recomendaciones',
  templateUrl: './recomendaciones.component.html',
  styleUrls: ['./recomendaciones.component.css']
})
export class RecomendacionesComponent implements OnInit {
  recomendaciones: any;

  constructor(private sharedData: SharedDataService) { }

  ngOnInit(): void {

    this.recomendaciones = this.sharedData.itemPersonales?.id_cliente;
  }

  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.2bcard.com/RonaldMartinez', "_blank");
  }

}
