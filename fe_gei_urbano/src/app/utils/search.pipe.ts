import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';

@Pipe({
  name: 'Busqueda',
  pure: false
})

export class BusquedaPipe implements PipeTransform {
  constructor(private router: Router) { }

  transform(gets: any[], search: any, campo?: string): any {
    if (this.router.url === '/bandeja-usuarios') {
      return gets?.filter((item) => {
        let nombreCompleto = item.sNombres + " " + item.sApellidoPat + " " + item.sApellidoMat;
        return (!search.sNombreyApellidos || nombreCompleto?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreyApellidos?.toLowerCase())) ||
          (nombreCompleto?.toLowerCase().indexOf(search.sNombreyApellidos?.toLowerCase()) > -1);
      });
    }

    if (this.router.url === '/rutas') {
      return gets?.filter((item) => {
        let nombreCompleto = item.sNombre;
        let nombrePlaca = item.sPlaca;

        // Verificar el campo sNombreRuta
        if (campo === 'sNombreRuta') {
          return (!search.sNombreRuta || nombreCompleto?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreRuta?.toLowerCase())) ||
            (nombreCompleto?.toLowerCase().indexOf(search.sNombreRuta?.toLowerCase()) > -1);
        }
        // Verificar el campo sPlaca
        else if (campo === 'sNombrePlaca') {
          return (!search.sNombrePlaca || nombrePlaca?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombrePlaca?.toLowerCase())) ||
            (nombrePlaca?.toLowerCase().indexOf(search.sNombrePlaca?.toLowerCase()) > -1);
        }

        return true;
      });
    }
  }
}
