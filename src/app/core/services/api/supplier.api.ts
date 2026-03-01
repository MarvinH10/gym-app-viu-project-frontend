import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
    SupplierResource,
    SupplierQueryParams,
    SupplierRequest,
    SupplierFormOptions,
    SupplierPaginatedResponse
} from '@/core/models';

@Injectable({
    providedIn: 'root',
})
export class SupplierApi {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/suppliers`;

    getSuppliers(params: SupplierQueryParams): Observable<{ success: boolean; data: any; meta: any }> {
        let httpParams = new HttpParams();

        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);

        return this.http.get<{ success: boolean; data: any; meta: any }>(this.apiUrl, {
            params: httpParams,
        });
    }

    getSupplier(id: string | number): Observable<{ success: boolean; data: SupplierResource; meta?: any }> {
        return this.http.get<{ success: boolean; data: SupplierResource; meta?: any }>(`${this.apiUrl}/${id}`);
    }

    createSupplier(data: SupplierRequest): Observable<{ success: boolean; message: string; data: SupplierResource }> {
        return this.http.post<{ success: boolean; message: string; data: SupplierResource }>(this.apiUrl, data);
    }

    updateSupplier(id: string | number, data: SupplierRequest): Observable<{ success: boolean; message: string; data: SupplierResource }> {
        return this.http.put<{ success: boolean; message: string; data: SupplierResource }>(`${this.apiUrl}/${id}`, data);
    }

    deleteSupplier(id: string | number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleStatus(id: string | number): Observable<{ success: boolean; message: string; data: SupplierResource }> {
        return this.http.patch<{ success: boolean; message: string; data: SupplierResource }>(
            `${this.apiUrl}/${id}/toggle-status`,
            {}
        );
    }

    getFormOptions(): Observable<{ success: boolean; data: SupplierFormOptions }> {
        return this.http.get<{ success: boolean; data: SupplierFormOptions }>(`${this.apiUrl}/form-options`);
    }
}
