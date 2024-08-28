// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: window.location.protocol + '//' + window.location.hostname + 'https://huellahonduras-test.alwa.pe:8090/', cambioPeriodo: {
    anio_base: 'ANIO-BASE',
    reapertura: 'REAPERTURA',
    reconocimiento_1: 'RECO-1',
    reconocimiento_2: 'RECO-2',
    reconocimiento_3: 'RECO-3',
    reconocimiento_4: 'RECO-4',
  },
  parametro: {
    sistema: {
      sTipo: 'SISTEMA',
      sCodRutaDescarga: 'RUTA-DATA'
    }
  },
  recaptcha: {
    siteKey: '6Ld1SyMqAAAAALQ1gCksm8aCCKBScMVqpXQyMsRy'
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
