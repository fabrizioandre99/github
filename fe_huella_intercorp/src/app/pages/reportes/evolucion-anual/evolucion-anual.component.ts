
import { AfterViewInit, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ArchivoService } from 'src/app/services/archivo.service';
import { Component } from '@angular/core';
import { Chart, ChartItem, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LocacionService } from 'src/app/services/locacion.service';
import { ReportesGeiService } from 'src/app/services/reportes-gei.service';
import { PeriodoService } from 'src/app/services/periodo.service';

@Component({
  selector: 'app-evolucion-anual',
  templateUrl: './evolucion-anual.component.html',
  styleUrls: ['./evolucion-anual.component.css']
})
export class EvolucionAnualComponent implements OnInit, AfterViewInit {
  oUsuario: IUsuario | undefined;
  periodo: any;
  nIdEmpresa: any;
  nombreComercial: any;

  lstLocacion: any[] = [];
  lstPartCategoria: any[] = [];
  porcentajeLocacion: any[] = [];
  lstPartVentas: any[] = [];

  totalXVentas: any;
  isLoadFiltros: boolean = false;
  arrayColor = [
    '#FF5757',
    '#F3D223',
    '#43D2FF',
    '#4BE4F5'
  ];

  model: any = {};
  modelfilter: any = {};

  legendItemsCategoria: any;
  legendItemsCategoria_mod: any;
  legendItemsVentas: any;
  legendItemsVentas_mod: any;

  scrollContainer: HTMLElement | null | undefined;
  scrollSpeed = 6.7;

  sfFiltros: boolean = false;
  isLoadDescargar: boolean = false;
  selectedUnidadNegocio: any;

  oChartCategoria!: any;
  oChartCategoriaMod!: any;
  oChartVentas!: any;
  oChartVentasMod!: any;

  noHayLocacion: boolean = false;

  constructor(private reportesGeiService: ReportesGeiService,
    private locacionService: LocacionService, private periodoService: PeriodoService, private toastr: ToastrService, private seguridadService: SeguridadService, private archivoService: ArchivoService) {
    Chart.register(...registerables);
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
  /* ---------------------------------------------- */
  /* -------Hacer scrolling a los  radiogroup----- */
  startScroll(event: MouseEvent, direction: 'left' | 'right') {
    const container = (event.currentTarget as HTMLElement)?.parentElement?.querySelector('.overflow-auto') as HTMLElement | null;
    if (container) {
      this.scrollContainer = container;
      this.scroll(direction);
    }
  }

  stopScroll() {
    this.scrollContainer = null;
  }

  scroll(direction: 'left' | 'right') {
    if (this.scrollContainer) {
      const scrollAmount = direction === 'left' ? -this.scrollSpeed : this.scrollSpeed;
      this.scrollContainer.scrollBy({ left: scrollAmount });
      requestAnimationFrame(() => this.scroll(direction));
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.scrollBy({
      left: event.deltaY < 0 ? -30 : 30
    });
  }
  /* ---------------------------------------------- */


  ngOnInit(): void {
    this.nIdEmpresa = localStorage.getItem('LocalIdEmpresa_intercorp');
    this.nombreComercial = localStorage.getItem('LocalNombreComercial_intercorp');
  }

  ngAfterViewInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      Promise.all([this.fnListarLocacion()]).then(() => {

        if (this.lstLocacion.length > 0) {

          this.modelfilter.locacion = 'Todas';

          // Llama a todas las funciones simultáneamente usando forkJoin
          this.listarPartCategoria();
          this.listarPartVentas();
        } else {
          this.noHayLocacion = true;
        }
      });
    }

  }

