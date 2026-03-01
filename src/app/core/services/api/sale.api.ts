import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import { SaleResource, SaleQueryParams, SaleFormOptions } from '@/core/models/sale.model';
import { ApiResponse, PaginatedResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SaleApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/sales`;

  getSales(params: SaleQueryParams): Observable<ApiResponse<PaginatedResponse<SaleResource>>> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.payment_status) httpParams = httpParams.set('payment_status', params.payment_status);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);

    return this.http.get<any>(this.API_URL, { params: httpParams }).pipe(
      map((res) => {
        if (res?.data && Array.isArray(res.data)) {
          return {
            ...res,
            data: {
              data: res.data,
              links: res.links,
              meta: res.meta,
            },
          };
        }
        if (res?.data?.data && Array.isArray(res.data.data)) {
          return res;
        }
        return res;
      }),
    );
  }

  getSale(id: number | string): Observable<ApiResponse<SaleResource>> {
    return this.http.get<ApiResponse<SaleResource>>(`${this.API_URL}/${id}`);
  }

  createSale(data: any): Observable<ApiResponse<SaleResource>> {
    return this.http.post<ApiResponse<SaleResource>>(this.API_URL, data);
  }

  updateSale(id: number | string, data: any): Observable<ApiResponse<SaleResource>> {
    return this.http.put<ApiResponse<SaleResource>>(`${this.API_URL}/${id}`, data);
  }

  deleteSale(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  postSale(id: number | string): Observable<ApiResponse<SaleResource>> {
    return this.http.patch<ApiResponse<SaleResource>>(`${this.API_URL}/${id}/post`, {});
  }

  paySale(id: number | string): Observable<ApiResponse<SaleResource>> {
    return this.http.patch<ApiResponse<SaleResource>>(`${this.API_URL}/${id}/pay`, {});
  }

  cancelSale(id: number | string): Observable<ApiResponse<SaleResource>> {
    return this.http.patch<ApiResponse<SaleResource>>(`${this.API_URL}/${id}/cancel`, {});
  }

  createCreditNote(id: number | string): Observable<ApiResponse<SaleResource>> {
    return this.http.post<ApiResponse<SaleResource>>(`${this.API_URL}/${id}/credit-note`, {});
  }

  getFormOptions(): Observable<ApiResponse<SaleFormOptions>> {
    return this.http.get<ApiResponse<SaleFormOptions>>(`${this.API_URL}/form-options`);
  }
}
