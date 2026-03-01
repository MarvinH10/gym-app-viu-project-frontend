import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  AttendanceResource,
  AttendanceQueryParams,
  PaginatedAttendancesResponse,
  AttendanceCheckInRequest,
} from '@/core/models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/attendances`;

  getAttendances(params: AttendanceQueryParams): Observable<PaginatedAttendancesResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params.search) httpParams = httpParams.set('q', params.search);
    if (params.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params.end_date) httpParams = httpParams.set('end_date', params.end_date);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<PaginatedAttendancesResponse>(this.apiUrl, {
      params: httpParams,
    });
  }

  getAttendance(id: string | number): Observable<{ data: AttendanceResource }> {
    return this.http.get<{ data: AttendanceResource }>(`${this.apiUrl}/${id}`);
  }

  checkIn(
    data: AttendanceCheckInRequest,
  ): Observable<{ success: boolean; message: string; data: AttendanceResource }> {
    return this.http.post<{ success: boolean; message: string; data: AttendanceResource }>(
      `${this.apiUrl}/check-in`,
      data,
    );
  }

  checkOut(
    id: string | number,
  ): Observable<{ success: boolean; message: string; data: AttendanceResource }> {
    return this.http.patch<{ success: boolean; message: string; data: AttendanceResource }>(
      `${this.apiUrl}/${id}/check-out`,
      {},
    );
  }

  updateAttendance(
    id: string | number,
    data: any,
  ): Observable<{ success: boolean; message: string; data: AttendanceResource }> {
    return this.http.put<{ success: boolean; message: string; data: AttendanceResource }>(
      `${this.apiUrl}/${id}`,
      data,
    );
  }
}
