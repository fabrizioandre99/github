import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ArchivoService } from 'src/app/services/archivo.service';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Chart, ChartItem, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ParametroService } from 'src/app/services/parametro.service';
import { ReportesGeiService } from 'src/app/services/reportes-gei.service';
import { FuenteEmisionService } from 'src/app/services/fuente-emision.service';

@Component({
  selector: 'app-indicadores-gei',
  templateUrl: './indicadores-gei.component.html',
  styleUrls: ['./indicadores-gei.component.css']
})

export class IndicadoresGeiComponent {
  oUsuario: IUsuario | undefined;
  periodo: any;

  model: any = {};
  modelfilter: any = {};

  porcentajeProgreso: any;

  lstSector: any[] = [];
  lstPartVentas: any[] = [];
  lstFuenteEmision: any[] = [];
  lstPartFuente: any[] = [];

  legendItemsEmpresa: any;
  legendItemsEmpresa_mod: any;

  legendItemsFuente: any;
  legendItemsFuente_mod: any;

  scrollContainer: HTMLElement | null | undefined;
  scrollSpeed = 6.7;

  initialCutout: number | undefined;
  initialAncho: number | undefined;

  sfFiltros: boolean = false;
  isLoadDescargar: boolean = false;
  isLoadFiltros: boolean = false;
  showArrows: boolean = false;

  selectedUnidadNegocio: any;
  arrayColor = [
    "#F60C2F",
    "#0079FF",
    "#50D890",
    "#FFD31D",
    "#94DD4D",
    "#6528F7",
    "#765827",
    "#23DEF3",
    "#F3D223",
    "#FF0060",
    "#F6FA70",
    "#BA704F",
    "#A480FF",
    "#F94C10",
    "#AD09DD",
    "#F900BF",
    "#172774",
    "#FF5757",
    "#FBA1B7"
  ];

  oChartEmpresa!: any;
  oChartEmpresaMod!: any;

  oChartFuente!: any;
  oChartFuenteMod!: any;
  usedColors: { [key: string]: string } = {}; // Declaración de usedColors
  objetoSubida: any = {
    liSector: []
  };

  @ViewChild('containerRef', { static: false }) containerRef!: ElementRef;
  checkDimensionsSubject = new Subject<void>();

