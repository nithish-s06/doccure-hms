// ==========================================================================
// apex-chart-data.js
// ==========================================================================



// Global chart styling variables
const bluePrimary = '#0070f3';
const blueLight = '#3b82f6';
const borderGray = '#f1f5f9';

// ----------------------------------------------------
// 1. Patient Growth Main Analytics Chart
// ----------------------------------------------------
if (document.getElementById('chart-growth')) {
	var growthOptions = {
		series: [{
			name: 'Patients',
			data: [7000, 6000, 6800, 5000, 12457, 5500, 6200, 7100, 6400, 7900, 9500, 6800]
		}],
		chart: {
			type: 'bar',
			height: 215,
			toolbar: { show: false }
		},
		plotOptions: {
			bar: {
			borderRadius: 6,
			columnWidth: '55%',
			colors: {
				ranges: [{
					from: 12000,
					to: 13000,
					color: bluePrimary
				}]
			}
			}
		},
		// Replicating striped line texture patterns for regular months
		fill: {
			type: ['pattern', 'solid'],
			pattern: {
				style: 'slantedLines',
				width: 4,
				height: 4,
				strokeWidth: 1.5
			}
		},
		colors: ['#cbd5e1'], // Default fallback muted fill color for non-peak columns
		dataLabels: { enabled: false },
		grid: { 
			show: false, 
			padding: { 
			left: 0, 
			right: -10 
			} 
		},
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {style: { colors: '#94a3b8', fontSize: '11px' } }
		},
		yaxis: {
			labels: {
				offsetX: -15, 
				style: { colors: '#94a3b8', fontSize: '11px' },
				formatter: (val) => val >= 1000 ? (val / 1000) + 'K' : val
			}
		},
		responsive: [
			{
				breakpoint: 575,
				options: {
				grid: {
					padding: {
					left: 0,
					right: 0,
					}
				}
				}
			}
		]

	};
	new ApexCharts(document.querySelector("#chart-growth"), growthOptions).render();
}

if (document.getElementById('chart-quarter')) {
	var growthQuarterlyOptions = {
	series: [{
		name: 'Patients',
		data: [19800, 22957, 19700, 24200]
	}],
	chart: {
		type: 'bar',
		height: 215,
		toolbar: { show: false }
	},
	plotOptions: {
		bar: {
		borderRadius: 6,
		columnWidth: '40%', // Tightened slightly from 55% because 4 columns stretch wider than 12
		colors: {
			ranges: [{
			from: 24000, // Seamlessly targets the new peak quarter value boundary
			to: 25000,
			color: typeof bluePrimary !== 'undefined' ? bluePrimary : '#2563eb'
			}]
		}
		}
	},
	fill: {
		type: ['pattern', 'solid'],
		pattern: {
		style: 'slantedLines',
		width: 4,
		height: 4,
		strokeWidth: 1.5
		}
	},
	colors: ['#cbd5e1'], 
	dataLabels: { enabled: false },
	grid: { show: false, padding: { left: 0, right: -10 } },
	xaxis: {
		categories: ['Q1', 'Q2', 'Q3', 'Q4'],
		axisBorder: { show: false },
		axisTicks: { show: false },
		labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 'bold' } }
	},
	yaxis: {
		labels: {
		offsetX: -15, 
		style: { colors: '#94a3b8', fontSize: '11px' },
		formatter: (val) => val >= 1000 ? (val / 1000) + 'K' : val
		}
	}
	};

	new ApexCharts(document.querySelector("#chart-quarter"), growthQuarterlyOptions).render();
}

