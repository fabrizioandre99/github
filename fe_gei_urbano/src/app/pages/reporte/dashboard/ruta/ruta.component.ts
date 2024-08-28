import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IUsuario } from '../../../../models/usuario';
import { AfterViewInit, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { SeguridadService } from '../../../../services/seguridad.service';
import { IDataResponse } from '../../../../models/IDataResponse';
import { ResultadoGeiService } from '../../../../services/resultado-gei.service';
import Chart from 'chart.js/auto';
import {ChartDataset, ChartItem, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { PeriodoService } from '../../../../services/periodo.service';
import { RutaService } from '../../../../services/ruta.service';

@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.component.html',
  styleUrl: './ruta.component.css'
})

export class RutaComponent implements OnInit, AfterViewInit{
  //Variables
  oUsuario: IUsuario | undefined;

  initialCutout: number | undefined;
  initialAncho: number = 60;

  hasLongLabel: boolean = false;

  arrayColor = [
    '#FF5733', // Rojo mandarina
    '#85C1E9', // Azul cielo claro
    '#82E0AA', // Verde menta
    '#F7DC6F', // Amarillo sol
    '#D7BDE2', // Lila suave
    '#A3E4D7', // Turquesa pastel
    '#F1948A', // Rosa salmón
    '#BB8FCE', // Púrpura polvo
    '#F0B27A', // Naranja melocotón
    '#52BE80', // Verde esmeralda
    '#EB984E', // Naranja caramelo
    '#A569BD', // Violeta
    '#58D68D', // Verde primavera
    '#F5B041', // Amarillo dorado
    '#6C3483', // Morado oscuro
    '#1ABC9C', // Turquesa
    '#F4D03F', // Amarillo canario
    '#AED6F1', // Azul polvo
    '#A04000', // Marrón cuero
    '#CD6155', // Rojo terracota
    '#145A32', // Verde bosque
    '#5499C7', // Azul acero
    '#48C9B0', // Turquesa claro
    '#F8C471', // Naranja arena
    '#7D3C98', // Púrpura real
    '#45B39D', // Verde mar
    '#F4D03F', // Amarillo mantequilla
    '#7FB3D5', // Azul serenidad
    '#784212', // Marrón café
    '#EC7063', // Rojo coral
    '#1A5276', // Azul marino
    '#73C6B6', // Turquesa medio
    '#F5CBA7', // Naranja melón
    '#6D4C41', // Marrón chocolate
    '#E74C3C', // Rojo carmesí
    '#2471A3', // Azul cobalto
    '#7DCEA0', // Verde agua
    '#F0E68C', // Khaki claro
    '#935116', // Marrón óxido
    '#CB4335', // Rojo ladrillo
    '#2E86C1', // Azul celeste
    '#82E0AA', // Verde algas
    '#FFFACD', // Limón chiffon
    '#A04000', // Marrón óxido
    '#D98880', // Rosa viejo
    '#2980B9', // Azul bahía
    '#ABEBC6', // Verde menta claro
    '#FAFAD2', // Oro claro
    '#6E2C00', // Marrón madera
    '#E6B0AA', // Rosa polvo
    '#3498DB', // Azul brillante
    '#A9DFBF', // Verde pálido
    '#FFFFE0', // Amarillo claro
    '#512E5F', // Morado berenjena
    '#F1948A', // Rosa melocotón
    '#85C1E9', // Azul cielo
    '#D5F5E3', // Verde eucalipto
    '#FFFACD', // Amarillo vainilla
    '#4A235A', // Morado oscuro
    '#C39BD3', // Lila
    '#AED6F1', // Azul pastel
    '#D4EFDF', // Verde lima
    '#FAFAD2', // Amarillo pastel
    '#7B241C', // Marrón caoba
    '#D7BDE2', // Malva
    '#5499C7', // Azul claro
    '#ABEBC6', // Verde claro
    '#FEF9E7', // Marfil
    '#641E16', // Marrón granate
    '#F5B7B1', // Rosa claro
    '#5DADE2', // Azul agua
    '#A9DFBF', // Verde manzana
    '#FEF9E7', // Blanco hueso
    '#78281F', // Marrón tabaco
    '#FADBD8', // Rosa algodón
    '#AED6F1', // Azul hielo
    '#A9DFBF', // Verde limón
    '#FCF3CF', // Amarillo crema
    '#943126', // Rojo óxido
    '#F5CBA7', // Naranja pastel
    '#AED6F1', // Azul celeste
    '#A9DFBF', // Verde claro
    '#FDEDC1', // Beige claro
    '#CB4335', // Rojo tomate
    '#FAD7A0', // Naranja claro
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FDF2E9', // Blanco marfil
    '#B03A2E', // Rojo vino
    '#FDEBD0', // Naranja crema
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FEF5E7', // Blanco antiguo
    '#922B21', // Rojo sangre
    '#F8C471', // Naranja dorado
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FEFCEA', // Blanco lino
    '#7B1F2A', // Rojo burdeos
    '#F9E79F', // Amarillo mantequilla
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FEF9E7', // Blanco vainilla
    '#641E16', // Marrón oscuro
    '#F7DC6F', // Amarillo dorado
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FEFDEA', // Blanco crema
    '#512E5F', // Morado profundo
    '#F4D03F', // Amarillo sol
    '#AED6F1', // Azul claro
    '#A9DFBF', // Verde claro
    '#FEFEEA', // Blanco nieve
    '#17202A', // Negro azabache    
  ];

