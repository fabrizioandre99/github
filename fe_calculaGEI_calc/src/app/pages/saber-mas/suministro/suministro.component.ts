import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-suministro',
  templateUrl: './suministro.component.html',
  styleUrls: ['./suministro.component.css']
})
export class SuministroComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.2bcard.com/RonaldMartinez', "_blank");
  }

}
