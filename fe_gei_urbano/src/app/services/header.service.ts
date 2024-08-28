import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private toggleSubject = new BehaviorSubject<boolean>(true);

  toggleMenu() {
    this.toggleSubject.next(!this.toggleSubject.value);
  }

  CloseMenu() {
    if(this.toggleSubject.value == false) this.toggleSubject.next(!this.toggleSubject.value);
  }

  OpenMenu() {
    if(this.toggleSubject.value == true) this.toggleSubject.next(!this.toggleSubject.value);
  }

  getToggleObservable() {
    return this.toggleSubject.asObservable();
  }
}