  currentColor: string = '#FFABAB';
  usedColors: { [key: string]: string } = {}; // Declaración de usedColors

  pantallaAncho: number = window.innerWidth;

  modelfilter: any = {};

  nIdPeriodo: number;
  nIdRuta: number;
  boTop: boolean;

  lstPeriodo: any[] = [];
  lstRuta: any[] = [];
  lstRptTopRuta: any[] = [];
  lstRptBotRuta: any[] = [];
  lstRptRutaMes: any[] = [];

  oChartTopRuta!: Chart<'doughnut', number[], string>;
  legendItemsTopRuta: any;
  porcentajeTopRuta: any[] = [];
  totalTopRuta: any;

  oChartBotRuta!: Chart<'doughnut', number[], string>;
  legendItemsBotRuta: any;
  porcentajeBotRuta: any[] = [];
  totalBotRuta: any;

  oChartRutaMes!: any;
  legendItemsRutaMes: any;

  bdTotalEmisiones: any;

  loadingPagina: boolean = true;
  fShowSkeletonVehiculoTop: boolean = true;
  fShowSkeletonVehiculoBot: boolean = true;
  fShowSkeletonVehiculoMes: boolean = true;

  nSizeTop: any;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router, private toastr: ToastrService, private seguridadService: SeguridadService,
    private resultadosGeiService: ResultadoGeiService, private periodoService: PeriodoService, private rutaService: RutaService ) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let promesaInicial = Promise.resolve();

      promesaInicial
        .then(() =>  this.loadingPagina = true)
        .then(() => {
          this.fnListarPeriodo();
          this.initialCutout = this.calculateChartDoughnut();
        })
        .then(() =>  this.loadingPagina = false);
    }
  }

  ngAfterViewInit(): void {
    let promesaInicial = Promise.resolve();
    promesaInicial
    .then(() =>  this.loadingPagina = true)
    .then(() => {
      this.fnListarPeriodo();
      this.initialCutout = this.calculateChartDoughnut();
    })
    .then(() =>  this.loadingPagina = false);
  }

  async fnListarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarPeriodoConEmg());
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        
        if(this.lstPeriodo.length == 0 ) {
          this.loadingPagina = false;
          this.fShowSkeletonVehiculoTop = false;
          this.fShowSkeletonVehiculoBot = false;
          this.fShowSkeletonVehiculoMes = false;
          this.bdTotalEmisiones = -1;
        } else {
          if(this.nIdPeriodo == undefined) this.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;
          this.fnListarRuta();
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if(error.error.codMensaje == undefined || error.error.codMensaje == null) {
        this.router.navigate(['/error-500']);
      } else {
        this.seguridadService.logout(error.error.mensajeUsuario);
      }
    }
  }

  async fnListarRuta() {
    try {
      let data: IDataResponse = await lastValueFrom(this.rutaService.listarByPeriodo(this.nIdPeriodo));
      if (data.exito) {
        this.lstRuta = data.datoAdicional;
        if(this.lstRuta.length == 0 ) {
          this.loadingPagina = false;
          this.fShowSkeletonVehiculoTop = false;
          this.fShowSkeletonVehiculoBot = false;
          this.fShowSkeletonVehiculoMes = false;
          this.bdTotalEmisiones = -1;
        } else {
          this.nIdRuta = this.lstRuta[0].nIdRuta;
          this.cambiarFiltros();
        }
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      console.log(error);
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async listarRptVehiculoTop() {
    try { 
      let dataTop: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReportePorRuta(this.nIdPeriodo, this.nIdRuta, true));
      
      if (dataTop.exito) {
        this.lstRptTopRuta = dataTop.datoAdicional;
        this.nSizeTop = Math.floor(this.lstRptTopRuta.length/2) + 1;
        if(this.lstRptTopRuta.length === 10) this.nSizeTop = 10;
        this.lstRptTopRuta = this.lstRptTopRuta.slice(0, this.nSizeTop);
        this.totalTopRuta = this.lstRptTopRuta.reduce((acc, elem) => acc + elem.bdTotalGeiCO2eq, 0);

        console.log(this.totalTopRuta);
        this.fnChartTopVehiculo();
      } else {
        this.totalTopRuta = [];
      }
      this.fShowSkeletonVehiculoTop = false;
    } catch (error: any) {
      this.fShowSkeletonVehiculoTop = false;
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async listarRptVehiculoBot() {
    try { 
      let dataBot: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReportePorRuta(this.nIdPeriodo, this.nIdRuta, false));

      if (dataBot.exito) {
        this.lstRptBotRuta = dataBot.datoAdicional;
        this.nSizeTop = Math.floor(this.lstRptBotRuta.length/2) + 1;
        if(this.lstRptBotRuta.length === 10) this.nSizeTop = 10;
        this.lstRptBotRuta = this.lstRptBotRuta.slice(0, this.nSizeTop);
        this.totalBotRuta = this.lstRptBotRuta.reduce((acc, elem) => acc + elem.bdTotalGeiCO2eq, 0);
        console.log(this.nIdPeriodo + " - " + this.nIdRuta);
        console.log(this.lstRptBotRuta);
        console.log(this.totalBotRuta);
        this.fnChartBotVehiculo();
      } else {
        this.lstRptBotRuta = [];
      }
      this.fShowSkeletonVehiculoBot = false;
    } catch (error: any) {
      this.fShowSkeletonVehiculoBot = false;
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async listarRptVehiculoMes() {
    try { 
      let data: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReporteVehiculoMes(this.nIdPeriodo, this.nIdRuta));
       
      if (data.exito) {
        this.lstRptRutaMes = data.datoAdicional;
        this.fnChartVehiculoMes();
      } else {
        this.lstRptRutaMes = [];
      }
      this.fShowSkeletonVehiculoMes = false;
    } catch (error: any) {
      this.fShowSkeletonVehiculoMes = false;
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  async listarTotalEmisiones() {
    try { 
      let data: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReporteAnualTotal(this.nIdPeriodo, this.nIdRuta));
      
      if (data.exito)  {
        this.bdTotalEmisiones = this.truncateValue(data.datoAdicional, 0);
      } else this.bdTotalEmisiones = -1;
    }
    catch (error: any) {
      console.log(error);
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  cambiarFiltros() {
    let promesaInicial = Promise.resolve();
    promesaInicial
    .then(() =>  {
      this.loadingPagina = true;
      this.fShowSkeletonVehiculoTop = true;
      this.fShowSkeletonVehiculoBot = true;
      this.fShowSkeletonVehiculoMes = true;
    })
    .then(() => {
      this.listarRptVehiculoTop();
      this.listarRptVehiculoBot();
      this.listarRptVehiculoMes();
      this.listarTotalEmisiones();
      this.initialCutout = this.calculateChartDoughnut();
    })
    .then(() =>  this.loadingPagina = false);
  }

  fnChartTopVehiculo() {
    if (this.oChartTopRuta) this.oChartTopRuta.destroy();

    const nombresArray = this.lstRptTopRuta.map(vehiculo => vehiculo.sPlaca);

    this.porcentajeTopRuta = this.lstRptTopRuta.map(ruta => ruta.bdPorcentaje);

    const valor = this.lstRptTopRuta.map(ruta => ruta.bdTotalGeiCO2eq);

    const createChart = (ChartContext: ChartItem) => {
      return new Chart(ChartContext, {
        type: 'doughnut',
        data: {
          labels: nombresArray,
          datasets: [{
            data: this.porcentajeTopRuta,
            backgroundColor: this.arrayColor,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 0,
            borderRadius: 100,
          }]
        },
        options: {
          responsive: true,
          devicePixelRatio: 2,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              titleColor: '#002FA1',
              bodyColor: '#002FA1',
              displayColors: false,
              backgroundColor: (tooltipItem) => {
                const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
                return this.makeColorLighter(originalColor, 0.5);
              },
              titleFont: {
                family: 'Poppins',
                size: 12,
              },
              bodyFont: {
                family: 'Poppins',
                size: 12
              },
              callbacks: {
                label: (context) => {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  const arrayLines = [' ' + context.formattedValue + '%', ' ' + this.truncateValue(valor[index], 2) + ' [tCO₂e]'];
                  return arrayLines;
                },
              },
            }
          },
          cutout: this.initialCutout,
          animation: {
            duration: 1000
          },

        },
        plugins: [{
          id: 'firstDonutChart',
          afterDatasetsDraw: (chart, args, options) => {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();
            let str: any = this.truncateValue(this.totalTopRuta, 0);

            let fontSize = 50;

            // Medir el ancho del texto
            ctx.font = `bolder ${fontSize}px Poppins`;
            let textWidth = ctx.measureText(str).width;

            // Margen aumentado para dar más espacio
            const margin = 60;

            // Si el texto es más ancho que el gráfico, reducir el tamaño de la letra
            while (textWidth > width - margin && fontSize > 10) {
              fontSize -= 2; // Reducimos el tamaño en 2px
              ctx.font = `bolder ${fontSize}px Poppins`;
              textWidth = ctx.measureText(str).width;
            }

            let halfFontSize = fontSize / 2;

            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('' + str, width / 2, height / 2 + top);

            // Ajustar la posición vertical de "tCO₂e"
            const offset = fontSize * 0.15; // Ajuste para dar un pequeño espacio entre los textos
            ctx.font = `${halfFontSize}px Poppins`;
            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('tCO₂e', width / 2, height / 2 + top + halfFontSize + offset);
            ctx.restore();
          }
        }]
      });
    };
    
    const pieChartRef = document.getElementById('chartTopVehiculo') as HTMLCanvasElement;
    if(pieChartRef != null || pieChartRef != undefined) {
      const ChartContext = pieChartRef.getContext('2d')!;
      this.oChartTopRuta = createChart(ChartContext);
      setTimeout(() => {
        this.legendItemsTopRuta = this.oChartTopRuta?.legend?.legendItems;
        this.checkForLongLabels(this.legendItemsTopRuta);
      });
    }
  }

  fnChartBotVehiculo() {
    if (this.oChartBotRuta) this.oChartBotRuta.destroy();

    const nombresArray = this.lstRptBotRuta.map(ruta => ruta.sPlaca);

    this.porcentajeBotRuta = this.lstRptBotRuta.map(ruta => ruta.bdPorcentaje);

    const valor = this.lstRptBotRuta.map(ruta => ruta.bdTotalGeiCO2eq);

    const createChart = (ChartContext: ChartItem) => {
      return new Chart(ChartContext, {
        type: 'doughnut',
        data: {
          labels: nombresArray,
          datasets: [{
            data: this.porcentajeBotRuta,
            backgroundColor: this.arrayColor,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 0,
            borderRadius: 100,
          }]
        },
        options: {
          responsive: true,
          devicePixelRatio: 2,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              titleColor: '#002FA1',
              bodyColor: '#002FA1',
              displayColors: false,
              backgroundColor: (tooltipItem) => {
                const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
                return this.makeColorLighter(originalColor, 0.5);
              },
              titleFont: {
                family: 'Poppins',
                size: 12,
              },
              bodyFont: {
                family: 'Poppins',
                size: 12
              },
              callbacks: {
                label: (context) => {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  const arrayLines = [' ' + context.formattedValue + '%', ' ' + this.truncateValue(valor[index], 2) + ' [tCO₂e]'];
                  return arrayLines;
                },
              },
            }
          },
          cutout: this.initialCutout,
          animation: {
            duration: 1000
          },

        },
        plugins: [{
          id: 'firstDonutChart',
          afterDatasetsDraw: (chart, args, options) => {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();
            let str: any = this.truncateValue(this.totalBotRuta, 0);

            // Tamaño inicial de texto
            let fontSize = 50;

            // Medir el ancho del texto
            ctx.font = `bolder ${fontSize}px Poppins`;
            let textWidth = ctx.measureText(str).width;

            // Margen aumentado para dar más espacio
            const margin = 60;

            // Si el texto es más ancho que el gráfico, reducir el tamaño de la letra
            while (textWidth > width - margin && fontSize > 10) {
              fontSize -= 2; // Reducimos el tamaño en 2px
              ctx.font = `bolder ${fontSize}px Poppins`;
              textWidth = ctx.measureText(str).width;
            }

            let halfFontSize = fontSize / 2;

            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('' + str, width / 2, height / 2 + top);

            // Ajustar la posición vertical de "tCO₂e"
            const offset = fontSize * 0.15; // Ajuste para dar un pequeño espacio entre los textos
            ctx.font = `${halfFontSize}px Poppins`;
            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('tCO₂e', width / 2, height / 2 + top + halfFontSize + offset);
            ctx.restore();
          }
        }]
      });
    };
    
    const pieChartRef = document.getElementById('chartBotVehiculo') as HTMLCanvasElement;
    if(pieChartRef != undefined || pieChartRef != null) {
      const ChartContext = pieChartRef.getContext('2d')!;
      this.oChartBotRuta = createChart(ChartContext);
      setTimeout(() => {
        this.legendItemsBotRuta = this.oChartBotRuta?.legend?.legendItems;
        this.checkForLongLabels(this.legendItemsBotRuta);
      });
    }
  }

  fnChartVehiculoMes() {
    if (this.oChartRutaMes) this.oChartRutaMes.destroy();

    const labels = this.lstRptRutaMes.map(item => item.sMes);

    let maxCO2eqLiFuente = 0;

    this.lstRptRutaMes.forEach(item => {
      // Sumar los valores de bdTotalGeiCO2eq para cada liFuente
      let sum = item.liVehiculo.reduce((acc: number, current: any) => acc + current.bdTotalGeiCO2eq, 0);

      // Comparar y actualizar el valor máximo
      if (sum > maxCO2eqLiFuente) {
        maxCO2eqLiFuente = sum;
      }
    });


    this.usedColors = {};

    const createDatasets = () => {
      const datasets: any = {};
      this.lstRptRutaMes.forEach((mes, index) => {
        mes.liVehiculo.forEach((vehiculo: any) => {
          if (!datasets[vehiculo.sPlaca]) {
            datasets[vehiculo.sPlaca] = {
              label: vehiculo.sPlaca,
              data: new Array(this.lstRptRutaMes.length).fill(null),
              borderRadius: 16,
              barThickness: this.initialAncho, // Usamos el valor dinámico aquí
              backgroundColor: this.getColor(vehiculo.sPlaca),
            };
          }
          const monthIndex = labels.indexOf(vehiculo.sMes);
          datasets[vehiculo.sPlaca].data[monthIndex] = vehiculo.bdTotalGeiCO2eq;
        });
      });
      return Object.values(datasets);
    };
    
    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    const self = this;
    const createChart = (ChartContext: ChartItem) => {

      const sizeDataLabel = 14;

      const totalSumPlugin = {
        id: 'totalSumPlugin',
        beforeDatasetsDraw: function (chart: any, args: any, options: any) {
          const ctx = chart.ctx;
          chart.data.labels.forEach((label: string, labelIndex: number) => {
            let total = 0;
            chart.data.datasets.forEach((dataset: { data: any[]; }) => {
              total += dataset.data[labelIndex] || 0;
            });

            let topPosition: any = null;
            chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
              if (!chart.isDatasetVisible(datasetIndex)) return;
              const meta = chart.getDatasetMeta(datasetIndex);
              const bar = meta.data[labelIndex];
              if (topPosition === null || bar.y < topPosition) {
                topPosition = bar.y;
              }
            });

            if (topPosition !== null) {
              topPosition -= 3.8; // Ajusta este valor según sea necesario

              const labelWidth = ctx.measureText(self.truncateValue(total, 2).toLocaleString()).width;
              const labelPadding = 6;
              const borderRadius = 4;

              ctx.save();
              ctx.fillStyle = 'transparent';
              roundRect(ctx, chart.scales.x.getPixelForValue(label) - labelWidth / 2 - labelPadding, topPosition - 20, labelWidth + 2 * labelPadding, 20, borderRadius);
              ctx.fill();

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'black';
              ctx.font = `500 ${sizeDataLabel}px Poppins`;
              ctx.shadowColor = 'black';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0.9;
              ctx.shadowOffsetY = 0;
              ctx.fillText(self.truncateValue(total, 2).toLocaleString(), chart.scales.x.getPixelForValue(label), topPosition - 10);
              ctx.restore();
            }
          });
        }
      };

      const activePlugins = [totalSumPlugin];


      return new Chart(ChartContext, {
        plugins: activePlugins,
        type: 'bar',
        data: {
          labels: labels,
          datasets: createDatasets() as ChartDataset[],
        },
        options: {
          devicePixelRatio: 2,
          scales: {
            x: {
              grid: {
                display: false,
              }, border: {
                display: false
              },
              stacked: true, // Apilar barras en el eje x
              ticks: {
                font: {
                  size: 14,
                  weight: 500,
                  family: 'Poppins',
                }
              },
            },
            y: {
              ticks: {
                font: {
                  size: 14,
                  weight: 500,
                  family: 'Poppins',
                }
              }, grid: {
                display: true, // Asegúrate de que esto esté configurado como 'true'
              },
              max: maxCO2eqLiFuente * 1.2,
              border: {
                display: false
              },
              title: {
                display: true,
                text: 'Emisiones GEI [tCO₂e]'
              },
              stacked: true, // Apilar barras en el eje y
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000 // Ajusta la duración de la animación según el valor de "animate"
          }, plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              align: 'center',
              color: 'black',
              font: {
                size: sizeDataLabel,
                family: 'Poppins',

              },
              display: function (context) {
                // Type guard to check if the data is a number
                const data: any = context.dataset.data[context.dataIndex];
                if (typeof data === 'number') {
                  return data > (maxCO2eqLiFuente / 18);
                }
                return false;
              },
              formatter: function (value, context) {
                const data = context.dataset.data[context.dataIndex];
                if (typeof data === 'number') {
                  return self.truncateValue(data, 2).toLocaleString();
                } else {
                  // Manejar el caso en que el valor no es un número, si es necesario
                  return '';
                }
              }
            },
            tooltip: {
              displayColors: false,
              titleColor: '#002FA1',
              bodyColor: '#002FA1',
              backgroundColor: (tooltipItem) => {
                const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
                const lighterColor = this.makeColorLighter(originalColor, 0.5); // Ajusta el valor de 'amount' según se necesite
                return lighterColor;
              },
              titleFont: {
                family: 'Poppins',
                size: 12,
              },
              bodyFont: {
                family: 'Poppins',
                size: 12
              },
              callbacks: {
                title: function (context) {
                  // Puedes personalizar el título del tooltip aquí
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
                  const truncatedValue = typeof currentValue === 'number' ? self.truncateValue(currentValue, 2).toLocaleString() : currentValue;

                  // Puedes personalizar el contenido del tooltip aquí
                  return '' + truncatedValue + ' [tCO₂e]';
                }
              }
            },
          },
        },
      });

    };

    const pieChartRef = document.getElementById('chartVehiculoMes') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartRutaMes = createChart(ChartContext);

    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendItemsRutaMes = this.oChartRutaMes?.legend?.legendItems;
    });
  }

  makeColorLighter(color: string, amount: number): string {
    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };

    const rgbToHex = (rgb: number[]) => {
      return '#' + ((1 << 24) | (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16).slice(1);
    };

    const originalRgb = hexToRgb(color);
    const lighterRgb = originalRgb.map((value) => {
      const newValue = value + (255 - value) * amount;
      return Math.min(newValue, 255); // Aplicar límite de 255 para evitar valores fuera de rango
    });

    const lighterColor = rgbToHex(lighterRgb);

    return lighterColor;
  }

  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  checkForLongLabels(legendItems: any): void {
    for (let item of legendItems) {
      if (item.text.length > 30) {
        this.hasLongLabel = true;
        break;
      }
    }
  }

  toggleRuta(index: number, tipo: number): void {
    let meta: any;
    let isHidden: any;
    switch(tipo) {
      case 1:
        meta = this.oChartTopRuta.getDatasetMeta(0);
        isHidden = !meta.data[index].hidden;
        meta.data[index].hidden = isHidden;
        this.legendItemsTopRuta[index].hidden = isHidden;
        this.oChartTopRuta.update();
        break;
      case 2:
        meta = this.oChartBotRuta.getDatasetMeta(0);
        isHidden = !meta.data[index].hidden;
        meta.data[index].hidden = isHidden;
        this.legendItemsBotRuta[index].hidden = isHidden;
        this.oChartBotRuta.update();
        break;
    }

  }

  toggleVehiculoMes(index: number): void {
    const dataset = this.oChartRutaMes.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsRutaMes[index].hidden = dataset.hidden;

    this.recalculateMaxValue();
    this.oChartRutaMes.update();
  }

  recalculateMaxValue(): void {
    const MIN_Y_AXIS_VALUE = 10;
    let maxCO2eqLiFuente = 0;
    
    this.lstRptRutaMes.forEach(item => {
      let sum = item.liVehiculo.reduce((acc: number, current: any) => {

        const datasetIndex = this.oChartRutaMes.data.datasets.findIndex((ds: any) => ds.label === current.sPlaca);
        if (!this.oChartRutaMes.isDatasetVisible(datasetIndex)) {
          return acc;
        }
        return acc + current.bdTotalGeiCO2eq;
      }, 0);

      if (sum > maxCO2eqLiFuente) maxCO2eqLiFuente = sum;
    });

    if (maxCO2eqLiFuente < MIN_Y_AXIS_VALUE) {
      maxCO2eqLiFuente = MIN_Y_AXIS_VALUE;
    }

    this.oChartRutaMes.options.scales.y.max = maxCO2eqLiFuente * 1.3;
    this.oChartRutaMes.update();
  }

  updateChart(chart: any, cutoutValue: number) {
    if (chart) {
      chart.options.cutout = cutoutValue;
      chart.update();
    }
  }

  updateChartBar() {
    const cutoutValue = this.calculateChartDoughnut();
    this.updateChart(this.oChartTopRuta, cutoutValue);
    this.updateChart(this.oChartBotRuta, cutoutValue);
    this.updateChart(this.oChartRutaMes, cutoutValue);
  }

  calculateChartDoughnut(): number {
    const windowWidth = window.innerWidth;
    for (const width of Object.keys(this.cutoutValues)) {
      if (windowWidth < parseInt(width)) {
        return this.cutoutValues[width];
      }
    }
    return 128;
  }

  cutoutValues: any = {
    260: 55,
    300: 70,
    325: 90,
    360: 100,
    425: 120,
    992: 125,
    1035: 80,
    1080: 80,
    1164: 90,
    1227: 98,
    1355: 100,
    1479: 115,
    1500: 130,
  };

  cutoutBarThickness: any = {
    425: 5,
    767: 5,
    992: 35,
    1200: 45,
    1500: 65,
  };

  calculateChartBarThickness(): number {
    const windowWidth = window.innerWidth;
    let isLengthGreaterThan11;

    // Comprueba si la longitud de this.lstPartFuente es mayor a 11
    isLengthGreaterThan11 = this.lstRptRutaMes.length > 10;

    for (const width of Object.keys(this.cutoutBarThickness)) {
      if (windowWidth < parseInt(width)) return this.cutoutBarThickness[width];
    }

    // Si la longitud de this.lstPartFuente.length es mayor que 11
    return isLengthGreaterThan11 ? 60 : 65;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallaAncho = event.target.innerWidth;
    this.initialAncho = this.calculateChartBarThickness();

    if (this.lstRptRutaMes.length > 0 && this.oChartRutaMes.data.datasets.length > 0) {
      this.oChartRutaMes.data.datasets.forEach((dataset: any) => dataset.barThickness = this.initialAncho);
    }

    this.updateChartBar();
    if (this.oChartRutaMes) this.oChartRutaMes.update();
  }

  getColor(name: string): string {
    if (!this.usedColors[name]) {
      // Encuentra un color no utilizado en el arrayColor
      const availableColor = this.arrayColor.find(color => !Object.values(this.usedColors).includes(color));
      if (availableColor) {
        this.usedColors[name] = availableColor;
      }
    }
    return this.usedColors[name];
  }

}
