import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css']
})
export class InicioSesionComponent implements OnInit {

  rutaRedict: String;

  constructor(private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    //console.log('ArrayMenu', localStorage.getItem('ArrayMenu'));
    //console.log('Session', localStorage.getItem('SessionRol'));
    if (localStorage.getItem('SessionRol') !== null) {
      this.router.navigate([localStorage.getItem('SessionRuta')]);
    }
  }

  login() {
    window.open('https://test-celepsa.alwa.pe/auth-home/', "_self");
  }

}
