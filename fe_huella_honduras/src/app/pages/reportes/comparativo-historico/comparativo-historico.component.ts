import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ChartConfiguration, Chart, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { lastValueFrom } from 'rxjs';
import { IDataResponse } from '../../../models/IDataResponse';
import { ErrorService } from '../../../services/error.service';
import { ReporteService } from '../../../services/reportes-service/reportes.service';
import { IUsuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/gestion-service/usuario.service';
import { SharedDataService } from '../../../services/shared-data.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-comparativo-historico',
  standalone: true,
  imports: [
    BaseChartDirective,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    CommonModule,
    MatMenuModule,
    MatTabsModule
  ],
  templateUrl: './comparativo-historico.component.html',
  styleUrls: ['./comparativo-historico.component.css']
})
export class ComparativoHistoricoComponent implements OnInit, OnDestroy {
  barChartHistData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartHistOptions: ChartConfiguration<'bar'>['options'] = this.createBarChartAbsoluto();
  barChartHistLegend = false;

  lstAbsolutas: any[] = [];
  lstRelativas: any[] = [];

  barChartRelData: ChartConfiguration<'bar'>['data'][] = [];
  barChartRelOptions: ChartConfiguration<'bar'>['options'][] = [];

  nIdUsuario: number = 0;
  nIdInstitucion: number = 0;

  loadingCharts: boolean = true;

  constructor(
    private reporteService: ReporteService,
    private errorService: ErrorService,
    private usuarioService: UsuarioService,
    private sharedDataService: SharedDataService,

  ) {
    Chart.register(linePlugin);
  }

  ngOnInit(): void {
    this.nIdUsuario = this.sharedDataService.itemMenu?.nIdUsuario || 0;
    this.fnObtenerUsuario();

  }

  ngOnDestroy(): void {
    Chart.unregister(linePlugin);
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.updateCharts();
  }

  updateCharts() {
    this.barChartHistOptions = this.createBarChartAbsoluto();

    this.barChartRelOptions.forEach((options, i) => {
      const anios = this.barChartRelData[i].labels as string[];
      this.barChartRelOptions[i] = this.createBarChartRelativo(this.lstRelativas[i].sUnidad, anios, i);
    });

    const chart = Chart.getChart('barChartHist') as Chart<'bar'>;
    if (chart) {
      chart.update();
    }

    this.barChartRelData.forEach((data, i) => {
      const chartRel = Chart.getChart(`barChartRel${i}`) as Chart<'bar'>;
      if (chartRel) {
        chartRel.update();
      }
    });
  }

