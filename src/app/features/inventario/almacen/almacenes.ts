import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { WarehouseApi } from '@/core/services/api/warehouse.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { WarehouseResource, PaginatedResponse, WarehouseQueryParams } from '@/core/models';
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
    selector: 'app-almacenes',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './almacenes.html',
    styleUrl: './almacenes.css',
})
export class Almacenes {
    private readonly router = inject(Router);
    private readonly warehouseApi = inject(WarehouseApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly warehouses = signal<WarehouseResource[]>([]);
    readonly pagination = signal<PaginatedResponse<WarehouseResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(15);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<WarehouseResource>[] = [
        {
            key: 'name',
            label: 'Almacén',
            type: 'text',
        },
        {
            key: 'location',
            label: 'Ubicación',
            type: 'text',
            fallback: 'Sin ubicación',
        },
        {
            key: 'company',
            label: 'Compañía',
            type: 'text',
            transform: (v) => v?.business_name || '—',
        },
        {
            key: 'is_active',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v) => (v === true || v === 1 || String(v) === '1' || String(v) === 'true' ? 'secondary' : 'outline'),
            transform: (v) => (v === true || v === 1 || String(v) === '1' || String(v) === 'true' ? 'Activo' : 'Inactivo'),
        },
        {
            key: 'created_at',
            label: 'Creado el',
            type: 'text',
        }
    ];

    readonly actions: TableDetailsAction<WarehouseResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (w) => this.router.navigate(['/inventario/almacen', w.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (w) => this.router.navigate(['/inventario/almacen', w.id, 'edit']),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (w) => this.toggleStatus(w),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (w) => this.confirmDeleteWarehouse(w),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadWarehouses();
        });
    }

    goToNewWarehouse() {
        this.router.navigate(['/inventario/almacen/new']);
    }

    loadWarehouses() {
        this.loading.set(true);
        this.error.set(null);

        const params: WarehouseQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.warehouseApi.getWarehouses(params).subscribe({
            next: (res) => {
                // Robust mapping based on recent fixes
                const responseData = res.data as any;

                if (responseData && Array.isArray(responseData.data)) {
                    this.warehouses.set(responseData.data);
                    this.pagination.set(responseData.meta);
                } else if (Array.isArray(responseData)) {
                    this.warehouses.set(responseData);
                    this.pagination.set(null);
                } else {
                    this.warehouses.set([]);
                    this.pagination.set(null);
                }

                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los almacenes. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(warehouse: WarehouseResource) {
        this.warehouseApi.toggleStatus(warehouse.id).subscribe({
            next: (res) => {
                toast.success(res.message || 'Estado actualizado');

                // Update local signal directly for immediate feedback
                if (res.data) {
                    this.warehouses.update(current =>
                        current.map(w => w.id === warehouse.id ? { ...w, ...res.data } : w)
                    );
                } else {
                    this.loadWarehouses();
                }
            },
            error: () => toast.error('Error al actualizar estado'),
        });
    }

    confirmDeleteWarehouse(warehouse: WarehouseResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Almacén',
            zContent: `¿Estás seguro de que deseas eliminar el almacén <strong>${warehouse.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.warehouseApi.deleteWarehouse(warehouse.id).subscribe({
                    next: () => {
                        toast.success('Almacén eliminado');
                        this.loadWarehouses();
                    },
                    error: () => toast.error('No se pudo eliminar el almacén'),
                });
            },
        });
    }
}
