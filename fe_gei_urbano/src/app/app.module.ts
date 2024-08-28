import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from "@angular/common";
import { CommonModule } from '@angular/common';

import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { InicioSesionComponent } from './pages/login/inicio-sesion/inicio-sesion.component';
import { CodigoConfirmacionComponent } from './pages/login/codigo-confirmacion/codigo-confirmacion.component';
import { NuevaContrasenaComponent } from './pages/login/nueva-contrasena/nueva-contrasena.component';

import { MenuComponent } from '../app/shared/menu/menu.component';
import { HeaderComponent } from '../app/shared/header/header.component';

import { BandejaUsuariosComponent } from '../app/pages/administracion/bandeja-usuarios/bandeja-usuarios.component';
import { AccesoSistemaComponent } from './pages/administracion/acceso-sistema/acceso-sistema.component';
import { RutasComponent } from './pages/configuracion/rutas/rutas.component';
import { ParametrosSistemaComponent } from './pages/configuracion/parametros-sistema/parametros-sistema.component';
import { BitacoraErroresComponent } from './pages/administracion/bitacora-errores/bitacora-errores.component';

import { Page404Component } from './error/page-404/page-404.component';
import { Page500Component } from './error/page-500/page-500.component';

import { BusquedaPipe } from './utils/search.pipe';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
import { NgOtpInputModule } from 'ng-otp-input';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { CalendarioService } from './services/calendario.service';
import { FactorEmisionComponent } from './pages/configuracion/factor-emision/factor-emision.component';
import { PeriodosComponent } from './pages/operacion/periodos/periodos.component';
import { DatosActividadComponent } from './pages/operacion/datos-actividad/datos-actividad.component';
import { ResultadoGeiComponent } from './pages/reporte/resultado-gei/resultado-gei.component';
import { HistoricoComponent } from './pages/reporte/dashboard/historico/historico.component';
import { ResumenAnualComponent } from './pages/reporte/dashboard/resumen-anual/resumen-anual.component';
import { RutaComponent } from './pages/reporte/dashboard/ruta/ruta.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { TecnologiasComponent } from './pages/configuracion/tecnologias/tecnologias.component';
import { FactorEmisionNivel2Component } from './pages/configuracion/factor-emision-nivel2/factor-emision-nivel2.component';
import { NavbarFeComponent } from './shared/navbar-fe/navbar-fe.component';



registerLocaleData(localeEs, "es", localeEsExtra);

@NgModule({
  declarations: [
    AppComponent,

    BusquedaPipe,
    MenuComponent,
    HeaderComponent,

    InicioSesionComponent,
    CodigoConfirmacionComponent,
    NuevaContrasenaComponent,

    BandejaUsuariosComponent,
    AccesoSistemaComponent,
    RutasComponent,
    ParametrosSistemaComponent,
    BitacoraErroresComponent,

    Page404Component,
    Page500Component,
    FactorEmisionComponent,
    PeriodosComponent,
    DatosActividadComponent,
    ResultadoGeiComponent,
    HistoricoComponent,
    ResumenAnualComponent,
    RutaComponent,
    NavbarComponent,
    TecnologiasComponent,
    FactorEmisionNivel2Component,
    NavbarFeComponent,
  ],
  imports: [
    CommonModule, FormsModule, NgbDropdownModule, ReactiveFormsModule, NgSelectModule, BrowserModule, BrowserAnimationsModule, HttpClientModule, NgbModule, RouterModule,
    AppRoutingModule, NgbTooltipModule, NgOtpInputModule, ToastrModule.forRoot(),],

  providers: [
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: "es-ES" },
    { provide: NgbDateParserFormatter, useClass: CalendarioService },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
