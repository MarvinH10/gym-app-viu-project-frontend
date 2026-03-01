import { Component, inject, signal, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DashboardApi } from '@/core/services/api/dashboard.api';
import { AuthService } from '@/core/services/auth';
import { DashboardData } from '@/core/models/dashboard.model';
import { DashboardImports } from './dashboard.imports';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexGrid,
  ApexTooltip,
  ApexTheme,
} from 'ngx-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  colors: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  theme: ApexTheme;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardImports],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly sanitizer = inject(DomSanitizer);
  readonly authService = inject(AuthService);

  readonly dashboardData = signal<DashboardData | null>(null);
  readonly isLoading = signal(true);
  readonly isDarkMode = signal(false);
  readonly videoUrl = signal<SafeResourceUrl | null>(null);

  // Opciones del gráfico de ingresos (Area)
  readonly revenueChartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ['#7c3aed', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    xaxis: {
      labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '12px' },
        formatter: (val) => `S/ ${val.toLocaleString()}`,
      },
    },
    grid: {
      borderColor: 'rgba(148, 163, 184, 0.1)',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#94a3b8' },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    tooltip: { theme: 'dark' },
  };

  // Opciones del gráfico de membresías (Donut)
  readonly membershipChartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'inherit',
      background: 'transparent',
    },
    colors: ['#7c3aed', '#f59e0b', '#3b82f6'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontWeight: 600, color: '#94a3b8' },
            value: { show: true, fontSize: '20px', fontWeight: 700, color: '#94a3b8' },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              color: '#64748b',
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#94a3b8' },
    },
    stroke: { show: false },
    tooltip: { theme: 'dark' },
  };

  ngOnInit() {
    this.detectTheme();
    // Video solicitado por el usuario
    this.videoUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.youtube.com/embed/aXuLHuRC3Ic?autoplay=0&mute=1&controls=1&rel=0',
      ),
    );

    this.dashboardApi.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    const observer = new MutationObserver(() => this.detectTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  private detectTheme() {
    this.isDarkMode.set(document.documentElement.classList.contains('dark'));
    this.updateChartTheme();
  }

  private updateChartTheme() {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    const textColor = this.isDarkMode() ? '#94a3b8' : '#64748b';
    const gridColor = this.isDarkMode() ? 'rgba(148, 163, 184, 0.1)' : '#e2e8f0';

    this.revenueChartOptions.theme = { mode: theme };
    this.membershipChartOptions.theme = { mode: theme };

    if (this.revenueChartOptions.xaxis?.labels?.style) {
      this.revenueChartOptions.xaxis.labels.style.colors = textColor;
    }
    if (
      this.revenueChartOptions.yaxis &&
      !Array.isArray(this.revenueChartOptions.yaxis) &&
      this.revenueChartOptions.yaxis.labels?.style
    ) {
      this.revenueChartOptions.yaxis.labels.style.colors = textColor;
    }
    if (this.revenueChartOptions.legend?.labels) {
      this.revenueChartOptions.legend.labels.colors = textColor;
    }
    if (this.revenueChartOptions.grid) {
      this.revenueChartOptions.grid.borderColor = gridColor;
    }

    if (this.membershipChartOptions.legend?.labels) {
      this.membershipChartOptions.legend.labels.colors = textColor;
    }
  }

  get trendColor(): string {
    const trend = this.dashboardData()?.stats.revenue_trend || 0;
    return trend >= 0 ? 'text-green-500' : 'text-red-500';
  }
}
