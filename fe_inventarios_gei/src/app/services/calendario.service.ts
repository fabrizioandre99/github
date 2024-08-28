import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})

export class CalendarioService extends NgbDateParserFormatter {

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split('/');
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): any {
    return date ? ('0' + date.day).slice(-2) + '/' + ('0' + date.month).slice(-2) + '/' + date.year : null;
  }
}
