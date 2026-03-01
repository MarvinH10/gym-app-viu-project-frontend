import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionApi } from '@/core/services/api/subscription.api';
import { MemberApi } from '@/core/services/api/member.api';
import { MembershipPlanApi } from '../../../../core/services/api/membership-plan.api';
import { PaginatedResponse, Member, PaginatedMembershipPlansResponse, MembershipPlanResource } from '@/core/models';
import {
    FormCreateEditComponent,
    DynamicField,
} from '@/shared/components/form-create-edit/form-create-edit.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { toast } from 'ngx-sonner';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-subscription-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormCreateEditComponent,
    ],
    templateUrl: './subscription-create-edit.component.html',
})
export class SubscriptionCreateEditComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly subscriptionApi = inject(SubscriptionApi);
    private readonly memberApi = inject(MemberApi);
    private readonly planApi = inject(MembershipPlanApi);

    readonly id = signal<string | null>(null);
    readonly loading = signal(false);
    readonly initialData = signal<any>(null);

    readonly fields = signal<DynamicField[]>([
        {
            name: 'partner_id',
            label: 'Socio',
            type: 'select',
            placeholder: 'Selecciona un socio...',
            options: [],
            colSpan: 1,
        },
        {
            name: 'membership_plan_id',
            label: 'Plan de Membresía',
            type: 'select',
            placeholder: 'Selecciona un plan...',
            options: [],
            colSpan: 1,
        },
        {
            name: 'start_date',
            label: 'Fecha de Inicio',
            type: 'date',
            colSpan: 1,
        },
        {
            name: 'amount_paid',
            label: 'Monto a Pagar',
            type: 'number',
            colSpan: 1,
        },
        {
            name: 'payment_method',
            label: 'Método de Pago',
            type: 'select',
            options: [
                { label: 'Efectivo', value: 'cash' },
                { label: 'Transferencia', value: 'transfer' },
                { label: 'Tarjeta', value: 'card' }
            ],
            colSpan: 1,
        },
        {
            name: 'payment_reference',
            label: 'Referencia/Operación',
            type: 'text',
            colSpan: 1
        },
        {
            name: 'notes',
            label: 'Notas Adicionales',
            type: 'textarea',
            colSpan: 2,
        }
    ]);

    ngOnInit() {
        this.id.set(this.route.snapshot.params['id']);
        this.loadOptions();
        if (this.id()) {
            this.loadSubscription();
        }
    }

    loadOptions() {
        this.memberApi.getMembers({ per_page: 100 }).subscribe({
            next: (res: PaginatedResponse<Member>) => {
                const partners = res.data.map((m: Member) => ({ label: m.name, value: m.id.toString() }));
                this.updateFieldOptions('partner_id', partners);
            },
            error: () => toast.error('Error al cargar la lista de socios')
        });

        // Intentamos cargar planes sin filtro de estado primero por si el filtro causa el 500
        // o si el usuario aún no limpia los datos corruptos.
        this.planApi.getPlans({ per_page: 100 }).subscribe({
            next: (res: PaginatedMembershipPlansResponse) => {
                const plans = res.data.map((p: MembershipPlanResource) => ({ label: p.name, value: p.id.toString() }));
                this.updateFieldOptions('membership_plan_id', plans);
            },
            error: (err) => {
                console.error('Error loading plans:', err);
                toast.error('Error al cargar planes de membresía', {
                    description: 'Es posible que existan datos corruptos en la base de datos.'
                });
            }
        });
    }

    private updateFieldOptions(fieldName: string, options: any[]) {
        this.fields.update(fs => fs.map(f => f.name === fieldName ? { ...f, options } : f));
    }

    loadSubscription() {
        this.loading.set(true);
        this.subscriptionApi.getSubscription(this.id()!).subscribe({
            next: (res) => {
                this.initialData.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                toast.error('Error al cargar datos');
                this.goBack();
            },
        });
    }

    onFormSubmit(rawData: any) {
        this.loading.set(true);

        // Normalización estricta para el API
        const data = {
            partner_id: parseInt(rawData.partner_id, 10),
            membership_plan_id: parseInt(rawData.membership_plan_id, 10),
            company_id: parseInt(localStorage.getItem('company_id') || '1', 10), // Fallback a 1 si no hay company_id
            start_date: rawData.start_date || new Date().toISOString().split('T')[0],
            amount_paid: parseFloat(rawData.amount_paid || 0),
            payment_method: rawData.payment_method || 'cash',
            payment_reference: rawData.payment_reference || null,
            notes: rawData.notes || null,
        };

        console.log('Sending subscription data:', data);

        const request = this.id()
            ? this.subscriptionApi.updateSubscription(this.id()!, data)
            : this.subscriptionApi.createSubscription(data);

        request.subscribe({
            next: () => {
                toast.success(this.id() ? 'Suscripción actualizada' : 'Suscripción adquirida y registrada exitosamente.');
                this.goBack();
            },
            error: (err) => {
                console.error('Subscription error:', err);
                let detail = 'Error al procesar';
                if (err?.error?.errors) {
                    const errors = err.error.errors;
                    detail = Object.keys(errors).map(k => `${k}: ${errors[k].join(', ')}`).join(' | ');
                } else if (err?.error?.message) {
                    detail = err.error.message;
                }
                toast.error('Error de Validación', { description: detail });
                this.loading.set(false);
            },
        });
    }

    goBack() {
        this.router.navigate(['/gym/subscriptions']);
    }
}
