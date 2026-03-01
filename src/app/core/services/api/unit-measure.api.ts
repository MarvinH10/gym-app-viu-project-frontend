import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitOfMeasureResource, PaginatedResponse, UnitOfMeasureQueryParams, UnitOfMeasureFormOptions } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UnitOfMeasureApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getUnits(params: UnitOfMeasureQueryParams): Observable<PaginatedResponse<UnitOfMeasureResource>> {
        let httpParams = new HttpParams();

        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.per_page) {
            httpParams = httpParams.set('per_page', params.per_page.toString());
        }
        if (params.search) {
            httpParams = httpParams.set('q', params.search);
        }
        if (params.family) {
            httpParams = httpParams.set('family', params.family);
        }
        if (params.base_unit_id !== undefined && params.base_unit_id !== null) {
            httpParams = httpParams.set('base_unit_id', params.base_unit_id.toString());
        }
        if (params.only_active !== undefined) {
            httpParams = httpParams.set('only_active', params.only_active ? '1' : '0');
        }

        return this.http.get<PaginatedResponse<UnitOfMeasureResource>>(`${this.API_URL}/unit-of-measures`, {
            params: httpParams,
        });
    }

    getUnit(id: number | string): Observable<{ data: UnitOfMeasureResource }> {
        return this.http.get<{ data: UnitOfMeasureResource }>(`${this.API_URL}/unit-of-measures/${id}`);
    }

    createUnit(data: Partial<UnitOfMeasureResource>): Observable<{ message: string; data: UnitOfMeasureResource }> {
        return this.http.post<{ message: string; data: UnitOfMeasureResource }>(`${this.API_URL}/unit-of-measures`, data);
    }

    updateUnit(
        id: number | string,
        data: Partial<UnitOfMeasureResource>,
    ): Observable<{ message: string; data: UnitOfMeasureResource }> {
        return this.http.put<{ message: string; data: UnitOfMeasureResource }>(
            `${this.API_URL}/unit-of-measures/${id}`,
            data,
        );
    }

    deleteUnit(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/unit-of-measures/${id}`);
    }

    toggleStatus(id: number | string): Observable<{ message: string; data: UnitOfMeasureResource }> {
        return this.http.patch<{ message: string; data: UnitOfMeasureResource }>(
            `${this.API_URL}/unit-of-measures/${id}/toggle-status`,
            {},
        );
    }

    getFormOptions(): Observable<UnitOfMeasureFormOptions> {
        return this.http.get<UnitOfMeasureFormOptions>(`${this.API_URL}/unit-of-measures/form-options`);
    }
}
