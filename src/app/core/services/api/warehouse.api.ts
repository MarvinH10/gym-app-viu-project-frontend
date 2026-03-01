import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
    WarehouseResource,
    WarehouseQueryParams,
    WarehouseRequest,
    WarehouseFormOptions,
    PaginatedResponse
} from '@/core/models';

@Injectable({
    providedIn: 'root',
})
export class WarehouseApi {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/warehouses`;

    getWarehouses(params: WarehouseQueryParams): Observable<{ success: boolean; data: PaginatedResponse<WarehouseResource> }> {
        let httpParams = new HttpParams();

        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.per_page) {
            httpParams = httpParams.set('per_page', params.per_page.toString());
        }
        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }

        return this.http.get<{ success: boolean; data: PaginatedResponse<WarehouseResource> }>(this.apiUrl, {
            params: httpParams,
        });
    }

    getWarehouse(id: string | number): Observable<{ success: boolean; data: WarehouseResource }> {
        return this.http.get<{ success: boolean; data: WarehouseResource }>(`${this.apiUrl}/${id}`);
    }

    createWarehouse(data: WarehouseRequest): Observable<{ success: boolean; message: string; data: WarehouseResource }> {
        return this.http.post<{ success: boolean; message: string; data: WarehouseResource }>(this.apiUrl, data);
    }

    updateWarehouse(id: string | number, data: WarehouseRequest): Observable<{ success: boolean; message: string; data: WarehouseResource }> {
        return this.http.put<{ success: boolean; message: string; data: WarehouseResource }>(`${this.apiUrl}/${id}`, data);
    }

    deleteWarehouse(id: string | number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    toggleStatus(id: string | number): Observable<{ success: boolean; message: string; data: WarehouseResource }> {
        return this.http.patch<{ success: boolean; message: string; data: WarehouseResource }>(
            `${this.apiUrl}/${id}/toggle-status`,
            {}
        );
    }

    getFormOptions(): Observable<{ success: boolean; data: WarehouseFormOptions }> {
        return this.http.get<{ success: boolean; data: WarehouseFormOptions }>(`${this.apiUrl}/form-options`);
    }
}
