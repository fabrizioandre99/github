
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ArchivoService } from 'src/app/services/archivo.service';
import { Component } from '@angular/core';
import { Chart, ChartItem, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PeriodoService } from 'src/app/services/periodo.service';
import { ParametroService } from 'src/app/services/parametro.service';
import { ReportesGeiService } from 'src/app/services/reportes-gei.service';

@Component({
  selector: 'app-panel-comparativo',
  templateUrl: './panel-comparativo.component.html',
  styleUrls: ['./panel-comparativo.component.css']
})
export class PanelComparativoComponent {
  oUsuario: IUsuario | undefined;
  periodo: any;
  nIdEmpresa: any;
  lstPeriodo: any[] = [];
  lstSector: any[] = [];

  model: any = {};
  modelfilter: any = {};

  totalEmpresa: any;
  lstPartEmpresa: any[] = [];

  totalCategoria: any;
  lstPartCategoria: any[] = [];

  lstFuenteEmision: any[] = [];
  lstPartFuente: any[] = [];

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

  currentColor: string = '#FFABAB';

  legendItemsCat: any;
  legendItemsCat_mod: any;
  legendItemsEmpresa: any;
  legendItemsEmpresa_mod: any;
  legendItemsFuente: any;
  legendItemsFuente_mod: any

  porcentajeCategoria: any[] = [];
  valorCategoria: any[] = [];
  porcentajeEmpresa: any[] = [];

  scrollSpeed = 6.7;
  scrollContainer: HTMLElement | null | undefined;
  initialCutout: number | undefined;
  initialAncho: number | undefined;

  sfFiltros: boolean = false;
  isLoadDescargar: boolean = false;
  isLoadFiltros: boolean = false;
  hasLongLabel: boolean = false;

  oChartCategoria!: Chart<'doughnut', number[], string>;
  oChartCategoriaMod!: Chart<'doughnut', number[], string>;
  oChartEmpresa!: Chart<'doughnut', number[], string>;
  oChartEmpresaMod!: Chart<'doughnut', number[], string>;
  oChartFuente!: any;
  oChartFuenteMod!: any;

  usedColors: { [key: string]: string } = {};
  objetoSubida: any = {
    liSector: []
  };

  pantallaAncho: number = window.innerWidth;
  valorAsignado: any = '-';
  checkDimensionsSubject = new Subject<void>();

  @ViewChild('containerSector') containerSectorRef: ElementRef;
  @ViewChild('containerPeriodo') containerPeriodoRef: ElementRef;

  showArrowsSector = false;
  showArrowsPeriodo = false;

  constructor(private reportesGeiService: ReportesGeiService, private parametroService: ParametroService, private periodoService: PeriodoService, private toastr: ToastrService, private seguridadService: SeguridadService, private archivoService: ArchivoService) {
    Chart.register(...registerables);
    this.checkDimensionsSubject.pipe(
      debounceTime(200)
    ).subscribe(() => {
      this.performDimensionCheck();
    });

  }

  ngOnInit(): void {
    this.nIdEmpresa = localStorage.getItem('LocalIdEmpresa_intercorp');
    this.initialCutout = this.calculateChartDoughnut();
  }


  ngAfterViewInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      Promise.all([this.listarSector()]).then(() => {
        Promise.all([this.listarPeriodo()]).then(() => {

          if (this.lstSector.length > 0) {
            const getNombreSector = this.lstSector.find(objeto => objeto.sCodigo === this.lstSector[0].sCodigo);
            this.modelfilter.nombreSector = getNombreSector.sValor;
          } else {
            this.modelfilter.nombreSector = 'No hay data.';
          }

          if (this.lstPeriodo.length > 0) {
            const getPeriodo = this.lstPeriodo.find(objeto => objeto.nIdPeriodo === this.lstPeriodo[0].nIdPeriodo);
            this.modelfilter.codPeriodo = getPeriodo.nAnio;
            this.modelfilter.nombrePeriodo = getPeriodo.nAnio;
          } else {
            this.modelfilter.codPeriodo = null;
            this.modelfilter.nombrePeriodo = 'No hay data.';
          }

          this.listarPartEmpresa();
          this.listarPartCategoria();
          this.buscarFuenteEmision();
          this.triggerDimensionCheck();
        });
      });
    }

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

  /* --------------------------------------------------------------*/
  /* --Mostrar las flechas cuando el contenido excede a su padre--*/

  triggerDimensionCheck() {
    this.checkDimensionsSubject.next();
  }

  performDimensionCheck() {
    if (this.containerSectorRef || this.containerPeriodoRef) {
      const containerSector = this.containerSectorRef?.nativeElement;
      const containerPeriodo = this.containerPeriodoRef?.nativeElement;

      if (containerSector) {
        this.showArrowsSector = containerSector.scrollWidth > containerSector.clientWidth;
      }

      if (containerPeriodo) {
        this.showArrowsPeriodo = containerPeriodo.scrollWidth > containerPeriodo.clientWidth;
      }

    }
  }
  /* -------------------------------------------------------------*/
  /* ----Detectar el width y establecer grosor al donut chart---- */

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateChartBar();

    this.pantallaAncho = event.target.innerWidth;

    const cutoutValue = this.calculateChartDoughnut();
    this.valorAsignado = cutoutValue;

    this.triggerDimensionCheck();
  }

  cutoutValues = {
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

  calculateChartDoughnut(): number {
    const windowWidth = window.innerWidth;
    for (const width of Object.keys(this.cutoutValues)) {
      if (windowWidth < parseInt(width)) {
        return this.cutoutValues[width];
      }
    }
    return 128;
  }

  updateChartBar() {
    const cutoutValue = this.calculateChartDoughnut();
    this.updateChart(this.oChartEmpresa, cutoutValue);
    this.updateChart(this.oChartCategoria, cutoutValue);
    this.updateChart(this.oChartFuente, cutoutValue);
  }

  /* ---------------------------------------------- */
  /* -------Configuración del radioGroup----------- */

  onCheckboxChange() {
    const allItem = this.lstSector.find(x => x.sCodigo === -1);
    if (allItem.checked) {
      for (let item of this.lstSector) {
        if (!item.checked && item.sCodigo !== -1) {
          allItem.checked = false;
          break;
        }
      }
    }
    const allChecked = this.lstSector.every(x => x.checked || x.sCodigo === -1);
    if (allChecked) {
      allItem.checked = true;
    }
    const selectedItems = this.lstSector.filter(x => x.checked && x.sCodigo !== -1);
    this.objetoSubida.liSector = selectedItems.map(x => x.sCodigo);

  }

  onAllCheckboxChange() {
    const allItem = this.lstSector.find(x => x.sCodigo === -1);

    if (allItem.checked) {
      this.lstSector.forEach(x => x.checked = true);
    } else {
      this.lstSector.forEach(x => x.checked = false);
    }

    this.onCheckboxChange();
  }
  /* ---------------------------------------------- */

  aplicarFiltros() {
    this.isLoadFiltros = true;
    this.model.nIdFuenteEmision = null;

    if (this.lstSector.length > 0) {
      // Primero, verifica si todos los checkboxes están seleccionados
      const allSelected = this.lstSector.every(item => item.checked);

      if (allSelected) {
        // Si todos están seleccionados, establecemos el nombreSector como "Todos"
        this.modelfilter.nombreSector = "Todos";
      } else {
        // Si no todos están seleccionados, vamos a concatenar los nombres de los sectores seleccionados.
        const selectedSectors = this.lstSector
          .filter(item => item.checked && item.sCodigo !== -1) // excluyendo el checkbox "Todos"
          .map(item => item.sValor) // obtenemos solo los nombres de los sectores
          .join(' - '); // unimos los nombres con " - "

        this.modelfilter.nombreSector = selectedSectors;
      }
    } else {
      this.modelfilter.nombreSector = 'No hay data.';
    }

    if (this.lstPeriodo.length > 0) {
      const getPeriodo = this.lstPeriodo.find(objeto => objeto.nAnio === this.model.nAnio);
      this.modelfilter.codPeriodo = getPeriodo.nAnio;
      this.modelfilter.nombrePeriodo = getPeriodo.nAnio;

    } else {
      this.modelfilter.codPeriodo = null;
      this.modelfilter.nombrePeriodo = 'No hay data.';
    }

    this.buscarFuenteEmision();
    this.listarPartEmpresa();
    this.listarPartCategoria();

    this.lstPartFuente = [];
    this.isLoadFiltros = false;
    this.sfFiltros = false;
  }


  buscarFuenteEmision() {
    const periodoEncontrado = this.lstPeriodo.find(periodo => periodo.nAnio === this.model.nAnio);

    if (periodoEncontrado) {
      this.lstFuenteEmision = periodoEncontrado.liFuenteEmision;
    }
  }

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


  async listarPeriodo() {
    try {
      let data: IDataResponse = await lastValueFrom(this.periodoService.listarByCodSector(this.objetoSubida.liSector));
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;

        this.model.nAnio = this.lstPeriodo[0]?.nAnio;
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

  async listarPartEmpresa() {
    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.participacionAnualPorEmpresa(this.modelfilter.codPeriodo, this.objetoSubida.liSector));
      if (data.exito) {

        if (data.datoAdicional.liEmpresa) {
          this.totalEmpresa = data.datoAdicional.bdTotalGeiCO2eq;
          this.lstPartEmpresa = data.datoAdicional.liEmpresa;
          this.fnChartEmpresa();
        } else {
          this.lstPartEmpresa = [];
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
    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.participaciónAnualPorCategoria(this.modelfilter.codPeriodo, this.objetoSubida.liSector));
      if (data.exito) {
        if (data.datoAdicional.liCategoria) {
          this.totalCategoria = data.datoAdicional.bdTotalEmisionCO2eq;
          this.lstPartCategoria = data.datoAdicional.liCategoria;

          this.fnChartCategoria();

        } else {
          this.lstPartCategoria = [];
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

  async listarPartFuente() {
    const getNombreFuente = this.lstFuenteEmision.find(objeto => objeto.nIdFuenteEmision === this.model.nIdFuenteEmision);
    this.modelfilter.fuente = getNombreFuente.sNombre;

    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.emisionAnualPorFuente(this.modelfilter.codPeriodo, this.objetoSubida.liSector,
        this.model.nIdFuenteEmision));
      if (data.exito) {
        this.lstPartFuente = data.datoAdicional;

        this.fnChartFuente();
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

  fnChartEmpresa() {
    if (this.oChartEmpresa) {
      this.oChartEmpresa.destroy();
    }
    if (this.oChartEmpresaMod) {
      this.oChartEmpresaMod.destroy();
    }

    const nombresArray = this.lstPartEmpresa.map(empresa => empresa.sNombreComercial);

    this.porcentajeEmpresa = this.lstPartEmpresa.map(empresa => empresa.bdPorcentaje);

    const valorEmpresa = this.lstPartEmpresa.map(empresa => empresa.bdTotalGeiCO2eq);

    const createChart = (canvas: HTMLCanvasElement, colorChart: string[], ChartContext: ChartItem, animate: any) => {
      return new Chart(ChartContext, {
        type: 'doughnut',
        data: {
          labels: nombresArray,
          datasets: [{
            data: this.porcentajeEmpresa,
            backgroundColor: this.arrayColor,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 0,
            borderRadius: 100,
          }]
        },
        options: {
          responsive: true,
          //maintainAspectRatio: true,
          devicePixelRatio: animate ? 2 : 5,
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
                family: 'Value Sans Pro',
                size: 12,
              },
              bodyFont: {
                family: 'Value Sans Pro',
                size: 12
              },
              callbacks: {
                label: (context) => {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  const arrayLines = [' ' + context.formattedValue + '%', ' ' + this.truncateValue(valorEmpresa[index], 2) + ' [tCO₂e]'];
                  return arrayLines;
                },
              },
            },

          },
          cutout: animate ? this.initialCutout : 128,
          animation: {
            duration: animate ? 1000 : 1000 // Ajusta la duración de la animación según el valor de "animate"
          },

        },
        plugins: [{
          id: 'firstDonutChart',
          afterDatasetsDraw: (chart, args, options) => {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();
            let str: any = this.truncateValue(this.totalEmpresa, 2);

            // Tamaño inicial de texto
            let fontSize = 50;

            // Medir el ancho del texto
            ctx.font = `bolder ${fontSize}px Value Sans Pro`;
            let textWidth = ctx.measureText(str).width;

            // Margen aumentado para dar más espacio
            const margin = 60;

            // Si el texto es más ancho que el gráfico, reducir el tamaño de la letra
            while (textWidth > width - margin && fontSize > 10) {
              fontSize -= 2; // Reducimos el tamaño en 2px
              ctx.font = `bolder ${fontSize}px Value Sans Pro`;
              textWidth = ctx.measureText(str).width;
            }

            let halfFontSize = fontSize / 2;

            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('' + str, width / 2, height / 2 + top);

            // Ajustar la posición vertical de "tCO₂e"
            const offset = fontSize * 0.15; // Ajuste para dar un pequeño espacio entre los textos
            ctx.font = `${halfFontSize}px Value Sans Pro`;
            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('tCO₂e', width / 2, height / 2 + top + halfFontSize + offset);
            ctx.restore();
          }
        }]


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

      this.checkForLongLabels();
    });

  }

  fnChartCategoria() {
    if (this.oChartCategoria) {
      this.oChartCategoria.destroy();
    }
    if (this.oChartCategoriaMod) {
      this.oChartCategoriaMod.destroy();
    }

    const nombresArray = this.lstPartCategoria.map(locacion => locacion.sNombre);

    this.porcentajeCategoria = this.lstPartCategoria.map(locacion => locacion.bdPorcentaje);

    this.valorCategoria = this.lstPartCategoria.map(empresa => empresa.bdTotalEmisionCO2eq);


    const categoriaColores = {
      '1': '#FF5757',
      '2': '#F3D223',
      '3': '#43D2FF',
      '4': '#4BE4F5'
    };

    const backgroundCategorias = nombresArray.map(nombre => {
      const match = nombre.match(/Categoría (\d+)/); // Busca la palabra "Categoría" seguida de un número en el nombre de la categoría
      const numeroCategoria = match ? match[1] : null;
      return numeroCategoria ? categoriaColores[numeroCategoria] || '#FFFFFF' : '#FFFFFF'; // Usa el color por defecto si no se encuentra el número de categoría
    });


    const createChart = (canvas: HTMLCanvasElement, colorChart: string[], ChartContext: ChartItem, animate: any) => {
      return new Chart(ChartContext, {
        type: 'doughnut',
        data: {
          labels: nombresArray,
          datasets: [{
            data: this.porcentajeCategoria,
            backgroundColor: backgroundCategorias,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 0,
            borderRadius: 100,
          }]
        },
        options: {
          responsive: true,
          devicePixelRatio: animate ? 2 : 5,
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
                  return context[0].label.substring(0, 11);
                },
                label: (context) => {
                  var dataset = context.dataset;
                  var index = context.dataIndex;
                  const arrayLines = [' ' + context.formattedValue + '%', ' ' + this.truncateValue(this.valorCategoria[index], 2) + ' [tCO₂e]'];
                  return arrayLines;
                },
              },
            }
          },
          cutout: animate ? this.initialCutout : 128,
          animation: {
            duration: animate ? 1000 : 1000 // Ajusta la duración de la animación según el valor de "animate"
          },

        },
        plugins: [{
          id: 'secondDonutChart',
          afterDatasetsDraw: (chart, args, options) => {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();
            let str: any = this.truncateValue(this.totalCategoria, 2);

            // Tamaño inicial de texto
            let fontSize = 50;

            // Medir el ancho del texto
            ctx.font = `bolder ${fontSize}px Value Sans Pro`;
            let textWidth = ctx.measureText(str).width;

            // Margen aumentado para dar más espacio
            const margin = 60;

            // Si el texto es más ancho que el gráfico, reducir el tamaño de la letra
            while (textWidth > width - margin && fontSize > 10) {
              fontSize -= 2; // Reducimos el tamaño en 2px
              ctx.font = `bolder ${fontSize}px Value Sans Pro`;
              textWidth = ctx.measureText(str).width;
            }

            let halfFontSize = fontSize / 2;

            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('' + str, width / 2, height / 2 + top);

            // Ajustar la posición vertical de "tCO₂e"
            const offset = fontSize * 0.15; // Ajuste para dar un pequeño espacio entre los textos
            ctx.font = `${halfFontSize}px Value Sans Pro`;
            ctx.fillStyle = '#002FA1';
            ctx.textAlign = 'center';
            ctx.fillText('tCO₂e', width / 2, height / 2 + top + halfFontSize + offset);
            ctx.restore();
          }
        }]

      });
    };

    const pieChartRef = document.getElementById('chartCategoria') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = ['#23DEF3', '#FF5757', '#A480FF'];
    this.oChartCategoria = createChart(pieChartRef, colorChart, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartCategoria_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartCategoriaMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      this.legendItemsCat = this.oChartCategoria?.legend?.legendItems;
      this.legendItemsCat_mod = this.oChartCategoriaMod?.legend?.legendItems;

    });
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

  fnChartFuente() {

    if (this.oChartFuente) {
      this.oChartFuente.destroy();
    }

    if (this.oChartFuenteMod) {
      this.oChartFuenteMod.destroy();
    }

    const labels = this.lstPartFuente.map(item => item.sCodMes);
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
              borderColor: this.getColor(fuente.sNombreComercial),
              backgroundColor: this.getColor(fuente.sNombreComercial),
            };
          }
          const monthIndex = labels.indexOf(fuente.sCodMes);
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
                const lighterColor = this.makeColorLighter(originalColor, 0.5);
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
                  return '' + truncatedValue + ' [tCO₂e/mes]';
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


  checkForLongLabels(): void {
    for (let item of this.legendItemsEmpresa) {
      if (item.text.length > 30) {
        this.hasLongLabel = true;
        break;
      }
    }
  }

  getTooltipClass(text: string): string {
    if (text.substring(0, 11).includes('1')) {
      this.currentColor = '#FFABAB';
      return 'tooltip_red';
    } else if (text.substring(0, 11).includes('2')) {
      this.currentColor = '#F9E891';
      return 'tooltip_yellow';
    } else if (text.substring(0, 11).includes('3')) {
      this.currentColor = '#A1E8FF';
      return 'tooltip_blue';
    } else if (text.substring(0, 11).includes('4')) {
      this.currentColor = '#A5F1FA';
      return 'tooltip_lightblue';
    }
    return '';
  }

  toggleCategoria(index: number): void {
    const dataset = this.oChartCategoria.data.datasets[0];
    const meta: any = this.oChartCategoria.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendItemsCat[index].hidden = isHidden;

    this.oChartCategoria.update();
  }

  toggleFuente(index: number): void {
    const dataset = this.oChartFuente.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsFuente[index].hidden = dataset.hidden;

    this.oChartFuente.update();
  }

  toggleEmpresa(index: number): void {
    const dataset = this.oChartEmpresa.data.datasets[0];
    const meta: any = this.oChartEmpresa.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendItemsEmpresa[index].hidden = isHidden;

    this.oChartEmpresa.update();
  }

  convertToImage() {
    this.isLoadDescargar = true;
    setTimeout(() => {
      this.archivoService.descargarReporte('dowloandPdf', 4);
      this.isLoadDescargar = false;
    }, 1100);
  }

  generarColorAleatorio(): string {
    const hue = Math.random() * 360; // Hue en grados (0-360)
    const saturation = Math.random() * 100; // Saturación (0-100)
    const lightness = Math.random() * 50 + 25; // Luminosidad (25-75)

    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    return color;
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

}








