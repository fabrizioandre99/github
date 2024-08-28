import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './pages/inicio-sesion/inicio-sesion.component';
import { BandejaUsuariosComponent } from './pages/bandeja-usuarios/bandeja-usuarios.component';
import { AccesoSistemaComponent } from './pages/acceso-sistema/acceso-sistema.component';
import { ProveedorEnergiaComponent } from './pages/proveedor-energia/proveedor-energia.component';
import { FactorEmisionComponent } from './pages/factor-emision/factor-emision.component';
import { BandejaClientesComponent } from './pages/bandeja-clientes/bandeja-clientes.component';
import { LoadingLoginComponent } from './pages/loading-login/loading-login.component';
import { LoadingLogoutComponent } from './pages/loading-logout/loading-logout.component';
import { hasAccess } from './utils/admin.guard';


const routes: Routes = [
  { path: '', component: InicioSesionComponent },
  { path: 'loading-login', component: LoadingLoginComponent },
  { path: 'loading-logout', component: LoadingLogoutComponent, canActivate: [hasAccess] },
  { path: 'bandeja-usuarios', component: BandejaUsuariosComponent, canActivate: [hasAccess] },
  { path: 'acceso-sistema', component: AccesoSistemaComponent, canActivate: [hasAccess] },
  { path: 'proveedor-energia', component: ProveedorEnergiaComponent, canActivate: [hasAccess] },
  { path: 'factor-emision', component: FactorEmisionComponent, canActivate: [hasAccess] },
  { path: 'bandeja-clientes', component: BandejaClientesComponent, canActivate: [hasAccess] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],

  exports: [RouterModule]
})
export class AppRoutingModule { }
