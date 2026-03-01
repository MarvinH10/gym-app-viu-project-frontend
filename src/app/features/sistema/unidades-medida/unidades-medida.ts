import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { UnitMeasureApi } from '@/core/services/api/unit-measure.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { UnitMeasureResource, UnitMeasurePaginatedResponse, UnitMeasureQueryParams } from '@/core/models';
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
    selector: 'app-unidades-medida',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './unidades-medida.html',
})
export class UnidadesMedida {
    private readonly router = inject(Router);
    private readonly unitApi = inject(UnitMeasureApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly units = signal<UnitMeasureResource[]>([]);
    readonly pagination = signal<UnitMeasurePaginatedResponse['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<UnitMeasureResource>[] = [
        {
            key: 'name',
            label: 'Nombre',
            type: 'stack',
            subKey: 'symbol',
            subTransform: (v) => `Símbolo: ${v || 'N/A'}`,
        },
        {
            key: 'family',
            label: 'Familia',
            type: 'text',
            fallback: 'Sin familia',
        },
        {
            key: 'factor',
            label: 'Factor',
            type: 'text',
            transform: (v) => v.toString(),
        },
        {
            key: 'base_unit',
            label: 'Unidad Base',
            type: 'text',
            transform: (v) => v?.name || 'Es Unidad Base',
        },
        {
            key: 'is_active',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v) => (v ? 'secondary' : 'outline'),
            transform: (v) => (v ? 'Activo' : 'Inactivo'),
        },
    ];

    readonly actions: TableDetailsAction<UnitMeasureResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (u) => this.router.navigate(['/sistema/unidades-medida', u.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (u) => this.router.navigate(['/sistema/unidades-medida', u.id, 'edit']),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (u) => this.toggleStatus(u),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (u) => this.confirmDelete(u),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadUnits();
        });
    }

    goToNew() {
        this.router.navigate(['/sistema/unidades-medida/new']);
    }

    loadUnits() {
        this.loading.set(true);
        const params: UnitMeasureQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.unitApi.getUnits(params).subscribe({
            next: (res) => {
                this.units.set(res.data);
                this.pagination.set(res.meta);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las unidades de medida.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(unit: UnitMeasureResource) {
        this.unitApi.toggleStatus(unit.id).subscribe({
            next: (res) => {
                toast.success(res.message);
                this.loadUnits();
            },
            error: () => toast.error('Error al actualizar estado'),
        });
    }

    confirmDelete(unit: UnitMeasureResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Unidad de Medida',
            zContent: `¿Estás seguro de que deseas eliminar la unidad <strong>${unit.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.unitApi.deleteUnit(unit.id).subscribe({
                    next: () => {
                        toast.success('Unidad de medida eliminada');
                        this.loadUnits();
                    },
                    error: () => toast.error('No se pudo eliminar la unidad'),
                });
            },
        });
    }
}
