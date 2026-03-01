import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { CategoryApi } from '@/core/services/api/category.api';
import { CategoryResource } from '@/core/models';

@Component({
    selector: 'app-categoria-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...FormCreateEditImports,
    ],
    templateUrl: './categoria-create-edit.html',
    styleUrl: './categoria-create-edit.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoriaCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly categoryApi = inject(CategoryApi);

    readonly isSubmitting = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly categoryId = signal<string | null>(null);
    readonly initialData = signal<any | undefined>(undefined);
    readonly parentCategories = signal<{ id: number; name: string }[]>([]);

    ngOnInit() {
        this.loadFormOptions();

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.categoryId.set(id);
                this.loadCategory(id);
            }
        });
    }

    loadFormOptions() {
        this.categoryApi.getFormOptions().subscribe({
            next: (res) => {
                this.parentCategories.set(
                    res.data.parent_categories.map(c => ({ id: c.id, name: c.full_name || c.name }))
                );
            }
        });
    }

    loadCategory(id: string) {
        this.isLoading.set(true);
        this.categoryApi.getCategory(id).subscribe({
            next: (res) => {
                this.initialData.set(res.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                toast.error('Error al cargar categoría');
                this.router.navigate(['/inventario/categorias']);
            },
        });
    }

    get categoryFormFields(): DynamicField[] {
        return [
            {
                name: 'name',
                label: 'Nombre de la Categoría',
                type: 'text',
                placeholder: 'Ej. Suplementos, Accesorios',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 2,
            },
            {
                name: 'parent_id',
                label: 'Categoría Padre',
                type: 'select',
                placeholder: 'Selecciona una categoría padre (Opcional)',
                options: this.parentCategories().map(c => ({ label: c.name, value: String(c.id) })),
                colSpan: 2,
            },
            {
                name: 'description',
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Breve descripción de la categoría...',
                colSpan: 2,
            },
            {
                name: 'is_active',
                label: 'Categoría Activa',
                type: 'boolean',
                defaultValue: true,
                colSpan: 1,
            },
        ];
    }

    onFormSubmit(formData: any) {
        this.isSubmitting.set(true);
        this.error.set(null);

        const id = this.categoryId();
        const request = id ? this.categoryApi.updateCategory(id, formData) : this.categoryApi.createCategory(formData);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message);
                this.router.navigate(['/inventario/categorias']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message || 'Error al guardar la categoría';
                this.error.set(msg);
                toast.error('Error', { description: msg });
            },
        });
    }

    onCancel() {
        this.router.navigate(['/inventario/categorias']);
    }
}
