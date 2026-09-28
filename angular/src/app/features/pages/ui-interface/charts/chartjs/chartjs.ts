import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

@Component({
  selector: 'app-chartjs',
  imports: [],
  templateUrl: './chartjs.html',
  styleUrl: './chartjs.css',
})
export class Chartjs {
   ngOnInit(): void {
      this.RenderChart();
      this.transchart();
      this.gradchart(); 
      this.horizonchart();
      this.stackchart();
      this.doughcharts();
      this.verstack();
      this.piecharts();
      this.areacharts();
      this.donutCharts();
      this.donutCharts2();
      
    }

    RenderChart() {
      const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      new Chart("chartBar1", {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Sales',
						data: [40, 50, 70, 50, 40, 60],
						backgroundColor: '#D4AF37',					
						borderRadius: 10,
					}]
				},
				options: { // Root options started here
					maintainAspectRatio: false,
					responsive: true,
					plugins: {
						legend: {
							display: false
						}
					},
					scales: {
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
							},
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						},
						y: {
							grid: {
								color: myBorderColor, 
							},
							beginAtZero: true,
							max: 80,
							ticks: {
								color: labelColor,
								font: { size: 10 }
							}
						}
					}
				} // End of options
			});
    }
    transchart() {
      const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      new Chart("chartBar2", {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Sales',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: '#EAD79A',				
						borderRadius: 10,
					}]
				},
				options: {
					maintainAspectRatio: false,
					responsive: true,
					scales: {
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
							},
							ticks: {
								color: labelColor,
								font: { size: 11 } // ✅ Correct way to set font size in v4
							}, // ✅ Moved outside `ticks`
						},
						y: {
							grid: {
								color: myBorderColor, 
							},
							ticks: {
								color: labelColor,
								font: { size: 10 }, // ✅ Sets max value for the Y-axis
							}
						}
					}
				}
			});
    }

    gradchart() {
      const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      // const ctx2 = document.getElementById('chartBar3').getContext('2d');
       const chartRef = document.getElementById('chartBar3') as HTMLCanvasElement;

  if (!chartRef) return;

  const ctx = chartRef.getContext('2d');
  if (!ctx) return;
      const gradient = ctx.createLinearGradient(0, 0, 0, 250);
			gradient.addColorStop(0, '#7A13F0');
			gradient.addColorStop(1, '#EAD79A');

      new Chart("chartBar3",{
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Sales',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: gradient
					}]
				},
				options: { // Root options
					maintainAspectRatio: false,
					responsive: true,
					plugins: { // Legend goes here in v3+
						legend: {
							display: false
						}
					},
					scales: {
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
							},
							ticks: {
								color: labelColor,
								font: { size: 11 }
							},
						},
						y: {
							grid: {
								color: myBorderColor, 
							},
							border: {
								color: myBorderColor, // Sets solid axis line
							},
							beginAtZero: true,
							max: 80,
							ticks: {
								color: labelColor,
								font: { size: 10 }
							}
						}
					}
				}
			});
    }
    
    horizonchart() {
        const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      new Chart("chartBar4", {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Sales',
						data: [14, 12, 34, 25, 24, 20],					
						borderColor: '#AA7DFF',
						borderWidth: 2, 	
						backgroundColor: ['#EDE6FF']
					}]
				},
				options: {
					indexAxis: 'y',
					maintainAspectRatio: false,
					scales: {
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						},
						y: {
							grid: {
								color: myBorderColor, 
							},
							ticks: {
								color: labelColor,
								font: { size: 10 },
							}
						}
					}
				}
			});
    }
    stackchart() {
       const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      new Chart("chartBar5",  {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
					datasets: [{
						label: 'Income',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: [ '#99A1AF']
					}, {
						label: 'Expense',
						data: [22, 30, 25, 30, 20, 40],
						backgroundColor: '#D4AF37'
					}]
				},
				options: {
					indexAxis: 'y',
					maintainAspectRatio: false,
					scales: {
						y: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						},
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							ticks: {
								color: labelColor,
								font: { size: 11 },
							}
						}
					}
				}
			});
    }
    
    verstack() {
       const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
      new Chart("chartStacked1", {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Income',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: '#D4AF37',
						borderWidth: 1,
					}, {
						label: 'Expense',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: '#D97F06',
						borderWidth: 1,
					}]
				},
				options: {
					maintainAspectRatio: false,
					scales: {
						y: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							stacked: true,
							beginAtZero: true,
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						},
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							stacked: true,
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						}
					}
				}
			});
    }
  
  doughcharts() {
     const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
    new Chart("chartStacked2", {
				type: 'bar',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
					datasets: [{
						label: 'Sales',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor: '#2FD896',
						borderWidth: 1,
					}, {
						label: 'Revenue',
						data: [14, 12, 34, 25, 24, 20],
						backgroundColor:  '#51A2FF',
						borderWidth: 1,
					}]
				},
				options: {
					indexAxis: 'y',
					maintainAspectRatio: false,
					scales: {
						y: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							stacked: true,
							ticks: {
								color: labelColor,
								font: { size: 10 },
							}
						},
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							stacked: true,
							ticks: {
								color: labelColor,
								font: { size: 11 }
							}
						}
					}
				}
			}); 
  }
  piecharts() {
     const style = getComputedStyle(document.documentElement);
      const myBorderColor = style.getPropertyValue('--color-border-color').trim();
      const labelColor = style.getPropertyValue('--color-default').trim();
    new Chart("chartLine1",{
				type: 'line',
				data: {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
					datasets: [{
						label: 'Sales',
						data: [14, 12, 34, 25, 44, 36, 35, 25, 30, 32, 20, 25 ],
						borderColor: '#7008E7',
						borderWidth: 1,
						fill: false
					}, {
						label: 'Revenue',
						data: [35, 30, 45, 35, 55, 40, 10, 20, 25, 55, 50, 45],
						borderColor: '#D97F06',
						borderWidth: 1,
						fill: false
					}]
				},
				options: {
					maintainAspectRatio: false,
					scales: {
						x: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							ticks: {
								color: labelColor,
							},
						},
						y: {
							grid: {
								color: myBorderColor, // NO BRACKETS []
							},
							border: {
								color: myBorderColor, // Sets solid axis line
								width: 1
							},
							ticks: {
								color: labelColor,
								font: { size: 12 },
							}
						},
					}
				}
			});
  }
  donutCharts(){
    const datapie = {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
			datasets: [{
			data: [35, 20, 8, 15, 24],
			backgroundColor: ['#9148FF', '#0ABF7F', '#F5A70D', '#F6339A', '#00BBA7' ],
			borderWidth: 2
			}]
		};

		const optionpie = {
			responsive: true,
			maintainAspectRatio: false,
			cutout: '60%',   // 👈 doughnut thickness (THIS makes it like image)

			plugins: {
				legend: {
					display: true,
					position: 'top',
					labels: {
						boxWidth: 30,
						padding: 15
					}
				}
			},

			animation: {
				animateScale: true,
				animateRotate: true
			}
		};
    new Chart("chartPie",{
			type: 'doughnut',
			data: datapie,
		})
  }
  donutCharts2(){
   const datapie = {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
			datasets: [{
			data: [35, 20, 8, 15, 24],
			backgroundColor: ['#9148FF', '#0ABF7F', '#F5A70D', '#F6339A', '#00BBA7' ],
			borderWidth: 2
			}]
		};

		const optionpie = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
					position: 'bottom'
				}
			},
			animation: {
				animateScale: true,
				animateRotate: true
			}
		};

    new Chart("chartDonut",{
			type: 'pie',
			data: datapie,
		})
  }
  areacharts() {
    new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart
  
      data: {// values on X-Axis
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug' ], 
         datasets: [
          {
            label: "Sales",
            data: ['467','576', '572', '79', '92',
                 '574', '573', '576'],
            backgroundColor: 'blue'
          },
          {
            label: "Profit",
            data: ['542', '542', '536', '327', '17',
                   '0.00', '538', '541'],
            backgroundColor: 'limegreen'
          }  
        ]
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }

}
