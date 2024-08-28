import { Component, HostListener, OnInit } from '@angular/core';
import { Chart, ChartItem, registerables } from 'chart.js';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { AlertService } from 'src/app/services/alert.service';
import { SolicitudUsuarioService } from 'src/app/services/solicitud-usuario.service';
import { PeriodoService } from 'src/app/services/periodo.service';
import { Reportes } from 'src/app/models/reportes';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { IUsuario } from 'src/app/models/usuario';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FuentesEmisionService } from 'src/app/services/fuentes-emision.service';

@Component({
  selector: 'app-reportes-gei',
  templateUrl: './reportes-gei.component.html',
  styleUrls: ['./reportes-gei.component.css']
})
export class ReportesGeiComponent implements OnInit {
  oUsuario: IUsuario;
  firstDonutChart: any;
  secondDonutChart: any;
  barChart: any;
  barChartGas: any;
  lstDepartamento: any;
  lstProvincia: any;
  lstDistrito: any;
  lstAnio: any;
  lstSector: any;
  listadoSector: any;
  lstPorcentajeSector: any;
  lstSubsector: any;
  lstGasSubsector: any;

  loading: Boolean = false;
  disabledDepartamento: boolean = false;
  disabledProvincia: boolean = false;
  disabledDistrito: boolean = false;
  disabledAnio: boolean = false;
  legendFirstDonutChart: any;
  legendSecondDonutChart: any;
  legendBarChart: any;
  legendBarChartGas: any;

  initialCutout: number | undefined;
  initialCutoutSecond: number | undefined;

  pantallaAncho: any;
  valorAsignado: any;
  changeNumber = 464;

  model: Reportes = new Reportes();
  usuarioActual: any;

  constructor(private fuentesEmisionService: FuentesEmisionService, private seguridadService: SeguridadService, private solicitudUsuarioService: SolicitudUsuarioService, private alertService: AlertService,
    private periodoService: PeriodoService) { Chart.register(...registerables); }

