import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './pages/login/inicio-sesion/inicio-sesion.component';
import { CodigoConfirmacionComponent } from './pages/login/codigo-confirmacion/codigo-confirmacion.component';
import { NuevaContrasenaComponent } from './pages/login/nueva-contrasena/nueva-contrasena.component';
import { BandejaUsuariosComponent } from '../app/pages/administracion/bandeja-usuarios/bandeja-usuarios.component';
import { AccesoSistemaComponent } from './pages/administracion/acceso-sistema/acceso-sistema.component';
import { RutasComponent } from './pages/configuracion/rutas/rutas.component';
import { ParametrosSistemaComponent } from './pages/configuracion/parametros-sistema/parametros-sistema.component';
import { BitacoraErroresComponent } from './pages/administracion/bitacora-errores/bitacora-errores.component';
import { FactorEmisionComponent } from './pages/configuracion/factor-emision/factor-emision.component';
import { Page404Component } from './error/page-404/page-404.component';
import { Page500Component } from './error/page-500/page-500.component';
import { EsLogout } from './utils/admin.guard';
import { PeriodosComponent } from './pages/operacion/periodos/periodos.component';
import { DatosActividadComponent } from './pages/operacion/datos-actividad/datos-actividad.component';
import { ResultadoGeiComponent } from './pages/reporte/resultado-gei/resultado-gei.component';
import { HistoricoComponent } from './pages/reporte/dashboard/historico/historico.component';
import { RutaComponent } from './pages/reporte/dashboard/ruta/ruta.component';
import { ResumenAnualComponent } from './pages/reporte/dashboard/resumen-anual/resumen-anual.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { TecnologiasComponent } from './pages/configuracion/tecnologias/tecnologias.component';
import { FactorEmisionNivel2Component } from './pages/configuracion/factor-emision-nivel2/factor-emision-nivel2.component';
import { NavbarFeComponent } from './shared/navbar-fe/navbar-fe.component';



const routes: Routes = [
  { path: '', component: InicioSesionComponent },
  { path: 'codigo-confirmacion', component: CodigoConfirmacionComponent },
  { path: 'nueva-contrasena', component: NuevaContrasenaComponent },
  { path: 'bandeja-usuarios', component: BandejaUsuariosComponent },
  { path: 'acceso-sistema', component: AccesoSistemaComponent },
  { path: 'rutas', component: RutasComponent },
  { path: 'tecnologia', component: TecnologiasComponent },
  { path: 'factor-emision-nivel2', component: FactorEmisionNivel2Component },
  { path: 'parametros-sistema', component: ParametrosSistemaComponent },
  { path: 'bitacora-errores', component: BitacoraErroresComponent },
  { path: 'factor-emision', component: FactorEmisionComponent },
  { path: 'periodos', component: PeriodosComponent },
  { path: 'datos-actividad', component: DatosActividadComponent },
  { path: 'resultado-gei', component: ResultadoGeiComponent },
  { path: 'dashboard-historico', component: HistoricoComponent,
    children: [
    { path: 'dashboard-resumenAnual', component: ResumenAnualComponent },
    { path: 'dashboard-ruta', component: RutaComponent }
    ]  },
  { path: 'dashboard-resumenAnual', component: ResumenAnualComponent },
  { path: 'dashboard-ruta', component: RutaComponent },
  { path: 'navbar-factor', component: NavbarFeComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'error-500', component: Page500Component },
  { path: '**', component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],

  exports: [RouterModule]
})
export class AppRoutingModule { }
