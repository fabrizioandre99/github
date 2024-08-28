import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { InicioSesionComponent } from './pages/operaciones/inicio-sesion/inicio-sesion.component';
import { HeaderComponent } from './shared/header/header.component';
import { MenuComponent } from './shared/menu/menu.component';
import { InformacionEmpresaComponent } from './pages/operaciones/informacion-empresa/informacion-empresa.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PeriodosCalculoComponent } from './pages/operaciones/periodos-calculo/periodos-calculo.component';
import { DatosActividadComponent } from './pages/operaciones/datos-actividad/datos-actividad.component';
import { EmisionesGeiComponent } from './pages/reportes/emisiones-gei/emisiones-gei.component';
import { IndicadoresGeiComponent } from './pages/reportes/indicadores-gei/indicadores-gei.component';
import { EvolucionAnualComponent } from './pages/reportes/evolucion-anual/evolucion-anual.component';
import { PanelComparativoComponent } from './pages/reportes/panel-comparativo/panel-comparativo.component';
import { EmpresasComponent } from './pages/operaciones/gestion-empresas/gestion-empresas.component';
import { LoadingLoginComponent } from './pages/operaciones/loading-login/loading-login.component';
import { BitacoraLogComponent } from './pages/operaciones/bitacora-log/bitacora-log.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { BusquedaPipe } from './utils/search.pipe';
import { CalendarioService } from './services/calendario.service';
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
import { registerLocaleData } from "@angular/common";

registerLocaleData(localeEs, "es", localeEsExtra);

@NgModule({
  declarations: [
    AppComponent,
    BusquedaPipe,
    InicioSesionComponent,
    HeaderComponent,
    MenuComponent,
    InformacionEmpresaComponent,
    PeriodosCalculoComponent,
    DatosActividadComponent,
    EmisionesGeiComponent,
    IndicadoresGeiComponent,
    EvolucionAnualComponent,
    LoadingLoginComponent,
    PanelComparativoComponent,
    EmpresasComponent,
    BitacoraLogComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbCollapseModule,
    NgbTooltipModule,
    NgSelectModule,
    NgbProgressbarModule,
    NgbDatepickerModule,
    ToastrModule.forRoot({
      enableHtml: true,
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: "es-ES" },
    { provide: NgbDateParserFormatter, useClass: CalendarioService },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
