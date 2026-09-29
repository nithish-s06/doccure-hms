import { AfterViewInit, Component, DOCUMENT, Inject, OnDestroy } from '@angular/core';
import ApexCharts from 'apexcharts';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';


@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit, OnDestroy {
  AllRoutes = All_Routes;
  private readonly bluePrimary = '#0070f3';
  private readonly blueLight = '#3b82f6';

  private readonly sparklineBase = {
    chart: { type: 'area', height: 50, sparkline: { enabled: true }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: { enabled: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
  };

  private charts: ApexCharts[] = [];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.renderGrowthChart();
    this.renderQuarterChart();
    this.renderRevenueChart();
    this.renderSparklines();
    this.renderDepartmentDonut();
    this.renderMonthlyDonut();
    this.renderYearlyDonut();
    this.renderAppointmentHeatmap();
  }

  ngOnDestroy(): void {
    this.charts.forEach((c) => c.destroy());
  }

  private mount(id: string, options: any): void {
    const el = this.document.getElementById(id);
    if (!el) return;
    const chart = new ApexCharts(el, options);
    chart.render();
    this.charts.push(chart);
  }

  /* ---------------- 1. Patient Growth Main Analytics Chart ---------------- */

  private renderGrowthChart(): void {
    this.mount('chart-growth', {
      series: [{ name: 'Patients', data: [7000, 6000, 6800, 5000, 12457, 5500, 6200, 7100, 6400, 7900, 9500, 6800] }],
      chart: { type: 'bar', height: 215, toolbar: { show: false } },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '55%',
          colors: { ranges: [{ from: 12000, to: 13000, color: this.bluePrimary }] },
        },
      },
      fill: { type: ['pattern', 'solid'], pattern: { style: 'slantedLines', width: 4, height: 4, strokeWidth: 1.5 } },
      colors: ['#cbd5e1'],
      dataLabels: { enabled: false },
      grid: { show: false, padding: { left: 0, right: -10 } },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: { colors: '#94a3b8', fontSize: '11px' },
          formatter: (val: number) => (val >= 1000 ? val / 1000 + 'K' : val),
        },
      },
      responsive: [{ breakpoint: 575, options: { grid: { padding: { left: 0, right: 0 } } } }],
    });
  }

  private renderQuarterChart(): void {
    this.mount('chart-quarter', {
      series: [{ name: 'Patients', data: [19800, 22957, 19700, 24200] }],
      chart: { type: 'bar', height: 215, toolbar: { show: false } },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '40%',
          colors: { ranges: [{ from: 24000, to: 25000, color: this.bluePrimary }] },
        },
      },
      fill: { type: ['pattern', 'solid'], pattern: { style: 'slantedLines', width: 4, height: 4, strokeWidth: 1.5 } },
      colors: ['#cbd5e1'],
      dataLabels: { enabled: false },
      grid: { show: false, padding: { left: 0, right: -10 } },
      xaxis: {
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 'bold' } },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: { colors: '#94a3b8', fontSize: '11px' },
          formatter: (val: number) => (val >= 1000 ? val / 1000 + 'K' : val),
        },
      },
    });
  }

  /* ---------------- 2. Revenue Breakdown Stacked Bar Chart ---------------- */

  private renderRevenueChart(): void {
    const isDark = this.document.documentElement.classList.contains('dark');
    const annotationColor = isDark ? '#e2e8f0' : '#334155';
    this.mount('chart-revenue', {
      series: [
        { name: 'Appointments', data: [150, 190, 310] },
        { name: 'Pharmacy', data: [130, 210, 240] },
        { name: 'Medical Records', data: [178, 198, 246] },
      ],
      chart: { type: 'bar', height: 180, stacked: true, toolbar: { show: false } },
      plotOptions: {
        bar: { columnWidth: '60%', borderRadius: 6, borderRadiusApplication: 'around', borderRadiusWhenStacked: 'all' },
      },
      colors: ['#0284c7', '#38bdf8', '#bae6fd'],
      dataLabels: { enabled: false },
      grid: { show: false },
      legend: { show: false },
      xaxis: {
        categories: ['Jan - Apr', 'May - Aug', 'Sep - Dec'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      },
      yaxis: { show: false },
      annotations: {
        points: [
          { x: 'Jan - Apr', y: 458, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: annotationColor, fontWeight: 'bold' }, text: '$458K', offsetY: -5 } },
          { x: 'May - Aug', y: 598, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: annotationColor, fontWeight: 'bold' }, text: '$598K', offsetY: -5 } },
          { x: 'Sep - Dec', y: 796, marker: { size: 0 }, label: { borderColor: 'transparent', style: { color: annotationColor, fontWeight: 'bold' }, text: '$796K', offsetY: -5 } },
        ],
      },
    });
  }

  /* ---------------- 3. Smooth KPI Sparklines ---------------- */

  private renderSparklines(): void {
    this.mount('sparkline-patients', {
      ...this.sparklineBase,
      series: [{ data: [30, 40, 35, 50, 48, 60, 55] }],
      colors: [this.blueLight],
    });
    this.mount('sparkline-doctors', {
      ...this.sparklineBase,
      series: [{ data: [50, 45, 48, 40, 42, 45, 43] }],
      colors: ['#7c3aed'],
    });
    this.mount('sparkline-appointments', {
      ...this.sparklineBase,
      series: [{ data: [20, 35, 25, 45, 30, 40, 38] }],
      colors: ['#f59e0b'],
    });
    this.mount('sparkline-emergency', {
      ...this.sparklineBase,
      chart: { ...this.sparklineBase.chart, height: 20 },
      series: [{ data: [15, 10, 22, 12, 18, 14, 25] }],
      colors: ['#f43f5e'],
    });
  }

  /* ---------------- 4. Department-mix donut charts ---------------- */

  private readonly donutLabels = ['Cardiology', 'Pediatrics', 'Oncology', 'Orthopedics', 'Neurology'];
  private readonly donutColors = ['#0284c7', '#38bdf8', '#94a3b8', '#f59e0b', '#8b5cf6'];

  private renderDepartmentDonut(): void {
    this.mount('departmentDonutChart', {
      series: [32, 26, 10, 30, 2],
      chart: { type: 'donut', height: 260, sparkline: { enabled: false }, parentHeightOffset: 0 },
      labels: this.donutLabels,
      colors: this.donutColors,
      stroke: { show: true, width: 3, colors: ['var(--color-white)'] },
      dataLabels: {
        enabled: true,
        formatter: (val: string) => parseInt(val, 10) + '%',
        style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] },
      },
      legend: {
        show: false,
        position: 'right',
        offsetY: 18,
        floating: false,
        fontSize: '13px',
        fontFamily: 'inherit',
        fontWeight: 500,
        markers: { radius: 12, width: 11, height: 11 },
        itemMargin: { vertical: 8 },
      },
      plotOptions: { pie: { customScale: 0.9, donut: { size: '65%', labels: { show: false } } } },
      responsive: [
        { breakpoint: 1399, options: { chart: { height: 210 } } },
        { breakpoint: 768, options: { chart: { height: 280 }, legend: { position: 'bottom' } } },
      ],
    });
  }

  private renderMonthlyDonut(): void {
    this.mount('monthlyDonutChart', {
      series: [35, 23, 10, 25, 7],
      chart: { type: 'donut', height: 240, sparkline: { enabled: false }, parentHeightOffset: 0 },
      labels: this.donutLabels,
      colors: this.donutColors,
      stroke: { show: true, width: 3, colors: ['var(--color-white)'] },
      dataLabels: {
        enabled: true,
        formatter: (val: string) => parseInt(val, 10) + '%',
        style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] },
      },
      legend: { show: false },
      plotOptions: { pie: { customScale: 0.9, donut: { size: '65%' } } },
      responsive: [
        { breakpoint: 1399, options: { chart: { height: 210 } } },
        { breakpoint: 768, options: { chart: { height: 280 }, legend: { position: 'bottom' } } },
      ],
    });
  }

  private renderYearlyDonut(): void {
    this.mount('yearlyDonutChart', {
      series: [30, 28, 8, 32, 2],
      chart: { type: 'donut', height: 240, sparkline: { enabled: false }, parentHeightOffset: 0 },
      labels: this.donutLabels,
      colors: this.donutColors,
      stroke: { show: true, width: 3, colors: ['var(--color-white)'] },
      dataLabels: {
        enabled: true,
        formatter: (val: string) => parseInt(val, 10) + '%',
        style: { fontSize: '11px', fontWeight: '700', colors: ['#fff'] },
      },
      legend: { show: false },
      plotOptions: { pie: { customScale: 0.9, donut: { size: '65%' } } },
      responsive: [
        { breakpoint: 1399, options: { chart: { height: 210 } } },
        { breakpoint: 768, options: { chart: { height: 280 }, legend: { position: 'bottom' } } },
      ],
    });
  }

  /* ---------------- 5. Appointment density heatmap ---------------- */

  private generateHeatmapRow(dayName: string, dataValues: number[]) {
    const hours = ['8AM', '10AM', '11AM', '1PM', '2PM', '4PM', '5PM', '7PM', '8PM'];
    return {
      name: dayName,
      data: hours.map((hour, index) => ({ x: hour, y: dataValues[index] || 1 })),
    };
  }

  private renderAppointmentHeatmap(): void {
    this.mount('appointmentHeatmapChart', {
      series: [
        this.generateHeatmapRow('Sun', [1, 3, 3, 1, 4, 2, 3, 2, 1]),
        this.generateHeatmapRow('Sat', [1, 4, 3, 2, 4, 4, 4, 4, 2]),
        this.generateHeatmapRow('Fri', [3, 4, 2, 4, 4, 4, 4, 3, 2]),
        this.generateHeatmapRow('Thu', [4, 4, 3, 4, 2, 4, 2, 4, 1]),
        this.generateHeatmapRow('Wed', [1, 4, 3, 4, 3, 4, 4, 1, 1]),
        this.generateHeatmapRow('Tue', [4, 2, 2, 4, 3, 4, 3, 3, 3]),
        this.generateHeatmapRow('Mon', [2, 2, 2, 3, 5, 1, 2, 2, 1]),
      ],
      chart: { height: 270, type: 'heatmap', toolbar: { show: false } },
      plotOptions: {
        heatmap: {
          radius: 10,
          enableShades: false,
          useFillColorAsStroke: false,
          reverseNegativeShade: true,
          colorScale: {
            ranges: [
              { from: 1, to: 1, color: '#eff6ff' },
              { from: 2, to: 2, color: '#bfdbfe' },
              { from: 3, to: 3, color: '#60a5fa' },
              { from: 4, to: 4, color: '#3b82f6' },
              { from: 5, to: 5, color: '#0256d6' },
            ],
          },
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 6, colors: ['var(--color-white)'] },
      grid: { show: false, padding: { left: 0, right: -5, top: 0 } },
      xaxis: {
        position: 'top',
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 'bold' },
          formatter: (value: string) => {
            const visibleHours = ['8AM', '11AM', '2PM', '5PM', '8PM'];
            return visibleHours.includes(value) ? value : '';
          },
        },
      },
      yaxis: { labels: { offsetX: -15, style: { colors: '#64748b', fontSize: '12px', fontWeight: '600' } } },
      legend: { show: false },
      tooltip: { enabled: true },
      responsive: [
        { breakpoint: 768, options: { chart: { height: 240 }, stroke: { width: 4 } } },
        {
          breakpoint: 480,
          options: {
            yaxis: { labels: { offsetX: -15, style: { fontSize: '10px' } } },
            grid: { show: false, padding: { left: -10, right: 15, top: 0 } },
          },
        },
      ],
    });
  }
}
