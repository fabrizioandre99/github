import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-alert',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input() msgError: string = '';
}
