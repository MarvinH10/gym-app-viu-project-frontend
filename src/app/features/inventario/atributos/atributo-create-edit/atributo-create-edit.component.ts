import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { AttributeApi } from '@/core/services/api/attribute.api';
import { AttributeResource } from '@/core/models';

@Component({
    selector: 'app-atributo-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...FormCreateEditImports,
    ],
    templateUrl: './atributo-create-edit.html',
    styleUrl: './atributo-create-edit.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AtributoCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly attributeApi = inject(AttributeApi);

    readonly isSubmitting = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly attributeId = signal<string | null>(null);
    readonly initialData = signal<any | undefined>(undefined);

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.attributeId.set(id);
                this.isLoading.set(true);
                this.attributeApi.getAttribute(id).subscribe({
                    next: (res) => {
                        // Transform values array to string for textarea
                        const data = {
                            ...res.data,
                            values_raw: res.data.values?.map(v => v.value).join('\n')
                        };
                        this.initialData.set(data);
                        this.isLoading.set(false);
                    },
                    error: () => {
                        this.isLoading.set(false);
                        toast.error('Error al cargar atributo');
                        this.router.navigate(['/inventario/atributos']);
                    },
                });
            }
        });
    }

    get attributeFormFields(): DynamicField[] {
        return [
            {
                name: 'name',
                label: 'Nombre del Atributo',
                type: 'text',
                placeholder: 'Ej. Color, Talla, Material',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 2,
            },
            {
                name: 'values_raw',
                label: 'Valores / Variantes',
                type: 'textarea',
                placeholder: 'Ingresa un valor por línea...\nEj:\nRojo\nAzul\nVerde',
                colSpan: 2,
            },
            {
                name: 'is_active',
                label: 'Atributo Activo',
                type: 'boolean',
                defaultValue: true,
                colSpan: 1,
            },
        ];
    }

    onFormSubmit(formData: any) {
        this.isSubmitting.set(true);
        this.error.set(null);

        // Transform values_raw back to array
        const values = formData.values_raw
            ? formData.values_raw.split('\n').map((v: string) => v.trim()).filter((v: string) => v.length > 0)
            : [];

        const payload = {
            name: formData.name,
            is_active: formData.is_active,
            values: values
        };

        const id = this.attributeId();
        const request = id ? this.attributeApi.updateAttribute(id, payload) : this.attributeApi.createAttribute(payload);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message);
                this.router.navigate(['/inventario/atributos']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message || 'Error al guardar el atributo';
                this.error.set(msg);
                toast.error('Error', { description: msg });
            },
        });
    }

    onCancel() {
        this.router.navigate(['/inventario/atributos']);
    }
}
