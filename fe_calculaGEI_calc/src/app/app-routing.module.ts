import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { DatosEmpresaComponent } from './pages/datos-empresa/datos-empresa.component';
import { DatosConsumoComponent } from './pages/datos-consumo/datos-consumo.component';
import { CertificacionAlwaComponent } from './pages/certificacion-alwa/certificacion-alwa.component';
import { DatosPersonalesComponent } from './pages/datos-personales/datos-personales.component';
import { EmisionAnualComponent } from './pages/emision-anual/emision-anual.component';
import { RecomendacionesComponent } from './pages/recomendaciones/recomendaciones.component';
import { SuministroComponent } from './pages/saber-mas/suministro/suministro.component';
import { AutogeneracionComponent } from './pages/saber-mas/autogeneracion/autogeneracion.component';
import { EfEnergicaComponent } from './pages/saber-mas/ef-energica/ef-energica.component';
import { SostenibilidadComponent } from './pages/saber-mas/sostenibilidad/sostenibilidad.component';
import { PrimerProveedorComponent } from './pages/proveedores/primer-proveedor/primer-proveedor.component';
import { SegundoProveedorComponent } from './pages/proveedores/segundo-proveedor/segundo-proveedor.component';
import { TercerProveedorComponent } from './pages/proveedores/tercer-proveedor/tercer-proveedor.component';
import { FelicitacionesComponent } from './pages/felicitaciones/felicitaciones.component';

const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'certificacion-alwa', component: CertificacionAlwaComponent },
  { path: 'datos-empresa', component: DatosEmpresaComponent },
  { path: 'datos-consumo', component: DatosConsumoComponent },
  { path: 'datos-contacto', component: DatosPersonalesComponent },
  { path: 'emision-anual', component: EmisionAnualComponent },
  { path: 'recomendaciones', component: RecomendacionesComponent },
  { path: 'suministro', component: SuministroComponent },
  { path: 'autogeneracion', component: AutogeneracionComponent },
  { path: 'ef-energia', component: EfEnergicaComponent },
  { path: 'sostenibilidad', component: SostenibilidadComponent },
  { path: 'datos-consumo/1', component: PrimerProveedorComponent },
  { path: 'datos-consumo/2', component: SegundoProveedorComponent },
  { path: 'datos-consumo/3', component: TercerProveedorComponent },
  { path: 'felicitaciones', component: FelicitacionesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
