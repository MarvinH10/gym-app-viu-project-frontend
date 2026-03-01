import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CategoryApi } from '@/core/services/api/category.api';
import { CategoryResource } from '@/core/models';

@Component({
    selector: 'app-categoria-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...FormDetailImports,
    ],
    templateUrl: './categoria-detail.html',
    styleUrl: './categoria-detail.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoriaDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly categoryApi = inject(CategoryApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly category = signal<CategoryResource | null>(null);
    readonly isLoading = signal(true);
    readonly isDeleting = signal(false);

    readonly detailSections: DetailSection[] = [
        {
            title: 'Información General',
            fields: [
                { name: 'name', label: 'Nombre de la Categoría', colSpan: 2 },
                { name: 'full_name', label: 'Ruta Completa', colSpan: 2 },
                { name: 'description', label: 'Descripción', colSpan: 2, fallback: 'Sin descripción' },
            ],
        },
        {
            title: 'Configuración',
            fields: [
                { name: 'is_active', label: 'Estado Activo', type: 'boolean' },
                { name: 'parent_id', label: 'ID de Padre', fallback: 'Nivel Root (Principal)' },
            ],
        },
        {
            title: 'Auditoría',
            fields: [
                { name: 'created_at', label: 'Fecha de Creación', type: 'datetime' },
                { name: 'updated_at', label: 'Última Actualización', type: 'datetime' },
            ],
        },
    ];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/inventario/categorias']);
            return;
        }
        this.categoryApi.getCategory(id).subscribe({
            next: (res) => {
                this.category.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                toast.error('No se encontró la categoría');
                this.router.navigate(['/inventario/categorias']);
            },
        });
    }

    goToEdit() {
        const id = this.category()?.id;
        if (id) this.router.navigate(['/inventario/categorias', id, 'edit']);
    }

    confirmDelete() {
        const c = this.category();
        if (!c) return;

        this.alertDialog.confirm({
            zTitle: 'Eliminar Categoría',
            zContent: `¿Estás seguro de que deseas eliminar la categoría <strong>${c.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.isDeleting.set(true);
                this.categoryApi.deleteCategory(c.id).subscribe({
                    next: () => {
                        toast.success('Categoría eliminada');
                        this.router.navigate(['/inventario/categorias']);
                    },
                    error: () => {
                        this.isDeleting.set(false);
                        toast.error('Error al eliminar la categoría');
                    },
                });
            },
        });
    }
}
