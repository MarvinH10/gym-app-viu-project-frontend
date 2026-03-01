import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionApi } from '@/core/services/api/subscription.api';
import { MembershipSubscriptionResource } from '@/core/models';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-subscription-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        FormDetailComponent
    ],
    templateUrl: './subscription-detail.component.html',
})
export class SubscriptionDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly subscriptionApi = inject(SubscriptionApi);

    readonly subscription = signal<MembershipSubscriptionResource | null>(null);
    readonly loading = signal(true);

    readonly detailSections = signal<DetailSection[]>([
        {
            title: 'Resumen de Suscripción',
            fields: [
                { name: 'id', label: 'ID Suscripción' },
                {
                    name: 'status', label: 'Estado', type: 'badge', badgeVariant: (v) => {
                        switch (v) {
                            case 'active': return 'secondary';
                            case 'frozen': return 'outline';
                            case 'expired': return 'destructive';
                            default: return 'default';
                        }
                    }, transform: (v) => {
                        switch (v) {
                            case 'active': return 'Activa';
                            case 'frozen': return 'Congelada';
                            case 'expired': return 'Vencida';
                            default: return v;
                        }
                    }
                },
                { name: 'amount_paid', label: 'Monto Total', type: 'currency' },
                { name: 'payment_method', label: 'Método de Pago', transform: (v) => v === 'cash' ? 'Efectivo' : v === 'card' ? 'Tarjeta' : v === 'transfer' ? 'Transferencia' : v || '—' },
            ],
        },
        {
            title: 'Socio y Plan',
            fields: [
                { name: 'partner', label: 'Socio', transform: (v) => v?.name || '—' },
                { name: 'plan', label: 'Plan Contratado', transform: (v) => v?.name || '—' },
                { name: 'start_date', label: 'Fecha Inicio', type: 'date' },
                { name: 'end_date', label: 'Fecha Vencimiento', type: 'date' },
            ],
        },
        {
            title: 'Uso y Seguimiento',
            fields: [
                { name: 'entries_used', label: 'Entradas Usadas' },
                { name: 'days_remaining', label: 'Días Restantes', transform: (v) => `${v} días` },
                { name: 'progress', label: 'Progreso del Plan', transform: (v) => `${v}%` },
                { name: 'last_entry_date', label: 'Última Entrada', type: 'datetime' }
            ]
        }
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
