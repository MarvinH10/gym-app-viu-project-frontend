import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { CustomerApi } from '@/core/services/api/customer.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CustomerResource, PaginatedResponse, CustomerQueryParams } from '@/core/models';
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
    selector: 'app-clientes',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './clientes.html',
    styleUrl: './clientes.css',
})
export class Clientes {
    private readonly router = inject(Router);
    private readonly customerApi = inject(CustomerApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly customers = signal<CustomerResource[]>([]);
    readonly pagination = signal<PaginatedResponse<CustomerResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<CustomerResource>[] = [
        {
            key: 'name',
            label: 'Cliente',
            type: 'stack',
            subKey: 'email',
        },
        {
            key: 'document_number',
            label: 'Documento',
            type: 'stack',
            subKey: 'document_type',
        },
        {
            key: 'phone',
            label: 'Teléfono',
            type: 'text',
            fallback: '-',
        },
        {
            key: 'status',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v) => {
                switch (v) {
                    case 'active': return 'secondary';
                    case 'inactive': return 'outline';
                    case 'suspended': return 'destructive';
                    case 'blacklisted': return 'destructive';
                    default: return 'outline';
                }
            },
            transform: (v) => {
                switch (v) {
                    case 'active': return 'Activo';
                    case 'inactive': return 'Inactivo';
                    case 'suspended': return 'Suspendido';
                    case 'blacklisted': return 'Lista Negra';
                    default: return v;
                }
            }
        },
    ];

    readonly actions: TableDetailsAction<CustomerResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (c) => this.router.navigate(['/ventas/clientes', c.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (c) => this.router.navigate(['/ventas/clientes', c.id, 'edit']),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (c) => this.toggleStatus(c),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (c) => this.confirmDeleteCustomer(c),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadCustomers();
        });
    }

    goToNewCustomer() {
        this.router.navigate(['/ventas/clientes/new']);
    }

    loadCustomers() {
        this.loading.set(true);
        const params: CustomerQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.customerApi.getCustomers(params).subscribe({
            next: (res) => {
                this.customers.set(res.data);
                this.pagination.set(res.meta ?? null);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los clientes. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(customer: CustomerResource) {
        this.customerApi.toggleStatus(customer.id).subscribe({
            next: () => {
                toast.success('Estado actualizado correctamente');
                this.loadCustomers();
            },
            error: () => {
                toast.error('No se pudo cambiar el estado del cliente');
            },
        });
    }

    confirmDeleteCustomer(customer: CustomerResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Cliente',
            zContent: `¿Estás seguro de que deseas eliminar al cliente <strong>${customer.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.customerApi.deleteCustomer(customer.id).subscribe({
                    next: () => {
                        toast.success('Cliente eliminado');
                        this.loadCustomers();
                    },
                    error: () => toast.error('No se pudo eliminar el cliente'),
                });
            },
        });
    }
}
