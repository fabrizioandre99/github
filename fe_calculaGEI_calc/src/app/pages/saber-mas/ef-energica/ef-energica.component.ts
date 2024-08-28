import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ef-energica',
  templateUrl: './ef-energica.component.html',
  styleUrls: ['./ef-energica.component.css']
})
export class EfEnergicaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.2bcard.com/RonaldMartinez', "_blank");
  }
}