  constructor(private fuenteEmisionService: FuenteEmisionService, private reportesGeiService: ReportesGeiService, private parametroService: ParametroService, private toastr: ToastrService, private seguridadService: SeguridadService, private archivoService: ArchivoService,
  ) {
    Chart.register(...registerables);
    this.checkDimensionsSubject.pipe(
      debounceTime(200)
    ).subscribe(() => {
      this.performDimensionCheck();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      Promise.all([this.listarSector(), this.fnListarFuenteEmision()]).then(() => {
        this.listarPartVentas();
        this.triggerDimensionCheck();
      });

    }
  }

  /* --------------Truncar los números-----------*/
  truncateValue(value: number, decimals: number): string {
    const multiplier = 10 ** decimals;
    const truncatedValue = Math.trunc(value * multiplier) / multiplier;
    return truncatedValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /* ----------------------------------------------*/
  /* -------Hacer scrolling a los  radiogroup-----*/
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

  checkIfArrowsShouldBeShown(container: HTMLElement): void {
    if (container) {
      this.showArrows = container.scrollWidth > container.clientWidth;
    }
  }

  /* --------------------------------------------------------------*/
  /* --Mostrar las flechas cuando el contenido excede a su padre--*/

  onContentChanged() {
    this.triggerDimensionCheck();
  }

  triggerDimensionCheck() {
    this.checkDimensionsSubject.next();
  }

  private performDimensionCheck() {
    const container = this.containerRef.nativeElement;
    if (container) {
      this.showArrows = container.scrollWidth > container.clientWidth;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.triggerDimensionCheck();
  }

  /* ---------------------------------------------- */
  /* -------Configuración del radioGroup----------- */
  onCheckboxChange() {
    const allItem = this.lstSector.find(x => x.sCodigo === -1);
    if (allItem.checked) {
      const isAnyUnchecked = this.lstSector.some(x => !x.checked && x.sCodigo !== -1);
      if (isAnyUnchecked) {
        allItem.checked = false;
      }
    }

    const allCheckedExceptAllItem = this.lstSector.every(x => x.checked || x.sCodigo === -1);
    if (allCheckedExceptAllItem) {
      allItem.checked = true;
    }

    const selectedSectors = this.lstSector.filter(x => x.checked && x.sCodigo !== -1);
    this.objetoSubida.liSector = selectedSectors.map(x => x.sCodigo);

    if (selectedSectors.length === this.lstSector.length - 1) {
      this.modelfilter.nombreSector = 'Todos';
    } else {
      this.modelfilter.nombreSector = selectedSectors.map(x => x.sValor).join(' - ');
    }

    // Actualiza la lista de códigos seleccionados para la subida.
    const selectedItems = this.lstSector.filter(x => x.checked && x.sCodigo !== -1);
    this.objetoSubida.liSector = selectedItems.map(x => x.sCodigo);

    this.listarPartVentas();


    if (this.model.nIdFuenteEmision) {
      this.listarPartFuente();
    }
  }

  onAllCheckboxChange() {
    const allItem = this.lstSector.find(x => x.sCodigo === -1);
    this.lstSector.forEach(x => x.checked = allItem.checked); // Cambiar todos basado en "Todos"

    this.onCheckboxChange(); // Llama a onCheckboxChange para manejar la lógica de actualización
  }
  /* ---------------------------------------------- */

  async listarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('SECTOR'));
      if (data.exito) {
        this.lstSector = data.datoAdicional;

        if (this.lstSector.length > 0) {

          this.lstSector.unshift({
            "sCodigo": -1,
            "sValor": "Todos"
          });

          for (let item of this.lstSector) {
            item.checked = true;
          }
          //Seleccionar todos los checkboxes de Sector
          const selectedItems = this.lstSector.filter(x => x.checked && x.sCodigo !== -1);
          this.objetoSubida.liSector = selectedItems.map(x => x.sCodigo);

          this.modelfilter.nombreSector = 'Todos';

        } else {
          this.modelfilter.nombreSector = 'No hay data';
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

  async listarPartVentas() {
    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.indicadorVentasAnualPorSector(this.objetoSubida));
      if (data.exito) {
        this.lstPartVentas = data.datoAdicional;

        this.fnChartEmpresa();
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

  async fnListarFuenteEmision() {
    try {
      let data: IDataResponse = await lastValueFrom(this.fuenteEmisionService.listarFuenteEmision());
      if (data.exito) {
        this.lstFuenteEmision = data.datoAdicional;
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

  async listarPartFuente() {
    const getNombreFuente = this.lstFuenteEmision.find(objeto => objeto.nIdFuenteEmision === this.model.nIdFuenteEmision);
    this.modelfilter.fuente = getNombreFuente.sNombre;

    let data: IDataResponse = await lastValueFrom(this.reportesGeiService.emisionesGEIAnualPorFuente(this.model.nIdFuenteEmision, this.objetoSubida.liSector));

    if (data.exito) {
      this.lstPartFuente = data.datoAdicional;

      this.fnChartFuente();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }


  fnChartEmpresa() {
    if (this.oChartEmpresa) {
      this.oChartEmpresa.destroy();
    }

    if (this.oChartEmpresaMod) {
      this.oChartEmpresaMod.destroy();
    }
    const labels = this.lstPartVentas.map(item => item.nAnio);
    const datasets = {};

    const self = this;
    const arrayColors = this.arrayColor;

    this.usedColors = {};

    this.lstPartVentas.forEach((item, index) => {
      item.liEmpresa
        .forEach(fuente => {
          if (!datasets[fuente.sNombreComercial]) {
            datasets[fuente.sNombreComercial] = {
              label: fuente.sNombreComercial,
              data: new Array(this.lstPartVentas.length).fill(null),
              borderWidth: 2,
              borderColor: this.getColor(fuente.sNombreComercial),
              backgroundColor: this.getColor(fuente.sNombreComercial),
            };
          }
          const monthIndex = labels.indexOf(fuente.nAnio);
          datasets[fuente.sNombreComercial].data[monthIndex] = fuente.bdTotalGeiCO2eq;
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
              /*   stacked: true, // Apilar barras en el eje x */
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              },
              offset: this.lstPartVentas[1]?.liEmpresa?.length > 0 ? false : true,
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
                  return '' + truncatedValue + ' [tCO₂e/PEN]';
                }
              }
            },
          },
        }
      });
    };

    const pieChartRef = document.getElementById('chartEmpresa') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartEmpresa = createChart(pieChartRef, colorChart, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartEmpresa_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartEmpresaMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      this.legendItemsEmpresa = this.oChartEmpresa?.legend?.legendItems;
      this.legendItemsEmpresa_mod = this.oChartEmpresaMod?.legend?.legendItems;
    });
  }


  fnChartFuente() {
    if (this.oChartFuente) {
      this.oChartFuente.destroy();
    }

    if (this.oChartFuenteMod) {
      this.oChartFuenteMod.destroy();
    }

    const labels = this.lstPartFuente.map(item => item.nAnio);
    const datasets = {};

    const self = this;
    const arrayColors = this.arrayColor;

    this.usedColors = {};

    this.lstPartFuente.forEach((item, index) => {
      item.liEmpresa
        .forEach(fuente => {
          if (!datasets[fuente.sNombreComercial]) {
            datasets[fuente.sNombreComercial] = {
              label: fuente.sNombreComercial,
              data: new Array(this.lstPartFuente.length).fill(null),
              borderWidth: 2,
              borderColor: this.getColor(fuente.sNombreComercial),
              backgroundColor: this.getColor(fuente.sNombreComercial),
            };
          }
          const monthIndex = labels.indexOf(fuente.nAnio);
          datasets[fuente.sNombreComercial].data[monthIndex] = fuente.bdTotalGeiCO2eq;
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
              left: 30
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              }, border: {
                display: false
              },
              /*   stacked: true, // Apilar barras en el eje x */
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              },
              offset: this.lstPartFuente[1]?.liEmpresa?.length > 0 ? false : true,
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

                  return '' + truncatedValue + ' [tCO₂e/año]';
                }
              }
            },
          },
        }
      });
    };

    const pieChartRef = document.getElementById('chartFuente') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartFuente = createChart(pieChartRef, colorChart, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartFuente_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartFuenteMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      this.legendItemsFuente = this.oChartFuente?.legend?.legendItems;
      this.legendItemsFuente_mod = this.oChartFuenteMod?.legend?.legendItems;
    });
  }


  toggleEmpresa(index: number): void {
    const dataset = this.oChartEmpresa.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsEmpresa[index].hidden = dataset.hidden;

    this.oChartEmpresa.update();
  }


  toggleFuente(index: number): void {
    const dataset = this.oChartFuente.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsFuente[index].hidden = dataset.hidden;

    this.oChartFuente.update();
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

  convertToImage() {
    this.isLoadDescargar = true;
    setTimeout(() => {
      this.archivoService.descargarReporte('dowloandPdf', 3);
      this.isLoadDescargar = false;
    }, 1100);
  }
}
