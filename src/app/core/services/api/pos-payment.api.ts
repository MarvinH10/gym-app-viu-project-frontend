import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { PaginatedResponse } from '@/core/models';
import { PosSessionPayment } from './pos-session.api';

@Injectable({
  providedIn: 'root',
})
export class PosPaymentApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pos-session-payments`;

  getPosSessionPayments(params?: {
    page?: number;
    per_page?: number;
    payment_method_id?: number;
    pos_session_id?: number;
  }): Observable<PaginatedResponse<PosSessionPayment>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.per_page !== undefined) httpParams = httpParams.set('per_page', params.per_page);
      if (params.payment_method_id !== undefined)
        httpParams = httpParams.set('payment_method_id', params.payment_method_id);
      if (params.pos_session_id !== undefined)
        httpParams = httpParams.set('pos_session_id', params.pos_session_id);
    }
    return this.http.get<PaginatedResponse<PosSessionPayment>>(this.baseUrl, {
      params: httpParams,
    });
  }
}
