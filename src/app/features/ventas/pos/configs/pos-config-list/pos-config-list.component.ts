import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PosConfigApi, PosConfig } from '@/core/services/api/pos-config.api';
import { PosSessionApi } from '@/core/services/api/pos-session.api';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardCardComponent } from '@/shared/components/card';
import { toast } from 'ngx-sonner';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pos-config-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardBadgeComponent,
  ],
  template: `
    <div class="pos-config-container page-container">
      <div class="page-header flex justify-between items-center mb-6">
        <div>
          <h1 class="page-title text-2xl font-bold">Terminales POS (Cajas)</h1>
          <p class="text-muted-foreground mt-1">
            Gestiona los puntos de venta, almacenes vinculados y aperturas de turno.
          </p>
        </div>
        <div class="page-actions flex gap-2">
          <button z-button (click)="loadConfigs()" [disabled]="isLoading()" zType="outline">
            <z-icon zType="refresh-cw" class="mr-2" [class.animate-spin]="isLoading()" />
            Refrescar
          </button>
          <a z-button routerLink="create">
            <z-icon zType="plus" class="mr-2" />
            Nueva Terminal
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1, 2, 3]; track i) {
            <z-card class="h-48 animate-pulse"></z-card>
          }
        </div>
      } @else if (configs().length === 0) {
        <div class="text-center py-12 bg-card rounded-lg border border-border">
          <z-icon zType="monitor" class="size-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 class="text-lg font-medium mb-2">No hay Terminales</h3>
          <p class="text-muted-foreground mb-4">
            Comienza creando tu primera terminal de Punto de Venta para empezar a vender.
          </p>
          <a z-button routerLink="create">
            <z-icon zType="plus" class="mr-2" />
            Crear Terminal
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (config of configs(); track config.id) {
            <z-card
              class="flex flex-col h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div class="p-5 flex-1">
                <div class="flex justify-between items-start mb-4 gap-3">
                  <div class="flex-1 flex items-center gap-3 min-w-0">
                    <div class="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                      <z-icon zType="monitor" class="size-6" />
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-lg font-bold leading-none truncate" [title]="config.name">
                        {{ config.name }}
                      </h3>
                      <p
                        class="text-sm text-muted-foreground mt-1 truncate"
                        [title]="config.warehouse?.name || 'Sin almacén'"
                      >
                        {{ config.warehouse?.name || 'Sin almacén' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    @if (!config.is_active) {
                      <z-badge zType="destructive">Terminal Inactiva</z-badge>
                    } @else if (config.has_active_session) {
                      <z-badge>Turno Abierto</z-badge>
                    } @else {
                      <z-badge zType="secondary">Cerrada</z-badge>
                    }
                  </div>
                </div>

                <div class="space-y-2 mt-4 text-sm">
                  <div class="flex justify-between items-center gap-2 text-muted-foreground">
                    <span class="shrink-0">Impuestos</span>
                    <span class="font-medium text-foreground truncate text-right">
                      {{ config.apply_tax ? 'Si' : 'No' }}
                      {{ config.apply_tax && config.prices_include_tax ? '(Incluidos)' : '' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center gap-2 text-muted-foreground">
                    <span class="shrink-0">Cliente por defecto</span>
                    <span class="font-medium text-foreground truncate text-right">
                      {{ config.default_customer?.name || 'Ninguno' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-muted/30 p-4 border-t border-border flex flex-wrap gap-2">
                <a
                  z-button
                  zType="outline"
                  class="flex-1 min-w-[120px] flex justify-center basis-full sm:basis-auto"
                  [routerLink]="['edit', config.id]"
                >
                  <z-icon zType="settings" class="mr-2" /> Ajustes
                </a>
                <button
                  z-button
                  class="flex-1 min-w-[140px] flex justify-center basis-full sm:basis-auto"
                  (click)="openSession(config)"
                  [disabled]="!config.is_active || isOpening()"
                >
                  <z-icon zType="log-out" class="mr-2" />
                  {{ config.has_active_session ? 'Reanudar Sesión' : 'Abrir Sesión' }}
                </button>
              </div>
            </z-card>
          }
        </div>
      }
    </div>
  `,
})
export class PosConfigListComponent implements OnInit {
  private readonly configApi = inject(PosConfigApi);
  private readonly sessionApi = inject(PosSessionApi);
  private readonly router = inject(Router);

  configs = signal<PosConfig[]>([]);
  isLoading = signal(true);
  isOpening = signal(false);

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.isLoading.set(true);
    this.configApi
      .getPosConfigs({ per_page: 50 })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.configs.set(res.data);
        },
        error: () => toast.error('Error al cargar las terminales'),
      });
  }

  openSession(config: PosConfig): void {
    if (this.isOpening()) return;

    this.isOpening.set(true);
    this.sessionApi
      .getPosSessions({ pos_config_id: config.id, status: 'opened' })
      .pipe(finalize(() => this.isOpening.set(false)))
      .subscribe({
        next: (res) => {
          if (res.data && res.data.length > 0) {
            const activeSession = res.data[0];
            toast.info('Retomando sesión activa...');
            const url = this.router.serializeUrl(
              this.router.createUrlTree(['/ventas/pos/session', activeSession.id]),
            );
            window.open(url, '_blank');
          } else {
            this.router.navigate(['/ventas/pos/open', config.id]);
          }
        },
        error: (err: any) => {
          toast.error('Incapaz de verificar el estado de la caja.');
        },
      });
  }
}
