import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionApi } from '@/core/services/api/subscription.api';
import { MembershipSubscriptionResource } from '@/core/models';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-subscription-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    FormDetailComponent,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
  ],
  templateUrl: './subscription-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);
  private readonly subscriptionApi = inject(SubscriptionApi);

  readonly subscription = signal<MembershipSubscriptionResource | null>(null);
  readonly loading = signal(true);

  readonly detailSections = signal<DetailSection[]>([
    {
      title: 'Información de Pago',
      icon: 'banknote',
      fields: [
        { name: 'amount_paid', label: 'Monto Total', type: 'currency' },
        {
          name: 'payment_method',
          label: 'Método de Pago',
          type: 'badge',
          badgeVariant: () => 'outline',
          transform: (v) => {
            const methods: any = { cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta' };
            return methods[v] || v || '—';
          },
        },
        {
          name: 'payment_reference',
          label: 'Referencia/Operación',
          transform: (v) => v || 'Sin referencia',
        },
        { name: 'created_at', label: 'Fecha de Registro', type: 'datetime' },
      ],
    },
    {
      title: 'Socio y Plan',
      icon: 'users',
      fields: [
        { name: 'partner', label: 'Socio', transform: (v) => v?.name || '—' },
        { name: 'plan', label: 'Plan Contratado', transform: (v) => v?.name || '—' },
        { name: 'start_date', label: 'Fecha Inicio', type: 'date' },
        { name: 'end_date', label: 'Fecha Vencimiento', type: 'date' },
      ],
    },
    {
      title: 'Estado y Seguimiento',
      icon: 'trending-up',
      fields: [
        { name: 'entries_used', label: 'Entradas Usadas', transform: (v) => `${v} registros` },
        { name: 'days_remaining', label: 'Días Restantes', transform: (v) => `${v} días` },
        { name: 'progress', label: 'Uso del Plan', transform: (v) => `${v}% completado` },
        { name: 'last_entry_date', label: 'Último Acceso', type: 'datetime' },
      ],
    },
  ]);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadSubscription(id);
    }
  }

  loadSubscription(id: string) {
    this.loading.set(true);
    this.subscriptionApi.getSubscription(id).subscribe({
      next: (res) => {
        this.subscription.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        toast.error('No se pudo cargar la suscripción');
        this.goBack();
      },
    });
  }

  goBack() {
    this.router.navigate(['/gym/subscriptions']);
  }
}
