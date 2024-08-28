import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IniciosesionComponent } from './pages/operaciones/inicio-sesion/inicio-sesion.component';
import { RegistrarSolicitudComponent } from './pages/operaciones/registrar-solicitud/registrar-solicitud.component';
import { ListarSolicitudComponent } from './pages/operaciones/listar-solicitud/listar-solicitud.component';
import { ListarUsuariosComponent } from './pages/operaciones/listar-usuarios/listar-usuarios.component';
import { HeaderComponent } from './shared/header/header.component';
import { MenuComponent } from './shared/menu/menu.component';
import { ListarperiodoComponent } from './pages/operaciones/listar-periodo/listar-periodo.component';
import { ListarDatosComponent } from './pages/operaciones/listar-datos/listar-datos.component';
import { ListarInventariosComponent } from './pages/operaciones/listar-inventarios/listar-inventarios.component';
import { ResultadoGeiComponent } from './pages/operaciones/resultado-gei/resultado-gei.component';
import { HistorialPeriodosComponent } from './pages/operaciones/historial-periodos/historial-periodos.component';
import { BandejaNotificacionesComponent } from './pages/operaciones/bandeja-notificaciones/bandeja-notificaciones.component';
import { FactoresEmisionComponent } from './pages/mantenimiento/factores-emision/factores-emision.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from './utils/alert/alert.component';
import { BusquedaPipe } from './utils/search.pipe';
import { BitacoraLogComponent } from './pages/operaciones/bitacora-log/bitacora-log.component';
import { CoeficienteAtmosfericoComponent } from './pages/mantenimiento/coeficiente-atmosferico/coeficiente-atmosferico.component';
import { FuenteEmisionComponent } from './pages/mantenimiento/fuente-emision/fuente-emision.component';
import { RecuperarContrasenaComponent } from './pages/operaciones/recuperar-contrasena/recuperar-contrasena.component';
import { CodigoConfirmacionComponent } from './pages/operaciones/codigo-confirmacion/codigo-confirmacion.component';
import { NuevaContrasenaComponent } from './pages/operaciones/nueva-contrasena/nueva-contrasena.component';
import { UsuariosBloqueadosComponent } from './pages/operaciones/usuarios-bloqueados/usuarios-bloqueados.component';
import { CalendarioService } from './services/calendario.service';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { registerLocaleData } from "@angular/common";
import { ModalPeriodoComponent } from './pages/operaciones/modal-periodo/modal-periodo.component';
import { ModalLogoutComponent } from './pages/operaciones/modal-logout/modal-logout.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgOtpInputModule } from 'ng-otp-input';
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
import { ModalDescargaComponent } from './pages/operaciones/modal-descarga/modal-descarga.component';
import { ReportesGeiComponent } from './pages/reportes/reportes-gei/reportes-gei.component';
registerLocaleData(localeEs, "es", localeEsExtra);

@NgModule({
  declarations: [
    AlertComponent, AppComponent, IniciosesionComponent, RegistrarSolicitudComponent, ListarSolicitudComponent, ListarUsuariosComponent, HeaderComponent, MenuComponent, ListarperiodoComponent, ListarDatosComponent, ResultadoGeiComponent, HistorialPeriodosComponent, BandejaNotificacionesComponent, FactoresEmisionComponent, FooterComponent, BusquedaPipe, BitacoraLogComponent, FuenteEmisionComponent, CoeficienteAtmosfericoComponent, RecuperarContrasenaComponent, CodigoConfirmacionComponent, NuevaContrasenaComponent, UsuariosBloqueadosComponent, ListarInventariosComponent, ModalPeriodoComponent, ModalLogoutComponent, ModalDescargaComponent, ReportesGeiComponent],
  imports: [
    FormsModule, ReactiveFormsModule, BrowserModule, HttpClientModule, NgbModule, RouterModule,
    RecaptchaV3Module, AppRoutingModule, NgOtpInputModule, NgbTooltipModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey },
    { provide: LOCALE_ID, useValue: "es-ES" },
    { provide: NgbDateParserFormatter, useClass: CalendarioService },

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
