import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
@Pipe({
  name: 'Busqueda',
  pure: false
})

export class BusquedaPipe implements PipeTransform {
  constructor(private router: Router) { }

  transform(gets: any[], search: any): any {
    if (this.router.url === '/listar-solicitud')
      return gets?.filter((item) => {
        return (!search.oMunicipalidad.sNombre || item.oMunicipalidad.sNombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.oMunicipalidad.sNombre.toLowerCase())) ||
          (item.oMunicipalidad.sNombre.toLowerCase().indexOf(search.oMunicipalidad.sNombre.toLowerCase()) > -1)
      }
      )
    if (this.router.url === '/listar-periodo')
      return gets?.filter((item) => {
        return (!search.nAnio ||
          item.nAnio.toString().toLowerCase().indexOf(search.nAnio) !== -1)
      }
      )
    if (this.router.url === '/listar-usuarios')
      return gets?.filter((item) => {
        return (!search.sNombreInstitucion || item.sNombreInstitucion?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreInstitucion?.toLowerCase())) ||
          (item.sNombreInstitucion?.toLowerCase().indexOf(search.sNombreInstitucion?.toLowerCase()) > -1)
      }
      )
    if (this.router.url === '/factor-emision') {
      return gets?.filter((item) => {
        let sector = (!search.busqueda || item.oFuenteEmision?.sNombre?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.busqueda?.toLowerCase())) ||
          (item.oFuenteEmision?.sNombre?.toLowerCase().indexOf(search.busqueda?.toLowerCase()) > -1)

        return sector;
      })
    }
    if (this.router.url === '/usuarios-bloqueados')
      return gets?.filter((item) => {
        let sNombresCompletos = item.sNombre + ' ' + item.sApellido;
        return (!search.sNombre || sNombresCompletos?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombre?.toLowerCase())) ||
          (sNombresCompletos?.toLowerCase().indexOf(search.sNombre?.toLowerCase()) > -1)
      }
      )
    if (this.router.url === '/bandeja-notificaciones')
      return gets?.filter((item) => {
        return (!search.sEstadoActual || item.sEstadoActual?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sEstadoActual?.toLowerCase())) ||
          (item.sEstadoActual?.toLowerCase().indexOf(search.sEstadoActual?.toLowerCase()) > -1)
      }
      )
    if (this.router.url === '/listar-inventarios')
      return gets?.filter((item) => {
        return (!search.sNombre || item.oMunicipalidad.sNombre?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombre?.toLowerCase())) ||
          (item.oMunicipalidad.sNombre?.toLowerCase().indexOf(search.sNombre?.toLowerCase()) > -1)
      }
      )

    if (this.router.url === '/historial-periodos')
      return gets?.filter((item) => {
        return (!search.nAnio ||
          item.nAnio.toString().toLowerCase().indexOf(search.nAnio) !== -1)
      }
      )
  }
}
