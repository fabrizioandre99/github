import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BarraLateralComponent } from './pages/utils/barra-lateral/barra-lateral.component';
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
import { GoogleTagManagerModule } from 'angular-google-tag-manager';


@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    DatosEmpresaComponent,
    DatosConsumoComponent,
    CertificacionAlwaComponent,
    BarraLateralComponent,
    DatosPersonalesComponent,
    EmisionAnualComponent,
    RecomendacionesComponent,
    SuministroComponent,
    AutogeneracionComponent,
    EfEnergicaComponent,
    SostenibilidadComponent,
    PrimerProveedorComponent,
    SegundoProveedorComponent,
    TercerProveedorComponent,
    FelicitacionesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    GoogleTagManagerModule.forRoot({
      id: 'GTM-TQT6C7R',
    }),],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
