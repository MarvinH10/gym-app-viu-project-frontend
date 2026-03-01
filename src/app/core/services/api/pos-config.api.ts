import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { PaginatedResponse, ApiResponse } from '@/core/models';

export interface PosConfig {
  id: number;
  company_id: number;
  name: string;
  apply_tax: boolean;
  prices_include_tax: boolean;
  is_active: boolean;
  has_active_session?: boolean;
  journals: string;
  warehouse: any;
  default_customer?: any;
  tax?: any;
  created_at: string;
  updated_at: string;
}

export interface CreatePosConfigRequest {
  name: string;
  warehouse_id: number;
  default_customer_id?: number;
  tax_id?: number;
  apply_tax?: boolean;
  prices_include_tax?: boolean;
  is_active?: boolean;
  journals: {
    journal_id: number;
    document_type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note';
    is_default: boolean;
  }[];
}

export interface UpdatePosConfigRequest extends Partial<CreatePosConfigRequest> {}

@Injectable({
  providedIn: 'root',
})
export class PosConfigApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pos-configs`;

  getPosConfigs(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    status?: 'active' | 'inactive';
  }): Observable<PaginatedResponse<PosConfig>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.per_page !== undefined) httpParams = httpParams.set('per_page', params.per_page);
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedResponse<PosConfig>>(this.baseUrl, { params: httpParams });
  }

  getPosConfig(id: number): Observable<ApiResponse<PosConfig>> {
    return this.http.get<ApiResponse<PosConfig>>(`${this.baseUrl}/${id}`);
  }

  createPosConfig(data: CreatePosConfigRequest): Observable<ApiResponse<PosConfig>> {
    return this.http.post<ApiResponse<PosConfig>>(this.baseUrl, data);
  }

  updatePosConfig(id: number, data: UpdatePosConfigRequest): Observable<ApiResponse<PosConfig>> {
    return this.http.put<ApiResponse<PosConfig>>(`${this.baseUrl}/${id}`, data);
  }

  deletePosConfig(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<PosConfig>> {
    return this.http.patch<ApiResponse<PosConfig>>(`${this.baseUrl}/${id}/toggle-status`, {});
  }
}
