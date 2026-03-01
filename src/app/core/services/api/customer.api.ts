import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import {
    CustomerResource,
    CustomerQueryParams,
    PaginatedCustomersResponse,
    CustomerFormOptions
} from '@/core/models/customer.model';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class CustomerApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/customers`;

    getCustomers(params: CustomerQueryParams): Observable<PaginatedCustomersResponse> {
        let httpParams = new HttpParams();

        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.company_id) httpParams = httpParams.set('company_id', params.company_id);
        if (params.status) httpParams = httpParams.set('status', params.status);

        if (params['portal_filters[]']) {
            params['portal_filters[]'].forEach(f => {
                httpParams = httpParams.append('portal_filters[]', f);
            });
        }

        return this.http.get<any>(this.API_URL, { params: httpParams }).pipe(
            map(res => {
                // Defensive mapping to handle various response formats
                // Format A: { success: true, data: { data: [...], meta: {...} } }
                if (res?.data?.data && Array.isArray(res.data.data)) {
                    return {
                        ...res,
                        data: res.data.data,
                        links: res.data.links,
                        meta: res.data.meta
                    };
                }
                // Format B: { success: true, data: [...] }
                if (res?.data && Array.isArray(res.data)) {
                    return res;
                }
                return res;
            })
        );
    }

    getCustomer(id: number | string): Observable<ApiResponse<CustomerResource>> {
        return this.http.get<ApiResponse<CustomerResource>>(`${this.API_URL}/${id}`);
    }

    createCustomer(data: any): Observable<ApiResponse<CustomerResource>> {
        return this.http.post<ApiResponse<CustomerResource>>(this.API_URL, data);
    }

    updateCustomer(id: number | string, data: any): Observable<ApiResponse<CustomerResource>> {
        return this.http.put<ApiResponse<CustomerResource>>(`${this.API_URL}/${id}`, data);
    }

    deleteCustomer(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    toggleStatus(id: number | string): Observable<ApiResponse<CustomerResource>> {
        return this.http.patch<ApiResponse<CustomerResource>>(`${this.API_URL}/${id}/toggle-status`, {});
    }

    getFormOptions(): Observable<ApiResponse<CustomerFormOptions>> {
        return this.http.get<ApiResponse<CustomerFormOptions>>(`${this.API_URL}/form-options`);
    }
}