// ----------------------------------------------------
// 2. Revenue Breakdown Stacked Bar Chart
// ----------------------------------------------------
if (document.getElementById('chart-revenue')) {
var revenueOptions = {
  series: [
    { name: 'Appointments', data: [150, 190, 310] },
    { name: 'Pharmacy', data: [130, 210, 240] },
    { name: 'Medical Records', data: [178, 198, 246] }
  ],
  chart: {
    type: 'bar',
    height: 180,
    stacked: true,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      columnWidth: '60%',
      borderRadius: 6,
      borderRadiusApplication: 'around',
      borderRadiusWhenStacked: 'all'
    }
  },
  colors: [ '#0284c7', '#38bdf8', '#bae6fd' ], // Blue gradient scheme
  dataLabels: { enabled: false },
  grid: { show: false },
  legend: { show: false },
  xaxis: {
    categories: ['Jan - Apr', 'May - Aug', 'Sep - Dec'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '11px' } }
  },
  yaxis: { show: false },
  annotations: {
    points: [
      { x: 'Jan - Apr', y: 458, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: '#334155', fontWeight: 'bold' }, text: '$458K', offsetY: -5 } },
      { x: 'May - Aug', y: 598, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: '#334155', fontWeight: 'bold' }, text: '$598K', offsetY: -5 } },
      { x: 'Sep - Dec', y: 796, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: '#334155', fontWeight: 'bold' }, text: '$796K', offsetY: -5 } }
    ]
  }
};
new ApexCharts(document.querySelector("#chart-revenue"), revenueOptions).render();
}


// ----------------------------------------------------
// 4. Smooth KPI Sparklines (Shared Configurations)
// ----------------------------------------------------
const sparklineBase = {
  chart: { type: 'area', height: 50, sparkline: { enabled: true }, animations: { enabled: false } },
  stroke: { curve: 'smooth', width: 2 },
  tooltip: { enabled: false },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } }
};

// Total Patients Mini Sparkline
if (document.getElementById('sparkline-patients')) { 
new ApexCharts(document.querySelector("#sparkline-patients"), {
  ...sparklineBase,
  series: [{ data: [30, 40, 35, 50, 48, 60, 55] }],
  colors: [blueLight]
}).render();
}

// Active Doctors Mini Sparkline
if (document.getElementById('sparkline-doctors')) { 
new ApexCharts(document.querySelector("#sparkline-doctors"), {
  ...sparklineBase,
  series: [{ data: [50, 45, 48, 40, 42, 45, 43] }],
  colors: ['#7c3aed'] // Purple accent line
}).render();
}

// Appointments Mini Sparkline
if (document.getElementById('sparkline-appointments')) { 
new ApexCharts(document.querySelector("#sparkline-appointments"), {
  ...sparklineBase,
  series: [{ data: [20, 35, 25, 45, 30, 40, 38] }],
  colors: ['#f59e0b'] // Orange accent line
}).render();
}

// Emergency Mini Sparkline
if (document.getElementById('sparkline-emergency')) {
new ApexCharts(document.querySelector("#sparkline-emergency"), {
  ...sparklineBase,
  chart: { ...sparklineBase.chart, height: 20 },
  series: [{ data: [15, 10, 22, 12, 18, 14, 25] }],
  colors: ['#f43f5e'] // Red accent line
}).render();
}