  async ngOnInit() {
    this.oUsuario = this.seguridadService.isLogged();
    this.fnListarSector();
    this.initialCutout = this.calculateChartDoughnut(this.cutoutValues, 140);
    this.initialCutoutSecond = this.calculateChartDoughnut(this.cutoutValuesSecond, 190);
    this.usuarioActual = this.seguridadService.obtenerUsuarioActual;
    this.model.sector = -1;
    //console.log('usuarioActual', this.usuarioActual);

    if (this.oUsuario.sUsuario != undefined) {
      if (this.usuarioActual.nTipo === '01') {

        this.disabledProvincia = true;
        this.disabledDistrito = true;

        this.fnListarAnio();

        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDepartamento());
        if (data.exito) {
          this.lstDepartamento = data.datoAdicional;
          this.defaultUbigeo();
          this.fnBuscar();
        }

      } else {
        this.disabledDepartamento = true;
        this.disabledProvincia = true;
        this.disabledDistrito = true;
        this.model.sDepartamento = this.usuarioActual.sDepartamento!;

        try {
          let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDepartamento());
          if (data.exito) {
            this.lstDepartamento = data.datoAdicional;
            let dataProv: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarProvincia(this.model.sDepartamento));
            if (dataProv.exito) {
              this.lstProvincia = dataProv.datoAdicional;
              this.model.sProvincia = this.usuarioActual.sProvincia!;
              let dataDis: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDistrito(this.model?.sDepartamento, this.model?.sProvincia));
              if (dataDis.exito) {
                this.lstDistrito = dataDis.datoAdicional;
                this.model.sDistrito = this.usuarioActual.sDistrito!;
                this.fnBuscar();
                this.fnListarAnio();
              } else {
                this.alertService.error(dataDis.mensajeUsuario);
              }
            } else {
              this.alertService.error(dataProv.mensajeUsuario);
            }
          } else {
            this.alertService.error(data.mensajeUsuario);
          }
        } catch (error) {
          this.alertService.error('Existen problemas en el servidor.');
        }
      }
    }
  }

  defaultUbigeo() {
    this.model.sDepartamento = "";
    this.model.sProvincia = "";
    this.model.sDistrito = "";
    this.model.sAnio = "";
  }

  /* --------------Truncar los números----------- */
  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /* -------------------------------------------------------------*/
  /* ----Detectar el width y establecer grosor al donut chart---- */

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateChartBars();

    //console.log('Ancho de la pantalla:', event.target.innerWidth);
    this.pantallaAncho = event.target.innerWidth;

    const cutoutValue = this.calculateChartDoughnut(this.cutoutValues, 140);
    this.valorAsignado = cutoutValue;

  }

  cutoutValues = {
    315: 60,
    370: 80,
    450: 100,
    561: 120
  };

  cutoutValuesSecond = {
    315: 60,
    370: 80,
    450: 100,
    561: 120,
    768: 140,
  };

  setAncho(chart: any, cutoutValue: number) {
    if (chart) {
      chart.options.cutout = cutoutValue;
    }
  }

  updateChart(chart: any, cutoutValue: number) {
    this.setAncho(chart, cutoutValue);
    if (chart) {
      chart.update();
    }
  }

  calculateChartDoughnut(cutoutValues: Record<string, number>, defaultValue: number): number {
    const windowWidth = window.innerWidth;
    for (const width of Object.keys(cutoutValues)) {
      if (windowWidth < parseInt(width)) {
        return cutoutValues[width];
      }
    }
    return defaultValue;
  }

  updateChartBars() {
    const cutoutValueFirst = this.calculateChartDoughnut(this.cutoutValues, 140);
    //console.log('cutoutValueFirst', cutoutValueFirst);

    this.updateChart(this.firstDonutChart, cutoutValueFirst);

    const cutoutValueSecond = this.calculateChartDoughnut(this.cutoutValuesSecond, 190);
    //console.log('cutoutValueSecond', cutoutValueSecond);

    this.updateChart(this.secondDonutChart, cutoutValueSecond);
  }

  async fnListarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.fuentesEmisionService.listarSectores());
      if (data.exito) {
        this.listadoSector = data.datoAdicional;
        //console.log('this.listadoSector', this.listadoSector);
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  /* ------------------------------------------------ */
  async fnDepartamento() {
    try {
      let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDepartamento());
      if (data.exito) {
        this.lstDepartamento = data.datoAdicional;
        //console.log('this.lstDepartamento', this.lstDepartamento);
        this.fnProvincia();
        this.fnListarAnio();
        this.fnBuscar();
      } else {
        this.alertService.error(data.mensajeUsuario);
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnProvincia() {
    try {
      //console.log('model.sDepartamento', this.model.sDepartamento);

      //Si cambia de option en el campo departamento todos los otros combos de ubigeo se establecen en TODOS
      this.model.sProvincia = "";
      this.model.sDistrito = "";
      this.model.sAnio = "";

      this.fnListarAnio();
      this.fnBuscar();


      //Si está seleccionado TODOS en el campo departamento
      if (this.model.sDepartamento == "") {
        this.lstProvincia = [];
        this.lstDistrito = [];
        this.disabledProvincia = true;
        this.disabledDistrito = true;
      } else {
        //Si no está seleccionado TODOS que liste las provincias
        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarProvincia(this.model.sDepartamento));
        if (data.exito) {
          this.lstProvincia = data.datoAdicional;
          this.disabledProvincia = false;
          this.disabledDistrito = true;
        } else {
          this.alertService.error(data.mensajeUsuario);
        }
      }

    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  async fnDistrito() {
    try {
      this.model.sDistrito = "";
      this.model.sAnio = "";


      this.fnListarAnio();
      this.fnBuscar();

      if (this.model.sDepartamento == "" || this.model.sProvincia == "") {
        this.lstDistrito = [];
        this.disabledDistrito = true;
      } else {

        let data: IDataResponse = await lastValueFrom(this.solicitudUsuarioService.listarDistrito(this.model?.sDepartamento, this.model?.sProvincia));
        if (data.exito) {
          this.lstDistrito = data.datoAdicional;

          this.disabledDistrito = false;

        } else {
          this.alertService.error(data.mensajeUsuario);
        }
      }
    } catch (error) {
      this.alertService.error('Existen problemas en el servidor.');
    }
  }

  fnBuscar() {
    this.fnListarSectorReport();
  }


  changeDistrito() {
    this.model.sAnio = "";
    this.fnListarAnio();
    this.fnBuscar();
  }


  async fnListarAnio() {
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarAniosRGei(this.model.sDepartamento, this.model.sProvincia, this.model.sDistrito));
    if (data.exito) {
      this.lstAnio = data.datoAdicional;
      //console.log('this.lstAnio', this.lstAnio);
      if (this.lstAnio.length <= 0 && this.usuarioActual.nTipo !== '01') {
        this.model.sAnio = "-1";
        this.disabledAnio = true;
      } else {
        this.model.sAnio = "";
        this.disabledAnio = false;
      }
    } else {
      this.alertService.error(data.mensajeUsuario);
    }
  }

  async fnListarSectorReport() {
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarParticionSectorRGei(this.model.sDepartamento, this.model.sProvincia, this.model.sDistrito, this.model.sAnio));
    if (data.exito) {
      this.lstSector = data.datoAdicional;
      if (this.lstSector.length > 0) {
        this.model.sector = -1;
      } else {
        this.model.sector = -2;
      }

      this.lstSubsector = null!;
      this.lstGasSubsector = null!;

      //console.log('this.lstSector', this.lstSector);
      this.fnListarPorcentajeSector();
    } else {
      this.alertService.error(data.mensajeUsuario);
    }
    this.loading = false;
  }

  async fnListarPorcentajeSector() {
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarPorcentajeSector(this.model.sDepartamento, this.model.sProvincia, this.model.sDistrito, this.model.sAnio));
    if (data.exito) {
      const filteredData = data.datoAdicional.filter((item: { bdTotalCo2eq: number; bdPorcentaje: number; }) => item.bdTotalCo2eq !== 0 || item.bdPorcentaje !== 0);
      this.lstPorcentajeSector = filteredData.map((item: { bdPorcentaje: any; }) => item.bdPorcentaje);

      //console.log('this.lstPorcentajeSector', this.lstPorcentajeSector);

      this.fnFirstDonutChart();
      this.fnBarChart();
    } else {
      this.alertService.error(data.mensajeUsuario);
    }
  }

  async fnListarSubsectorReport() {
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarParticionSubsectorRGei(this.model.sector, this.model.sDepartamento, this.model.sProvincia, this.model.sDistrito, this.model.sAnio));
    if (data.exito) {
      this.lstSubsector = data.datoAdicional;
      //console.log('this.lstSubsector', this.lstSubsector);
      this.fnSecondDonutChart();

    } else {
      this.alertService.error(data.mensajeUsuario);
    }
    this.loading = false;
  }

  async fnListarGasPorSubsector() {
    let data: IDataResponse = await lastValueFrom(this.periodoService.listarGasPorSubsector(this.model.sector, this.model.sDepartamento, this.model.sProvincia, this.model.sDistrito, this.model.sAnio));
    if (data.exito) {
      this.lstGasSubsector = data.datoAdicional;

      /*       this.lstGasSubsector = [
              {
                "nIdFuenteEmision": 1,
                "sCodigoGPC": "I",
                "sNombre": "Energía Estacionaria",
                "nIdPadre": -1,
                "sNombreFna": "FNAEnergiaEstacionaria",
                "sDescripcion": "Las fuentes de energía estacionarias provienen de la quema de combustible, así como las emisiones fugitivas liberadas en el proceso de generación, suministro y consumo de formas útiles de energía (como electricidad o calor).",
                "bdTotalCo2": 163.47,
                "bdTotalCh4": 10818.1,
                "bdTotalN2o": 0.28,
                "bdTotalCo2eq": 10981.94,
                "nNivel": 1,
                "subsectores": [
                  {
                    "nIdFuenteEmision": 2,
                    "sCodigoGPC": "I.1",
                    "sNombre": "Edificios residenciales",
                    "nIdPadre": 1,
                    "sCodFuente": "RES",
                    "sDescripcion": "here",
                    "bdTotalCo2": 1,
                    "bdTotalCh4": 2,
                    "bdTotalN2o": 3,
                    "bdTotalCo2eq": 36.35,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 3,
                    "sCodigoGPC": "I.2",
                    "sNombre": "Edificios e instalaciones comerciales",
                    "nIdPadre": 1,
                    "sCodFuente": "COM",
                    "bdTotalCo2": 2,
                    "bdTotalCh4": 3,
                    "bdTotalN2o": 4,
                    "bdTotalCo2eq": 1.92,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 37,
                    "sCodigoGPC": "I.3",
                    "sNombre": "Edificios e instalaciones institucionales",
                    "nIdPadre": 1,
                    "sCodFuente": "PUB",
                    "bdTotalCo2": 1,
                    "bdTotalCh4": 2,
                    "bdTotalN2o": 3,
                    "bdTotalCo2eq": 2.1,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 4,
                    "sCodigoGPC": "I.4",
                    "sNombre": "Construcción e industrias manufactureras",
                    "nIdPadre": 1,
                    "sCodFuente": "MyC",
                    "bdTotalCo2": 1,
                    "bdTotalCh4": 2,
                    "bdTotalN2o": 3,
                    "bdTotalCo2eq": 0.77,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 5,
                    "sCodigoGPC": "I.5",
                    "sNombre": "Industrias energéticas",
                    "nIdPadre": 1,
                    "sCodFuente": "IEN",
                    "bdTotalCo2": 5,
                    "bdTotalCh4": 6,
                    "bdTotalN2o": 1,
                    "bdTotalCo2eq": 91.4,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 22,
                    "sCodigoGPC": "I.6",
                    "sNombre": "Actividades agrícolas",
                    "nIdPadre": 1,
                    "sCodFuente": "AGR",
                    "bdTotalCo2": 4.79,
                    "bdTotalCh4": 0.01,
                    "bdTotalN2o": 0.01,
                    "bdTotalCo2eq": 4.82,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 26,
                    "sCodigoGPC": "I.7",
                    "sNombre": "Actividades de silvicultura y de pesca",
                    "nIdPadre": 1,
                    "sCodFuente": "PES",
                    "bdTotalCo2": 5.75,
                    "bdTotalCh4": 0.01,
                    "bdTotalN2o": 0.02,
                    "bdTotalCo2eq": 5.8,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 30,
                    "sCodigoGPC": "I.8",
                    "sNombre": "Emisiones fugitivas del transporte de carbón",
                    "nIdPadre": 1,
                    "sCodFuente": "FCA",
                    "bdTotalCo2": 1.03,
                    "bdTotalCh4": 3.76,
                    "bdTotalN2o": 0,
                    "bdTotalCo2eq": 387.8,
                    "nNivel": 2
                  },
                  {
                    "nIdFuenteEmision": 77,
                    "sCodigoGPC": "I.9",
                    "sNombre": "Emisiones fugitivas de la distribución de gas natural a los usuarios finales",
                    "nIdPadre": 1,
                    "sCodFuente": "FGN",
                    "bdTotalCo2": 10,
                    "bdTotalCh4": 10,
                    "bdTotalN2o": 0,
                    "bdTotalCo2eq": 10450.98,
                    "nNivel": 2
                  }
                ]
              }
            ]; */
      //console.log('this.lstGasSubsector', this.lstGasSubsector);
      this.fnBarChartGas();
    } else {
      this.alertService.error(data.mensajeUsuario);
    }
    this.loading = false;
  }


  fnFirstDonutChart() {
    //Asignar los nombres a un array
    const sNombres = this.lstSector?.map((item: { sNombre: any; }) => item.sNombre);

    //Asignar los porcentajes a un array
    let suma = 0;
    for (let i = 0; i < this.lstSector?.length; i++) {
      suma += this.lstSector[i].bdTotalCo2eq;
    }

    // Suponiendo que this.lstPorcentajeSector contiene los valores iniciales
    this.lstPorcentajeSector = this.lstPorcentajeSector.map((valor: number) => {
      // Paso 1: Si el valor es negativo, conviértelo en positivo
      if (valor < 0) {
        valor = -valor;
      }
      return valor;
    });

    // Paso 2: Calcula la suma total de los valores
    const total = this.lstPorcentajeSector.reduce((suma: any, valor: any) => suma + valor, 0);

    // Paso 3: Reemplaza cada valor por su porcentaje con respecto al total
    this.lstPorcentajeSector = this.lstPorcentajeSector.map((valor: number) => (valor / total) * 100);

    var donutCtx = document.getElementById('firstDonutChart') as HTMLCanvasElement;
    if (this.firstDonutChart) {
      this.firstDonutChart.destroy();
    }
    const legendMargin = {
      id: 'legendMargin',
      afterUpdate(chart: any) {
        const legend = chart.legend;
        if (legend) {
          legend.top = chart.chartArea.bottom + 10;
        }
      }
    };
    this.firstDonutChart = new Chart(donutCtx!, {
      type: 'doughnut',
      data: {
        labels: sNombres,
        datasets: [{
          // barThickness: 10,
          data: this.lstPorcentajeSector,
          backgroundColor: [
            "#e06666",
            "#c27ba0",
            "#e69138",
            "#6aa84f",
            "#FFA37F"
          ],
          hoverBackgroundColor: [
            "#e06666",
            "#c27ba0",
            "#e69138",
            "#6aa84f",
            "#FFA37F"
          ]
        }]
      },
      options: {
        cutout: this.initialCutout,
        responsive: true,
        devicePixelRatio: 2,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 8,
            top: 8,
          }
        },
        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || '';
                label += ' Total: ' + context.formattedValue + '%';
                return label;
              },
            }
          },
        }
      },
      plugins: [legendMargin, {
        id: 'firstDonutChart',
        afterDatasetsDraw: (chart, args, options) => {
          const { ctx, chartArea: { top, width, height } } = chart;
          ctx.save();

          //suma = this.changeNumber;
          let str: any = this.truncateValue(suma, 2);

          //console.log('chart.chartArea.height', chart.chartArea.height);
          //console.log('window.innerWidth', window.innerWidth);
          //Tamaño de texto
          let fontSize = 47;
          let heightSize = 2.1

          if (str.length > 10) {
            fontSize = (425 / (str.length)) * 1.2;
            heightSize = 2.1;
            //console.log('CASO 1');
          }

          if (window.innerWidth < 600 && str.length > 6) {
            fontSize = (425 / (str.length)) * 0.8;
            //console.log('CASO 2');
          }

          if (window.innerWidth < 360) {
            fontSize = (chart.chartArea.width / (str.length)) * 1.2;
            heightSize = 2.05;
            //console.log('CASO 3');
          }

          if (str.length > 22) {
            heightSize = 2
            //console.log('CASO 4');
          }

          let halfFontSize = fontSize / 2;
          //const halffontHeight = fontHeight / 2;
          ctx.font = `bolder ${fontSize}px Roboto`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText('' + str, width / 2, height / 2 + top);
          ctx.restore();
          ctx.font = `${halfFontSize}px Roboto`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText('tCO₂eq', width / 2, height / heightSize + top + fontSize);
          ctx.restore();
        }
      }
      ]
    });

    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendFirstDonutChart = this.firstDonutChart?.legend?.legendItems;

    });
  }

  toggleFirstDonut(index: number): void {
    const dataset = this.firstDonutChart.data.datasets[0];
    const meta: any = this.firstDonutChart.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendFirstDonutChart[index].hidden = isHidden;

    this.firstDonutChart.update();
  }


  fnBarChart() {
    //Asignar los nombres a un array
    const sNombres = this.lstSector?.map((item: { sNombre: any; }) => item.sNombre);
    const matrix: any[][] = [];

    const categorias = {
      bdFeCO2: "#1591b5",
      bdFeCH4: "#bbbbbb",
      bdFeN2O: "#27b9ed"
    };

    Object.keys(categorias).forEach(categoria => {
      const fila: any[] = [];
      this.lstSector?.forEach((objeto: { [x: string]: any; }) => {
        fila.push([objeto[categoria], categorias[categoria]]);
      });
      matrix.push(fila);
    });

    //Hallar el mayor valor de la matriz
    let maxVal = -Infinity;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        // Si el valor actual es mayor que el valor máximo, actualiza el valor máximo
        if (matrix[i][j][0] > maxVal) {
          maxVal = matrix[i][j][0];
        }
      }
    }

    // Redondea el valor máximo
    //console.log('maxVal', maxVal);
    let numStr = maxVal.toString(); // convierte el número en una cadena
    let unidad = numStr.split(".")[0]; // toma la parte entera del número
    let numCaracteres = unidad.length; // encuentra la longitud de la cadena

    let ceros = "0".repeat(numCaracteres - 1);
    let primerCaracter = Number(numStr.charAt(0)) + 1;

    //console.log('cifra', Number(primerCaracter + ceros));
    maxVal = Number(primerCaracter + ceros);


    // Obtener el número de columnas
    const numColumnas = matrix[0].length;

    // Obtener los valores mínimo, medio y máximo de cada columna
    let minValues: number[] = [];
    let midValues: number[] = [];
    let maxValues: number[] = [];
    let minColors: string[] = [];
    let midColors: string[] = [];
    let maxColors: string[] = [];

    for (let j = 0; j < numColumnas; j++) {
      let columna = matrix.map(fila => fila[j]); // Extraer los valores de la columna
      let valores = columna.map(celda => celda[0]); // Extraer los valores de las celdas
      let colores = columna.map(celda => celda[1]); // Extraer los colores de las celdas
      minValues.push(Math.min(...valores)); // Obtener el valor mínimo
      maxValues.push(Math.max(...valores)); // Obtener el valor máximo
      let sortedValores = valores.slice().sort((a, b) => a - b); // Ordenar los valores de la columna
      midValues.push(sortedValores[Math.floor(sortedValores.length / 2)]); // Obtener el valor intermedio
      minColors.push(colores[valores.indexOf(Math.min(...valores))]); // Obtener el color correspondiente al valor mínimo
      maxColors.push(colores[valores.indexOf(Math.max(...valores))]); // Obtener el color correspondiente al valor máximo
      midColors.push(colores[valores.indexOf(sortedValores[Math.floor(sortedValores.length / 2)])]);  // Obtener el color correspondiente al valor intermedio
    }

    // Imprimir los resultados
    //console.log('minValues', minValues);
    //console.log('midValues', midValues);
    //console.log('maxValues', maxValues);
    //console.log(minColors);
    //console.log(midColors);
    //console.log(maxColors);

    var barCtx = document.getElementById('barChart') as HTMLCanvasElement;
    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(barCtx!, {
      type: 'bar',
      data: {
        labels: sNombres,
        datasets: [
          {
            label: "CO2",
            data: minValues,
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#3D3D3D',
              font: {
                size: 13,
              }
            },
            borderRadius: 16,
            backgroundColor: minColors,
            barThickness: 18
          }, {
            label: "CH4",
            data: midValues,
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#3D3D3D',
              font: {
                size: 13,
              }
            },
            borderRadius: 16,
            backgroundColor: midColors,
            barThickness: 18
          }, {
            label: "N2O",
            data: maxValues,
            borderRadius: 16,
            backgroundColor: maxColors,
            barThickness: 18
          },

        ],
      },
      options: {
        responsive: true,
        devicePixelRatio: 2,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'tCO₂eq',
              color: '#3D3D3D',
              padding: 0,
              font: {
                style: 'normal',
              }
            },
          },
          x: {
            stacked: true,
            grid: {
              lineWidth: 0,
            },
            ticks: {
              color: "#3D3D3D",
              font: {
                size: 14,
                weight: '500'
              }
            }
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                //Asignar cada titulo según el color seleccionado
                let tooltipLabel = "";
                if (context.dataset.backgroundColor) {
                  if (context.dataset.backgroundColor[context.dataIndex] == "#1591b5") {
                    tooltipLabel = "CO2"
                  }
                  if (context.dataset.backgroundColor[context.dataIndex] == "#bbbbbb") {
                    tooltipLabel = "CH4"
                  }
                  if (context.dataset.backgroundColor[context.dataIndex] == "#27b9ed") {
                    tooltipLabel = "N2O"
                  }
                }
                return ' ' + tooltipLabel + ': ' + context.formattedValue + '';
              },
            }
          },
          datalabels: {
            font: {
              size: 12,
              weight: 'bold'
            },
            padding: {
              top: 0,
            },
            anchor: 'end',
            align: 'end',
          },
        },
      },
      plugins: [{
        id: 'barChart',
        //Asignar color de fondo y cambiar color de los box en los legends
        beforeDraw: function (chart) {
          const ctx = chart.canvas.getContext('2d')!;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#FAFAFA';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();

          var legends = chart.legend!.legendItems!;
          //console.log('legends', legends);
          legends.forEach(function (e, i) {
            if (i === 0) {
              e.fillStyle = '#1591b5';
            } else if (i === legends.length - 1) {
              e.fillStyle = '#27b9ed';
            } else {
              e.fillStyle = '#bbbbbb';
            }
          });
        }
      }
      ]
    });

    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendBarChart = this.barChart?.legend?.legendItems;

    });

  }

  toggleBarChart(index: number): void {
    const clickedColor = this.legendBarChart[index].fillStyle;

    // Recorre los datasets y actualiza la visibilidad de los valores con el color clicado
    this.barChart.data.datasets.forEach((dataset: any) => {
      dataset.data.forEach((value: any, valueIndex: number) => {
        const dataColor = dataset.backgroundColor[valueIndex];
        if (dataColor === clickedColor) {
          // Alterna la visibilidad del valor
          if (dataset.dataOriginal === undefined) {
            dataset.dataOriginal = dataset.data.slice(); // Guarda una copia original de los datos
          }
          if (dataset.data[valueIndex] === null) {
            dataset.data[valueIndex] = dataset.dataOriginal[valueIndex]; // Restaura el valor original
            this.legendBarChart[index].hidden = false; // Mostrar el legendario
          } else {
            dataset.data[valueIndex] = null; // Oculta el valor
            this.legendBarChart[index].hidden = true; // Ocultar el legendario
          }
        }
      });
    });

    this.barChart.update();
  }

  getSubsectorNames() {
    return this.lstGasSubsector[0].subsectores.map((subsector: { sNombre: any; }) => subsector.sNombre);
  }

  prepareDataForChart() {
    const dataSets: { label: any; data: any[]; backgroundColor: any; }[] = [];

    // Leyendas para las barras ('CO2', 'CH4', 'N2O')
    const legends = ['CO2', 'CH4', 'N2O'];

    // Iterar a través de los subsectores
    this.lstGasSubsector[0].subsectores.forEach((subsector: { [x: string]: any; sNombre: any; }) => {
      const data = legends.map(legend => subsector[`bdTotal${legend}`]);

      const dataSet: any = {
        label: subsector.sNombre,
        data: data,
        /*   backgroundColor: this.getRandomColor() */
      };
      dataSets.push(dataSet);
    });

    return dataSets;
  }

  fnSecondDonutChart() {
    var donutCtx = document.getElementById('secondDonutChart') as HTMLCanvasElement;
    if (this.secondDonutChart) {
      this.secondDonutChart.destroy();
    }
    //Asignar colores por nombre de subsector, los nombres que no están se les asigna un color aleatorio
    const colores = {
      'DRS': '#e69138', //Disposición de residuos sólidos
      'DOM': '#BF5F00',//Tratamiento y vertido de aguas residuales domésticas
      'IND': '#975500',//Tratamiento y vertido de aguas residuales industriales
      'TTE': '#E6260E', //Transporte
      'TFE': '#C7C7C7', //Ferroviario
      'TMA': '#001EB1', //Navegación marítima, fluvial y lacustre
      'TAV': '#2B88FF', //Aviación
      'PI': '#f5795e', //Procesos industriales
      'RES': '#C8BAFF', //Edificios residenciales
      'COM': '#4B06BC', //Edificios e instalaciones comerciales
      'PUB': '#02BDBA', //Edificios e instalaciones institucionales
      'MyC': '#4CBBFF', //Construcción e industrias manufactureras
      'IEN': '#FDB813', //Industrias energéticas
      'AGR': '#5ccb5f', //Actividades agrícolas
      'PES': '#007F4F', //Actividades de silvicultura y de pesca
      'FCA': '#232323', //Emisiones fugitivas del transporte de carbón
      'FGN': '#a5a9ad', //Emisiones fugitivas de los sistemas de gas natural
      'GAN': '#b5d433', //Ganadería
      'US': '#F7DC6F', //Uso del suelo
    };

    const nombres = this.lstSubsector.map((objeto: { sCodFuente: any; }) => objeto.sCodFuente);
    const coloresArray = nombres.map((nombre: string | number) => colores[nombre] || getRandomColor());

    //Función para obtener colores aleatorios a los sCodFuente que no se encuentren en la lista
    function getRandomColor() {
      const letras = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    //Armar arrays de solo nombres y porcentajes, y la suma de todos
    const sNombres = this.lstSubsector.map((item: { sNombre: any; }) => item.sNombre);
    let porcentajes = this.lstSubsector.map((item: { bdTotalCo2eq: any; }) => item.bdTotalCo2eq);


    //Hallar la suma de los valores
    let suma = 0;
    for (let i = 0; i < this.lstSubsector.length; i++) {
      suma += this.lstSubsector[i].bdTotalCo2eq;
    }

    // Verificar si hay algún valor negativo en el array
    const hayNegativo = porcentajes.some((valor: any) => valor < 0);
    // Multiplicar por -1 si hay algún valor negativo
    if (hayNegativo) {
      porcentajes = porcentajes.map((valor: any) => (valor < 0 ? valor * -1 : valor));
      //console.log('999', porcentajes);
    } else {
      //console.log(porcentajes);
    }

    //Hallar la suma para los porcentajes
    let sumaPercent: any = porcentajes.reduce((total: any, valor: any) => total + valor, 0);

    this.secondDonutChart = new Chart(donutCtx!, {
      type: 'doughnut',
      data: {
        labels: sNombres,
        datasets: [{
          // barThickness: 10,
          data: porcentajes,
          backgroundColor: coloresArray,
          hoverBackgroundColor: coloresArray
        }]
      },
      options: {
        cutout: this.initialCutoutSecond,
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || '';
                var percent = (context.dataset.data[context.dataIndex] / sumaPercent) * 100;
                label += ' Total: ' + percent.toFixed(2) + '%';
                return label;
              },
            }
          },
        }
      },
      plugins: [{
        id: 'secondDonutChart',
        afterDatasetsDraw: (chart, args, options) => {
          const { ctx, chartArea: { top, width, height } } = chart;
          ctx.save();

          //suma = this.changeNumber;
          let str: any = this.truncateValue(suma, 2);

          //console.log('chart.chartArea.height', chart.chartArea.height);
          //console.log('window.innerWidth', window.innerWidth);
          //Tamaño de texto
          let fontSize = 47;
          let heightSize = 2.1

          if (str.length > 10) {
            fontSize = (425 / (str.length)) * 1.3;
            heightSize = 2.1;
            //console.log('CASO 1');
          }

          if (window.innerWidth < 600 && str.length > 6) {
            fontSize = (425 / (str.length)) * 0.8;
            heightSize = 2.1;
            //console.log('CASO 2');
          }

          if (window.innerWidth < 360) {
            fontSize = (chart.chartArea.width / (str.length)) * 1.2;
            heightSize = 2.05;
            //console.log('CASO 3');
          }

          if (str.length > 22) {
            heightSize = 2
            //console.log('CASO 4');
          }

          let halfFontSize = fontSize / 2;
          //const halffontHeight = fontHeight / 2;
          ctx.font = `bolder ${fontSize}px Roboto`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText('' + str, width / 2, height / 2 + top);
          ctx.restore();
          ctx.font = `${halfFontSize}px Roboto`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText('tCO₂eq', width / 2, height / heightSize + top + fontSize);
          ctx.restore();
        }
      }
      ]
    });
    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendSecondDonutChart = this.secondDonutChart?.legend?.legendItems;

    });
  }

  toggleSecondDonut(index: number): void {
    const dataset = this.secondDonutChart.data.datasets[0];
    const meta: any = this.secondDonutChart.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendSecondDonutChart[index].hidden = isHidden;

    this.secondDonutChart.update();
  }

  fnBarChartGas() {
    if (this.barChartGas) {
      this.barChartGas.destroy();
    }

    // Obtén las etiquetas (nombres de subsectores)
    const labels = this.lstGasSubsector[0].subsectores.map(
      (subsector: { sNombre: any }) => subsector.sNombre
    );

    // Obtén los valores de bdTotalCo2eq, bdTotalCh4 y bdTotalN2o para cada columna
    const co2Values = this.lstGasSubsector[0].subsectores.map(
      (subsector: { bdTotalCo2: any }) => subsector.bdTotalCo2
    );
    const ch4Values = this.lstGasSubsector[0].subsectores.map(
      (subsector: { bdTotalCh4: any }) => subsector.bdTotalCh4
    );
    const n2oValues = this.lstGasSubsector[0].subsectores.map(
      (subsector: { bdTotalN2o: any }) => subsector.bdTotalN2o
    );

    // Combina los datos para superponer las filas en lugar de apilarlas
    const combinedData = labels.map((label: any, index: string | number) => ({
      label,
      co2Value: co2Values[index],
      ch4Value: ch4Values[index],
      n2oValue: n2oValues[index],
    }));

    // Crea los conjuntos de datos para CO2, CH4 y N2O
    const datasets = [
      {
        label: 'CO2',
        data: combinedData.map((item: { co2Value: any; }) => item.co2Value),
        backgroundColor: '#1591b5',
        borderRadius: 16,
        barThickness: 40,
        stack: 'stack1', // Nombre de la pila para CO2
        barPercentage: 1, // Todas las barras en esta columna estarán centradas
        categoryPercentage: 1, // Cada categoría ocupa todo el espacio en el eje x
      },
      {
        label: 'CH4',
        data: combinedData.map((item: { ch4Value: any; }) => item.ch4Value),
        backgroundColor: '#bbbbbb',
        borderRadius: 16,
        barThickness: 40,
        stack: 'stack1', // Nombre de la pila para CH4
        barPercentage: 1, // Todas las barras en esta columna estarán centradas
        categoryPercentage: 1, // Cada categoría ocupa todo el espacio en el eje x
      },
      {
        label: 'N2O',
        data: combinedData.map((item: { n2oValue: any; }) => item.n2oValue),
        backgroundColor: '#27b9ed',
        borderRadius: 16,
        barThickness: 40,
        stack: 'stack1', // Nombre de la pila para N2O
        barPercentage: 1, // Todas las barras en esta columna estarán centradas
        categoryPercentage: 1, // Cada categoría ocupa todo el espacio en el eje x
      },
    ];

    const self = this;
    const createChart = (
      canvas: HTMLCanvasElement,
      colorChart: string[],
      ChartContext: ChartItem,
      animate: any
    ) => {

      return new Chart(ChartContext, {
        plugins: [
          {
            id: 'barChartGas',
            // Asignar color de fondo y cambiar color de los box en los legends
            beforeDraw: function (chart) {
              const ctx = chart.canvas.getContext('2d')!;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = '#FAFAFA';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();

              var legends = chart.legend!.legendItems!;
              legends.forEach(function (e, i) {
                if (i === 0) {
                  e.fillStyle = '#1591b5';
                } else if (i === legends.length - 1) {
                  e.fillStyle = '#27b9ed';
                } else {
                  e.fillStyle = '#bbbbbb';
                }
              });
            },
          },
        ],
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          devicePixelRatio: 2,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: {
                lineWidth: 0,
              },
              ticks: {
                color: "#3D3D3D",
                font: {
                  size: 14,
                  weight: '500'
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'tCO₂eq',
                color: '#3D3D3D',
                padding: 0,
                font: {
                  style: 'normal',
                },
              },
              stacked: false, // No apilar barras en el eje y
            },
          },
          animation: {
            duration: animate ? 1000 : 1000, // Ajusta la duración de la animación según el valor de "animate"
          },
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              align: 'center',
              color: 'black',
              font: {
                size: 14, // Cambia 14 por el tamaño deseado
                family: 'Roboto',
              },
              formatter: function (value, context) {
                const data = context.dataset.data[context.dataIndex];
                if (typeof data === 'number') {
                  return self.truncateValue(data, 2).toLocaleString();
                } else {
                  // Manejar el caso en que el valor no es un número, si es necesario
                  return '';
                }
              },
            },
            tooltip: {
              titleFont: {
                family: 'Roboto',
                size: 12,
              },
              bodyFont: {
                family: 'Roboto',
                size: 12,
              },
              callbacks: {
                title: function (context) {
                  if (context[0].dataset.label === 'Emisiones totales') {
                    return 'Emisiones totales';
                  } else {
                    return context[0].dataset.label;
                  }
                },
                label: function (context) {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  var currentValue = dataset.data[index];
                  const truncatedValue =
                    typeof currentValue === 'number'
                      ? self.truncateValue(currentValue, 2).toLocaleString()
                      : currentValue;
                  return '' + truncatedValue + ' [tCO₂e]';
                },
              },
            },
          },
        },
      });
    };

    const pieChartRef = document.getElementById('barChartGas') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = null!;
    this.barChartGas = createChart(pieChartRef, colorChart, ChartContext, true);
    //console.log('barChartGas', this.barChartGas);
    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendBarChartGas = this.barChartGas?.legend?.legendItems;
    });
  }

  toggleBarChartGas(index: number): void {
    const dataset = this.barChartGas.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendBarChartGas[index].hidden = dataset.hidden;

    this.barChartGas.update();
  }
}
