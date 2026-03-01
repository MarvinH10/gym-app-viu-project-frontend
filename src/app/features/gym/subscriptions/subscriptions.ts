import {
  Component,
  effect,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { SubscriptionApi } from '@/core/services/api/subscription.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import {
  MembershipSubscriptionResource,
  PaginatedSubscriptionsResponse,
  SubscriptionQueryParams,
} from '@/core/models/subscription.model';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSearchFiltersImports } from '@/shared/components/search-filters';
import {
  TableDetailsImports,
  TableDetailsColumn,
  TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsComponent {
  private readonly router = inject(Router);
  private readonly subscriptionApi = inject(SubscriptionApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly subscriptions = signal<MembershipSubscriptionResource[]>([]);
  readonly pagination = signal<PaginatedSubscriptionsResponse['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(25);
  readonly status = signal<'active' | 'frozen' | 'expired' | undefined>(undefined);

  readonly columns: TableDetailsColumn<MembershipSubscriptionResource>[] = [
    {
      key: 'partner',
      label: 'Socio',
      type: 'stack',
      subKey: 'id',
      transform: (v: any) => v?.name || 'Cliente',
      subTransform: (v: any) => `ID: #${v}`,
    },
    {
      key: 'plan',
      label: 'Plan',
      type: 'text',
      transform: (v: any) => v?.name || 'Personalizado',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v: string) => {
        switch (v) {
          case 'active':
            return 'secondary';
          case 'frozen':
            return 'outline';
          case 'expired':
            return 'destructive';
          default:
            return 'default';
        }
      },
      transform: (v: string) => {
        switch (v) {
          case 'active':
            return 'Activa';
          case 'frozen':
            return 'Congelada';
          case 'expired':
            return 'Vencida';
          default:
            return v?.toUpperCase() || '—';
        }
      },
    },
    {
      key: 'end_date',
      label: 'Vencimiento',
      type: 'text',
      transform: (v: string) =>
        v
          ? new Date(v).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
    },
    {
      key: 'progress',
      label: 'Uso',
      type: 'text',
      transform: (v: number, row: MembershipSubscriptionResource) =>
        `${row.entries_used} entradas (${v}%)`,
    },
  ];

  readonly tableActions: TableDetailsAction<MembershipSubscriptionResource>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (s: MembershipSubscriptionResource) =>
        this.router.navigate(['/gym/subscriptions', s.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (s: MembershipSubscriptionResource) =>
        this.router.navigate(['/gym/subscriptions', s.id, 'edit']),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (s: MembershipSubscriptionResource) => this.confirmDelete(s),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.status();
      this.loadSubscriptions();
    });
  }

  goToNew() {
    this.router.navigate(['/gym/subscriptions/new']);
  }

  loadSubscriptions() {
    this.loading.set(true);
    const params: SubscriptionQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      q: this.search(),
      status: this.status(),
    };

    this.subscriptionApi.getSubscriptions(params).subscribe({
      next: (res) => {
        this.subscriptions.set(res.data || []);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las suscripciones.');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(subscription: MembershipSubscriptionResource) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Suscripción',
      zContent: `¿Deseas eliminar la suscripción del socio <strong>${subscription.partner?.name || 'desconocido'}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Eliminar',
      zCancelText: 'Cancelar',
      zOnOk: () => {
        this.subscriptionApi.deleteSubscription(subscription.id).subscribe({
          next: () => {
            toast.success('Suscripción eliminada');
            this.loadSubscriptions();
          },
          error: (err) => {
            toast.error('Error al eliminar', { description: err?.error?.message });
          },
        });
      },
    });
  }
}