document.addEventListener("DOMContentLoaded", function () {
   if (document.getElementById('departmentDonutChart')) { 
    // --- 1. DEPARTMENT PERFORMANCE DONUT CHART ---
   const donutOptions = {
    series: [32, 26, 10, 30, 2],
    chart: {
        type: 'donut',
        height: 260,
        sparkline: { enabled: false }, // Explicitly keep false to handle structural canvas borders
        parentHeightOffset: 0 // Removes default canvas spacing boundaries
    },
    labels: ['Cardiology', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology'],
    colors: ['#0284c7', '#38bdf8', '#94a3b8', '#f59e0b', '#8b5cf6'],
    
    stroke: { 
        show: true,
        width: 3,
        colors: ['var(--color-white)']
    },
    
    dataLabels: {
        enabled: true,
        formatter: function (val) { return parseInt(val) + "%" },
        style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] }
    },
    legend: {
      show: false,
        position: 'right',
        offsetY: 18,             // Manual vertical offset pixel push overrides the hidden layout canvas gap
        floating: false,
        fontSize: '13px',        // Enhanced slightly for cleaner readability
        fontFamily: 'inherit',
        fontWeight: 500,
        markers: { 
            radius: 12,
            width: 11,
            height: 11
        },
        itemMargin: { 
            vertical: 8          // Amplified item line separation heights to match donut outer radius distribution 
        }
    },
    
    plotOptions: {
        pie: {
            customScale: 0.9, 
            donut: {
                size: '65%',
                labels: { show: false }
            }
        }
    },
    responsive: [
      {
      breakpoint: 1399, // Tablet Screens
      options: {
        chart: {
          height: 210 // Decreasing chart height prevents circles from stretching vertically
        },
      }
    },
    {
      breakpoint: 768, // Tablet Screens
		options: {
			chart: {
			height: 280 // Decreasing chart height prevents circles from stretching vertically
			},
			legend: {
			position: 'bottom',
			}
		}
		},]
	};

    new ApexCharts(document.querySelector("#departmentDonutChart"), donutOptions).render();
}
if (document.getElementById('monthlyDonutChart')) { 
    const monthlyDonutOptions = {
    series: [35, 23, 10, 25, 7], // Unique breakdown matching monthly performance
    chart: {
        type: 'donut',
        height: 240,
        sparkline: { enabled: false },
        parentHeightOffset: 0
    },
    labels: ['Cardiology', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology'],
    colors: ['#0284c7', '#38bdf8', '#94a3b8', '#f59e0b', '#8b5cf6'],
    stroke: { 
        show: true,
        width: 3,
        colors: ['var(--color-white)']
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) { return parseInt(val) + "%" },
        style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] }
    },
    legend: { show: false },
    plotOptions: {
        pie: {
            customScale: 0.9, 
            donut: { size: '65%' }
        }
    },
    responsive: [
      {
      breakpoint: 1399, // Tablet Screens
      options: {
        chart: {
          height: 210 // Decreasing chart height prevents circles from stretching vertically
        },
      }
    },
    {
      breakpoint: 768, // Tablet Screens
      options: {
        chart: {
          height: 280 // Decreasing chart height prevents circles from stretching vertically
        },
         legend: {
        position: 'bottom',
        }
      }
    },]
	};
	new ApexCharts(document.querySelector("#monthlyDonutChart"), monthlyDonutOptions).render();
}

if (document.getElementById('yearlyDonutChart')) { 
	const yearlyDonutOptions = {
	series: [30, 28, 8, 32, 2], // Aggregate trends mapping long-term scale metrics
		chart: {
			type: 'donut',
			height: 240,
			sparkline: { enabled: false },
			parentHeightOffset: 0
		},
		labels: ['Cardiology', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology'],
		colors: ['#0284c7', '#38bdf8', '#94a3b8', '#f59e0b', '#8b5cf6'],
		stroke: { 
			show: true,
			width: 3,
			colors: ['var(--color-white)']
		},
		dataLabels: {
			enabled: true,
			formatter: function (val) { return parseInt(val) + "%" },
			style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] }
		},
		legend: { show: false },
		plotOptions: {
			pie: {
				customScale: 0.9, 
				donut: { size: '65%' }
			}
		},
		responsive: [
		{
		breakpoint: 1399, // Tablet Screens
		options: {
			chart: {
			height: 210 // Decreasing chart height prevents circles from stretching vertically
			},
		}
		},
		{
		breakpoint: 768, // Tablet Screens
		options: {
			chart: {
			height: 280 // Decreasing chart height prevents circles from stretching vertically
			},
			legend: {
			position: 'bottom',
			}
		}
		},]
	};
	new ApexCharts(document.querySelector("#yearlyDonutChart"), yearlyDonutOptions).render();
}

