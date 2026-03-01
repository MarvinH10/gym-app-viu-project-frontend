import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethodResource, PaginatedResponse, PaymentMethodQueryParams } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PaymentMethodApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getPaymentMethods(params: PaymentMethodQueryParams): Observable<PaginatedResponse<PaymentMethodResource>> {
        let httpParams = new HttpParams();

        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.per_page) {
            httpParams = httpParams.set('per_page', params.per_page.toString());
        }
        if (params.q) {
            httpParams = httpParams.set('q', params.q);
        }
        if (params.status) {
            httpParams = httpParams.set('status', params.status);
        }

        return this.http.get<PaginatedResponse<PaymentMethodResource>>(`${this.API_URL}/payment-methods`, {
            params: httpParams,
        });
    }

    getPaymentMethod(id: number | string): Observable<{ data: PaymentMethodResource }> {
        return this.http.get<{ data: PaymentMethodResource }>(`${this.API_URL}/payment-methods/${id}`);
    }

    createPaymentMethod(data: { name: string; is_active: boolean }): Observable<{ message: string; data: PaymentMethodResource }> {
        return this.http.post<{ message: string; data: PaymentMethodResource }>(`${this.API_URL}/payment-methods`, data);
    }

    updatePaymentMethod(id: number | string, data: { name: string; is_active: boolean }): Observable<{ message: string; data: PaymentMethodResource }> {
        return this.http.put<{ message: string; data: PaymentMethodResource }>(`${this.API_URL}/payment-methods/${id}`, data);
    }

    deletePaymentMethod(id: number | string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.API_URL}/payment-methods/${id}`);
    }

    toggleStatus(id: number | string): Observable<{ success: boolean; message: string; data: PaymentMethodResource }> {
        return this.http.patch<{ success: boolean; message: string; data: PaymentMethodResource }>(
            `${this.API_URL}/payment-methods/${id}/toggle-status`,
            {}
        );
    }
}
