export interface DashboardStats {
  total_members: number;
  active_subscriptions: number;
  total_sales_month: number;
  new_members_week: number;
  revenue_trend: number; // Porcentaje de crecimiento
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface DashboardData {
  stats: DashboardStats;
  revenue_chart: {
    categories: string[];
    series: ChartSeries[];
  };
  membership_distribution: {
    labels: string[];
    series: number[];
  };
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string | number;
  type: 'sale' | 'member' | 'attendance';
  title: string;
  subtitle: string;
  time: string;
  status?: 'success' | 'warning' | 'info';
}
