import { Routes } from '@angular/router';
import { SolicitudParticipacionComponent } from './pages/operaciones/solicitud-participacion/solicitud-participacion.component';
import { InicioSesionComponent } from './pages/auth/inicio-sesion/inicio-sesion.component';
import { HomeComponent } from './pages/operaciones/home/home.component';
import { CodigoVerificacionComponent } from './pages/auth/codigo-verificacion/codigo-verificacion.component';
import { NuevaContrasenaComponent } from './pages/auth/nueva-contrasena/nueva-contrasena.component';
import { NuevaContrasena, isLogeado } from './utils/admin.guard';
import { GestionUsuariosComponent } from './pages/operaciones/gestion-usuarios/gestion-usuarios.component';
import { SolicitudesParticipacionComponent } from './pages/operaciones/gestion-participacion/gestion-participacion.component';
import { PerfilOrganizacionalComponent } from './pages/operaciones/perfil-organizacional/perfil-organizacional.component';
import { MisHcComponent } from './pages/operaciones/mis-hc/mis-hc.component';
import { LimitesInformeComponent } from './pages/operaciones/limites-informe/limites-informe.component';
import { IndicadoresDesempenoComponent } from './pages/operaciones/indicadores-desempeno/indicadores-desempeno.component';
import { ResultadoGeiComponent } from './pages/operaciones/resultado-gei/resultado-gei.component';
import { MisExclusionesComponent } from './pages/operaciones/mis-exclusiones/mis-exclusiones.component';
import { AccionesMitigacionComponent } from './pages/operaciones/acciones-mitigacion/acciones-mitigacion.component';
import { HcOrganizacionalComponent } from './pages/operaciones/hc-organizacional/hc-organizacional.component';
import { FuentesEmisionComponent } from './pages/mantenimientos/fuentes-emision/fuentes-emision.component';
import { SolicitudesReconocimientoComponent } from './pages/operaciones/solicitudes-reconocimiento/solicitudes-reconocimiento.component';
import { PotencialAtmosfericoComponent } from './pages/mantenimientos/potencial-atmosferico/potencial-atmosferico.component';
import { FactorCalculoComponent } from './pages/mantenimientos/factor-calculo/factor-calculo.component';
import { HomeSernaComponent } from './pages/operaciones/home-serna/home-serna.component';
import { BitacoraIncidenciasComponent } from './pages/operaciones/bitacora-incidencias/bitacora-incidencias.component';
import { ComparativoHistoricoComponent } from './pages/reportes/comparativo-historico/comparativo-historico.component';
import { ParametrosSistemaComponent } from './pages/operaciones/parametros-sistema/parametros-sistema.component';
import { BandejaDocumentosComponent } from './pages/operaciones/bandeja-documentos/bandeja-documentos.component';
import { MedidasMitigacionComponent } from './pages/operaciones/medidas-mitigacion/medidas-mitigacion.component';

export const routes: Routes = [
    { path: '', component: InicioSesionComponent },
    { path: 'solicitud-participacion', component: SolicitudParticipacionComponent },
    { path: 'solicitud-participacion/:token', component: SolicitudParticipacionComponent },
    { path: 'inicio-org', component: HomeComponent },
    { path: 'codigo-verificacion', component: CodigoVerificacionComponent },
    { path: 'nueva-contrasena', component: NuevaContrasenaComponent, canActivate: [NuevaContrasena] },
    { path: 'gestion-usuarios', component: GestionUsuariosComponent, canActivate: [isLogeado] },
    { path: 'gestion-participacion', component: SolicitudesParticipacionComponent, canActivate: [isLogeado] },
    { path: 'perfil-organizacional', component: PerfilOrganizacionalComponent, canActivate: [isLogeado] },
    { path: 'mis-hc', component: MisHcComponent, canActivate: [isLogeado] },
    { path: 'limites-informe', component: LimitesInformeComponent, canActivate: [isLogeado] },
    { path: 'indicadores-desempeno', component: IndicadoresDesempenoComponent, canActivate: [isLogeado] },
    { path: 'resultado-gei', component: ResultadoGeiComponent, canActivate: [isLogeado] },
    { path: 'mis-exclusiones', component: MisExclusionesComponent, canActivate: [isLogeado] },
    { path: 'acciones-mitigacion', component: AccionesMitigacionComponent, canActivate: [isLogeado] },
    { path: 'hc-organizacional', component: HcOrganizacionalComponent, canActivate: [isLogeado] },
    { path: 'fuentes-emision', component: FuentesEmisionComponent, canActivate: [isLogeado] },
    { path: 'solicitudes-reconocimiento', component: SolicitudesReconocimientoComponent, canActivate: [isLogeado] },
    { path: 'potencial-calentamiento', component: PotencialAtmosfericoComponent, canActivate: [isLogeado] },
    { path: 'factor-calculo', component: FactorCalculoComponent, canActivate: [isLogeado] },
    { path: 'inicio', component: HomeSernaComponent, canActivate: [isLogeado] },
    { path: 'bitacora-incidencias', component: BitacoraIncidenciasComponent, canActivate: [isLogeado] },
    { path: 'comparativo-historico', component: ComparativoHistoricoComponent, canActivate: [isLogeado] },
    { path: 'parametros-sistema', component: ParametrosSistemaComponent, canActivate: [isLogeado] },
    { path: 'bandeja-documentos', component: BandejaDocumentosComponent, canActivate: [isLogeado] },
    { path: 'medidas-mitigacion', component: MedidasMitigacionComponent, canActivate: [isLogeado] },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