if (document.getElementById('appointmentHeatmapChart')) { 
    // --- 2. APPOINTMENT DENSITY HEATMAP ---
  const generateHeatmapRow = (dayName, dataValues) => {
  // 1. Refined hour steps to produce perfect grid cell squares
  const hours = ['8AM', '10AM', '11AM', '1PM', '2PM', '4PM', '5PM', '7PM', '8PM'];
  
  return {
    name: dayName,
	data: hours.map((hour, index) => ({
		x: hour,
		// Map data safely while keeping the sequence balanced
		y: dataValues[index] || 1
		}))
	};
	};

	var heatmapOptions = {
	series: [
		// Trimmed arrays to match the new 9-column configuration sequence perfectly
		generateHeatmapRow('Sun', [1, 3, 3, 1, 4, 2, 3, 2, 1]),
		generateHeatmapRow('Sat', [1, 4, 3, 2, 4, 4, 4, 4, 2]),
		generateHeatmapRow('Fri', [3, 4, 2, 4, 4, 4, 4, 3, 2]),
		generateHeatmapRow('Thu', [4, 4, 3, 4, 2, 4, 2, 4, 1]),
		generateHeatmapRow('Wed', [1, 4, 3, 4, 3, 4, 4, 1, 1]),
		generateHeatmapRow('Tue', [4, 2, 2, 4, 3, 4, 3, 3, 3]),
		generateHeatmapRow('Mon', [2, 2, 2, 3, 5, 1, 2, 2, 1])
	],
	chart: {
		height: 270, // Base desktop height
		type: 'heatmap',
		toolbar: { show: false }
	},
	plotOptions: {
		heatmap: {
		radius: 10, // Ensures rounding is 100% maximum threshold
		enableShades: false,
		useFillColorAsStroke: false,
		reverseNegativeShade: true,
		colorScale: {
			ranges: [
			{ from: 1, to: 1, color: '#eff6ff' },
			{ from: 2, to: 2, color: '#bfdbfe' },
			{ from: 3, to: 3, color: '#60a5fa' },
			{ from: 4, to: 4, color: '#3b82f6' },
			{ from: 5, to: 5, color: '#0256d6' }
			]
		}
		}
	},
	dataLabels: { enabled: false },
	stroke: {
		width: 6, // Reduced size slightly for standard desktop grid breathing room
		colors: ['var(--color-white)']
	},
	grid: { show: false, padding: { left: 0, right: -5, top: 0 } },
	xaxis: {
		position: 'top',
		axisBorder: { show: false },
		axisTicks: { show: false },
		labels: {
		style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 'bold' },
		formatter: function(value) {
			const visibleHours = ['8AM', '11AM', '2PM', '5PM', '8PM'];
			return visibleHours.includes(value) ? value : '';
		}
		}
	},
	yaxis: {
		labels: {
		offsetX: -15,
		style: { colors: '#64748b', fontSize: '12px', fontWeight: '600' }
		}
	},
	legend: { show: false },
	tooltip: { enabled: true },
	
	// Responsive rules to recalculate height and stroke when width drops
	responsive: [
	{
		breakpoint: 768, // Tablet Screens
		options: {
		chart: {
			height: 240 
		},
		stroke: {
			width: 4 
		},
		}
	},
	{
		breakpoint: 480, // Mobile Screens
		options: {
		// Fixed: Moved inside options wrapper
		yaxis: {
			labels: {
			offsetX: -15,
			style: { fontSize: '10px' }
			}
		},
		// Fixed: Moved inside options wrapper
		grid: { show: false, padding: { left: -10, right: 15, top: 0 } }
		}
	}
	]

	};

    new ApexCharts(document.querySelector("#appointmentHeatmapChart"), heatmapOptions).render();
}
});

