import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './pages/operaciones/inicio-sesion/inicio-sesion.component';
import { InformacionEmpresaComponent } from './pages/operaciones/informacion-empresa/informacion-empresa.component';
import { PeriodosCalculoComponent } from './pages/operaciones/periodos-calculo/periodos-calculo.component';
import { DatosActividadComponent } from './pages/operaciones/datos-actividad/datos-actividad.component';
import { EmisionesGeiComponent } from './pages/reportes/emisiones-gei/emisiones-gei.component';
import { IndicadoresGeiComponent } from './pages/reportes/indicadores-gei/indicadores-gei.component';
import { EvolucionAnualComponent } from './pages/reportes/evolucion-anual/evolucion-anual.component';
import { PanelComparativoComponent } from './pages/reportes/panel-comparativo/panel-comparativo.component';
import { EmpresasComponent } from './pages/operaciones/gestion-empresas/gestion-empresas.component';
import { BitacoraLogComponent } from './pages/operaciones/bitacora-log/bitacora-log.component';
import { LoadingLoginComponent } from './pages/operaciones/loading-login/loading-login.component';
import { EsLogin } from './utils/admin.guard';

const routes: Routes = [
  { path: '', component: InicioSesionComponent },
  { path: 'informacion-empresa', component: InformacionEmpresaComponent, canActivate: [EsLogin] },
  { path: 'periodos-calculo', component: PeriodosCalculoComponent, canActivate: [EsLogin] },
  { path: 'gestionar-periodo', component: PeriodosCalculoComponent, canActivate: [EsLogin] },
  { path: 'gestion-empresas', component: EmpresasComponent, canActivate: [EsLogin] },
  { path: 'mis-datos-actividad', component: DatosActividadComponent, canActivate: [EsLogin] },
  { path: 'datos-actividad', component: DatosActividadComponent },
  { path: 'rpt-emisiones-gei', component: EmisionesGeiComponent, canActivate: [EsLogin] },
  { path: 'rpt-emisiones-gei-adm', component: EmisionesGeiComponent, canActivate: [EsLogin] },
  { path: 'rpt-evolucion-anual', component: EvolucionAnualComponent, canActivate: [EsLogin] },
  { path: 'rpt-indicadores-gei', component: IndicadoresGeiComponent, canActivate: [EsLogin] },
  { path: 'rpt-panel-comparativo', component: PanelComparativoComponent, canActivate: [EsLogin] },
  { path: 'bitacora-log', component: BitacoraLogComponent, canActivate: [EsLogin] },
  { path: 'loading', component: LoadingLoginComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
