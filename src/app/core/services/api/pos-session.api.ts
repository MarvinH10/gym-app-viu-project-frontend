import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { PaginatedResponse, ApiResponse } from '@/core/models';
import { PosConfig } from './pos-config.api';

export interface PosSessionPayment {
  id: number;
  pos_session_id: number;
  sale_id?: number;
  payment_method_id: number;
  amount: number;
  reference_sale_id?: number;
  payment_method: any;
  created_at: string;
  updated_at: string;
}

export interface PosSession {
  id: number;
  pos_config_id: number;
  user_id: number;
  status: 'opened' | 'closed';
  opening_balance: number;
  closing_balance?: number;
  opening_note?: string;
  closing_note?: string;
  opened_at: string;
  closed_at?: string;
  total_payments: number;
  config: PosConfig;
  payments: PosSessionPayment[];
  created_at: string;
  updated_at: string;
}

export interface OpenPosSessionRequest {
  pos_config_id: number;
  opening_balance: number;
  opening_note?: string;
}

export interface ClosePosSessionRequest {
  pos_config_id: number;
  closing_balance: number;
  closing_note?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PosSessionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pos-sessions`;

  getPosSessions(params?: {
    page?: number;
    per_page?: number;
    pos_config_id?: number;
    status?: 'opened' | 'closed';
    user_id?: number;
  }): Observable<PaginatedResponse<PosSession>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.per_page !== undefined) httpParams = httpParams.set('per_page', params.per_page);
      if (params.pos_config_id !== undefined)
        httpParams = httpParams.set('pos_config_id', params.pos_config_id);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.user_id !== undefined) httpParams = httpParams.set('user_id', params.user_id);
    }
    return this.http.get<PaginatedResponse<PosSession>>(this.baseUrl, { params: httpParams });
  }

  getPosSession(id: number): Observable<ApiResponse<PosSession>> {
    return this.http.get<ApiResponse<PosSession>>(`${this.baseUrl}/${id}`);
  }

  openPosSession(data: OpenPosSessionRequest): Observable<ApiResponse<PosSession>> {
    return this.http.post<ApiResponse<PosSession>>(this.baseUrl, data);
  }

  closePosSession(id: number, data: ClosePosSessionRequest): Observable<ApiResponse<PosSession>> {
    return this.http.patch<ApiResponse<PosSession>>(`${this.baseUrl}/${id}/close`, data);
  }
}
