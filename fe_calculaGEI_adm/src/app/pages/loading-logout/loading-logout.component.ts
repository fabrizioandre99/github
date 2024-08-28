import { Component, OnInit } from '@angular/core';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-loading-logout',
  templateUrl: './loading-logout.component.html',
  styleUrls: ['./loading-logout.component.css']
})
export class LoadingLogoutComponent implements OnInit {

  constructor(private localDataService: LocalDataService) { }

  ngOnInit(): void {
    this.localDataService.removeLocalStorage();
  }

}
