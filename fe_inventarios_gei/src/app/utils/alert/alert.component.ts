import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  message: any;
  successMessage = '';

  isShown: boolean = false;

  Cerrar() {
    this.isShown = !this.isShown;
  }

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.subscription = this.alertService.getAlert()
      .subscribe(message => {
        switch (message && message.type) {
          case 'success':
            message.cssClass = 'alert alert-success';
            this.isShown = true;
            break;
          case 'danger':
            message.cssClass = 'alert alert-danger';
            this.isShown = true;
            break;
          case 'warning':
            message.cssClass = 'alert alert-warning';
            this.isShown = true;
            break;
          case 'close':
            this.isShown = false;
            break;
        }
        this.message = message;

      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeAlert() {
    this.alertService.clear();
  }
  reset() {
    this.alertService.getAlert();
  }
}
