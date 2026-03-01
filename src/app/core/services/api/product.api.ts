import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ProductTemplateResource,
  PaginatedResponse,
  ProductQueryParams,
  ProductFormOptions,
} from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  getProducts(params: ProductQueryParams): Observable<any> {
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
    if (params.category_id) {
      httpParams = httpParams.set('category_id', params.category_id.toString());
    }

    return this.http
      .get<any>(this.API_URL, {
        params: httpParams,
      })
      .pipe(
        map((res) => {
          if (res && res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
            return res.data;
          }
          if (res && res.data && Array.isArray(res.data)) {
            return res;
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
              per_page: 25,
              links: [],
            },
            links: { first: null, last: null, prev: null, next: null },
          };
        }),
      );
  }

  getProduct(id: number | string): Observable<{ data: ProductTemplateResource }> {
    return this.http.get<{ data: ProductTemplateResource }>(`${this.API_URL}/${id}`);
  }

  createProduct(data: FormData): Observable<{ message: string; data: ProductTemplateResource }> {
    return this.http.post<{ message: string; data: ProductTemplateResource }>(this.API_URL, data);
  }

  updateProduct(
    id: number | string,
    data: FormData,
  ): Observable<{ message: string; data: ProductTemplateResource }> {
    data.append('_method', 'PUT');
    return this.http.post<{ message: string; data: ProductTemplateResource }>(
      `${this.API_URL}/${id}`,
      data,
    );
  }

  deleteProduct(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleStatus(
    id: number | string,
  ): Observable<{ message: string; data: ProductTemplateResource }> {
    return this.http.patch<{ message: string; data: ProductTemplateResource }>(
      `${this.API_URL}/${id}/toggle-status`,
      {},
    );
  }

  getFormOptions(): Observable<{ success: boolean; message: string; data: ProductFormOptions }> {
    return this.http.get<{ success: boolean; message: string; data: ProductFormOptions }>(
      `${this.API_URL}/form-options`,
    );
  }
}
