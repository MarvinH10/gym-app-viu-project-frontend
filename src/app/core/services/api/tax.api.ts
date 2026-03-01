import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaxResource, PaginatedResponse, TaxQueryParams } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaxApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getTaxes(params: TaxQueryParams): Observable<PaginatedResponse<TaxResource>> {
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

    return this.http.get<PaginatedResponse<TaxResource>>(`${this.API_URL}/taxes`, {
      params: httpParams,
    });
  }

  getTax(id: number | string): Observable<{ data: TaxResource }> {
    return this.http.get<{ data: TaxResource }>(`${this.API_URL}/taxes/${id}`);
  }

  createTax(data: Partial<TaxResource>): Observable<{ message: string; data: TaxResource }> {
    return this.http.post<{ message: string; data: TaxResource }>(`${this.API_URL}/taxes`, data);
  }

  updateTax(
    id: number | string,
    data: Partial<TaxResource>,
  ): Observable<{ message: string; data: TaxResource }> {
    return this.http.put<{ message: string; data: TaxResource }>(
      `${this.API_URL}/taxes/${id}`,
      data,
    );
  }

  deleteTax(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/taxes/${id}`);
  }

  toggleStatus(id: number | string): Observable<{ message: string; is_active: boolean }> {
    return this.http.patch<{ message: string; is_active: boolean }>(
      `${this.API_URL}/taxes/${id}/toggle-status`,
      {},
    );
  }

  getFormOptions(): Observable<{ taxes: TaxResource[] }> {
    return this.http.get<{ taxes: TaxResource[] }>(`${this.API_URL}/taxes/form-options`);
  }
}
