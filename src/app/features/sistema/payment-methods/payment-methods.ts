import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { PaymentMethodApi } from '@/core/services/api/payment-method.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { PaymentMethodResource, PaginatedResponse, PaymentMethodQueryParams } from '@/core/models';
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
    selector: 'app-payment-methods',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './payment-methods.html',
    styleUrl: './payment-methods.css',
})
export class PaymentMethodsComponent {
    private readonly router = inject(Router);
    private readonly paymentMethodApi = inject(PaymentMethodApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly paymentMethods = signal<PaymentMethodResource[]>([]);
    readonly pagination = signal<PaginatedResponse<PaymentMethodResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly columns: TableDetailsColumn<PaymentMethodResource>[] = [
        {
            key: 'name',
            label: 'Nombre',
            type: 'text',
        },
        {
            key: 'is_active',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v) => (v ? 'secondary' : 'outline'),
            transform: (v) => (v ? 'Activo' : 'Inactivo'),
        },
        {
            key: 'created_at',
            label: 'Fecha Creación',
            type: 'text',
            transform: (v: any) => v ? new Date(v).toLocaleDateString('es-PE') : '—',
        },
    ];

    readonly actions: TableDetailsAction<PaymentMethodResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (pm) => this.router.navigate(['/sistema/payment-methods', pm.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (pm) => this.router.navigate(['/sistema/payment-methods', pm.id, 'edit']),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (pm) => this.toggleStatus(pm),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (pm) => this.confirmDeletePaymentMethod(pm),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadPaymentMethods();
        });
    }

    goToNewPaymentMethod() {
        this.router.navigate(['/sistema/payment-methods/new']);
    }

    loadPaymentMethods() {
        this.loading.set(true);
        const params: PaymentMethodQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            q: this.search(),
        };

        this.paymentMethodApi.getPaymentMethods(params).subscribe({
            next: (res) => {
                const data = res.data || [];
                // Ordenar por nombre por defecto
                data.sort((a, b) => a.name.localeCompare(b.name));
                this.paymentMethods.set(data);
                this.pagination.set(res.meta);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los métodos de pago.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(pm: PaymentMethodResource) {
        this.paymentMethodApi.toggleStatus(pm.id).subscribe({
            next: () => {
                toast.success('Estado actualizado correctamente');
                this.loadPaymentMethods();
            },
            error: () => toast.error('No se pudo cambiar el estado'),
        });
    }

    confirmDeletePaymentMethod(pm: PaymentMethodResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Método de Pago',
            zContent: `¿Estás seguro de que deseas eliminar el método de pago <strong>${pm.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.paymentMethodApi.deletePaymentMethod(pm.id).subscribe({
                    next: (res) => {
                        toast.success(res.message || 'Método de pago eliminado');
                        this.loadPaymentMethods();
                    },
                    error: () => toast.error('No se pudo eliminar el método de pago'),
                });
            },
        });
    }
}
