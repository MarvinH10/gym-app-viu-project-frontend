import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { CategoryApi } from '@/core/services/api/category.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CategoryResource, PaginatedResponse, CategoryQueryParams } from '@/core/models';
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
    selector: 'app-categorias',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './categorias.html',
    styleUrl: './categorias.css',
})
// Trigger compiler refresh
export class Categorias {
    private readonly router = inject(Router);
    private readonly categoryApi = inject(CategoryApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly categories = signal<CategoryResource[]>([]);
    readonly pagination = signal<PaginatedResponse<CategoryResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(15);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<CategoryResource>[] = [
        {
            key: 'name',
            label: 'Categoría',
            type: 'text',
        },
        {
            key: 'description',
            label: 'Descripción',
            type: 'text',
            fallback: 'Sin descripción',
        },
        {
            key: 'full_name',
            label: 'Ruta Completa',
            type: 'text',
            fallback: '—',
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
            type: 'text',
        }
    ];

    readonly actions: TableDetailsAction<CategoryResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (c) => this.router.navigate(['/inventario/categorias', c.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (c) => this.router.navigate(['/inventario/categorias', c.id, 'edit']),
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
            onAction: (c) => this.confirmDeleteCategory(c),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadCategories();
        });
    }

    goToNewCategory() {
        this.router.navigate(['/inventario/categorias/new']);
    }

    loadCategories() {
        this.loading.set(true);
        this.error.set(null);

        const params: CategoryQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
        };

        this.categoryApi.getCategories(params).subscribe({
            next: (res) => {
                // Defensive mapping for different API response structures
                const responseData = res.data as any;

                if (responseData && Array.isArray(responseData.data)) {
                    // Standard PaginatedResponse wrapped in success/data
                    this.categories.set(responseData.data);
                    this.pagination.set(responseData.meta);
                } else if (Array.isArray(responseData)) {
                    // Flat array wrapped in success/data
                    this.categories.set(responseData);
                    this.pagination.set(null);
                } else {
                    this.categories.set([]);
                    this.pagination.set(null);
                }

                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las categorías. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    toggleStatus(category: CategoryResource) {
        this.categoryApi.toggleStatus(category.id).subscribe({
            next: (res) => {
                toast.success(res.message);
                this.loadCategories();
            },
            error: () => toast.error('Error al actualizar estado'),
        });
    }

    confirmDeleteCategory(category: CategoryResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Categoría',
            zContent: `¿Estás seguro de que deseas eliminar la categoría <strong>${category.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.categoryApi.deleteCategory(category.id).subscribe({
                    next: () => {
                        toast.success('Categoría eliminada');
                        this.loadCategories();
                    },
                    error: () => toast.error('No se pudo eliminar la categoría'),
                });
            },
        });
    }
}
