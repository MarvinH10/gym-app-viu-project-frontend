import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalResource, PaginatedResponse, JournalQueryParams, JournalFormOptions, ApiResponse } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class JournalApi {
    private readonly http = inject(HttpClient);
    private readonly API_URL = environment.apiUrl;

    getJournals(params: JournalQueryParams): Observable<PaginatedResponse<JournalResource>> {
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
        if (params.type) {
            httpParams = httpParams.set('type', params.type);
        }

        return this.http.get<PaginatedResponse<JournalResource>>(`${this.API_URL}/journals`, {
            params: httpParams,
        });
    }

    getJournal(id: number | string): Observable<{ data: JournalResource }> {
        return this.http.get<{ data: JournalResource }>(`${this.API_URL}/journals/${id}`);
    }

    createJournal(data: any): Observable<{ message: string; data: JournalResource }> {
        return this.http.post<{ message: string; data: JournalResource }>(`${this.API_URL}/journals`, data);
    }

    updateJournal(id: number | string, data: any): Observable<{ message: string; data: JournalResource }> {
        return this.http.put<{ message: string; data: JournalResource }>(`${this.API_URL}/journals/${id}`, data);
    }

    deleteJournal(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/journals/${id}`);
    }

    resetSequence(id: number | string): Observable<{ message: string; data?: any }> {
        return this.http.post<{ message: string; data?: any }>(`${this.API_URL}/journals/${id}/reset-sequence`, {});
    }

    getFormOptions(): Observable<JournalFormOptions> {
        return this.http.get<JournalFormOptions>(`${this.API_URL}/journals/form-options`);
    }
}
