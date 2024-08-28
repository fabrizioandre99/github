import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IniciosesionComponent } from './pages/operaciones/inicio-sesion/inicio-sesion.component';
import { RegistrarSolicitudComponent } from './pages/operaciones/registrar-solicitud/registrar-solicitud.component';
import { ListarSolicitudComponent } from './pages/operaciones/listar-solicitud/listar-solicitud.component';
import { ListarUsuariosComponent } from './pages/operaciones/listar-usuarios/listar-usuarios.component';
import { ListarperiodoComponent } from './pages/operaciones/listar-periodo/listar-periodo.component';
import { ListarDatosComponent } from './pages/operaciones/listar-datos/listar-datos.component';
import { ListarInventariosComponent } from './pages/operaciones/listar-inventarios/listar-inventarios.component';
import { ResultadoGeiComponent } from './pages/operaciones/resultado-gei/resultado-gei.component';
import { HistorialPeriodosComponent } from './pages/operaciones/historial-periodos/historial-periodos.component';
import { BandejaNotificacionesComponent } from './pages/operaciones/bandeja-notificaciones/bandeja-notificaciones.component';
import { FactoresEmisionComponent } from './pages/mantenimiento/factores-emision/factores-emision.component';
import { BitacoraLogComponent } from './pages/operaciones/bitacora-log/bitacora-log.component';
import { CoeficienteAtmosfericoComponent } from './pages/mantenimiento/coeficiente-atmosferico/coeficiente-atmosferico.component';
import { FuenteEmisionComponent } from './pages/mantenimiento/fuente-emision/fuente-emision.component';
import { RecuperarContrasenaComponent } from './pages/operaciones/recuperar-contrasena/recuperar-contrasena.component';
import { CodigoConfirmacionComponent } from './pages/operaciones/codigo-confirmacion/codigo-confirmacion.component';
import { NuevaContrasenaComponent } from './pages/operaciones/nueva-contrasena/nueva-contrasena.component';
import { UsuariosBloqueadosComponent } from './pages/operaciones/usuarios-bloqueados/usuarios-bloqueados.component';
import { ReportesGeiComponent } from './pages/reportes/reportes-gei/reportes-gei.component';
import { EsAmbos, EsLogout, EsMINAM, EsMuni } from './utils/admin.guard';

const routes: Routes = [
  { path: '', component: IniciosesionComponent },
  { path: 'registrar-solicitud', component: RegistrarSolicitudComponent },
  { path: 'registrar-solicitud/:token', component: RegistrarSolicitudComponent },
  { path: 'listar-solicitud', component: ListarSolicitudComponent, canActivate: [EsMINAM] },
  { path: 'listar-periodo', component: ListarperiodoComponent, canActivate: [EsMuni] },
  { path: 'listar-usuarios', component: ListarUsuariosComponent, canActivate: [EsMINAM] },
  { path: 'listar-datos', component: ListarDatosComponent, canActivate: [EsAmbos] },
  { path: 'listar-inventarios', component: ListarInventariosComponent, canActivate: [EsMINAM] },
  { path: 'usuarios-bloqueados', component: UsuariosBloqueadosComponent, canActivate: [EsMINAM] },
  { path: 'resultados-gei', component: ResultadoGeiComponent, canActivate: [EsAmbos] },
  { path: 'historial-periodos', component: HistorialPeriodosComponent, canActivate: [EsMINAM] },
  { path: 'bandeja-notificaciones', component: BandejaNotificacionesComponent, canActivate: [EsMuni] },
  { path: 'factor-emision', component: FactoresEmisionComponent, canActivate: [EsMINAM] },
  { path: 'bitacora-log', component: BitacoraLogComponent, canActivate: [EsMINAM] },
  { path: 'coeficiente-atmosferico', component: CoeficienteAtmosfericoComponent, canActivate: [EsMINAM] },
  { path: 'fuente-emision', component: FuenteEmisionComponent, canActivate: [EsMINAM] },
  { path: 'reportes-gei', component: ReportesGeiComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },
  { path: 'codigo-confirmacion', component: CodigoConfirmacionComponent },
  { path: 'nueva-contrasena', component: NuevaContrasenaComponent, canActivate: [EsLogout] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
