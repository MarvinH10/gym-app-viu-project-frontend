import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryResource, PaginatedResponse, CategoryQueryParams, CategoryFormOptions } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CategoryApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getCategories(params: CategoryQueryParams): Observable<{ success: boolean; data: PaginatedResponse<CategoryResource> }> {
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

        return this.http.get<{ success: boolean; data: PaginatedResponse<CategoryResource> }>(`${this.API_URL}/categories`, {
            params: httpParams,
        });
    }

    getCategory(id: number | string): Observable<{ success: boolean; data: CategoryResource }> {
        return this.http.get<{ success: boolean; data: CategoryResource }>(`${this.API_URL}/categories/${id}`);
    }

    createCategory(data: any): Observable<{ success: boolean; message: string; data: CategoryResource }> {
        return this.http.post<{ success: boolean; message: string; data: CategoryResource }>(`${this.API_URL}/categories`, data);
    }

    updateCategory(
        id: number | string,
        data: any,
    ): Observable<{ success: boolean; message: string; data: CategoryResource }> {
        return this.http.put<{ success: boolean; message: string; data: CategoryResource }>(
            `${this.API_URL}/categories/${id}`,
            data,
        );
    }

    deleteCategory(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/categories/${id}`);
    }

    toggleStatus(id: number | string): Observable<{ success: boolean; message: string; data: CategoryResource }> {
        return this.http.patch<{ success: boolean; message: string; data: CategoryResource }>(
            `${this.API_URL}/categories/${id}/toggle-status`,
            {},
        );
    }

    getFormOptions(): Observable<{ success: boolean; data: CategoryFormOptions }> {
        return this.http.get<{ success: boolean; data: CategoryFormOptions }>(`${this.API_URL}/categories/form-options`);
    }
}
