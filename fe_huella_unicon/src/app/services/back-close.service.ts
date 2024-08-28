import { Injectable } from '@angular/core';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalLogoutComponent } from '../pages/operaciones/modal-logout/modal-logout.component';

@Injectable({
  providedIn: 'root'
})
export class BackCloseService {

  constructor(private modalService: NgbModal, private router: Router) {
    window.addEventListener('popstate', () => {
      if (window.location.hash == '#/') {
        history.forward()
        this.modalService.dismissAll();
        this.modalService.open(ModalLogoutComponent, { centered: true, windowClass: "modal-xs" });
        window.location.hash = this.router.url;
      }
    });


  }
}