document.addEventListener("DOMContentLoaded", () => {
    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "#334155" : "#f1f5f9";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    // Base configurations for ApexCharts
    const baseOptions = {
        chart: {
            background: "transparent",
            toolbar: { show: false },
            fontFamily: "Outfit, sans-serif",
        },
        theme: { mode: isDark ? "dark" : "light" },
        grid: {
            borderColor: 'var(--color-border-color)',
            strokeDashArray: 3,
        },
        xaxis: {
            labels: { style: { colors: textColor, fontSize: "11px" } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: textColor, fontSize: "11px" } },
        },
        tooltip: { theme: isDark ? "dark" : "light" },
        legend: { show: false },
    };

	
	if (document.getElementById('patientsSummaryChart')) { 
    // 1. Patients Summary Donut Chart
    const patientsSummaryEl = document.getElementById("patientsSummaryChart");
    if (patientsSummaryEl) {
        new ApexCharts(patientsSummaryEl, {
            ...baseOptions,
            chart: {
                type: "donut",
                height: "100%",
                sparkline: { enabled: true },
            },
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    donut: {
                        size: "75%",
                        labels: { show: false },
                    },
                },
            },
            stroke: { colors: [isDark ? "#1e293b" : "#fff"], width: 3.5 },
            series: [30, 25, 45],
            colors: ["#6366f1", "#10b981", "#3b82f6"],
            labels: ["New", "Surgery", "Recovered"],
        }).render();
    }

	}
    // 2. Patients Statistics Grouped Bar Chart
	if (document.getElementById('patientsStatsChart')) { 
    const patientsStatsEl = document.getElementById("patientsStatsChart");
    if (patientsStatsEl) {
        new ApexCharts(patientsStatsEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "bar",
                height: "100%",
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "50%",
                    borderRadius: 2.5,
                    borderRadiusApplication: "around",
                },
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2.5,
                colors: ["transparent"],
            },
            series: [
                { name: "Female", data: [35, 45, 38, 52, 42, 58, 48] },
                { name: "Children", data: [28, 38, 30, 45, 35, 48, 38] },
                { name: "Male", data: [42, 55, 48, 62, 50, 68, 58] },
            ],
            colors: ["#3b82f6", "#8b5cf6", "#10b981"],
            xaxis: {
                ...baseOptions.xaxis,
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            },
        }).render();
    }
	}

    // 3. Revenue Line/Area Chart
    const revenueWeeklyEl = document.getElementById("revenueWeeklyChart");
    if (revenueWeeklyEl) {
        new ApexCharts(revenueWeeklyEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "area",
                height: "100%",
            },
            stroke: {
                curve: "smooth",
                width: 2.5,
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.2,
                    opacityTo: 0.01,
                    stops: [0, 95, 100],
                },
            },
            series: [
                {
                    name: "Income",
                    data: [
                        18000, 32000, 24000, 38000, 20000, 30000, 42000, 34000,
                        26000, 44000,
                    ],
                },
                {
                    name: "Expense",
                    data: [
                        12050, 24000, 18000, 29000, 14000, 22000, 32000, 24000,
                        18000, 30000,
                    ],
                },
            ],
            colors: ["#3b82f6", "#8b5cf6"],
            xaxis: {
                ...baseOptions.xaxis,
                categories: [
                    "Oct 01",
                    "Oct 02",
                    "Oct 03",
                    "Oct 04",
                    "Oct 05",
                    "Oct 06",
                    "Oct 07",
                    "Oct 08",
                    "Oct 09",
                    "Oct 10",
                ],
            },
        }).render();
    }

    // --- Reports Page Charts (Ensure reports page remains functional) ---
	if (document.getElementById('reportsAdmissionsChart')) { 
    const admissionsChartEl = document.getElementById("reportsAdmissionsChart");
    if (admissionsChartEl) {
        new ApexCharts(admissionsChartEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "line",
                height: 260,
            },
            stroke: {
                width: [0, 3],
                curve: "smooth",
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: "50%",
                },
            },
            colors: ["#2563eb", "#10b981"],
            series: [
                {
                    name: "Admissions",
                    type: "bar",
                    data: [
                        380, 412, 445, 398, 421, 456, 489, 512, 478, 523, 544,
                        567,
                    ],
                },
                {
                    name: "Discharges",
                    type: "line",
                    data: [
                        360, 395, 420, 380, 405, 440, 470, 488, 462, 508, 530,
                        549,
                    ],
                },
            ],
            xaxis: {
                ...baseOptions.xaxis,
                categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
            },
			yaxis: {
				labels:{
					offsetX: -15,
				}
			},
			grid: {
                borderColor: 'var(--color-border-color)',
				padding: { left: 0, right: 0,}
			},
        }).render();
    }
	}

	if (document.getElementById('reportsRevenueChart')) { 
    const reportsRevenueEl = document.getElementById("reportsRevenueChart");
    if (reportsRevenueEl) {
        new ApexCharts(reportsRevenueEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "area",
                height: 260,
            },
            colors: ["#8b5cf6"],
            series: [
                {
                    name: "Revenue ($K)",
                    data: [
                        420, 485, 512, 478, 534, 598, 621, 647, 682, 715, 748,
                        812,
                    ],
                },
            ],
            xaxis: {
                ...baseOptions.xaxis,
                categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
            },
			yaxis: {
				labels:{
					offsetX: -15,
				}
			},
			grid: {
                borderColor: 'var(--color-border-color)',
				padding: { left: 0, right: 0,}
			},
		}).render();
    }
	}
});

