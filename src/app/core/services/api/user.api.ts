import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserQueryParams, PaginatedResponse } from '@/core/models';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(params: UserQueryParams): Observable<PaginatedResponse<User>> {
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

    return this.http.get<PaginatedResponse<User>>(`${this.API_URL}/users`, {
      params: httpParams,
    });
  }

  getUser(id: string | number): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.API_URL}/users/${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/users`, data);
  }

  updateUser(id: string | number, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/users/${id}`, data);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }
}
