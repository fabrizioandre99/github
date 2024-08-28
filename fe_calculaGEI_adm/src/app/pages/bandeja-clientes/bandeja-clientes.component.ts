import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { IDataResponse } from 'src/app/models/IDataResponse';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SectorService } from 'src/app/services/sector.service';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-bandeja-clientes',
  templateUrl: './bandeja-clientes.component.html',
  styleUrls: ['./bandeja-clientes.component.css']
})

export class BandejaClientesComponent implements OnInit {
  page = 1;
  pageSize = 5;
  total = 0;

  lstSkeleton = Array(3);
  lstClientes: any;
  lstIndustria: any[] = [];
  lstProveedor: any[] = [];

  model: Cliente = new Cliente();
  today = new Date();

  fShow: boolean = false;
  fShowSkeleton: boolean = false;
  loadingEliminar: boolean = false;
  invalid_firstDate: boolean = false;
  invalid_secondDate: boolean = false;
  openModal: boolean = false;

  firstCalendar: NgbDateStruct = this.calendar.getToday();
  secondCalendar: NgbDateStruct = this.calendar.getToday();

  firstChart: Chart;
  secondChart: Chart;
  thirdChart: Chart;

  modalRef: NgbModalRef;

  constructor(private modalService: NgbModal, private clienteService: ClienteService, private sectorService: SectorService,
    private proveedorService: ProveedorService, private toastr: ToastrService, private http: HttpClient,
    private calendar: NgbCalendar, private localDataService: LocalDataService) { Chart.register(...registerables); }

  ngOnInit(): void {
    //Obtener fecha actual
    const fechaActual = this.today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    this.model.FechaInicio = fechaActual;
    this.model.FechaFin = fechaActual;
    this.fnListarClientes();
  }

