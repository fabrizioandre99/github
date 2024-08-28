import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-logout',
  templateUrl: './modal-logout.component.html',
  styleUrls: ['./modal-logout.component.css']
})
export class ModalLogoutComponent implements OnInit {
  loading: Boolean = false;
  constructor(private modalService: NgbModal, public router: Router) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  logout() {
    this.loading = true;
    localStorage.clear();
    this.router.navigate(['/']);
    this.modalService.dismissAll();
  }
}
