import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFormatDate]',
  standalone: true // Declarar la directiva como standalone
})
export class FormatDateDirective {
  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remover todo lo que no sea dígito

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 8);
    }

    input.value = value;
  }
}
