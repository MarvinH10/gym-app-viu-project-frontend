import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PosSessionApi, OpenPosSessionRequest } from '@/core/services/api/pos-session.api';
import { PosConfigApi, PosConfig } from '@/core/services/api/pos-config.api';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardLabelDirective } from '@/shared/components/label';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pos-session-open',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardLabelDirective,
  ],
  template: `
    <div class="w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4">
      <z-card class="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div class="p-6 text-center border-b border-border">
          <div
            class="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4"
          >
            <z-icon zType="monitor" class="size-6" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight">Caja Fuerte</h1>
          <p class="text-muted-foreground mt-1 text-sm">
            @if (config()) {
              Apertura de turno para <strong>{{ config()?.name }}</strong>
            } @else {
              Cargando info...
            }
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="openSession()" class="p-6 space-y-6">
          <div class="space-y-2">
            <label z-label
              >Saldo de Apertura (Efectivo inicial) <span class="text-destructive">*</span></label
            >
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
              <input
                z-input
                type="number"
                formControlName="opening_balance"
                class="pl-8"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            @if (form.controls.opening_balance.invalid && form.controls.opening_balance.touched) {
              <span class="text-xs text-destructive"
                >El saldo inicial es requerido y debe ser válido.</span
              >
            }
          </div>

          <div class="space-y-2">
            <label z-label>Notas de Apertura (Opcional)</label>
            <textarea
              z-input
              formControlName="opening_note"
              rows="3"
              placeholder="Ej. Billetes de 10 y 20, sin monedas..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              z-button
              zType="outline"
              class="flex-1"
              (click)="cancel()"
              [disabled]="isLoading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              z-button
              class="flex-1"
              [disabled]="form.invalid || isLoading() || !config()"
            >
              @if (isLoading()) {
                <z-icon zType="refresh-cw" class="mr-2 animate-spin" /> Abriendo...
              } @else {
                Abrir Sesión
              }
            </button>
          </div>
        </form>
      </z-card>
    </div>
  `,
  host: {
    class: 'block w-full h-full',
  },
})
export class PosSessionOpenComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionApi = inject(PosSessionApi);
  private readonly configApi = inject(PosConfigApi);

  configId = signal<number | null>(null);
  config = signal<PosConfig | null>(null);
  isLoading = signal(false);

  form = this.fb.nonNullable.group({
    opening_balance: [0, [Validators.required, Validators.min(0)]],
    opening_note: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('configId');
    if (id) {
      this.configId.set(+id);
      this.loadConfig(+id);
    } else {
      toast.error('Terminal no definida');
      this.router.navigate(['/ventas/pos']);
    }
  }

  private loadConfig(id: number) {
    this.configApi.getPosConfig(id).subscribe({
      next: (res) => {
        this.config.set(res.data);
      },
      error: () => {
        toast.error('No se pudo cargar la info de la terminal.');
        this.cancel();
      },
    });
  }

  openSession() {
    if (this.form.invalid || !this.configId()) return;

    this.isLoading.set(true);
    const vals = this.form.getRawValue();
    const payload: OpenPosSessionRequest = {
      pos_config_id: this.configId()!,
      opening_balance: vals.opening_balance,
      opening_note: vals.opening_note || undefined,
    };

    this.sessionApi
      .openPosSession(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          toast.success('Sesión iniciada exitosamente.');
          // Abrir el terminal interactivo en una nueva pestaña
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['/ventas/pos/session', res.data.id]),
          );
          window.open(url, '_blank');

          // Redirigir la pestaña actual a la lista de terminales
          this.router.navigate(['/ventas/pos']);
        },
        error: (err: any) => {
          toast.error(err?.error?.message || 'Error al abrir la sesión. ¿Ya hay un turno abierto?');
        },
      });
  }

  cancel() {
    this.router.navigate(['/ventas/pos']);
  }
}
