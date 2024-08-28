import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-autogeneracion',
  templateUrl: './autogeneracion.component.html',
  styleUrls: ['./autogeneracion.component.css']
})
export class AutogeneracionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  redict() {
    sessionStorage.clear();
    window.open('https://celepsa.2bcard.com/RonaldMartinez', "_blank");
  }

}
