// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/* export const environment = {
  production: false,
  baseUrl: window.location.protocol + '//' + window.location.hostname + ':8080'
}; */

export const environment = {
  production: false,
  baseUrl: window.location.protocol + '//' + window.location.hostname + ':8080/be_inventarios_gei',
  sNombreCookie: 'sisgei-cookie',
  recaptcha: {
    siteKey: '6Lc5d08jAAAAAI-kT5MJ0lQp4WmuEIyIzyyipgip'
  },
  sTipoCredencial: {
    SoyMinam: '01',
    SoyMuni: '02'
  },
  sDescargaCodigo: {
    FormatoFDA: 'FDA',
    FormatoFDJ: 'FDJ'
  },
  sDescargaNombre: {
    FormatoFDA: 'FormatosFDA.zip',
    FormatoFDJ: 'FormatoFDJ.pdf'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
