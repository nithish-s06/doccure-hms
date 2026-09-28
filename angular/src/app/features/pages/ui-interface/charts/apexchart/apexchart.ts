import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { RouterLink } from '@angular/router';

export interface ChartOptions  {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-apexchart',
  imports: [NgApexchartsModule],
  templateUrl: './apexchart.html',
  styleUrl: './apexchart.css',
  encapsulation:ViewEncapsulation.None
})
export class Apexchart {

  
    @ViewChild('chart')
    chart!: ChartComponent;
  
    public Linechart: Partial<ChartOptions> | any;
  
    public Areachart: Partial<ChartOptions> | any;
  
    public ColumnCharts: Partial<ChartOptions> | any;
  
    public StackedCharts: Partial<ChartOptions> | any;
  
    public BarCharts: Partial<ChartOptions> | any;
  
    public MixedChart: Partial<ChartOptions> | any;
  
    public DonutChart: Partial<ChartOptions> | any;
  
    public RadialChart: Partial<ChartOptions> | any;
  
    ngOnInit(): void {
      this.Linechart =  {
			chart: {
				height: 350,
				type: 'line',
				zoom: {
					enabled: false
				},
				toolbar: {
					show: false,
				},
				borderWidth: 1,
				borderColor: '#000',
			},
			colors: ['var(--color-primary)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight',
				width: 2,
			},
			series: [{
				name: "Desktops",
				data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
			}],
			title: {
				text: 'Product Trends by Month',
				align: 'left',
				style: {
					color: 'var(--color-default)',
				},
			},
			grid: {
				borderColor: 'var(--color-border-color)',
				row: {

					opacity: 0.5
				},
				padding: {
					left: -5,
					right: 0,
				},
			},
			xaxis: {
				labels: {
					style: {
						colors: 'var(--color-default)',
					},
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				},
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
			},
			yaxis: {
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
					},
				},
			},
		};
      this.Areachart = {
			chart: {
				height: 350,
				type: 'area',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--color-primary)', 'var(--color-warning)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight',
				width: 1,
			},
			grid: {
				borderColor: 'var(--color-border-color)',
				padding: {
					left: -5,
					right: -15,
				},
			},
			series: [{
				name: 'Income',
				data: [40, 56, 28, 50, 42, 50, 60]
			}, {
				name: 'Expense',
				data: [20, 36, 20, 40, 25, 40, 30]
			}],

			xaxis: {
				labels: {
					style: {
						colors: 'var(--color-default)',
					},
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				},
				type: 'datetime',
				categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T05:35:00"],
			},
			tooltip: {
				x: {
					format: 'dd/MM/yy HH:mm'
				},
			},
			yaxis: {
				min: 0,
				max: 60,
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
					},
				},
			},
			legend: {
				labels: {
					colors: 'var(--color-default)',
				}
			},
		};
      this.ColumnCharts = {
			chart: {
				height: 290,
				type: 'bar',
				toolbar: {
					show: false,
				}
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '50%',
					borderRadius: 5,
					endingShape: 'rounded', // This rounds the top edges of the bars
				},
			},
			colors: ['var(--color-primary-500)', 'var(--color-success-500)', 'var(--color-warning-500)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},

			series: [{
				name: 'Inprogress',
				data: [19, 65, 19, 19, 19, 19, 19]
			}, {
				name: 'Active',
				data: [89, 45, 89, 46, 61, 25, 79]
			},
			{
				name: 'Completed',
				data: [39, 39, 39, 80, 48, 48, 48]
			}],
			xaxis: {
				categories: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
				labels: {
					style: {
						colors: 'var(--color-default)',
						fontSize: '12px',
					}
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				},
			},
			yaxis: {
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
						fontSize: '14px',
					}
				}
			},
			grid: {
				borderColor: 'var(--color-border-color)',
				strokeDashArray: 5,
				padding: {
					left: -8,
					right: -15,
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val:any) {
						return "" + val + "%"
					}
				}
			},
			legend: {
				labels: {
					colors: 'var(--color-default)',
				}
			},
		};
      this.StackedCharts = {
			chart: {
				height: 290,
				type: 'bar',
				stacked: true,
				toolbar: {
					show: false,
				}
			},
			responsive: [{
				breakpoint: 480,
				options: {
					legend: {
						position: 'bottom',
						offsetX: -10,
						offsetY: 0
					}
				}
			}],
			plotOptions: {
				bar: {
					horizontal: false,
				},
			},
			grid: {
				borderColor: 'var(--color-border-color)',
				padding: {
					left: -5,
					right: -15,
				},
			},
			colors: ['var(--color-primary-500)', 'var(--color-success-500)', 'var(--color-warning-500)', 'var(--color-pink-500)'],
			series: [{
				name: 'Laptops',
				data: [44, 55, 41, 67, 22, 43]
			}, {
				name: 'Cosmetics',
				data: [13, 23, 20, 8, 13, 27]
			}, {
				name: 'Medical Devices',
				data: [11, 17, 15, 15, 21, 14]
			}, {
				name: 'Software',
				data: [21, 7, 25, 13, 22, 8]
			}],
			yaxis: {
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
					},
				},
			},
			xaxis: {
				labels: {
					style: {
						colors: 'var(--color-default)',
					},
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				},
				type: 'datetime',
				categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT', '01/05/2011 GMT', '01/06/2011 GMT'],
			},
			legend: {
				labels: {
					colors: 'var(--color-default)',
				},
			},
			fill: {
				opacity: 1
			},
		};
      // Bar Chart
      this.BarCharts = {
			chart: {
				height: 350,
				type: 'bar',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--color-primary-600)'],
			grid: {
				borderColor: 'var(--color-border-color)',
				padding: {
					left: 0,
					right: -15,
				},
			},
			plotOptions: {
				bar: {
					horizontal: true,
				}
			},
			dataLabels: {
				enabled: false
			},
			series: [{
				data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
			}],
			xaxis: {
				labels: {
					style: {
						colors: 'var(--color-default)',
					},
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				},
				categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan', 'United States', 'China', 'Germany'],
			},
			yaxis: {
				labels: {
					offsetX: -10,
					style: {
						colors: 'var(--color-default)',
					},
				},
			},
		};
      // Mixed Chart
      this.MixedChart = {
			chart: {
				height: 350,
				type: 'line',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--color-primary-600)', 'var(--color-success-600)'],
			series: [{
				name: 'Website Blog',
				type: 'column',
				data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
			}, {
				name: 'Social Media',
				type: 'line',
				data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
			}],
			stroke: {
				width: [0, 4]
			},
			grid: {
				borderColor: 'var(--color-border-color)',
				padding: {
					left: -5,
					right: -15,
				},
			},
			title: {
				text: 'Traffic Sources',
				style: {
					color: 'var(--color-default)',
				},
			},
			legend: {
				labels: {
					colors: 'var(--color-default)',
				}
			},
			labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
			xaxis: {
				type: 'datetime',
				labels: {
					style: {
						colors: 'var(--color-default)',
					},
				},
				axisBorder: {
					color: ['var(--color-border-color)'],
				},
				axisTicks: {
					color: ['var(--color-border-color)'],
				}
			},
			yaxis: [{
				title: {
					text: 'Website Blog',
				},
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
					},
				},

			}, {
				opposite: true,
				title: {
					text: 'Social Media'
				},
				labels: {
					offsetX: -15,
					style: {
						colors: 'var(--color-default)',
					},
				},
			}]

		};
      // Donut Chart
      this.DonutChart = {
			chart: {
				height: 330,
				type: 'donut',
				toolbar: {
					show: false,
				}
			},
			legend: {
				position: 'bottom',
				labels: {
					colors: 'var(--color-default)',
				}
			},
			colors: ['var(--color-primary-600)', 'var(--color-success-600)', 'var(--color-warning-600)', 'var(--color-pink-600)'],
			labels: ['Laptops', 'Cosmetics', 'Medical Devices', 'Software'],
			series: [44, 55, 41, 17],
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom'
					}
				}
			}]
		};
      // Radial Chart
      this.RadialChart = {
			chart: {
				height: 350,
				type: 'radialBar',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--color-primary-600)', 'var(--color-success-600)', 'var(--color-warning-600)', 'var(--color-pink-600)'],
			plotOptions: {
				radialBar: {
					dataLabels: {
						name: {
							fontSize: '22px',
							color: 'var(--color-title)',
						},
						value: {
							fontSize: '16px',
							color: 'var(--color-default)',
						},
						total: {
							show: true,
							label: 'Total',
							color: 'var(--color-default)',
							formatter: function (w:any) {
								return 249
							}
						}
					}
				}
			},
			series: [44, 55, 67, 83],
			labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
		};
    }
  
    public generateData(
      baseval: number,
      count: number,
      yrange: { max: number; min: number }
    ) {
      let i = 0;
      const series = [];
      while (i < count) {
        const x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
        const y =
          Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;
  
        series.push([x, y, z]);
        baseval += 86400000;
        i++;
      }
      return series;
    }

}
