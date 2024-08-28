import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
@Pipe({
  name: 'Busqueda',
  pure: false
})

export class BusquedaPipe implements PipeTransform {
  constructor(private router: Router) { }

  transform(gets: any[], search: any): any {
    if (this.router.url === '/bandeja-clientes')
      return gets?.filter((item) => {
        let sector = (item.oSectorDto?.id_sector === search.id_sector);
        let nombre = (!search.sRazonSocial || item.sRazonSocial?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sRazonSocial?.toLowerCase())) ||
          (item.sRazonSocial?.toLowerCase().indexOf(search.sRazonSocial?.toLowerCase()) > -1)
        let firstProv = item?.Emisiones?.[0]?.oProveedorEnergia?.nIdProveedor === search.nIdProveedor;
        let secondProv = item?.Emisiones?.[1]?.oProveedorEnergia?.nIdProveedor === search.nIdProveedor;
        let thirdProv = item?.Emisiones?.[2]?.oProveedorEnergia?.nIdProveedor === search.nIdProveedor;

        if ((search.id_sector == -1 && search.nIdProveedor == -1 && !search.sRazonSocial) || (!search.id_sector && !search.nIdProveedor && !search.sRazonSocial)
          || (search.id_sector == -1 && !search.nIdProveedor && !search.sRazonSocial) || (!search.id_sector && search.nIdProveedor == -1 && !search.sRazonSocial)) {
          return true;
        }
        if ((!search.id_sector || search.id_sector == -1) && search.nIdProveedor && !search.sRazonSocial) {
          return (firstProv || secondProv || thirdProv) && nombre;
        }
        if ((!search.nIdProveedor || search.nIdProveedor == -1) && search.id_sector && !search.sRazonSocial) {
          return sector && nombre;
        }
        if ((!search.id_sector || search.id_sector == -1) && (!search.nIdProveedor || search.nIdProveedor == -1) && search.sRazonSocial) {
          return nombre;
        }
        if (search.id_sector && search.nIdProveedor == -1 && search.sRazonSocial !== undefined) {
          return sector && nombre;
        }
        if (search.id_sector == -1 && search.nIdProveedor && search.sRazonSocial !== undefined) {
          return (firstProv || secondProv || thirdProv) && nombre;
        }
        return sector && (firstProv || secondProv || thirdProv) && nombre;
      }
      )

    if (this.router.url === '/bandeja-usuarios')
      return gets?.filter((item) => {
        let nombreCompleto = item.sNombre + " " + item.sApellPaterno + " " + item.sApellMaterno;
        return (!search.sNombreyApellidos || nombreCompleto?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.sNombreyApellidos?.toLowerCase())) ||
          (nombreCompleto?.toLowerCase().indexOf(search.sNombreyApellidos?.toLowerCase()) > -1
          )
      })

  }

}
