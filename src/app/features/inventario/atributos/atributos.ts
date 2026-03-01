import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { AttributeApi } from '@/core/services/api/attribute.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { AttributeResource, PaginatedResponse, AttributeQueryParams } from '@/core/models';
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
    selector: 'app-atributos',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './atributos.html',
    styleUrl: './atributos.css',
})
export class Atributos {
    private readonly router = inject(Router);
    private readonly attributeApi = inject(AttributeApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly attributes = signal<AttributeResource[]>([]);
    readonly pagination = signal<PaginatedResponse<AttributeResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(15);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<AttributeResource>[] = [
        {
            key: 'name',
            label: 'Nombre del Atributo',
            type: 'text',
        },
        {
            key: 'values',
            label: 'Valores',
            type: 'text',
            transform: (v: any[]) => v?.map(val => val.value).join(', ') || 'Sin valores',
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
            label: 'Creado el',
        }
    ];

    readonly actions: TableDetailsAction<AttributeResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (a) => this.router.navigate(['/inventario/atributos', a.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (a) => this.router.navigate(['/inventario/atributos', a.id, 'edit']),
        },
        {
            label: 'Cambiar estado',
            icon: 'refresh-cw',
            onAction: (a) => this.toggleStatus(a),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (a) => this.confirmDeleteAttribute(a),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadAttributes();
        });
    }

    goToNewAttribute() {
        this.router.navigate(['/inventario/atributos/new']);
    }

    loadAttributes() {
        this.loading.set(true);
        const params: AttributeQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.attributeApi.getAttributes(params).subscribe({
            next: (res) => {
                this.attributes.set(res.data.data);
                this.pagination.set(res.data.meta);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los atributos. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(attribute: AttributeResource) {
        this.attributeApi.toggleStatus(attribute.id).subscribe({
            next: (res) => {
                toast.success(res.message);
                this.loadAttributes();
            },
            error: () => toast.error('Error al actualizar estado'),
        });
    }

    confirmDeleteAttribute(attribute: AttributeResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Atributo',
            zContent: `¿Estás seguro de que deseas eliminar el atributo <strong>${attribute.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.attributeApi.deleteAttribute(attribute.id).subscribe({
                    next: () => {
                        toast.success('Atributo eliminado');
                        this.loadAttributes();
                    },
                    error: () => toast.error('No se pudo eliminar el atributo'),
                });
            },
        });
    }
}
