import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CompanyResource,
  PaginatedResponse,
  CompanyQueryParams,
  CompanyFormOptions,
} from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/companies`;

  getCompanies(params: CompanyQueryParams): Observable<PaginatedResponse<CompanyResource>> {
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

    return this.http
      .get<any>(this.API_URL, {
        params: httpParams,
      })
      .pipe(
        map((res) => {
          if (res && res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
            return res.data as PaginatedResponse<CompanyResource>;
          }
          if (res && res.data && Array.isArray(res.data)) {
            return res as PaginatedResponse<CompanyResource>;
          }
          return {
            data: [],
            meta: {
              current_page: 1,
              last_page: 1,
              total: 0,
              from: null,
              to: null,
              path: '',
              per_page: 15,
              links: [],
            },
            links: { first: null, last: null, prev: null, next: null },
          } as PaginatedResponse<CompanyResource>;
        }),
      );
  }

  getCompany(id: number | string): Observable<{ data: CompanyResource }> {
    return this.http.get<{ data: CompanyResource }>(`${this.API_URL}/${id}`);
  }

  createCompany(
    data: Partial<CompanyResource>,
  ): Observable<{ message: string; data: CompanyResource }> {
    return this.http.post<{ message: string; data: CompanyResource }>(this.API_URL, data);
  }

  updateCompany(
    id: number | string,
    data: Partial<CompanyResource>,
  ): Observable<{ message: string; data: CompanyResource }> {
    return this.http.put<{ message: string; data: CompanyResource }>(`${this.API_URL}/${id}`, data);
  }

  deleteCompany(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getFormOptions(): Observable<{ success: boolean; message: string; data: CompanyFormOptions }> {
    return this.http.get<{ success: boolean; message: string; data: CompanyFormOptions }>(
      `${this.API_URL}/form-options`,
    );
  }
}
