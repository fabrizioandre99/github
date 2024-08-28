// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './helpers/jwt.interceptor';
import { SeguridadService } from './services/seguridad.service';
import { ToastrModule } from 'ngx-toastr';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter, MatDateFormats } from '@angular/material/core';

import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from '../environments/environment';

registerLocaleData(es);

// Definición de formatos de fecha personalizados
export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
    provideAnimationsAsync(),
    SeguridadService,
    importProvidersFrom(ToastrModule.forRoot({
      enableHtml: true,
    })),
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter },
    provideCharts(withDefaultRegisterables()),
    provideCharts(withDefaultRegisterables()),
  ]
};
