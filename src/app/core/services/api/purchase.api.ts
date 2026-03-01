import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse, PaginatedResponse } from '@/core/models/api-response.model';
import {
  PurchaseResource,
  PurchaseQueryParams,
  PurchaseFormOptions,
  PurchaseProductPayload,
  CreatePurchasePayload,
} from '@/core/models/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/purchases`;

  getPurchases(
    params: PurchaseQueryParams,
  ): Observable<ApiResponse<PaginatedResponse<PurchaseResource>>> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
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
        return res;
      }),
    );
  }

  getPurchase(id: number | string): Observable<ApiResponse<PurchaseResource>> {
    return this.http.get<ApiResponse<PurchaseResource>>(`${this.API_URL}/${id}`);
  }

  createPurchase(data: CreatePurchasePayload): Observable<ApiResponse<PurchaseResource>> {
    return this.http.post<ApiResponse<PurchaseResource>>(this.API_URL, data);
  }

  updatePurchase(
    id: number | string,
    data: CreatePurchasePayload,
  ): Observable<ApiResponse<PurchaseResource>> {
    return this.http.put<ApiResponse<PurchaseResource>>(`${this.API_URL}/${id}`, data);
  }

  deletePurchase(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  postPurchase(id: number | string): Observable<ApiResponse<PurchaseResource>> {
    return this.http.patch<ApiResponse<PurchaseResource>>(`${this.API_URL}/${id}/post`, {});
  }

  payPurchase(id: number | string): Observable<ApiResponse<PurchaseResource>> {
    return this.http.patch<ApiResponse<PurchaseResource>>(`${this.API_URL}/${id}/pay`, {});
  }

  cancelPurchase(id: number | string): Observable<ApiResponse<PurchaseResource>> {
    return this.http.patch<ApiResponse<PurchaseResource>>(`${this.API_URL}/${id}/cancel`, {});
  }

  getFormOptions(): Observable<ApiResponse<PurchaseFormOptions>> {
    return this.http.get<ApiResponse<PurchaseFormOptions>>(`${this.API_URL}/form-options`);
  }
}
