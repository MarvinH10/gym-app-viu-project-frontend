import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  MembershipPlanResource,
  MembershipPlanQueryParams,
  PaginatedMembershipPlansResponse,
} from '@/core/models/membership-plan.model';

@Injectable({
  providedIn: 'root',
})
export class MembershipPlanApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/membership-plans`;

  getPlans(params: MembershipPlanQueryParams): Observable<PaginatedMembershipPlansResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http
      .get<any>(this.apiUrl, {
        params: httpParams,
      })
      .pipe(
        map((res) => {
          if (res && res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
            return res.data as PaginatedMembershipPlansResponse;
          }
          return res as PaginatedMembershipPlansResponse;
        }),
      );
  }

  getPlan(id: string | number): Observable<{ data: MembershipPlanResource }> {
    return this.http.get<{ data: MembershipPlanResource }>(`${this.apiUrl}/${id}`);
  }

  createPlan(data: any): Observable<{ message: string; data: MembershipPlanResource }> {
    return this.http.post<{ message: string; data: MembershipPlanResource }>(this.apiUrl, data);
  }

  updatePlan(
    id: string | number,
    data: any,
  ): Observable<{ message: string; data: MembershipPlanResource }> {
    return this.http.put<{ message: string; data: MembershipPlanResource }>(
      `${this.apiUrl}/${id}`,
      data,
    );
  }

  deletePlan(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(
    id: string | number,
  ): Observable<{ success: boolean; message: string; data: MembershipPlanResource }> {
    return this.http.patch<{ success: boolean; message: string; data: MembershipPlanResource }>(
      `${this.apiUrl}/${id}/toggle-status`,
      {},
    );
  }

  getFormOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/form-options`);
  }
}
