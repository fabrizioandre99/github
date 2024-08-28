export const environment = {
  production: true,
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
