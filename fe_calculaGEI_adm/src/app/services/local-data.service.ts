import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {
  constructor(private router: Router) {
  }

  removeLocalStorage() {
    localStorage.clear();
    // Obtener la cookie que se va a borrar
    let cookieEmail = 'correo';
    let cookieValue = '';
    document.cookie.split(';').forEach((cookie: string) => {
      if (cookie.indexOf(cookieEmail) === 0) {
        cookieValue = cookie.substring(cookieEmail.length + 1);
      }
    });
    // Borrar la cookie
    if (cookieValue !== '') {
      document.cookie = cookieEmail + '=' + cookieValue + '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    this.router.navigate(["/"]);
  }

}
