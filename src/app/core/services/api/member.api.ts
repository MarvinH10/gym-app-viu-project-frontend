import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, MemberFormOptions, PaginatedResponse, MemberQueryParams } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MemberApi {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMembers(params: MemberQueryParams): Observable<PaginatedResponse<Member>> {
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
    if (params['status[]']) {
      params['status[]'].forEach((s) => {
        httpParams = httpParams.append('status[]', s);
      });
    }
    if (params['portal[]']) {
      params['portal[]'].forEach((p) => {
        httpParams = httpParams.append('portal[]', p);
      });
    }

    return this.http.get<PaginatedResponse<Member>>(`${this.API_URL}/members`, {
      params: httpParams,
    });
  }

  getMember(id: string): Observable<{ data: Member }> {
    return this.http.get<{ data: Member }>(`${this.API_URL}/members/${id}`);
  }

  createMember(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/members`, data);
  }

  updateMember(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/members/${id}`, data);
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/members/${id}`);
  }

  activatePortal(id: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/members/${id}/activate-portal`, data);
  }

  getFormOptions(): Observable<{ data: MemberFormOptions }> {
    return this.http.get<{ data: MemberFormOptions }>(`${this.API_URL}/members/form-options`);
  }

  checkDocumentExists(
    documentType: string,
    documentNumber: string,
  ): Observable<PaginatedResponse<Member>> {
    const params = new HttpParams().set('search', documentNumber).set('per_page', '5');
    return this.http.get<PaginatedResponse<Member>>(`${this.API_URL}/members`, { params });
  }
}
