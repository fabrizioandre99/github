
import { AfterViewInit, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { IUsuario } from 'src/app/models/usuario';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { ArchivoService } from 'src/app/services/archivo.service';
import { ReportesGeiService } from 'src/app/services/reportes-gei.service';
import { Component } from '@angular/core';
import { Chart, ChartDataset, ChartItem, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { PeriodoService } from 'src/app/services/periodo.service';
import { LocacionService } from 'src/app/services/locacion.service';
import { ActivatedRoute } from '@angular/router';
import { ParametroService } from 'src/app/services/parametro.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-emisiones-gei',
  templateUrl: './emisiones-gei.component.html',
  styleUrls: ['./emisiones-gei.component.css']
})

export class EmisionesGeiComponent implements OnInit, AfterViewInit {
  oUsuario: IUsuario | undefined;
  nIdPeriodo: any;
  nIdEmpresa: any;
  totalLocaciones: any;

  model: any = {};
  modelfilter: any = {};
  porcentajeProgreso: any;
  nombreComercial: any;
  previousAnio: number | null = null;
  previousEmpresa: number | null = null;

  lstLocacion: any[] = [];
  lstPeriodo: any[] = [];
  lstSector: any[] = [];

  lstEmpresas: any[] = [];

  lstPartLocacion: any[] = [];
  lstPartCategoria: any[] = [];
  lstPartFuente: any[] = [];
  valorCategoria: any[] = [];

  porcentajeCategoria: any[] = [];
  porcentajeLocacion: any[] = [];

  totalLocacion: any;
  totalCategoria: any;

  legendItemsCat: any;
  legendItemsCat_mod: any;

  legendItemsLoc: any;
  legendItemsLoc_mod: any;

  legendItemsFuente: any;
  legendItemsFuente_mod: any;

  scrollContainer: HTMLElement | null | undefined;
  scrollSpeed = 6.7;
  initialCutout: number | undefined;
  initialAncho: number | undefined;

  sfFiltros: boolean = true;
  isLoadDescargar: boolean = false;
  isLoadFiltros: boolean = false;
  isLoadAllPage: boolean = true;
  noHayPeriodo: boolean = false;
  esAdmin: boolean = false;
  hasLongLabel: boolean = false;

  arrayColor = [
    '#A480FF', // Morado
    '#23DEF3', // Celeste
    '#FF5757', // Rojo
    '#F3D223', // Naranja
    '#8AFFC7', // Verde Agua
    '#FFB35A', // Naranja
    '#D37CFF', // Fucsia
    '#FF7575', // Carmesí
    '#9AE65E', // Verde Oscuro
    '#DBC9B5', // Marrón
    '#00A1FF', // Azul
    '#E400FF', // Rosado
    '#23DEB8', // Verde Claro
    '#FFAACC', // Lila
    '#6ED6FF', // Celeste
    '#FF965A', // Naranja
    '#DAD6B5', // Beige
    '#FF3EAA', // Rosa
    '#78FFC7', // Turquesa
    '#FFDD5A', // Amarillo
    '#B37CFF', // Lavanda
    '#A4E65E', // Verde Lima
    '#C1C1C1', // Gris Claro
    '#A5BCFF', // Azul Cielo
    '#F900FF', // Magenta
    '#23DE87', // Verde Menta
    '#FFD6AC', // Melocotón
    '#FF4747', // Rojo Brillante
    '#F3E223', // Amarillo Brillante
    '#FF9EB3', // Rosa Claro
    '#7AFFD0', // Verde Agua Claro
    '#FFD15A', // Naranja Brillante
    '#E37CFF', // Lila Oscuro
  ];
  currentColor: string = '#FFABAB';

  oChartLocacion!: Chart<'doughnut', number[], string>;
  oChartLocacionMod!: Chart<'doughnut', number[], string>;
  oChartCategoria!: Chart<'doughnut', number[], string>;
  oChartCategoriaMod!: Chart<'doughnut', number[], string>;
  oChartFuente!: any;
  oChartFuenteMod!: any;

  usedColors: { [key: string]: string } = {}; // Declaración de usedColors

  pantallaAncho: number = window.innerWidth;
  valorAsignado: any = '-';

