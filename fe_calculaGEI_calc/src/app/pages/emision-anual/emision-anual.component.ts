import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DataService } from 'src/app/services/data.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-emision-anual',
  templateUrl: './emision-anual.component.html',
  styleUrls: ['./emision-anual.component.css']
})
export class EmisionAnualComponent implements OnInit {
  canvas1: any;
  canvas2: any;
  canvas3: any;

  firstCtx: any;
  secondCtx: any;
  thirdCtx: any;

  barChart1: any;
  barChart2: any;
  barChart3: any;

  lstEmision: any = {};

  optionsObj: any;
  datasetsObj: any;

  @ViewChild('firstChart', { static: true }) firstChart!: { nativeElement: any };
  @ViewChild('secondChart', { static: true }) secondChart!: { nativeElement: any };
  @ViewChild('thirdChart', { static: true }) thirdChart!: { nativeElement: any };

  constructor(private dataService: DataService, private sharedData: SharedDataService,) { Chart.register(...registerables); }

  ngOnInit() {
    //Deshabilitar todos los inputs
    this.sharedData.itemEmpresa.disabled = true;

    if (this.sharedData.itemPersonales.id_cliente == null) {

      setTimeout(() => {
        this.fnEmision();
        var body = document.getElementById('loading') as HTMLFormElement;
        body.classList.add('d-none');

      }, 1500)
    } else if (this.sharedData.itemPersonales.id_cliente !== null) {
      this.fnEmision();
      var body = document.getElementById('loading') as HTMLFormElement;
      body.classList.add('d-none');
    }

  }

  fnEmision() {

    this.dataService.listarEmision(this.sharedData.itemPersonales.id_cliente).subscribe(
      {
        next: data => {
          //console.log(data)
          if (data.exito) {

            this.lstEmision = data.datoAdicional;

            this.canvas1 = this.firstChart.nativeElement;
            this.canvas2 = this.secondChart.nativeElement;
            this.canvas3 = this.thirdChart.nativeElement;

            this.firstCtx = this.canvas1.getContext('2d');
            this.secondCtx = this.canvas2.getContext('2d');
            this.thirdCtx = this.canvas3.getContext('2d');

            let max1 = Math.max(this.lstEmision.mi_empresa[0]?.emision_empresa, this.lstEmision.empresas_peru, this.lstEmision.empresas_rubro);
            //console.log(max1);

            let max2 = Math.max(this.lstEmision.mi_empresa[1]?.emision_empresa, this.lstEmision.empresas_peru, this.lstEmision.empresas_rubro);
            //console.log(max2);

            let max3 = Math.max(this.lstEmision.mi_empresa[2]?.emision_empresa, this.lstEmision.empresas_peru, this.lstEmision.empresas_rubro);
            //console.log(max3);

            //console.log('Lista emision', this.lstEmision);

            let longLabels = [['Empresas del', 'Perú**'], 'Tu empresa', ['Empresas del', 'rubro'],]

            //Si Sector es 1 no mostrar valores de rubro
            if (this.sharedData.itemEmpresa.sectorDto == 1) {
              longLabels = longLabels.slice(0, -1);
              this.lstEmision.empresas_rubro = null;
            }

            //Chart 1
            this.barChart1 = new Chart(this.firstCtx, {
              plugins: [ChartDataLabels],
              type: 'bar',
              data: {
                labels: longLabels,
                datasets: [
                  {
                    data: [this.lstEmision.empresas_peru, this.lstEmision.mi_empresa[0]?.emision_empresa, this.lstEmision.empresas_rubro],
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      color: '#0D3154',
                      font: {
                        size: 13,
                      }
                    },
                    borderRadius: 10,
                    backgroundColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    //position: 'right',
                    grid: {
                      drawBorder: false,
                    },
                    title: {
                      display: true,
                      text: 'tCO₂eq',
                      color: '#0D3154',
                      padding: 1,
                      font: {
                        size: 15
                      }
                    },
                    max: max1 * 1.2,
                    ticks: {
                      display: false,
                    }
                  },
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "#0D3154",
                      font: {
                        size: 13,
                        weight: '600',
                        family: 'Nunito',
                      }
                    }
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
                      family: 'Nunito',
                    },
                    anchor: 'end',
                    align: 'end'
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        //console.log(context[0].label);
                        return context[0].label.split(',').join(' ');
                      }
                    }
                  }
                },
              },
            });

            //Chart 2
            this.barChart2 = new Chart(this.secondCtx, {
              plugins: [ChartDataLabels],
              type: 'bar',
              data: {
                labels: longLabels,
                datasets: [
                  {
                    data: [this.lstEmision.empresas_peru, this.lstEmision.mi_empresa[1]?.emision_empresa, this.lstEmision.empresas_rubro],
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      color: '#0D3154',
                      font: {
                        size: 13,
                      }
                    },
                    borderRadius: 10,
                    backgroundColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    //position: 'right',
                    grid: {
                      drawBorder: false,
                    },
                    title: {
                      display: true,
                      text: 'tCO₂eq',
                      color: '#0D3154',
                      padding: 1,
                      font: {
                        size: 15
                      }
                    },
                    max: max2 * 1.2,
                    ticks: {
                      display: false,
                      callback: function (val: any) {
                        return val;
                      },
                    }
                  },
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "#0D3154",
                      font: {
                        size: 13,
                        weight: '600',
                        family: 'Nunito',
                      }
                    }
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
                      family: 'Nunito',
                    },
                    anchor: 'end',
                    align: 'end'
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        //console.log(context[0].label);
                        return context[0].label.split(',').join(' ');
                      }
                    }
                  }
                },
              },
            });
            //Chart 3
            this.barChart3 = new Chart(this.thirdCtx, {
              plugins: [ChartDataLabels],
              type: 'bar',
              data: {
                labels: longLabels,
                datasets: [
                  {
                    data: [this.lstEmision.empresas_peru, this.lstEmision.mi_empresa[2]?.emision_empresa, this.lstEmision.empresas_rubro],
                    datalabels: {
                      anchor: 'end',
                      align: 'top',
                      color: '#0D3154',
                      font: {
                        size: 13,
                      }
                    },
                    borderRadius: 10,
                    backgroundColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderColor: [
                      '#007EC5',
                      '#0D3154',
                      '#CFEAF2',
                    ],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    //position: 'right',
                    grid: {
                      drawBorder: false,
                    },
                    title: {
                      display: true,
                      text: 'tCO₂eq',
                      color: '#0D3154',
                      padding: 1,
                      font: {
                        size: 15
                      }
                    },
                    max: max3 * 1.2,
                    ticks: {
                      display: false,
                      callback: function (val: any) {
                        return val;
                      },
                    }
                  },
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "#0D3154",
                      font: {
                        size: 13,
                        weight: '600',
                        family: 'Nunito',
                      }
                    }
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
                      family: 'Nunito',
                    },
                    anchor: 'end',
                    align: 'end'
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        //console.log(context[0].label);
                        return context[0].label.split(',').join(' ');
                      }
                    }
                  }
                },
              },
            });
          }
        },
      })
  }

}

