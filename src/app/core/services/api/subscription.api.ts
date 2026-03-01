import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import {
    MembershipSubscriptionResource,
    SubscriptionQueryParams,
    PaginatedSubscriptionsResponse
} from '@/core/models/subscription.model';

@Injectable({
    providedIn: 'root',
})
export class SubscriptionApi {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/membership-subscriptions`;

    getSubscriptions(params: SubscriptionQueryParams): Observable<PaginatedSubscriptionsResponse> {
        let httpParams = new HttpParams();

        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
        if (params.q) httpParams = httpParams.set('q', params.q);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<any>(this.apiUrl, {
            params: httpParams,
        }).pipe(
            map(res => {
                // Si viene envuelto en { success: true, data: { data: [], meta: {} } }
                if (res && res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
                    return res.data as PaginatedSubscriptionsResponse;
                }
                // Si viene envuelto en { success: true, data: [...] } pero no es paginado (fallback)
                if (res && res.data && Array.isArray(res.data)) {
                    return res as any;
                }
                return res as PaginatedSubscriptionsResponse;
            })
        );
    }

    getSubscription(id: string | number): Observable<{ data: MembershipSubscriptionResource }> {
        return this.http.get<{ data: MembershipSubscriptionResource }>(`${this.apiUrl}/${id}`);
    }

    createSubscription(data: any): Observable<{ message: string; data: MembershipSubscriptionResource }> {
        return this.http.post<{ message: string; data: MembershipSubscriptionResource }>(this.apiUrl, data);
    }

    updateSubscription(id: string | number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    deleteSubscription(id: string | number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