  constructor(private activatedRoute: ActivatedRoute, private reportesGeiService: ReportesGeiService, private empresaService: EmpresaService, private parametroService: ParametroService,
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

  /* ----Detectar el width y establecer grosor al donut chart---- */

  calculateChartDoughnut(): number {
    const windowWidth = window.innerWidth;
    for (const width of Object.keys(this.cutoutValues)) {
      if (windowWidth < parseInt(width)) {
        return this.cutoutValues[width];
      }
    }
    return 128;
  }

  calculateChartBarThickness(): number {
    const windowWidth = window.innerWidth;

    // Comprueba si la longitud de this.lstPartFuente es mayor a 11
    const isLengthGreaterThan11 = this.lstPartFuente.length > 10;

    for (const width of Object.keys(this.cutoutBarThickness)) {
      if (windowWidth < parseInt(width)) {
        return this.cutoutBarThickness[width];
      }
    }

    // Si la longitud de this.lstPartFuente.length es mayor que 11
    return isLengthGreaterThan11 ? 60 : 65;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallaAncho = event.target.innerWidth;
    this.initialAncho = this.calculateChartBarThickness();

    if (this.lstPartFuente.length > 0 && this.oChartFuente.data.datasets.length > 0) {
      this.oChartFuente.data.datasets.forEach(dataset => {
        dataset.barThickness = this.initialAncho;
      });
    }

    this.updateChartBar();

    if (this.oChartFuente) {
      this.oChartFuente.update();
    }
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

  cutoutBarThickness = {
    425: 5,
    767: 5,
    992: 35,
    1200: 45,
    1500: 65,
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

  updateChartBar() {
    const cutoutValue = this.calculateChartDoughnut();

    this.updateChart(this.oChartLocacion, cutoutValue);
    this.updateChart(this.oChartCategoria, cutoutValue);
    this.updateChart(this.oChartFuente, cutoutValue);
  }

  /* ------------------------------------------------ */

  ngOnInit(): void {
    const isRoute = this.activatedRoute.snapshot.routeConfig?.path === 'rpt-emisiones-gei-adm';
    if (isRoute) {
      this.esAdmin = true;
    }

    if (!this.esAdmin) {
      this.nIdEmpresa = localStorage.getItem('LocalIdEmpresa_intercorp');
      this.nombreComercial = localStorage.getItem('LocalNombreComercial_intercorp');
    }
    this.initialCutout = this.calculateChartDoughnut();
    this.initialAncho = this.calculateChartBarThickness();
  }

  ngAfterViewInit(): void {
    this.oUsuario = this.seguridadService.isLogged();
    if (this.oUsuario.sUsuario != undefined) {
      let promesaInicial = Promise.resolve();

      if (this.esAdmin) {
        promesaInicial = promesaInicial.then(() => this.listarSector());
      }

      promesaInicial
        .then(() => this.listarPeriodo())
        .then(() => this.listarLocacion())
        .then(() => {
          if (!this.esAdmin) {
            // Preseleccionar año si es Empresa

            const getAnio = this.lstPeriodo.find(objeto => objeto.nIdPeriodo === this.lstPeriodo[0].nIdPeriodo);
            this.modelfilter.nAnio = getAnio.nAnio;

            this.listarPartLocacion();
            this.listarPartCategoria();
            this.listarPartFuente();
          }

          this.modelfilter.locacion = 'Todas';
          this.isLoadAllPage = false;
        });
    }
  }


  async listarSector() {
    try {
      let data: IDataResponse = await lastValueFrom(this.parametroService.listarParametro('SECTOR'));
      if (data.exito) {
        this.lstSector = data.datoAdicional;

        // Crear un nuevo array que contenga solo los valores de 'sCodigo'
        let oLiSector = this.lstSector.map(item => item.sCodigo);

        this.fnListarEmpresa(oLiSector);
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


  async fnListarEmpresa(oLiSector: any) {
    try {
      let data: IDataResponse = await lastValueFrom(this.empresaService.listarEmpresa(oLiSector));
      if (data.exito) {
        this.lstEmpresas = data.datoAdicional;
        this.model.nIdPeriodo = null;

        this.modelfilter.sNombreComercial = 'No hay data';

      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error: any) {
      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
  }

  async listarPeriodo() {
    try {

      let idEmpresa = this.nIdEmpresa;

      if (this.esAdmin) {
        idEmpresa = this.model.nIdEmpresa;
      }

      let data: IDataResponse = await lastValueFrom(this.periodoService.listarByIDEmpresa(idEmpresa));
      if (data.exito) {
        this.lstPeriodo = data.datoAdicional;
        //Eliminar periodos iniciados
        this.lstPeriodo = this.lstPeriodo.filter(periodo => periodo.nCodEstado !== 0);

        this.model.nIdPeriodo = null;

        if (this.lstPeriodo.length > 0) {
          this.model.nIdPeriodo = this.lstPeriodo[0]?.nIdPeriodo;
          if (!this.esAdmin) {
            this.porcentajeProgreso = this.lstPeriodo[0]?.nPorcentaje;
          }
        } else {
          this.modelfilter.nAnio = 'No hay data';
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

  async listarLocacion() {
    let data: IDataResponse = await lastValueFrom(this.locacionService.listarByPeriodo(this.model.nIdPeriodo));
    if (data.exito) {
      this.lstLocacion = data.datoAdicional;

      //Limpiar select al listar
      this.model.nIdLocacion = null;

      if (this.lstLocacion.length > 0) {
        this.lstLocacion.unshift({
          "nIdLocacion": -1,
          "sNombre": "Todas"
        });
        this.model.nIdLocacion = -1;
      } else {
        this.modelfilter.locacion = 'No hay data';
      }
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  aplicarFiltros() {
    this.isLoadFiltros = true;

    const selectedPeriodo = this.lstPeriodo.find(item => item.nIdPeriodo === this.model.nIdPeriodo);
    if (selectedPeriodo) {
      this.modelfilter.nAnio = selectedPeriodo.nAnio;
    }

    const selectedLocacion = this.lstLocacion.find(item => item.nIdLocacion === this.model.nIdLocacion);
    if (selectedLocacion) {
      this.modelfilter.locacion = selectedLocacion.sNombre;
    }

    const anioCambio = this.previousAnio !== this.modelfilter.nAnio;
    const empresaCambio = this.previousEmpresa !== this.model.nIdEmpresa;

    if (anioCambio || empresaCambio) {
      this.listarPartLocacion();
      this.previousAnio = this.modelfilter.nAnio;
      this.previousEmpresa = this.model.nIdEmpresa;
    }

    this.listarPartCategoria();
    this.listarPartFuente();

    this.porcentajeProgreso = selectedPeriodo.nPorcentaje;


    this.isLoadFiltros = false;
  }
  async changeEmpresa() {
    await this.listarPeriodo();
    await this.listarLocacion();

    this.aplicarFiltros();
    const getEmpresa = this.lstEmpresas.find((item) => item.nIdEmpresa === this.model.nIdEmpresa);
    if (getEmpresa) {
      this.modelfilter.sNombreComercial = getEmpresa.sNombreComercial;
    }
  }

  async changePeriodo() {
    await this.listarLocacion();
    this.aplicarFiltros();
  }

  async listarPartLocacion() {
    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.participacionLocacion(this.model.nIdPeriodo));
      if (data.exito) {
        if (data.datoAdicional.liLocacion) {
          this.totalLocacion = data.datoAdicional.bdTotalGeiCO2eq;
          this.lstPartLocacion = data.datoAdicional.liLocacion;
          this.fnChartLocacion();
          this.totalLocaciones = this.lstLocacion.filter(locacion => locacion.nIdLocacion !== -1).length;

        } else {
          this.lstPartLocacion = [];
          this.totalLocaciones = 0;

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
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.participacionCategoria(this.model.nIdPeriodo, idLocacion));
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
    let idLocacion = this.model.nIdLocacion;
    if (this.model.nIdLocacion == -1) { idLocacion = null! }

    let oPartFuente = {
      nIdPeriodo: this.model.nIdPeriodo,
      liLocaciones: idLocacion ? [idLocacion] : []
    };



    try {
      let data: IDataResponse = await lastValueFrom(this.reportesGeiService.participacionFuente(oPartFuente));
      if (data.exito) {
        if (data.datoAdicional) {

          this.lstPartFuente = data.datoAdicional;
          this.fnChartFuente();
        } else {
          this.lstPartFuente = [];
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


  fnChartLocacion() {
    if (this.oChartLocacion) {
      this.oChartLocacion.destroy();
    }
    if (this.oChartLocacionMod) {
      this.oChartLocacionMod.destroy();
    }
    const nombresArray = this.lstPartLocacion.map(locacion => locacion.sNombre);

    this.porcentajeLocacion = this.lstPartLocacion.map(locacion => locacion.bdPorcentaje);

    const valorLocacion = this.lstPartLocacion.map(locacion => locacion.bdTotalGeiCO2eq);

    const createChart = (canvas: HTMLCanvasElement, colorChart: string[], ChartContext: ChartItem, animate: any) => {
      return new Chart(ChartContext, {
        type: 'doughnut',
        data: {
          labels: nombresArray,
          datasets: [{
            data: this.porcentajeLocacion,
            backgroundColor: colorChart,
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
                  const arrayLines = [' ' + context.formattedValue + '%', ' ' + this.truncateValue(valorLocacion[index], 2) + ' [tCO₂e]'];
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
          id: 'firstDonutChart',
          afterDatasetsDraw: (chart, args, options) => {
            const { ctx, chartArea: { top, width, height } } = chart;
            ctx.save();
            let str: any = this.truncateValue(this.totalLocacion, 2);

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

    const pieChartRef = document.getElementById('chartLocacion') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartLocacion = createChart(pieChartRef, colorChart, ChartContext, true);


    const pieChartRefMod = document.getElementById('chartLocacion_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartLocacionMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      this.legendItemsLoc = this.oChartLocacion?.legend?.legendItems;
      this.legendItemsLoc_mod = this.oChartLocacionMod?.legend?.legendItems;

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

    this.valorCategoria = this.lstPartCategoria.map(locacion => locacion.bdTotalEmisionCO2eq);

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
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendItemsCat = this.oChartCategoria?.legend?.legendItems;
      this.legendItemsCat_mod = this.oChartCategoriaMod?.legend?.legendItems;
    });
  }


  fnChartFuente() {
    if (this.oChartFuente) {
      this.oChartFuente.destroy();
    }

    if (this.oChartFuenteMod) {
      this.oChartFuenteMod.destroy();
    }

    const labels = this.lstPartFuente.map(item => item.sMes);

    let maxCO2eqLiFuente = 0;

    this.lstPartFuente.forEach(item => {
      // Sumar los valores de bdTotalEmisionCO2eq para cada liFuente
      let sum = item.liFuente.reduce((acc, current) => acc + current.bdTotalEmisionCO2eq, 0);

      // Comparar y actualizar el valor máximo
      if (sum > maxCO2eqLiFuente) {
        maxCO2eqLiFuente = sum;
      }
    });


    this.usedColors = {};

    const createDatasets = (barThickness) => {
      const datasets = {};
      this.lstPartFuente.forEach((item, index) => {
        item.liFuente.forEach(fuente => {
          if (!datasets[fuente.sNombre]) {
            datasets[fuente.sNombre] = {
              label: fuente.sNombre,
              data: new Array(this.lstPartFuente.length).fill(null),
              borderRadius: 16,
              barThickness: barThickness, // Usamos el valor dinámico aquí
              backgroundColor: this.getColor(fuente.sNombre),
            };
          }
          const monthIndex = labels.indexOf(fuente.sMes);
          datasets[fuente.sNombre].data[monthIndex] = fuente.bdTotalEmisionCO2eq;
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
    const createChart = (canvas: HTMLCanvasElement, colorChart: string[], ChartContext: ChartItem, animate: any) => {

      const sizeDataLabel = animate ? 14 : 13;

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
              ctx.font = `500 ${sizeDataLabel}px Value Sans Pro`;
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

      const barThicknessValue = animate ? this.initialAncho : 60;
      const activePlugins = animate ? [totalSumPlugin] : [ChartDataLabels, totalSumPlugin];


      return new Chart(ChartContext, {
        plugins: activePlugins,
        type: 'bar',
        data: {
          labels: labels,
          datasets: createDatasets(barThicknessValue) as ChartDataset[],
        },
        options: {
          devicePixelRatio: animate ? 2 : 3,
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
                  weight: '500',
                  family: 'Value Sans Pro',
                }
              },
            },
            y: {
              ticks: {
                font: {
                  size: 14,
                  weight: '500',
                  family: 'Value Sans Pro',
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
            duration: animate ? 1000 : 1000 // Ajusta la duración de la animación según el valor de "animate"
          }, plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              align: 'center',
              color: 'black',
              font: {
                size: sizeDataLabel,
                family: 'Value Sans Pro',

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
                family: 'Value Sans Pro',
                size: 12,
              },
              bodyFont: {
                family: 'Value Sans Pro',
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

    const pieChartRef = document.getElementById('chartFuente') as HTMLCanvasElement;
    const ChartContext = pieChartRef.getContext('2d')!;
    const colorChart = this.arrayColor;
    this.oChartFuente = createChart(pieChartRef, colorChart, ChartContext, true);

    const pieChartRefMod = document.getElementById('chartFuente_mod') as HTMLCanvasElement;
    const ChartContextMod = pieChartRefMod.getContext('2d')!;
    this.oChartFuenteMod = createChart(pieChartRefMod, colorChart, ChartContextMod, false);

    setTimeout(() => {
      // Asigna el valor a legendItemsLoc después de un pequeño retraso
      this.legendItemsFuente = this.oChartFuente?.legend?.legendItems;
      this.legendItemsFuente_mod = this.oChartFuenteMod?.legend?.legendItems;
    });
  }



  toggleFuente(index: number): void {
    const dataset = this.oChartFuente.data.datasets[index];
    dataset.hidden = !dataset.hidden;
    this.legendItemsFuente[index].hidden = dataset.hidden;

    // Recalcular el valor máximo aquí
    this.recalculateMaxValue();

    this.oChartFuente.update();
  }

  recalculateMaxValue(): void {
    let maxCO2eqLiFuente = 0;
    this.lstPartFuente.forEach(item => {
      let sum = item.liFuente.reduce((acc, current) => {
        // Asegurarse de sumar solo los valores de los datasets visibles
        const datasetIndex = this.oChartFuente.data.datasets.findIndex(ds => ds.label === current.sNombre);
        if (!this.oChartFuente.isDatasetVisible(datasetIndex)) {
          return acc;
        }
        return acc + current.bdTotalEmisionCO2eq;
      }, 0);

      if (sum > maxCO2eqLiFuente) {
        maxCO2eqLiFuente = sum;
      }
    });

    // Establecer un valor mínimo razonable si maxCO2eqLiFuente es 0 o muy bajo
    // El valor mínimo debe ser lo suficientemente alto para que las líneas de cuadrícula se muestren correctamente
    const MIN_Y_AXIS_VALUE = 10; // Este valor puede ser ajustado según tus necesidades
    if (maxCO2eqLiFuente < MIN_Y_AXIS_VALUE) {
      maxCO2eqLiFuente = MIN_Y_AXIS_VALUE;
    }

    this.oChartFuente.options.scales.y.max = maxCO2eqLiFuente * 1.2; // Ajusta el valor máximo del eje Y
    this.oChartFuente.update(); // Asegúrate de actualizar el gráfico para reflejar el cambio
  }


  toggleLocacion(index: number): void {
    const dataset = this.oChartLocacion.data.datasets[0];
    const meta: any = this.oChartLocacion.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendItemsLoc[index].hidden = isHidden;

    this.oChartLocacion.update();
  }

  toggleCategoria(index: number): void {
    const dataset = this.oChartCategoria.data.datasets[0];
    const meta: any = this.oChartCategoria.getDatasetMeta(0);
    const isHidden = !meta.data[index].hidden;
    meta.data[index].hidden = isHidden;
    this.legendItemsCat[index].hidden = isHidden;

    this.oChartCategoria.update();
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

  checkForLongLabels(): void {
    for (let item of this.legendItemsLoc) {
      if (item.text.length > 30) {
        this.hasLongLabel = true;
        break;
      }
    }
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
      this.archivoService.descargarReporte('dowloandPdf', 1);
      this.isLoadDescargar = false;
    }, 1100);
  }

  limpiarFiltro() {
    this.model.nIdPeriodo = this.lstPeriodo[0].nIdPeriodo;
    this.model.nIdLocacion = -1;
  }
}
