import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sostenibilidad',
  templateUrl: './sostenibilidad.component.html',
  styleUrls: ['./sostenibilidad.component.css']
})
export class SostenibilidadComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.2bcard.com/RonaldMartinez', "_blank");
  }

}
