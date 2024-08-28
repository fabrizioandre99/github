import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { EmpresaService } from 'src/app/services/empresa.service';
import { SeguridadService } from 'src/app/services/seguridad.service';

@Component({
  selector: 'app-loading-login',
  templateUrl: './loading-login.component.html',
  styleUrls: ['./loading-login.component.css']
})
export class LoadingLoginComponent implements OnInit {
  oUsuario: IUsuario | undefined;
  ackValue: any;
  firstRuta: any;

  constructor(private seguridadService: SeguridadService,
    private empresaService: EmpresaService, private toastr: ToastrService, private activedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.login();
  }

  async login() {
    try {
      //Obtener token
      this.ackValue = this.activedRoute.snapshot.queryParamMap.get('ACK');

      let data: IDataResponse = await lastValueFrom(this.seguridadService.login(this.ackValue));
      if (data.exito) {
        data.datoAdicional.liMenu.forEach(menu => {
          menu.liSubmenu = menu.liSubmenu.filter(submenu => submenu.sAccion !== '/administrar-accesos');
        });

        //Obtener la primera ruta sea de liMenu o de su hijo liSubmenu
        for (let i = 0; i < data.datoAdicional.liMenu.length; i++) {
          const menu = data.datoAdicional.liMenu[i];
          if (menu.sAccion && menu.sAccion.startsWith('/')) {
            this.firstRuta = menu.sAccion;
            continue;
          } else if (menu.liSubmenu && menu.liSubmenu.length > 0) {
            this.firstRuta = menu.liSubmenu[0].sAccion;
            break;
          }
        }

        localStorage.setItem('LocalUser_intercorp', data.datoAdicional.sNombres + " " + data.datoAdicional.sApPaterno + " " + data.datoAdicional.sApMaterno);

        localStorage.setItem('LocalMenu_intercorp', JSON.stringify(data.datoAdicional.liMenu));

        localStorage.setItem('LocalRutaInicial_intercorp', this.firstRuta);

        let dataGetID: IDataResponse = await lastValueFrom(this.empresaService.listarById(data.datoAdicional.sCodEmpresa));


        if (dataGetID.exito) {

          localStorage.setItem('LocalNombreComercial_intercorp', dataGetID.datoAdicional[0]?.sNombreComercial);

          localStorage.setItem('LocalIdEmpresa_intercorp', dataGetID.datoAdicional[0]?.nIdEmpresa);

          localStorage.setItem('LocalCodEmpresa_intercorp', dataGetID.datoAdicional[0]?.sCodEmpresa);

        } else {
          //this.toastr.warning(dataGetID.mensajeUsuario, 'Advertencia');
        }

        //Ingresar todas las rutas a un array
        let rutas: string[] = [];

        data.datoAdicional.liMenu.forEach((item) => {
          if (item.liSubmenu) {
            item.liSubmenu.forEach((submenuItem) => {
              rutas.push(submenuItem.sAccion);
            });
          }
        });
        localStorage.setItem('LocalRutas_intercorp', JSON.stringify(rutas));

        this.router.navigate([this.firstRuta]);

      } else {
        this.router.navigate(['/']);
        this.toastr.error(data.mensajeUsuario, 'Error');
      }
    } catch (error) {
      this.router.navigate(['/']);
      this.toastr.error('Existe error en el servicio. Intente más tarde.', 'Error');
    }
  }
}
