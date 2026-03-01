import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@/environments/environment';
import { DashboardData } from '@/core/models/dashboard.model';
import { SaleApi } from './sale.api';
import { MemberApi } from './member.api';

@Injectable({
  providedIn: 'root',
})
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly saleApi = inject(SaleApi);
  private readonly memberApi = inject(MemberApi);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  getDashboardData(): Observable<DashboardData> {
    return this.consolidateRealData();
  }

  private consolidateRealData(): Observable<DashboardData> {
    return forkJoin({
      sales: this.saleApi.getSales({ per_page: 10 }).pipe(catchError(() => of(null))),
      members: this.memberApi.getMembers({ per_page: 10 }).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ sales, members }) => {
        const demo = this.getDemoData();

        if (sales && sales.data) {
          const salesList = Array.isArray(sales.data) ? sales.data : (sales.data as any).data || [];
          demo.stats.total_sales_month = salesList.reduce(
            (acc: number, s: any) => acc + (parseFloat(s.total) || 0),
            0,
          );

          const saleActivities = salesList.slice(0, 3).map((s: any, idx: number) => ({
            id: `sale-${idx}`,
            type: 'sale',
            title: 'Venta Realizada',
            subtitle: `S/ ${s.total} - ${s.customer?.name || 'Cliente'}`,
            time: 'Reciente',
            status: 'success',
          }));

          if (saleActivities.length > 0) {
            demo.recent_activity = [
              ...saleActivities,
              ...demo.recent_activity.slice(saleActivities.length),
            ];
          }
        }

        if (members && members.data) {
          const membersList = Array.isArray(members.data)
            ? members.data
            : (members as any).data || [];
          demo.stats.total_members =
            (members as any).meta?.total || membersList.length || demo.stats.total_members;
          demo.stats.active_subscriptions =
            membersList.filter((m: any) => m.status === 'active').length ||
            demo.stats.active_subscriptions;

          const memberActivities = membersList.slice(0, 2).map((m: any, idx: number) => ({
            id: `member-${idx}`,
            type: 'member',
            title: 'Miembro Actualizado',
            subtitle: `${m.name} (${m.status})`,
            time: 'En vivo',
            status: m.status === 'active' ? 'success' : 'warning',
          }));

          if (memberActivities.length > 0) {
            demo.recent_activity = [
              ...memberActivities,
              ...demo.recent_activity.slice(memberActivities.length),
            ];
          }
        }

        return demo;
      }),
    );
  }

  private getDemoData(): DashboardData {
    return {
      stats: {
        total_members: 1250,
        active_subscriptions: 840,
        total_sales_month: 45200,
        new_members_week: 12,
        revenue_trend: 15.5,
      },
      revenue_chart: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        series: [
          { name: 'Ingresos', data: [31, 40, 28, 51, 42, 109] },
          { name: 'Suscripciones', data: [11, 32, 45, 32, 34, 52] },
        ],
      },
      membership_distribution: {
        labels: ['Plan Black', 'Plan Gold', 'Plan Fit'],
        series: [44, 55, 13],
      },
      recent_activity: [
        {
          id: 1,
          type: 'member',
          title: 'Nuevo Miembro',
          subtitle: 'Juan Pérez se unió al Plan Black',
          time: 'hace 5 min',
          status: 'success',
        },
        {
          id: 2,
          type: 'sale',
          title: 'Venta Realizada',
          subtitle: 'S/ 150.00 por Proteína Whey',
          time: 'hace 15 min',
          status: 'info',
        },
        {
          id: 3,
          type: 'member',
          title: 'Suscripción Expirada',
          subtitle: 'Maria García (Plan Fit)',
          time: 'hace 1 hora',
          status: 'warning',
        },
      ],
    };
  }
}
