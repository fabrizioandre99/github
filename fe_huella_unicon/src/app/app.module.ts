import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { MenuComponent } from './shared/menu/menu.component';
import { AccesoUsuarioComponent } from './pages/administracion/acceso-usuario/acceso-usuario.component';
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
import { InicioComponent } from './pages/operaciones/inicio/inicio.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BusquedaPipe } from './utils/search.pipe';
import { registerLocaleData } from "@angular/common";
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
import { CalendarioService } from './services/calendario.service';
import { ToastrModule } from 'ngx-toastr';
import { NgOtpInputModule } from 'ng-otp-input';
import { BackCloseService } from './services/back-close.service';
registerLocaleData(localeEs, "es", localeEsExtra);

@NgModule({
  declarations: [
    AppComponent, HeaderComponent, MenuComponent, InicioSesionComponent, BandejaUsuariosComponent, BusquedaPipe, NuevaContrasenaComponent,
    CodigoConfirmacionComponent,
    BandejaPeriodosComponent,
    NivelActividadComponent,
    ResultadosGeiComponent,
    BitacoraUsuarioComponent,
    BitacoraErroresComponent,
    FactorEmisionComponent,
    AccesoUsuarioComponent,
    ParametrosSistemaComponent,
    DistribucionMensualComponent,
    EmisionesPlantaComponent,
    DistanciasAereasComponent,
    DistanciasTerrestresComponent,
    IndicadoresGeiComponent,
    RegistroCategoriasComponent,
    UnidadesNegocioComponent,
    LocacionesComponent,
    InicioComponent],
  imports: [
    FormsModule, ReactiveFormsModule, BrowserModule, BrowserAnimationsModule, NgSelectModule, HttpClientModule, NgbModule, RouterModule,
    AppRoutingModule, NgbTooltipModule, NgOtpInputModule, ToastrModule.forRoot()],
  providers: [BackCloseService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: "es-ES" },
    { provide: NgbDateParserFormatter, useClass: CalendarioService },

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
