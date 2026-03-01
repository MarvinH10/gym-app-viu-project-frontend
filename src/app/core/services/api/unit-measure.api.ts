import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitMeasureResource, UnitMeasurePaginatedResponse, UnitMeasureQueryParams, UnitMeasureFormOptions } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UnitMeasureApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getUnits(params: UnitMeasureQueryParams): Observable<UnitMeasurePaginatedResponse> {
        let httpParams = new HttpParams();

        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.per_page) {
            httpParams = httpParams.set('per_page', params.per_page.toString());
        }
        if (params.search || params.q) {
            httpParams = httpParams.set('q', params.search || params.q || '');
        }
        if (params.family) {
            httpParams = httpParams.set('family', params.family);
        }
        if (params.base_unit_id !== undefined && params.base_unit_id !== null) {
            httpParams = httpParams.set('base_unit_id', params.base_unit_id.toString());
        }
        if (params.only_active !== undefined && params.only_active !== null) {
            httpParams = httpParams.set('only_active', params.only_active.toString());
        }

        return this.http.get<UnitMeasurePaginatedResponse>(`${this.API_URL}/unit-of-measures`, {
            params: httpParams,
        });
    }

    getUnit(id: number | string): Observable<{ data: UnitMeasureResource }> {
        return this.http.get<{ data: UnitMeasureResource }>(`${this.API_URL}/unit-of-measures/${id}`);
    }

    createUnit(data: Partial<UnitMeasureResource>): Observable<{ message: string; data: UnitMeasureResource }> {
        return this.http.post<{ message: string; data: UnitMeasureResource }>(`${this.API_URL}/unit-of-measures`, data);
    }

    updateUnit(
        id: number | string,
        data: Partial<UnitMeasureResource>,
    ): Observable<{ message: string; data: UnitMeasureResource }> {
        return this.http.put<{ message: string; data: UnitMeasureResource }>(
            `${this.API_URL}/unit-of-measures/${id}`,
            data,
        );
    }

    deleteUnit(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/unit-of-measures/${id}`);
    }

    toggleStatus(id: number | string): Observable<{ message: string; data: UnitMeasureResource }> {
        return this.http.patch<{ message: string; data: UnitMeasureResource }>(
            `${this.API_URL}/unit-of-measures/${id}/toggle-status`,
            {},
        );
    }

    getFormOptions(): Observable<UnitMeasureFormOptions> {
        return this.http.get<UnitMeasureFormOptions>(`${this.API_URL}/unit-of-measures/form-options`);
    }
}
