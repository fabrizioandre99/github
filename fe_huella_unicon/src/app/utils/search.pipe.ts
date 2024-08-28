import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
@Pipe({
  name: 'Busqueda',
  pure: false
})

export class BusquedaPipe implements PipeTransform {
  constructor(private router: Router) { }

  transform(gets: any[], search: any): any {
    if (this.router.url === '/nivel-actividad')
      return gets?.filter((item) => {
        return (!search.oFuenteEmision.sNombre || item.oFuenteEmision.sNombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.oFuenteEmision.sNombre.toLowerCase())) ||
          (item.oFuenteEmision.sNombre.toLowerCase().indexOf(search.oFuenteEmision.sNombre.toLowerCase()) > -1)
      })

    if (this.router.url === '/bandeja-usuarios')
      return gets?.filter((item) => {
        let nombreCompleto = item.sNombres + " " + item.sApellidoPat + " " + item.sApellidoMat;
        return (!search.sNombreyApellidos || nombreCompleto?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreyApellidos?.toLowerCase())) ||
          (nombreCompleto?.toLowerCase().indexOf(search.sNombreyApellidos?.toLowerCase()) > -1
          )
      })

    if (this.router.url === '/distancia-aerea')
      return gets?.filter((item) => {
        return (!search.sSearchCodigo || item.sDestino.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sSearchCodigo.toLowerCase())) ||
          (item.sDestino.toLowerCase().indexOf(search.sSearchCodigo.toLowerCase()) > -1)
      })


    if (this.router.url === '/distancia-terrestre')
      return gets?.filter((item) => {
        return (!search.sSearchOrigen || item.sOrigen.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sSearchOrigen.toLowerCase())) ||
          (item.sOrigen.toLowerCase().indexOf(search.sSearchOrigen.toLowerCase()) > -1)
      })


    if (this.router.url === '/bitacora-usuario')
      return gets?.filter((item) => {
        return (!search.sNombreDocumento || item.sNombreDocumento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreDocumento.toLowerCase())) ||
          (item.sNombreDocumento.toLowerCase().indexOf(search.sNombreDocumento.toLowerCase()) > -1)
      })
  }


}
