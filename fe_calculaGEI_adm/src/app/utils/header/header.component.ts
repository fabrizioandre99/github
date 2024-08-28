import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: string | null;

  constructor(public router: Router) { }

  ngOnInit(): void {
    this.user = localStorage.getItem('SessionUser');
  }

  logout() {
    window.open('https://test-celepsa.alwa.pe/logout/', "_self");
  }
}