  createBarChartAbsoluto(): ChartConfiguration<'bar'>['options'] {
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
          enabled: true,
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw as number;
              return `${this.formatearComaMiles(value)} tCO₂e`;
            }
          },
          displayColors: false,
          titleFont: {
            family: 'Pluto Cond',
            weight: 'normal',
            size: 12,
          },
          bodyFont: {
            family: 'Pluto Cond',
            weight: 'normal',
            size: 12
          },
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
            display: true,
            color: '#000000',
            font: {
              size: 12,
              family: 'Pluto',

            },
            callback: (value, index, ticks) => {
              if (this.barChartHistData.labels && this.barChartHistData.labels[index]) {
                const label = this.barChartHistData.labels[index] as string;
                if (index === 0) {
                  return isMobile ? [`${label}`, `(Año base)`] : `${label} (Año base)`;
                }
                return `${label}`;
              }
              return '';
            }
          },
          border: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'tCO₂e',
            font: {
              size: 14,
              family: 'Pluto',
              weight: 'bold'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    };
  }

  createBarChartRelativo(indicador: string, anios: string[], index: number): ChartConfiguration<'bar'>['options'] {
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
          enabled: true,
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw as number;
              return `${this.formatearComaMilesDecimals(value)} tCO₂e`;
            }
          },
          displayColors: false,
          titleFont: {
            family: 'Pluto Cond',
            weight: 'normal',
            size: 12,
          },
          bodyFont: {
            family: 'Pluto Cond',
            weight: 'normal',
            size: 12
          },
        },
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#000000',
          formatter: (value) => {
            const formattedValue = this.formatearComaMilesDecimals(value);
            return isMobile ? `${formattedValue}\ntCO₂e/${indicador}` : `${formattedValue} tCO₂e/${indicador}`;
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
            display: true,
            color: '#000000',
            font: {
              size: 12,
              family: 'Pluto'
            },
            callback: (value, index) => {
              if (anios && anios[index]) {
                const label = anios[index];
                if (index === 0) {
                  return isMobile ? [`${label}`, `(Año base)`] : `${label} (Año base)`;
                }
                return `${label}`;
              }
              return '';
            }
          },
          border: {
            display: false,
          }
        },
        y: {
          title: {
            display: true,
            text: `tCO₂e/${indicador}`,
            font: {
              size: 14,
              family: 'Pluto',
              weight: 'bold'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    };
  }

  async fnListarEmisionesAbsolutas() {
    try {
      let oReporte = { nIdInstitucion: this.nIdInstitucion };
      const data: IDataResponse = await lastValueFrom(this.reporteService.listarParticipantes(oReporte));

      console.log('data', data);
      if (data.boExito) {
        this.lstAbsolutas = data.oDatoAdicional;

        console.log('this.lstAbsolutas', this.lstAbsolutas);
        const anios = this.lstAbsolutas.map((item: any) => item.nAnio);
        const totalGEI = this.lstAbsolutas.map((item: any) => item.bdTotalEmisiones);

        this.barChartHistData = {
          labels: anios,
          datasets: [{
            data: totalGEI,
            backgroundColor: '#A9ACAB',
            borderRadius: 4,
            categoryPercentage: 0.5,
            maxBarThickness: 80
          }]
        };

      }
    } catch (error) {
      this.errorService.enviar(error);
    }

    this.loadingCharts = false;
  }

  async fnListarEmisionesRelativas() {
    try {
      let oReporte = { nIdInstitucion: this.nIdInstitucion };
      const data: IDataResponse = await lastValueFrom(this.reporteService.listarCompIndicadores(oReporte));
      if (data.boExito) {
        this.lstRelativas = data.oDatoAdicional;

        this.lstRelativas.forEach((relativa, index) => {
          const anios = relativa.liPeriodo.map((item: any) => item.nAnio);
          const valores = relativa.liPeriodo.map((item: any) => item.oIndicador.bdResultado);

          const color = this.determinarColorBar(relativa.sCodUnidad);

          this.barChartRelData.push({
            labels: anios,
            datasets: [{
              data: valores,
              backgroundColor: color,
              borderRadius: 4,
              categoryPercentage: 0.5,
              maxBarThickness: 80
            }]
          });

          this.barChartRelOptions.push(this.createBarChartRelativo(relativa.sIndicador, anios, index));
        });


        console.log('this.lstRelativas', this.lstRelativas);
      }
    } catch (error) {
      this.errorService.enviar(error);
    }
  }
  formatearComaMiles(number: number): string {
    return number.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  formatearComaMilesDecimals(number: number): string {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async fnObtenerUsuario() {
    try {
      const oUsuario: IUsuario = { nIdUsuario: this.nIdUsuario };
      const data: IDataResponse = await lastValueFrom(this.usuarioService.obtenerUsuarioExterno(oUsuario));

      if (data.boExito) {
        //console.log('nIdInstitucion', data.oDatoAdicional.oInstitucion.nIdInstitucion);
        this.nIdInstitucion = data.oDatoAdicional.oInstitucion.nIdInstitucion;

        this.fnListarEmisionesAbsolutas();
        this.fnListarEmisionesRelativas();
        setTimeout(() => this.updateCharts(), 500);

        window.addEventListener('resize', this.onResize.bind(this));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }


  determinarColorBar(sCodUnidad: string): string {
    const codUnidad = sCodUnidad?.substring(0, 4)?.toUpperCase();
    switch (codUnidad) {
      case 'PERS':
        return '#007AFF'; // Color para 'Personas' (Azul)
      case 'PROD':
        return '#02D46A'; // Color para 'Producción' (Verde)
      case 'AREA':
        return '#F63428'; // Color para 'Área' (Rojo)
      case 'VENT':
        return '#FFCC00'; // Color para 'Venta' (Amarillo)
      default:
        return '#AF47D2'; // Color por defecto para los demás (Violeta)
    }
  }


}

// Plugin de Chart.js para dibujar una línea horizontal sobre el año base
const linePlugin: Plugin = {
  id: 'linePlugin',
  beforeDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const xAxis: any = chart.scales['x']; // Acceso correcto a la escala X
    const yAxis: any = chart.scales['y']; // Acceso correcto a la escala Y

    if (chart.data.labels && chart.data.labels.length > 0) {
      const yearLabels = chart.data.labels.map(label => parseInt(label as string));
      const minYearIndex = yearLabels.indexOf(Math.min(...yearLabels));

      // Obtener la posición Y para el valor del año menor
      const y = yAxis?.getPixelForValue(chart.data.datasets[0].data[minYearIndex] as number);
      const xStart = xAxis?.left; // Inicio de la línea en el eje X
      const xEnd = xAxis?.right; // Fin de la línea en el eje X

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xStart, y);
      ctx.lineTo(xEnd, y);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = '#00903B';
      ctx.stroke();
      ctx.restore();
    }
  }
};


