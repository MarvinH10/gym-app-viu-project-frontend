import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttributeResource, PaginatedResponse, AttributeQueryParams } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AttributeApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getAttributes(params: AttributeQueryParams): Observable<{ success: boolean; data: PaginatedResponse<AttributeResource> }> {
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

        return this.http.get<{ success: boolean; data: PaginatedResponse<AttributeResource> }>(`${this.API_URL}/attributes`, {
            params: httpParams,
        });
    }

    getAttribute(id: number | string): Observable<{ success: boolean; data: AttributeResource }> {
        return this.http.get<{ success: boolean; data: AttributeResource }>(`${this.API_URL}/attributes/${id}`);
    }

    createAttribute(data: { name: string; is_active: boolean; values?: string[] }): Observable<{ success: boolean; message: string; data: AttributeResource }> {
        return this.http.post<{ success: boolean; message: string; data: AttributeResource }>(`${this.API_URL}/attributes`, data);
    }

    updateAttribute(
        id: number | string,
        data: { name: string; is_active: boolean; values?: string[] },
    ): Observable<{ success: boolean; message: string; data: AttributeResource }> {
        return this.http.put<{ success: boolean; message: string; data: AttributeResource }>(
            `${this.API_URL}/attributes/${id}`,
            data,
        );
    }

    deleteAttribute(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/attributes/${id}`);
    }

    toggleStatus(id: number | string): Observable<{ success: boolean; message: string; data: AttributeResource }> {
        // Note: The prompt didn't strictly specify a toggle-status endpoint for attributes in the list, 
        // but the instruction said "implementando los métodos estándar... y toggleStatus()".
        // I'll assume it exists like in other modules.
        return this.http.patch<{ success: boolean; message: string; data: AttributeResource }>(
            `${this.API_URL}/attributes/${id}/toggle-status`,
            {},
        );
    }

    getFormOptions(): Observable<{ success: boolean; message: string; data: { types: any[] } }> {
        return this.http.get<{ success: boolean; message: string; data: { types: any[] } }>(`${this.API_URL}/attributes/form-options`);
    }
}
