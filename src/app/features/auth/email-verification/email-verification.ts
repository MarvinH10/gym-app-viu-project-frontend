import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@/core/services/auth';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [RouterLink, ZardButtonComponent, ZardCardComponent],
  template: `
    <z-card
      class="w-full max-w-[400px] text-center"
      [zTitle]="
        status() === 'verifying'
          ? 'Verificando email...'
          : status() === 'success'
            ? 'Email verificado'
            : 'Error de verificación'
      "
    >
      <div class="py-6">
        @if (status() === 'verifying') {
          <div class="flex flex-col items-center gap-4">
            <div
              class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            ></div>
            <p class="text-muted-foreground">
              Por favor espera un momento mientras procesamos tu verificación.
            </p>
          </div>
        } @else if (status() === 'success') {
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p class="text-muted-foreground">{{ message() }}</p>
            <a routerLink="/auth/login" z-button zType="default" class="mt-4"
              >Ir al inicio de sesión</a
            >
          </div>
        } @else {
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p class="text-muted-foreground">{{ message() }}</p>
            <a routerLink="/auth/login" z-button zType="outline" class="mt-4">Volver al inicio</a>
          </div>
        }
      </div>
    </z-card>
  `,
})
export class EmailVerification implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = signal<'verifying' | 'success' | 'error'>('verifying');
  message = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    const hash = this.route.snapshot.params['hash'];

    if (!id || !hash) {
      this.status.set('error');
      this.message.set('Enlace de verificación inválido.');
      return;
    }

    this.authService.verifyEmail(id, hash).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res.message || 'Tu correo electrónico ha sido verificado con éxito.');
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(err.message || 'El enlace de verificación ha expirado o es inválido.');
      },
    });
  }
}