  async fnListarIndustria() {
    let data: IDataResponse = await lastValueFrom(this.sectorService.listarIndustria(this.model.FechaInicio, this.model.FechaFin));
    if (data.exito) {
      this.lstIndustria = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarProveedor() {
    let data: IDataResponse = await lastValueFrom(this.proveedorService.listarComboCli(this.model.FechaInicio, this.model.FechaFin));
    if (data.exito) {
      this.lstProveedor = data.datoAdicional;
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnListarClientes() {
    try {
      this.fShowSkeleton = true;
      let data: IDataResponse = await lastValueFrom(this.clienteService.listarCliente(this.model.FechaInicio, this.model.FechaFin));
      if (data.exito) {
        this.lstClientes = data.datoAdicional;
        //console.log('this.lstClientes', this.lstClientes);
        this.fShowSkeleton = false;
        this.fnListarIndustria();
        this.fnListarProveedor();
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }
    } catch (error) {
      this.localDataService.removeLocalStorage()
    }
  }


  openModalEliminar(item: any, contentConfirmacion: any) {
    this.model.nIdCliente = item.nIdCliente;
    this.modalService.open(contentConfirmacion, { centered: true, windowClass: "modal-confirmacion" });
  }

  async fnEliminarCliente() {
    this.loadingEliminar = true;
    let data: IDataResponse = await lastValueFrom(this.clienteService.eliminarCliente(this.model.nIdCliente, localStorage.getItem('SessionIdUsuario')!));
    if (data.exito) {
      this.fnListarClientes();
      this.loadingEliminar = false;
      this.modalService.dismissAll();
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }
  }

  async fnDescargarFormato() {
    let data = await lastValueFrom(this.clienteService.descargarFormato(this.model.FechaInicio, this.model.FechaFin));
    const blob = new Blob([data as unknown as BlobPart], { type: "application/xlsx" })
    let filename = 'Bandeja_de_Clientes' + '.xlsx';
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
  }

  async fnVerReporte(item: any, contentReporte: any) {
    //Abrir modal al hacer click solo una vez
    this.openModal = true;
    let data: IDataResponse = await lastValueFrom(this.clienteService.emision(item.nIdCliente));
    if (data.exito) {
      this.openModal = false;

      this.model.total_mi_empresa = data.datoAdicional.total_mi_empresa.toFixed(2);
      this.model.empresas_peru = data.datoAdicional.empresas_peru.toFixed(2);
      this.model.empresas_rubro = data.datoAdicional.empresas_rubro.toFixed(2);
      this.model.primera_empresa = item.Emisiones[0]?.oProveedorEnergia.sNombre;
      this.model.segunda_empresa = item.Emisiones[1]?.oProveedorEnergia.sNombre;
      this.model.tercera_empresa = item.Emisiones[2]?.oProveedorEnergia.sNombre;
      this.model.emisiones_length = item.Emisiones.length;

      //Abrir Modal
      this.modalRef = this.modalService.open(contentReporte, { centered: true });

      const firstCanvas = document.getElementById('firstChart') as HTMLCanvasElement;
      const firstCtx = firstCanvas.getContext('2d');

      const secondCanvas = document.getElementById('secondChart') as HTMLCanvasElement;
      const secondCtx = secondCanvas.getContext('2d');

      const thirdCanvas = document.getElementById('thirdChart') as HTMLCanvasElement;
      const thirdCtx = thirdCanvas.getContext('2d');

      item.sRazonSocial_mod = item.sRazonSocial;
      //console.log('item.sRazonSocial_mod', item.sRazonSocial_mod);

      let labelsCharts = ['Empresas del Perú', item.sRazonSocial_mod, 'Empresas del rubro',]

      let barAncho = 80;

      if (window.innerWidth >= 700) {
        labelsCharts = labelsCharts.map(label => {
          if (label.length > 14) {
            return label.slice(0, 14) + '...';
          } else {
            return label;
          }
        });
      }

      if (window.innerWidth < 700) {
        labelsCharts = labelsCharts.map(label => {
          if (label.length > 10) {
            barAncho = 70;
            return label.slice(0, 10) + '...';
          } else {
            return label;
          }
        });
      }

      if (window.innerWidth < 500) {
        labelsCharts = labelsCharts.map(label => {
          if (label.length > 7) {
            barAncho = 60;
            return label.slice(0, 7) + '...';
          } else {
            return label;
          }
        });
      }


      let firstData = [this.model.empresas_peru, item.Emisiones[0]?.nEmisionCO2Eq.toFixed(2), this.model.empresas_rubro]

      let secondData = [this.model.empresas_peru, item.Emisiones[1]?.nEmisionCO2Eq.toFixed(2), this.model.empresas_rubro]

      let thirdData = [this.model.empresas_peru, item.Emisiones[2]?.nEmisionCO2Eq.toFixed(2), this.model.empresas_rubro]

      let firstMax = Math.max(...firstData);
      let secondMax = Math.max(...secondData);
      let thirdMax = Math.max(...thirdData);

      let valueFirstMax = parseFloat((firstMax * 1.4).toFixed(0));
      let valueSecondMax = parseFloat((secondMax * 1.4).toFixed(0));
      let valueThirdMax = parseFloat((thirdMax * 1.4).toFixed(0));

      let firstFormat = function (value: number, ctx: any) {
        return firstData[ctx.dataIndex];
      }
      let secondFormat = function (value: number, ctx: any) {
        return secondData[ctx.dataIndex];
      }
      let thirdFormat = function (value: number, ctx: any) {
        return thirdData[ctx.dataIndex];
      }

      let completeFirstDataset = {
        datalabels: {
          display: false
        },
        borderRadius: 16,
        backgroundColor: [
          '#B6E2A1',
          '#526648',
          '#92B581',
        ],
        borderColor: [
          '#B6E2A1',
          '#526648',
          '#92B581',
        ],
        //borderSkipped: false,
        borderWidth: 1,
        barThickness: barAncho
      };


      let completeYScale = {
        beginAtZero: true,
        ticks: {
          display: false,
        },
        grid: {
          drawBorder: false,
          display: false,
        },
        title: {
          display: true,
          text: 'tCO₂eq',
          color: '#3D3D3D',
          padding: 0,
          font: {
            size: 15,
            style: 'normal',
          }
        },
      }

      let completeXScale = {
        stacked: true,
        grid: {
          drawBorder: false,
          lineWidth: 0,
        },
        ticks: {
          color: "#3D3D3D",
          font: {
            size: 14,
            weight: '500',
            family: 'SF Pro Display',
          }
        }
      }
      this.firstChart = new Chart(firstCtx!, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
          labels: labelsCharts,
          datasets: [
            {
              data: firstData,
              ...completeFirstDataset,
            }, {
              data: [firstMax * 1.2, firstMax * 1.2, firstMax * 1.2],
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#3D3D3D',
                font: {
                  size: 13,
                }
              },
              borderRadius: 16,
              backgroundColor: [
                '#F4FBF1'
              ],
              hoverBackgroundColor: [
                '#F4FBF1'
              ],
              barThickness: barAncho
            }

          ],
        },
        options: {
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          scales: {
            y: {
              ...completeYScale,
              max: valueFirstMax,
            },
            x: {
              ...completeXScale,
            },
          },
          plugins: {
            legend: {
              display: false
            },
            datalabels: {
              font: {
                size: 12,
                weight: 'bold',
                family: 'SF Pro Display',
              },
              padding: {
                top: 0,
              },
              anchor: 'end',
              align: 'end',
              formatter: firstFormat,

            },
            tooltip: {
              callbacks: {
                title: function (context) {
                  var tooltipTitles = ['Empresas del Perú', item.sRazonSocial_mod, 'Empresas del rubro']
                  var titleIndex = context[0].datasetIndex;
                  var barIndex = context[0].dataIndex;
                  return tooltipTitles[barIndex];
                },
                label: function (context) {
                  var label = context.dataset.label || '';
                  if (context.datasetIndex === 1) {
                    label += firstData[context.dataIndex];
                  } else {
                    label += firstData[context.dataIndex];
                  }
                  //console.log('label', label);
                  return label;
                },
                labelColor: function (context) {
                  return {
                    borderColor: completeFirstDataset.backgroundColor[context.dataIndex],
                    backgroundColor: completeFirstDataset.backgroundColor[context.dataIndex],
                  }
                },
              }
            },
          },
        },
      });
      this.modalRef.result.then(() => {
        // Destruir el gráfico cuando se cierre el modal
        if (this.firstChart) {
          this.firstChart.destroy();
          this.modalRef.close();
        }
      }).catch((res) => { });

      this.secondChart = new Chart(secondCtx!, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
          labels: labelsCharts,
          datasets: [
            {
              data: secondData,
              ...completeFirstDataset,
            }, {
              data: [secondMax * 1.2, secondMax * 1.2, secondMax * 1.2],
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#3D3D3D',
                font: {
                  size: 13,
                }
              },
              borderRadius: 16,
              backgroundColor: [
                '#F4FBF1'
              ],
              hoverBackgroundColor: [
                '#F4FBF1'
              ],
              //borderSkipped: false,
              barThickness: barAncho
            }
          ],
        },
        options: {
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          scales: {
            y: {
              ...completeYScale,
              max: valueSecondMax,
            },
            x: {
              ...completeXScale,
            },
          },
          plugins: {
            legend: {
              display: false
            },
            datalabels: {
              font: {
                size: 12,
                weight: 'bold',
                family: 'SF Pro Display',
              },
              padding: {
                top: 0,
              },
              anchor: 'end',
              align: 'end',
              formatter: secondFormat,
            },
            tooltip: {
              callbacks: {
                title: function (context) {
                  var tooltipTitles = ['Empresas del Perú', item.sRazonSocial_mod, 'Empresas del rubro']
                  var titleIndex = context[0].datasetIndex;
                  var barIndex = context[0].dataIndex;
                  return tooltipTitles[barIndex];
                },
                label: function (context) {
                  var label = context.dataset.label || '';
                  if (context.datasetIndex === 1) {
                    label += secondData[context.dataIndex];
                  } else {
                    label += secondData[context.dataIndex];
                  }
                  return label;
                },
                labelColor: function (context) {
                  return {
                    borderColor: completeFirstDataset.backgroundColor[context.dataIndex],
                    backgroundColor: completeFirstDataset.backgroundColor[context.dataIndex],
                  }
                },
              }
            },
          },
        },
      });
      this.modalRef.result.then(() => {
        // Destruir el gráfico cuando se cierre el modal
        if (this.secondChart) {
          this.secondChart.destroy();
          this.modalRef.close();
        }
      }).catch((res) => { });


