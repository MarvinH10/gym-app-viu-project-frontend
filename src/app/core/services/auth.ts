import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthErrorResponse,
  ResetPasswordRequest,
} from '@/core/models';
import { AuthApi } from './api/auth.api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.authApi.register(data).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.authApi.login(data).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  refreshUser(): Observable<AuthResponse> {
    return this.authApi.getMe().pipe(
      tap((response: AuthResponse) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        this.currentUser.set(response.data.user);
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.logout();
        }
        return this.handleAuthError(err);
      }),
    );
  }

  verifyEmail(id: string, hash: string): Observable<any> {
    this.isLoading.set(true);
    return this.authApi.verifyEmail(id, hash).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  resendVerification(email: string): Observable<any> {
    this.isLoading.set(true);
    return this.authApi.resendVerification({ email }).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  forgotPassword(email: string): Observable<any> {
    this.isLoading.set(true);
    return this.authApi.forgotPassword({ email }).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    this.isLoading.set(true);
    return this.authApi.resetPassword(data).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.isLoading.set(false);
        return this.handleAuthError(err);
      }),
    );
  }

  logout(): void {
    this.authApi.logout().subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUser.set(user);
      } catch {
        this.logout();
      }
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
    this.currentUser.set(response.data.user);
  }

  private handleAuthError(err: HttpErrorResponse): Observable<never> {
    const body = err.error as AuthErrorResponse | undefined;
    let message = 'Ocurrió un error inesperado';

    if (body?.errors) {
      const firstField = Object.keys(body.errors)[0];
      message = body.errors[firstField][0];
    } else if (body?.message) {
      message = body.message;
    }

    this.error.set(message);
    return throwError(() => new Error(message));
  }
}
