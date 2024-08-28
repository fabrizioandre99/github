import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
@Pipe({
  name: 'Busqueda',
  pure: false
})

export class BusquedaPipe implements PipeTransform {
  constructor(private router: Router) { }

  transform(gets: any[], search: any): any {
    if (this.router.url === '/gestion-empresas')
      return gets?.filter((item) => {
        return (!search.nombreEmpresa || item.sRazonSocial.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.nombreEmpresa.toLowerCase())) ||
          (item.sRazonSocial.toLowerCase().indexOf(search.nombreEmpresa.toLowerCase()) > -1)
      })

    if (this.router.url === '/informacion-empresa')
      return gets?.filter((item) => {
        return (!search.nombreLocacion || item.sNombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.nombreLocacion.toLowerCase())) ||
          (item.sNombre.toLowerCase().indexOf(search.nombreLocacion.toLowerCase()) > -1)
      })
  }


}