// ==========================================================================
// apex-chart-demo.js
// ==========================================================================
// Demo ApexCharts initializations for the Apex Charts UI-kit page (chart-apex.html).
// Self-contained, guards every chart with a null check so it is safe to include
// on any page even if a given container is not present.

document.addEventListener('DOMContentLoaded', function () {
    if (typeof ApexCharts === 'undefined') return;

    var bluePrimary = '#0070f3';
    var blueLight = '#3b82f6';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Simple line chart
    if (document.getElementById('s-line')) {
        new ApexCharts(document.getElementById('s-line'), {
            series: [{ name: 'Patients', data: [30, 40, 35, 50, 49, 60, 70, 91, 125] }],
            chart: { type: 'line', height: 250, toolbar: { show: false } },
            stroke: { curve: 'smooth', width: 3 },
            colors: [bluePrimary],
            xaxis: { categories: months.slice(0, 9) }
        }).render();
    }

    // 2. Area chart
    if (document.getElementById('s-line-area')) {
        new ApexCharts(document.getElementById('s-line-area'), {
            series: [{ name: 'Appointments', data: [20, 45, 28, 60, 42, 75, 55, 68, 80] }],
            chart: { type: 'area', height: 250, toolbar: { show: false } },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
            colors: [blueLight],
            xaxis: { categories: months.slice(0, 9) }
        }).render();
    }

    // 3. Column chart
    if (document.getElementById('s-col')) {
        new ApexCharts(document.getElementById('s-col'), {
            series: [{ name: 'Admissions', data: [44, 55, 41, 67, 22, 43, 21, 49] }],
            chart: { type: 'bar', height: 250, toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
            colors: [bluePrimary],
            xaxis: { categories: months.slice(0, 8) }
        }).render();
    }

    // 4. Stacked column chart
    if (document.getElementById('s-col-stacked')) {
        new ApexCharts(document.getElementById('s-col-stacked'), {
            series: [
                { name: 'OPD', data: [44, 55, 41, 67, 22, 43] },
                { name: 'IPD', data: [13, 23, 20, 8, 13, 27] }
            ],
            chart: { type: 'bar', height: 250, stacked: true, toolbar: { show: false } },
            plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
            colors: [bluePrimary, blueLight],
            xaxis: { categories: months.slice(0, 6) }
        }).render();
    }

    // 5. Bar (horizontal) chart
    if (document.getElementById('s-bar')) {
        new ApexCharts(document.getElementById('s-bar'), {
            series: [{ name: 'Beds Occupied', data: [44, 55, 41, 64, 22] }],
            chart: { type: 'bar', height: 250, toolbar: { show: false } },
            plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
            colors: [bluePrimary],
            xaxis: { categories: ['ICU', 'General', 'Emergency', 'Maternity', 'Pediatric'] }
        }).render();
    }

    // 6. Mixed chart (line + column)
    if (document.getElementById('mixed-chart')) {
        new ApexCharts(document.getElementById('mixed-chart'), {
            series: [
                { name: 'Revenue', type: 'column', data: [23, 34, 28, 45, 39, 52, 41] },
                { name: 'Target', type: 'line', data: [30, 30, 35, 35, 40, 40, 45] }
            ],
            chart: { height: 250, type: 'line', toolbar: { show: false } },
            stroke: { width: [0, 3] },
            colors: [bluePrimary, '#22c55e'],
            xaxis: { categories: months.slice(0, 7) }
        }).render();
    }

    // 7. Donut chart
    if (document.getElementById('donut-chart')) {
        new ApexCharts(document.getElementById('donut-chart'), {
            series: [42, 26, 18, 14],
            chart: { type: 'donut', height: 260 },
            labels: ['General', 'ICU', 'Emergency', 'Maternity'],
            colors: [bluePrimary, blueLight, '#22c55e', '#f59e0b']
        }).render();
    }

    // 8. Radial bar chart
    if (document.getElementById('radial-chart')) {
        new ApexCharts(document.getElementById('radial-chart'), {
            series: [76],
            chart: { type: 'radialBar', height: 260 },
            colors: [bluePrimary],
            plotOptions: { radialBar: { hollow: { size: '60%' } } },
            labels: ['Bed Occupancy']
        }).render();
    }
});









// ==========================================================================
// charts.js
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "#334155" : "#f1f5f9";
    const textColor = isDark ? "#94a3b8" : "#64748b";

    // Base configurations for ApexCharts
    const baseOptions = {
        chart: {
            background: "transparent",
            toolbar: { show: false },
            fontFamily: "Outfit, sans-serif",
        },
        theme: { mode: isDark ? "dark" : "light" },
        grid: {
            borderColor: gridColor,
            strokeDashArray: 3,
        },
        xaxis: {
            labels: { style: { colors: textColor, fontSize: "11px" } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: textColor, fontSize: "11px" } },
        },
        tooltip: { theme: isDark ? "dark" : "light" },
        legend: { show: false },
    };

    // 1. Patients Summary Donut Chart
    const patientsSummaryEl = document.getElementById("patientsSummaryChart");
    if (patientsSummaryEl) {
        new ApexCharts(patientsSummaryEl, {
            ...baseOptions,
            chart: {
                type: "donut",
                height: "100%",
                sparkline: { enabled: true },
            },
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    donut: {
                        size: "75%",
                        labels: { show: false },
                    },
                },
            },
            stroke: { colors: [isDark ? "#1e293b" : "#fff"], width: 3.5 },
            series: [30, 25, 45],
            colors: ["#6366f1", "#10b981", "#3b82f6"],
            labels: ["New", "Surgery", "Recovered"],
        }).render();
    }

    // 2. Patients Statistics Grouped Bar Chart
    const patientsStatsEl = document.getElementById("patientsStatsChart");
    if (patientsStatsEl) {
        new ApexCharts(patientsStatsEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "bar",
                height: "100%",
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "50%",
                    borderRadius: 2.5,
                    borderRadiusApplication: "around",
                },
            },
            dataLabels: { enabled: false },
            stroke: {
                show: true,
                width: 2.5,
                colors: ["transparent"],
            },
            series: [
                { name: "Female", data: [35, 45, 38, 52, 42, 58, 48] },
                { name: "Children", data: [28, 38, 30, 45, 35, 48, 38] },
                { name: "Male", data: [42, 55, 48, 62, 50, 68, 58] },
            ],
            colors: ["#3b82f6", "#8b5cf6", "#10b981"],
            xaxis: {
                ...baseOptions.xaxis,
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            },
        }).render();
    }

    // 3. Revenue Line/Area Chart
    const revenueWeeklyEl = document.getElementById("revenueWeeklyChart");
    if (revenueWeeklyEl) {
        new ApexCharts(revenueWeeklyEl, {
            ...baseOptions,
            chart: {
                ...baseOptions.chart,
                type: "area",
                height: "100%",
            },
            stroke: {
                curve: "smooth",
                width: 2.5,
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.2,
                    opacityTo: 0.01,
                    stops: [0, 95, 100],
                },
            },
            series: [
                {
                    name: "Income",
                    data: [
                        18000, 32000, 24000, 38000, 20000, 30000, 42000, 34000,
                        26000, 44000,
                    ],
                },
                {
                    name: "Expense",
                    data: [
                        12050, 24000, 18000, 29000, 14000, 22000, 32000, 24000,
                        18000, 30000,
                    ],
                },
            ],
            colors: ["#3b82f6", "#8b5cf6"],
            xaxis: {
                ...baseOptions.xaxis,
                categories: [
                    "Oct 01",
                    "Oct 02",
                    "Oct 03",
                    "Oct 04",
                    "Oct 05",
                    "Oct 06",
                    "Oct 07",
                    "Oct 08",
                    "Oct 09",
                    "Oct 10",
                ],
            },
        }).render();
    }

});