      this.thirdChart = new Chart(thirdCtx!, {
        plugins: [ChartDataLabels],
        type: 'bar',
        data: {
          labels: labelsCharts,
          datasets: [
            {
              data: thirdData,
              ...completeFirstDataset,
            }, {
              data: [thirdMax * 1.2, thirdMax * 1.2, thirdMax * 1.2],
              datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#3D3D3D',
                font: {
                  size: 13,
                }
              },
              borderRadius: 16,
              backgroundColor: [
                '#F4FBF1'
              ],
              hoverBackgroundColor: [
                '#F4FBF1'
              ],
              //borderSkipped: false,
              barThickness: barAncho
            }
          ],
        },
        options: {
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          scales: {
            y: {
              ...completeYScale,
              max: valueThirdMax,
            },
            x: {
              ...completeXScale,
            },
          },
          plugins: {
            legend: {
              display: false
            },
            datalabels: {
              font: {
                size: 12,
                weight: 'bold',
                family: 'SF Pro Display',
              },
              padding: {
                top: 0,
              },
              anchor: 'end',
              align: 'end',
              formatter: thirdFormat
            },
            tooltip: {
              callbacks: {
                title: function (context) {
                  var tooltipTitles = ['Empresas del Perú', item.sRazonSocial_mod, 'Empresas del rubro']
                  var titleIndex = context[0].datasetIndex;
                  var barIndex = context[0].dataIndex;
                  return tooltipTitles[barIndex];
                },
                label: function (context) {
                  var label = context.dataset.label || '';
                  if (context.datasetIndex === 1) {
                    label += thirdData[context.dataIndex];
                  } else {
                    label += thirdData[context.dataIndex];
                  }
                  return label;
                },
                labelColor: function (context) {
                  return {
                    borderColor: completeFirstDataset.backgroundColor[context.dataIndex],
                    backgroundColor: completeFirstDataset.backgroundColor[context.dataIndex],
                  }
                },
              }
            },
          },
        },
      });
      this.modalRef.result.then(() => {
        // Destruir el gráfico cuando se cierre el modal
        if (this.thirdChart) {
          this.thirdChart.destroy();
          this.modalRef.close();
        }
      }).catch((res) => { });
    } else {
      this.toastr.warning(data.mensajeUsuario, 'Advertencia');
    }

  }


  changeFirstDate(changeDate: any) {
    this.model.FechaInicio = ('0' + changeDate.day).slice(-2) + '-' + ('0' + changeDate.month).slice(-2) + '-' + changeDate.year

    const splitFirstDate = this.model.FechaInicio.split('-');
    const splitSecondDate = this.model.FechaFin.split('-');

    const firstDate = `${splitFirstDate[1]}/${splitFirstDate[0]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[1]}/${splitSecondDate[0]}/${splitSecondDate[2]}`;

    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La primera fecha no debe ser mayor a la segunda', 'Advertencia');
      this.invalid_firstDate = true;
      return
    }
    this.invalid_firstDate = false;
    this.invalid_secondDate = false;
    this.fnListarClientes();

  }

  changeSecondDate(changeDate: any) {
    this.model.FechaFin = ('0' + changeDate.day).slice(-2) + '-' + ('0' + changeDate.month).slice(-2) + '-' + changeDate.year

    const splitFirstDate = this.model.FechaInicio.split('-');
    const splitSecondDate = this.model.FechaFin.split('-');

    const firstDate = `${splitFirstDate[1]}/${splitFirstDate[0]}/${splitFirstDate[2]}`;
    const secondDate = `${splitSecondDate[1]}/${splitSecondDate[0]}/${splitSecondDate[2]}`;

    if (new Date(String(firstDate)) > new Date(String(secondDate))) {
      this.toastr.warning('La segunda fecha no debe ser menor que la primera', 'Advertencia');
      this.invalid_secondDate = true;
    } else {
      this.invalid_firstDate = false;
      this.invalid_secondDate = false;
      this.fnListarClientes();
    }
  }

  fnFiltros() {
    this.fShow = true;
  }
}

