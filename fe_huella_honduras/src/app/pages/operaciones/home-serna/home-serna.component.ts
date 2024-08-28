import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { EmisionService } from '../../../services/huella-service/emision';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { MatButtonModule } from '@angular/material/button';
import { ChartConfiguration, Chart, ChartTypeRegistry, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../services/error.service';

// Registrar plugins de Chart.js
Chart.register(...registerables, ChartDataLabels);

// Desactivar datalabels por defecto
Chart.defaults.set('plugins.datalabels', {
  display: false
});

// Plugin personalizado para texto central en gráficos de doughnut
const textoCentrarlDoughnut = {
  id: 'doughnutCenterText',
  beforeDraw: (chart: any) => {
    if (chart.config.type === 'doughnut' && chart.config.data && chart.config.data.datasets.length) {
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;
      const fontSize = (height / 150).toFixed(2);

      ctx.restore();
      ctx.textBaseline = 'middle';

      const data = chart.config.data.datasets[0].data;
      const text = data.reduce((a: any, b: any) => a + b, 0);
      const subText1 = 'Organizacion' + (text > 1 ? 'es' : '');
      const subText2 = chart.canvas.id === 'firstDoughnut' ? 'participante' + (text > 1 ? 's' : '') : 'con reconocimiento';

      ctx.font = `bold ${fontSize}em 'Pluto', sans-serif`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2 - 20;
      ctx.fillText(text, textX, textY);

      ctx.font = `400 ${(parseFloat(fontSize) / 2)}em 'Pluto Cond', sans-serif`;
      const subTextX1 = Math.round((width - ctx.measureText(subText1).width) / 2);
      const subTextX2 = Math.round((width - ctx.measureText(subText2).width) / 2);
      const subTextY1 = height / 2 + 10;
      const subTextY2 = height / 2 + 30;
      ctx.fillText(subText1, subTextX1, subTextY1);
      ctx.fillText(subText2, subTextX2, subTextY2);

      ctx.save();
    }
  }
};

// Registrar el plugin personalizado globalmente
Chart.register(textoCentrarlDoughnut);

@Component({
  selector: 'app-home-serna',
  standalone: true,
  imports: [
    BaseChartDirective,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './home-serna.component.html',
  styleUrls: ['./home-serna.component.css']
})
export class HomeSernaComponent implements OnInit, OnDestroy {
  oPendientes: any = {};
  oTotalOrganizaciones: any = {};
  oOrganizaciones: any = {};
  lstHistoricas: any[] = [];
  oReconocimientos: any = {};
  sumaReconocimientos: number = 0;

  barChartLegend = false;
  doughnutChartLegend = true;
  barChartHistLegend = false;
  doughnutChartRecLegend = true;

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  barChartHistData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  doughnutChartRecData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };

  isHidden: boolean[] = [];
  isRecHidden: boolean[] = [];

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'start',
        color: '#FFFFFF',
        font: {
          size: 12,
          family: 'Pluto',
          weight: 'normal'
        }
      }
    },
    indexAxis: 'y',
    scales: {
      x: {
        display: false
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
            family: 'Pluto',
            weight: 'normal'
          },
          color: '#197A4E'
        }
      }
    }
  };

  barChartHistOptions: ChartConfiguration<'bar'>['options'] = this.createBarChartHistOptions();

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    cutout: '80%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false,
        backgroundColor: (tooltipItem) => {
          const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
          return this.aclararColor(originalColor, 0.6);
        },
        titleColor: '#27365E',
        bodyColor: '#27365E',
        titleFont: {
          family: 'Pluto Cond',
          weight: 'normal',
          size: 14,
        },
        bodyFont: {
          family: 'Pluto Cond',
          weight: 'normal',
          size: 14
        },
        callbacks: {
          title: function (context) {
            const value: any = context[0].raw;
            const total = context[0].dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = Math.round((value / total) * 100) + '%';
            return percentage;
          },
          label: function (context) {
            return context.label || '';
          }
        }
      }
    }
  };

  doughnutChartRecOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    cutout: '80%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false,
        backgroundColor: (tooltipItem) => {
          const originalColor: any = tooltipItem.tooltip.labelColors[0].backgroundColor;
          return this.aclararColor(originalColor, 0.6);
        },
        titleColor: '#27365E',
        bodyColor: '#27365E',
        titleFont: {
          family: 'Pluto Cond',
          weight: 'normal',
          size: 14,
        },
        bodyFont: {
          family: 'Pluto Cond',
          weight: 'normal',
          size: 14
        },
        callbacks: {
          title: function (context) {
            // Mostrar el valor en lugar del porcentaje
            const value: any = context[0].raw;
            return value;
          },
          label: function (context) {
            // Actualizar los textos de las leyendas en plural o singular según el valor
            const labelMap: any = {
              'Cuantificacion': 'Organización que ha calculado su huella',
              'Reducción': 'Organización con reducción',
              'Compensación': 'Organización que ha compensado',
              'Neutralización': 'Organización que ha neutralizado'
            };

            const labelMapPlural: any = {
              'Cuantificacion': 'Organizaciones que han calculado su huella',
              'Reducción': 'Organizaciones con reducción',
              'Compensación': 'Organizaciones que han compensado',
              'Neutralización': 'Organizaciones que han neutralizado'
            };

            const value: any = context.raw;
            const label = context.label;

            return value > 1 ? labelMapPlural[label] : labelMap[label];
          }
        }
      }
    }
  };

  constructor(
    private emisionService: EmisionService,
    private router: Router,
    private errorService: ErrorService) { }

  ngOnInit(): void {
    this.fnAccionesPendientes();
    this.fnTotalOrganizaciones();
    this.fnListarOrganizacionesPorCIIU();
    this.fnListarEmisionesHistoricas();
    this.fnDistribReconocimientos();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.barChartHistOptions = this.createBarChartHistOptions();
    // Re-renderizar el gráfico
    const chart: Chart<'bar'> = Chart.getChart('barChartHist') as Chart<'bar'>;
    if (chart) {
      chart.update();
    }
  }

  createBarChartHistOptions(): ChartConfiguration<'bar'>['options'] {
    const isMobile = window.innerWidth < 768;
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: isMobile ? 25 : 20,
        }
      },
      plugins: {
        tooltip: {
          enabled: false
        },
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#000000',
          formatter: (value) => {
            const formattedValue = this.formatearComaMiles(Math.round(value));
            return isMobile ? `${formattedValue}\ntCO₂e` : `${formattedValue} tCO₂e`;
          },
          font: {
            size: 11,
            family: 'Pluto',
            weight: 'normal'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              family: 'Pluto'
            }
          }
        },
        y: {
          display: false,
          ticks: {
            font: {
              size: 10,
              family: 'Pluto',
              weight: 'normal'
            }
          }
        }
      }
    }
  }

  /* ---------- Llamada de servicios -------------- */
  async fnAccionesPendientes() {
    try {
      const data: IDataResponse = await lastValueFrom(this.emisionService.obtenerAccionesPendientes());
      if (data.boExito) {
        this.oPendientes = data.oDatoAdicional;
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarOrganizacionesPorCIIU() {
    try {
      const data: IDataResponse = await lastValueFrom(this.emisionService.listarInstitucionesPorCIIU());

      if (data.boExito) {
        this.oOrganizaciones = data.oDatoAdicional;
        const isMobile = window.innerWidth < 768; // Detecta si es móvil
        const maxLength = isMobile ? 20 : 40; // Define la longitud según el dispositivo

        const sector = this.oOrganizaciones.map((item: any) => {
          const descripcion = item.sDescripcion;
          return descripcion.length > maxLength ? descripcion.substr(0, maxLength) + '...' : descripcion;
        });
        const total = this.oOrganizaciones.map((item: any) => item.nTotalInstituciones);

        this.barChartData = {
          labels: sector,
          datasets: [{
            data: total,
            backgroundColor: '#48E68C',
            borderRadius: 8,
            barPercentage: 0.5,
            categoryPercentage: 1
          }]
        }
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnTotalOrganizaciones() {
    try {
      const data: IDataResponse = await lastValueFrom(this.emisionService.obtenerTotalInstituciones());
      if (data.boExito) {
        this.oTotalOrganizaciones = data.oDatoAdicional;
        const numEmpresasInscritas = this.oTotalOrganizaciones.nTotalEmpresas - this.oTotalOrganizaciones.nTotalEmpresesConEmisiones;

        this.doughnutChartData = {
          labels: ['Empresas inscritas', 'Empresas que han reportado huella'],
          datasets: [{
            data: [numEmpresasInscritas, this.oTotalOrganizaciones.nTotalEmpresesConEmisiones],
            backgroundColor: ['#A4F9C8', '#2F9A5D'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        }

        this.crearLegend('firstDoughnut', this.doughnutChartData);
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnListarEmisionesHistoricas() {
    try {
      const data: IDataResponse = await lastValueFrom(this.emisionService.listarHistoricas());
      if (data.boExito) {
        this.lstHistoricas = data.oDatoAdicional;
        const anios = this.lstHistoricas.map((item: any) => item.oPeriodo.nAnio);
        const totalGEI = this.lstHistoricas.map((item: any) => item.bdTotalCo2eq);

        this.barChartHistData = {
          labels: anios,
          datasets: [{
            data: totalGEI,
            backgroundColor: '#A9ACAB',
            borderRadius: 4,
            categoryPercentage: 0.5
          }]
        }
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  async fnDistribReconocimientos() {
    try {
      const data: IDataResponse = await lastValueFrom(this.emisionService.obtenerDistribucionReconocimiento());
      if (data.boExito) {
        this.oReconocimientos = data.oDatoAdicional;

        const nCuantificacion = this.oReconocimientos.nCuantificacion;
        const nReduccion = this.oReconocimientos.nReduccion;
        const nCompensacion = this.oReconocimientos.nCompensacion;
        const nNeutralizacion = this.oReconocimientos.nNeutralizacion;

        console.log('nCuantificacion', nCuantificacion);
        this.sumaReconocimientos = nCuantificacion + nReduccion + nCompensacion + nNeutralizacion;

        this.doughnutChartRecData = {
          labels: ['Cuantificacion', 'Reducción', 'Compensación', 'Neutralización'],
          datasets: [{
            data: [nCuantificacion, nReduccion, nCompensacion, nNeutralizacion],
            backgroundColor: ['#3AB65B', '#3DC2B7', '#5277C3', '#C198E7'],
            borderWidth: 0,
            hoverOffset: 10,
          }]
        }

        this.crearLegend('secondDoughnut', this.doughnutChartRecData);
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }

  /* ---------- Agregar legends en el html -------------- */
  crearLegend(chartId: string, chartData: any) {
    const legendContainer = document.getElementById(`${chartId}Legend`);
    if (!legendContainer) return;

    legendContainer.innerHTML = ''; // Limpiar cualquier elemento de leyenda existente

    chartData.labels.forEach((label: string, index: number) => {
      const value = chartData.datasets[0].data[index];
      if (value > 0) {
        const legendItem = document.createElement('li');
        legendItem.classList.add('legend-item');
        legendItem.dataset['index'] = index.toString();

        const legendColor = document.createElement('span');
        legendColor.classList.add('legend-color');
        legendColor.style.backgroundColor = chartData.datasets[0].backgroundColor[index];
        legendItem.appendChild(legendColor);

        const legendText = document.createElement('span');
        legendText.textContent = label;
        legendItem.appendChild(legendText);

        legendContainer.appendChild(legendItem);

        legendItem.addEventListener('click', () => {
          const chart = Chart.getChart(chartId) as Chart<keyof ChartTypeRegistry, number[], unknown>;
          if (!chart) return;

          const meta = chart.getDatasetMeta(0);
          const item = meta.data[index] as any;
          item.hidden = !item.hidden;
          legendItem.classList.toggle('hidden', item.hidden);
          chart.update();
        });
      }
    });
  }

  toggleLegends(chartId: string, index: number, isRec: boolean = false): void {
    const chart = Chart.getChart(chartId) as Chart<'doughnut'>;
    if (!chart) return;

    const meta = chart.getDatasetMeta(0);
    const item: any = meta.data[index];
    item.hidden = !item.hidden;
    if (isRec) {
      this.isRecHidden[index] = item.hidden;
    } else {
      this.isHidden[index] = item.hidden;
    }
    chart.update();
  }

  /* ---------- Agregar tootlips y obtener colores -------------- */
  aclararColor(color: string, amount: number): string {
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
      return Math.min(newValue, 255);
    });

    const colorMasClaro = rgbToHex(lighterRgb);
    return colorMasClaro;
  }

  obtenerColorFondo(chartData: ChartConfiguration<'doughnut'>['data'], index: number): string {
    const backgroundColor = chartData.datasets[0].backgroundColor;
    if (Array.isArray(backgroundColor)) {
      return backgroundColor[index] as string;
    }
    return '';
  }

  /* ---------- Redirecciones -------------- */
  redirectSolicitud() {
    this.router.navigate(["/gestion-participacion"]);
  }

  redirectUsuario() {
    this.router.navigate(["/gestion-usuarios"]);
  }

  redirectReconocimiento() {
    this.router.navigate(["/solicitudes-reconocimiento"]);
  }

  redirectHuellas() {
    this.router.navigate(["/hc-organizacional"]);
  }

  /* ---------- Formateo -------------- */
  formatearComaMiles(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
