import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InicioSesionComponent } from './pages/inicio-sesion/inicio-sesion.component';
import { HeaderComponent } from './utils/header/header.component';
import { BandejaUsuariosComponent } from './pages/bandeja-usuarios/bandeja-usuarios.component';
import { AccesoSistemaComponent } from './pages/acceso-sistema/acceso-sistema.component';
import { SidebarAdminComponent } from './utils/sidebar-admin/sidebar-admin.component';
import { ProveedorEnergiaComponent } from './pages/proveedor-energia/proveedor-energia.component';
import { FactorEmisionComponent } from './pages/factor-emision/factor-emision.component';
import { BandejaClientesComponent } from './pages/bandeja-clientes/bandeja-clientes.component';
import { LoadingLoginComponent } from './pages/loading-login/loading-login.component';
import { LoadingLogoutComponent } from './pages/loading-logout/loading-logout.component';
import { CalendarioService } from './services/calendario.service';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { registerLocaleData } from "@angular/common";
import { BusquedaPipe } from './utils/search.pipe'
import localeEs from "@angular/common/locales/es";
import localeEsExtra from "@angular/common/locales/extra/es";
registerLocaleData(localeEs, "es", localeEsExtra);
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    InicioSesionComponent,
    HeaderComponent,
    BandejaUsuariosComponent,
    AccesoSistemaComponent,
    SidebarAdminComponent,
    ProveedorEnergiaComponent,
    FactorEmisionComponent,
    BandejaClientesComponent,
    BusquedaPipe,
    LoadingLoginComponent,
    LoadingLogoutComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    NgbTooltipModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "es-ES" },
    { provide: NgbDateParserFormatter, useClass: CalendarioService },
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
