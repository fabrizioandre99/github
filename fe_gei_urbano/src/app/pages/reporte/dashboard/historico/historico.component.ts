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
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnInit, AfterViewInit{

  //Variables
  oUsuario: IUsuario | undefined;
  loadingPagina: boolean = false;
  fShowSkeleton: boolean = true;

  lstRptRuta: any[] = [];
  lstRptCombustible: any[] = [];

  usedColors: { [key: string]: string } = {}; // Declaración de usedColors

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
  
  legendItemsRuta: any;
  oChartRuta: any;

  legendItemsCombustible: any;
  oChartCombustible: any;

  pantallaAncho: number = window.innerWidth;
  initialAncho: number[] = [60, 60];

  numVehiculosRuta: any[] = [];
  numVehiculosCombustible: any[] = [];

    //Constructor
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router, private toastr: ToastrService, private seguridadService: SeguridadService,
    private resultadosGeiService: ResultadoGeiService) {
  }

  ngOnInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
     if (this.oUsuario.sUsuario != undefined) {
      let promesaInicial = Promise.resolve();

      promesaInicial
        .then(() =>  this.loadingPagina = true)
        .then(() => {
          this.fnListarRuta();
          this.fnListarCombustible();
        })
        .then(() => {
          this.fnChartRuta();
          this.fnChartCombustible();
        })
        .then(() =>  this.loadingPagina = false);
    }
  }

  ngAfterViewInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let promesaInicial = Promise.resolve();

      promesaInicial
        .then(() => this.fnListarRuta())
        .then(() => {
          this.fnChartRuta();
          this.fnChartCombustible();
        });
    }
  }

  async fnListarRuta() {
    try {
      let data: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReporteHistoricaRuta());
      if (data.exito) {
        this.lstRptRuta = data.datoAdicional;
        console.log(this.lstRptRuta);
        this.fnChartRuta();
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
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

  async fnListarCombustible() {
    try {
      let data: IDataResponse = await lastValueFrom(this.resultadosGeiService.listarReporteHistoricaCombustible());
      if (data.exito) {
        this.lstRptCombustible = data.datoAdicional;
        this.fnChartCombustible();
        this.fShowSkeleton = false;
      } else {
        this.fShowSkeleton = false;
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje <= 99 && error.error.codMensaje >= 87)
        this.seguridadService.logout(error.error.mensajeUsuario);
      else this.router.navigate(['/error-500']);
    }
  }

  fnChartRuta() {
    if (this.oChartRuta) this.oChartRuta.destroy();

    const labels = this.lstRptRuta.map(item => item.nAnio);

    let maxCO2eqLiFuente = 0;
    this.numVehiculosRuta = this.lstRptRuta.map(item => item.nAnio);

    this.lstRptRuta.forEach(mes => {
      let sum = mes.liRuta.reduce((acc: number, current: any) => acc + current.bdTotalGeiCO2eq, 0);
      if (sum > maxCO2eqLiFuente) maxCO2eqLiFuente = sum;
    });

    this.usedColors = {};

    const createDatasets = () => {
      let emisionesTotales: number[] = [];
      const datasets: any = {};
      this.lstRptRuta.forEach((mes, index) => {
        let sumatoriaAnual: number = 0;
        mes.liRuta.forEach((ruta: any) => {
          if (!datasets[ruta.sNombre]) {
            datasets[ruta.sNombre] = {
              type: 'bar',
              label: ruta.sNombre,
              data: new Array(this.lstRptRuta.length).fill(null),
              borderRadius: 16,
              barThickness: this.initialAncho[0],
              backgroundColor: this.getColor(ruta.sNombre),
              num_vehiculos: ruta.nTotalVehiculos
            };
          }
          const monthIndex = labels.indexOf(ruta.nAnio);
          datasets[ruta.sNombre].data[monthIndex] = ruta.bdTotalGeiCO2eq;
          sumatoriaAnual = sumatoriaAnual + ruta.bdTotalGeiCO2eq;
        });
        emisionesTotales.push(sumatoriaAnual);
      });
      datasets['Puntos'] = {
        type: 'line',
          label: 'Total de emisiones',
          borderColor: '#FF5757',
          borderWidth: 1,
          backgroundColor: '#FF5757',
          data: emisionesTotales,
      };
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
                  var dataset: any = context.dataset;
                  var index = context.dataIndex;
                  var currentValue = dataset.data[index];
                  var num_vehiculos = dataset.num_vehiculos;
                  const truncatedValue = typeof currentValue === 'number' ? self.truncateValue(currentValue, 2).toLocaleString() : currentValue;
                  let arrayLines;
                  if (num_vehiculos != undefined)
                  arrayLines = [' ' + truncatedValue + ' [tCO₂e]', 'Cant. vehículos: ' + num_vehiculos];
                  else arrayLines = [' ' + truncatedValue + ' [tCO₂e]'];
                  return arrayLines;
                }
              }
            },
          },
        },
      });
    };

    const pieChartRef = document.getElementById('chartRuta') as HTMLCanvasElement;
    if(pieChartRef != null) {
      const ChartContext = pieChartRef.getContext('2d')!;
      this.oChartRuta = createChart(ChartContext);
      setTimeout(() => {
        this.legendItemsRuta = this.oChartRuta?.legend?.legendItems;
      });
    }
  }

  fnChartCombustible(){
    if (this.oChartCombustible) this.oChartCombustible.destroy();

    const labels = this.lstRptCombustible.map(item => item.nAnio);

    let maxCO2eqLiFuente = 0;
    this.numVehiculosCombustible = this.lstRptCombustible.map(item => item.nAnio);

    this.lstRptCombustible.forEach(mes => {
      let sum = mes.liFactorEmision.reduce((acc: number, current: any) => acc + current.bdTotalGeiCO2eq, 0);
      if (sum > maxCO2eqLiFuente) maxCO2eqLiFuente = sum;
    });

    this.usedColors = {};

    const createDatasets = () => {
      let emisionesTotales: number[] = [];
      const datasets: any = {};
      this.lstRptCombustible.forEach((mes, index) => {
        let sumatoriaAnual: number = 0;
        mes.liFactorEmision.forEach((factor: any) => {
          if (!datasets[factor.sTipoCombustible]) {
            datasets[factor.sTipoCombustible] = {
              type: 'bar',
              label: factor.sTipoCombustible,
              data: new Array(this.lstRptCombustible.length).fill(null),
              borderRadius: 16,
              barThickness: this.initialAncho[0],
              backgroundColor: this.getColor(factor.sTipoCombustible),
              num_vehiculos: factor.nTotalVehiculos
            };
          }
          const monthIndex = labels.indexOf(factor.nAnio);
          datasets[factor.sTipoCombustible].data[monthIndex] = factor.bdTotalGeiCO2eq;
          sumatoriaAnual = sumatoriaAnual + factor.bdTotalGeiCO2eq;
        });
        emisionesTotales.push(sumatoriaAnual);
      });
      datasets['Puntos'] = {
        type: 'line',
          label: 'Total de emisiones',
          borderColor: '#FF5757',
          borderWidth: 1,
          backgroundColor: '#FF5757',
          data: emisionesTotales,
      };
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
                  var dataset: any = context.dataset;
                  var index = context.dataIndex;
                  var currentValue = dataset.data[index];
                  var num_vehiculos = dataset.num_vehiculos;
                  const truncatedValue = typeof currentValue === 'number' ? self.truncateValue(currentValue, 2).toLocaleString() : currentValue;
                  let arrayLines;
                  if (num_vehiculos != undefined)
                  arrayLines = [' ' + truncatedValue + ' [tCO₂e]', 'Cant. vehículos: ' + num_vehiculos];
                  else arrayLines = [' ' + truncatedValue + ' [tCO₂e]'];
                  return arrayLines;
                }
              }
            },
          },
        },
      });
    };

    const pieChartRef = document.getElementById('chartCombustible') as HTMLCanvasElement;
    if(pieChartRef != null) {
      const ChartContext = pieChartRef.getContext('2d')!;
      this.oChartCombustible = createChart(ChartContext);
  
      setTimeout(() => {
        this.legendItemsCombustible = this.oChartCombustible?.legend?.legendItems;
      });
    }
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

  toggleFuente(index: number, tipo: number): void {
    let dataset;
    switch(tipo) {
      case 1:
        dataset = this.oChartRuta.data.datasets[index];
        dataset.hidden = !dataset.hidden;
        this.legendItemsRuta[index].hidden = dataset.hidden;
    
        // Recalcular el valor máximo aquí
        this.recalculateMaxValue(tipo);
        this.oChartRuta.update();
        break;
      case 2:
        dataset = this.oChartCombustible.data.datasets[index];
        dataset.hidden = !dataset.hidden;
        this.legendItemsCombustible[index].hidden = dataset.hidden;
    
        // Recalcular el valor máximo aquí
        this.recalculateMaxValue(tipo);
  
        this.oChartCombustible.update();
        break;
    }

  }

  recalculateMaxValue(tipo: number): void {
    let maxCO2eqLiFuente = 0;
    const MIN_Y_AXIS_VALUE = 5;
    
    switch(tipo) {
      case 1 :
        this.lstRptRuta.forEach(mes => {
          let sum = mes.liRuta.reduce((acc: number, current: any) => {
            const datasetIndex = this.oChartRuta.data.datasets.findIndex((ds: any) => ds.label === current.sNombre);
            if (!this.oChartRuta.isDatasetVisible(datasetIndex)) return acc;
            return acc + current.bdTotalGeiCO2eq;
          }, 0);
          if (sum > maxCO2eqLiFuente) maxCO2eqLiFuente = sum;
        });
    
        if (maxCO2eqLiFuente < MIN_Y_AXIS_VALUE) maxCO2eqLiFuente = MIN_Y_AXIS_VALUE;
       
        this.oChartRuta.options.scales.y.max = maxCO2eqLiFuente * 1.3;
        this.oChartRuta.update();
        break;
      case 2:
        this.lstRptCombustible.forEach(item => {
          let sum = item.liFactorEmision.reduce((acc: any, current: any) => {
            // Asegurarse de sumar solo los valores de los datasets visibles
            const datasetIndex = this.oChartCombustible.data.datasets.findIndex((ds: any) => ds.label === current.sTipoCombustible);
            if (!this.oChartCombustible.isDatasetVisible(datasetIndex)) return acc;
            return acc + current.bdTotalGeiCO2eq;
          }, 0);
    
          if (sum > maxCO2eqLiFuente) maxCO2eqLiFuente = sum;
        });
    
        // Establecer un valor mínimo razonable si maxCO2eqLiFuente es 0 o muy bajo
        // El valor mínimo debe ser lo suficientemente alto para que las líneas de cuadrícula se muestren correctamente

        if (maxCO2eqLiFuente < MIN_Y_AXIS_VALUE) maxCO2eqLiFuente = MIN_Y_AXIS_VALUE;
    
        this.oChartCombustible.options.scales.y.max = maxCO2eqLiFuente * 1.2; // Ajusta el valor máximo del eje Y
        this.oChartCombustible.update(); // Asegúrate de actualizar el gráfico para reflejar el cambio
        break;
    }

  }

  updateChart(chart: any, cutoutValue: number) {
    if (chart) {
      chart.options.cutout = cutoutValue;
      chart.update();
    }
  }

  updateChartBar() {
    const cutoutValue = this.calculateChartDoughnut();
    this.updateChart(this.oChartRuta, cutoutValue);
    this.updateChart(this.oChartCombustible, cutoutValue);
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

  calculateChartBarThickness(tipo: number): number {
    const windowWidth = window.innerWidth;
    let isLengthGreaterThan11;

    switch(tipo) {
      case 1:
        isLengthGreaterThan11 = this.lstRptRuta.length > 10;
        break;
      case 2:
        isLengthGreaterThan11 = this.lstRptCombustible.length > 10;
        break;
    }

    for (const width of Object.keys(this.cutoutBarThickness)) {
      if (windowWidth < parseInt(width)) return this.cutoutBarThickness[width];
    }

    // Si la longitud de this.lstPartFuente.length es mayor que 11
    return isLengthGreaterThan11 ? 60 : 65;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallaAncho = event.target.innerWidth;
    this.initialAncho[0] = this.calculateChartBarThickness(1);
    this.initialAncho[1] = this.calculateChartBarThickness(2);

    if (this.lstRptRuta.length > 0 && this.oChartRuta.data.datasets.length > 0) {
      this.oChartRuta.data.datasets.forEach((dataset: any) => 
        dataset.barThickness = this.initialAncho[0]);
    }

    if (this.lstRptCombustible.length > 0 && this.oChartCombustible.data.datasets.length > 0) {
      this.oChartCombustible.data.datasets.forEach((dataset: any) => 
        dataset.barThickness = this.initialAncho[1]);
    }

    this.updateChartBar();

    if (this.oChartRuta) this.oChartRuta.update();
    if (this.oChartCombustible) this.oChartCombustible.update();
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