  async fnListarLocacion() {
    try {
      let data: IDataResponse = await lastValueFrom(this.locacionService.listarLocacion(this.nIdEmpresa));
      this.lstLocacion = data.datoAdicional;

      if (data.exito) {

        if (this.lstLocacion.length > 0) {
          this.lstLocacion.unshift({
            "nIdLocacion": -1,
            "sNombre": "Todos"
          });
          this.model.nIdLocacion = -1;
        } else {
          this.modelfilter.locacion = 'No hay data';
        }

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  async listarPartCategoria() {
    let idLocacion = this.model.nIdLocacion;
    if (this.model.nIdLocacion == -1) { idLocacion = null! }
    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.emisionAnualPorCategoria(idLocacion, this.nIdEmpresa));
      if (data.exito) {
        this.lstPartCategoria = data.datoAdicional;
        this.fnChartCategoria();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }

  async listarPartVentas() {
    let idLocacion = this.model.nIdLocacion;
    if (this.model.nIdLocacion == -1) { idLocacion = null! }

    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.indicadoreVentasAnual(idLocacion, this.nIdEmpresa));
      if (data.exito) {
        this.lstPartVentas = data.datoAdicional;

        this.fnChartVentas();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    }
    catch (error: any) {
      if (error.error.codMensaje == 86
        || error.error.codMensaje == 87 || error.error.codMensaje == 88 || error.error.codMensaje == 89
        || error.error.codMensaje == 98 || error.error.codMensaje == 99) {
        this.seguridadService.logout();
        window.open(error.error.mensajeUsuario, '_self');
      } else {
        this.toastr.error('Existen problemas en el servidor.', 'Error');
      }
    }
  }


  aplicarFiltros() {
    this.isLoadFiltros = true;

    const getLocacion = this.lstLocacion.find((item: any) => item.nIdLocacion === this.model.nIdLocacion);
    if (getLocacion) { this.modelfilter.locacion = getLocacion.sNombre; }

    this.listarPartCategoria();
    this.listarPartVentas();
    this.isLoadFiltros = false;
    this.sfFiltros = false;
  }

  limpiarFiltro() {
    this.model.nIdLocacion = -1;
  }


  fnChartCategoria() {
    if (this.oChartCategoria) {
      this.oChartCategoria.destroy();
    }

    if (this.oChartCategoriaMod) {
      this.oChartCategoriaMod.destroy();
    }
    const labels = this.lstPartCategoria.map(item => item.nAnio);
    const datasets = {};

    const self = this;
    const arrayColors = this.arrayColor;
    // Define un objeto que mapea los colores a las categorías específicas
    const categoriaColores = {
      'Categoría 1': '#FF5757',
      'Categoría 2': '#F3D223',
      'Categoría 3': '#43D2FF',
      'Categoría 4': '#4BE4F5'
    };

    this.lstPartCategoria.forEach((item, index) => {
      item.liFuenteEmision.forEach(fuente => {
        if (!datasets[fuente.sNombre]) {
          const categoriaNombre = fuente.sNombre.split(":")[0].trim(); // Obtiene la primera palabra de la etiqueta
          const categoriaColor = categoriaColores[categoriaNombre] || '#FFFFFF'; // Obtiene el color de acuerdo con la categoría

          datasets[fuente.sNombre] = {
            label: fuente.sNombre,
            data: new Array(this.lstPartCategoria.length).fill(null),
            borderColor: categoriaColor,
            borderWidth: 2,
            backgroundColor: categoriaColor,
          };
        }
        const datasetIndex = Object.keys(datasets).indexOf(fuente.sNombre); // Encuentra el índice del conjunto de datos
        const monthIndex = labels.indexOf(item.nAnio); // Encuentra el índice del label
        datasets[fuente.sNombre].data[monthIndex] = fuente.bdTotalEmisionCO2eq;
      });
    });

    const createChart = (canvas: HTMLCanvasElement, colorChart: string[], ChartContext: ChartItem, animate: any) => {
      return new Chart(ChartContext, {
        plugins: animate ? [] : [ChartDataLabels],
        type: 'line',
        data: {
          labels: labels,
          datasets: Object.values(datasets),
        },
        options: {
          devicePixelRatio: animate ? 2 : 3,
          layout: {
            padding: {
              right: 30,
              left: 30,
              top: 20,
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              }, border: {
                display: false
              },
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              },
              offset: this.lstPartCategoria[1]?.liFuenteEmision?.length > 0 ? false : true,
            },
            y: {
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              }
              , border: {
                display: false
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: animate ? 1000 : 1000 // Ajusta la duración de la animación según el valor de "animate"
          },
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              backgroundColor: function (context) {
                return arrayColors[context.datasetIndex];
              },
              borderRadius: 4,
              color: 'white',
              font: {
                weight: 'bold', family: 'Value Sans Pro',
              }, formatter: function (value, context) {
                const data = context.dataset.data[context.dataIndex];
                if (typeof data === 'number') {
                  return self.truncateValue(data, 2).toLocaleString();
                } else {
                  // Manejar el caso en que el valor no es un número, si es necesario
                  return '';
                }
              },
              padding: 6
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
                family: 'Value Sans Pro',
                size: 12,
              },
              bodyFont: {
                family: 'Value Sans Pro',
                size: 12
              },
              callbacks: {
                title: function (context) {
                  const datasetLabels = context.map(item => item.dataset.label ? item.dataset.label.substring(0, 11) : '').join('\n');
                  return datasetLabels;
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
        }
      });
    };

    const pieChartRef = document.getElementById('chartCategoria') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartCategoria = createChart(pieChartRef, colorChart, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartCategoria_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartCategoriaMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendItemsCategoria = this.oChartCategoria?.legend?.legendItems;
      this.legendItemsCategoria_mod = this.oChartCategoriaMod?.legend?.legendItems;
    });
  }


  fnChartVentas() {
    if (this.oChartVentas) {
      this.oChartVentas.destroy();
    }

    if (this.oChartVentasMod) {
      this.oChartVentasMod.destroy();
    }

    const arrayAnios = this.lstPartVentas.map(item => item.nAnio);

    const arrayIndicadores = this.lstPartVentas.map(item => item.bdIndicadorVentas);

    const arrayColors = this.arrayColor;
    const self = this;

    const createChart = (canvas: HTMLCanvasElement, ChartContext: ChartItem, animate: any) => {
      return new Chart(ChartContext, {
        plugins: animate ? [] : [ChartDataLabels],
        type: 'line',
        data: {
          labels: arrayAnios,
          datasets: [{
            data: arrayIndicadores,
            backgroundColor: '#A480FF',
            borderColor: '#A480FF',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          devicePixelRatio: animate ? 2 : 3,
          layout: {
            padding: {
              right: 30,
              left: 30,
              top: 20
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              }, border: {
                display: false
              },
              /*  stacked: true, // Apilar barras en el eje x */
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              },
              offset: this.lstPartVentas.length > 1 ? false : true,
            },
            y: {
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              }
              , border: {
                display: false
              },
            },
          },
          /* responsive: true, */
          maintainAspectRatio: false,
          animation: {
            duration: animate ? 1000 : 1000 // Ajusta la duración de la animación según el valor de "animate"
          },
          plugins: {
            legend: {
              display: false,
            },

            datalabels: {
              backgroundColor: '#A480FF',
              borderRadius: 4,
              color: 'white',
              font: {
                weight: 'bold', family: 'Value Sans Pro',
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
              padding: 6
            },
            tooltip: {
              titleColor: '#002FA1',
              bodyColor: '#002FA1',
              displayColors: false,
              backgroundColor: (tooltipItem) => {
                const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
                const lighterColor = this.makeColorLighter(originalColor, 0.5); // Ajusta el valor de 'amount' según se necesite

                return lighterColor;
              },
              titleFont: {
                family: 'Value Sans Pro',
                size: 12,
              },
              bodyFont: {
                family: 'Value Sans Pro',
                size: 12
              },
              callbacks: {
                title: function (context) {
                  return 'GEI por Ventas';
                },
                label: function (context) {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  var currentValue = dataset.data[index];

                  const truncatedValue = typeof currentValue === 'number' ? self.truncateValue(currentValue, 2).toLocaleString() : currentValue;

                  // Puedes personalizar el contenido del tooltip aquí
                  return '' + truncatedValue + ' [tCO₂e/PEN]';
                }
              },
            }
          },

        },

      });
    };

    const pieChartRef = document.getElementById('chartVentas') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    this.oChartVentas = createChart(pieChartRef, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartVentas_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartVentasMod = createChart(pieChartRefMod, ChartContextMod, false);
  }


  toggleCategoria(index: number): void {
    const dataset = this.oChartCategoria.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsCategoria[index].hidden = dataset.hidden;

    this.oChartCategoria.update();
  }

  toggleVentas(index: number): void {
    const dataset = this.oChartVentas.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsVentas[index].hidden = dataset.hidden;

    this.oChartVentas.update();
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

  convertToImage() {
    this.isLoadDescargar = true;
    setTimeout(() => {
      this.archivoService.descargarReporte('dowloandPdf', 2);
      this.isLoadDescargar = false;
    }, 1100);
  }
}








