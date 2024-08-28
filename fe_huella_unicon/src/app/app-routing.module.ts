import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoUsuarioComponent } from './pages/administracion/acceso-usuario/acceso-usuario.component';
import { InicioComponent } from './pages/operaciones/inicio/inicio.component';
import { InicioSesionComponent } from './pages/operaciones/inicio-sesion/inicio-sesion.component';
import { BandejaUsuariosComponent } from './pages/operaciones/bandeja-usuarios/bandeja-usuarios.component';
import { NuevaContrasenaComponent } from './pages/operaciones/nueva-contrasena/nueva-contrasena.component';
import { CodigoConfirmacionComponent } from './pages/operaciones/codigo-confirmacion/codigo-confirmacion.component';
import { BandejaPeriodosComponent } from './pages/operaciones/bandeja-periodos/bandeja-periodos.component';
import { NivelActividadComponent } from './pages/operaciones/nivel-actividad/nivel-actividad.component';
import { ResultadosGeiComponent } from './pages/operaciones/resultados-gei/resultados-gei.component';
import { BitacoraUsuarioComponent } from './pages/administracion/bitacora-usuario/bitacora-usuario.component';
import { BitacoraErroresComponent } from './pages/administracion/bitacora-errores/bitacora-errores.component';
import { FactorEmisionComponent } from './pages/operaciones/factor-emision/factor-emision.component';
import { ParametrosSistemaComponent } from './pages/operaciones/parametros-sistema/parametros-sistema.component';
import { DistribucionMensualComponent } from './pages/operaciones/distribucion-mensual/distribucion-mensual.component';
import { EmisionesPlantaComponent } from './pages/operaciones/emisiones-planta/emisiones-planta.component';
import { DistanciasAereasComponent } from './pages/mantenimientos/distancias-aereas/distancias-aereas.component';
import { DistanciasTerrestresComponent } from './pages/mantenimientos/distancias-terrestres/distancias-terrestres.component';
import { IndicadoresGeiComponent } from './pages/reportes/indicadores-gei/indicadores-gei.component';
import { RegistroCategoriasComponent } from './pages/mantenimientos/registro-categorias/registro-categorias.component';
import { UnidadesNegocioComponent } from './pages/mantenimientos/unidades-negocio/unidades-negocio.component';
import { LocacionesComponent } from './pages/mantenimientos/locaciones/locaciones.component';
import { EsLogin, EsLogout } from './utils/admin.guard';

const routes: Routes = [
  { path: '', component: InicioSesionComponent },
  { path: 'home', component: InicioComponent, canActivate: [EsLogin] },
  { path: 'acceso-usuario', component: AccesoUsuarioComponent, canActivate: [EsLogin] },
  { path: 'bandeja-usuarios', component: BandejaUsuariosComponent, canActivate: [EsLogin] },
  { path: 'bandeja-periodos', component: BandejaPeriodosComponent, canActivate: [EsLogin] },
  { path: 'nueva-contrasena', component: NuevaContrasenaComponent, canActivate: [EsLogout] },
  { path: 'codigo-confirmacion', component: CodigoConfirmacionComponent },
  { path: 'nivel-actividad', component: NivelActividadComponent, canActivate: [EsLogin] },
  { path: 'resultados-gei', component: ResultadosGeiComponent, canActivate: [EsLogin] },
  { path: 'bitacora-usuario', component: BitacoraUsuarioComponent, canActivate: [EsLogin] },
  { path: 'bitacora-log', component: BitacoraErroresComponent, canActivate: [EsLogin] },
  { path: 'factor-emision', component: FactorEmisionComponent, canActivate: [EsLogin] },
  { path: 'parametros-sistema', component: ParametrosSistemaComponent, canActivate: [EsLogin] },
  { path: 'distribucion-mensual', component: DistribucionMensualComponent },
  { path: 'emision-planta', component: EmisionesPlantaComponent, canActivate: [EsLogin] },
  { path: 'distancia-aerea', component: DistanciasAereasComponent, canActivate: [EsLogin] },
  { path: 'distancia-terrestre', component: DistanciasTerrestresComponent, canActivate: [EsLogin] },
  { path: 'indicadores-gei', component: IndicadoresGeiComponent, canActivate: [EsLogin] },
  { path: 'categorias', component: RegistroCategoriasComponent, canActivate: [EsLogin] },
  { path: 'unidades-negocio', component: UnidadesNegocioComponent, canActivate: [EsLogin] },
  { path: 'locaciones', component: LocacionesComponent, canActivate: [EsLogin] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],

  exports: [RouterModule]
})
export class AppRoutingModule { }
