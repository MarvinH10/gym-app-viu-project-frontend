import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { SupplierApi } from '@/core/services/api/supplier.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { SupplierResource, PaginatedResponse, SupplierQueryParams } from '@/core/models';
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
    selector: 'app-proveedores',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './proveedores.html',
    styleUrl: './proveedores.css',
})
export class Proveedores {
    private readonly router = inject(Router);
    private readonly supplierApi = inject(SupplierApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly suppliers = signal<SupplierResource[]>([]);
    readonly pagination = signal<any | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<SupplierResource>[] = [
        {
            key: 'display_name',
            label: 'Proveedor',
            type: 'stack',
            subKey: 'document_number',
            subTransform: (v, row) => `${row.document_type}: ${v}`,
        },
        {
            key: 'email',
            label: 'Contacto',
            type: 'stack',
            subKey: 'phone',
            fallback: 'Sin correo',
        },
        {
            key: 'provider_category',
            label: 'Categoría',
            type: 'text',
            fallback: 'General',
        },
        {
            key: 'status',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v: string) => {
                switch (v) {
                    case 'active': return 'secondary';
                    case 'inactive': return 'outline';
                    case 'suspended': return 'destructive';
                    case 'blacklisted': return 'destructive';
                    default: return 'outline';
                }
            },
            transform: (v: string) => {
                switch (v) {
                    case 'active': return 'Activo';
                    case 'inactive': return 'Inactivo';
                    case 'suspended': return 'Suspendido';
                    case 'blacklisted': return 'Lista Negra';
                    default: return v;
                }
            }
        },
        {
            key: 'created_at',
            label: 'Registrado',
            type: 'text',
        }
    ];

    readonly actions: TableDetailsAction<SupplierResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (s) => this.router.navigate(['/compras/proveedores', s.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (s) => this.router.navigate(['/compras/proveedores/editar', s.id]),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (s) => this.toggleStatus(s),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (s) => this.confirmDeleteSupplier(s),
        },
    ];

    constructor() {
        console.log('Proveedores component initialized');
        effect(() => {
            this.search();
            this.currentPage();
            this.loadSuppliers();
        });
    }

    goToNewSupplier() {
        this.router.navigate(['/compras/proveedores/nuevo']);
    }

    loadSuppliers() {
        console.log('Loading suppliers with params:', {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search()
        });
        this.loading.set(true);
        this.error.set(null);

        const params: SupplierQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.supplierApi.getSuppliers(params).subscribe({
            next: (res: any) => {
                console.log('Suppliers response:', res);
                // Robust mapping based on recent fixes (Attributos, Almacen)
                const responseData = res.data;

                if (responseData && Array.isArray(responseData.data)) {
                    this.suppliers.set(responseData.data);
                    this.pagination.set(responseData.meta);
                } else if (Array.isArray(responseData)) {
                    this.suppliers.set(responseData);
                    this.pagination.set(res.meta || null);
                } else if (res.success && Array.isArray(res.data)) {
                    this.suppliers.set(res.data);
                    this.pagination.set(res.meta || null);
                } else {
                    this.suppliers.set([]);
                    this.pagination.set(null);
                }

                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading suppliers:', err);
                this.error.set('No se pudieron cargar los proveedores. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(supplier: SupplierResource) {
        this.supplierApi.toggleStatus(supplier.id).subscribe({
            next: (res) => {
                toast.success(res.message || 'Estado actualizado');
                // Instant update
                if (res.data) {
                    this.suppliers.update(current =>
                        current.map(s => s.id === supplier.id ? { ...s, ...res.data } : s)
                    );
                } else {
                    this.loadSuppliers();
                }
            },
            error: () => toast.error('Error al actualizar estado'),
        });
    }

    confirmDeleteSupplier(supplier: SupplierResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Proveedor',
            zContent: `¿Estás seguro de que deseas eliminar al proveedor <strong>${supplier.display_name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.supplierApi.deleteSupplier(supplier.id).subscribe({
                    next: () => {
                        toast.success('Proveedor eliminado');
                        this.loadSuppliers();
                    },
                    error: () => toast.error('No se pudo eliminar el proveedor'),
                });
            },
        });
    }
}
