import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField, DefaultOption } from '@/shared/components/form-create-edit';
import { UnitOfMeasureApi } from '@/core/services/api/unit-measure.api';
import { UnitOfMeasureResource, UnitOfMeasureFormOptions } from '@/core/models';

@Component({
    selector: 'app-unidades-medida-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...FormCreateEditImports,
    ],
    templateUrl: './unidades-medida-create-edit.html',
    styleUrl: './unidades-medida-create-edit.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UnidadesMedidaCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly unitApi = inject(UnitOfMeasureApi);

    readonly isSubmitting = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly unitId = signal<string | null>(null);
    readonly initialData = signal<UnitOfMeasureResource | undefined>(undefined);

    readonly formOptions = signal<UnitOfMeasureFormOptions | null>(null);

    readonly unitFormFields = computed<DynamicField[]>(() => {
        const options = this.formOptions();

        const familyOptions: DefaultOption[] = options?.families.map(f => ({ label: f, value: f })) || [];
        const baseUnitOptions: DefaultOption[] = options?.unit_of_measures.map(u => ({ label: u.name, value: u.id.toString() })) || [];

        return [
            {
                name: 'name',
                label: 'Nombre de la Unidad',
                type: 'text',
                placeholder: 'Ej. Kilogramos',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 2,
            },
            {
                name: 'symbol',
                label: 'Símbolo',
                type: 'text',
                placeholder: 'Ej. kg',
                validators: [Validators.maxLength(50)],
                colSpan: 1,
            },
            {
                name: 'family',
                label: 'Familia',
                type: 'select',
                options: familyOptions,
                validators: [Validators.required],
                colSpan: 1,
            },
            {
                name: 'base_unit_id',
                label: 'Unidad Base',
                type: 'select',
                options: [{ label: 'Ninguna (Es Unidad Base)', value: '' }, ...baseUnitOptions],
                colSpan: 1,
            },
            {
                name: 'factor',
                label: 'Factor de Conversión',
                type: 'number',
                validators: [Validators.min(1e-8)],
                defaultValue: 1,
                colSpan: 1,
            },
            {
                name: 'is_active',
                label: 'Unidad Activa',
                type: 'boolean',
                defaultValue: true,
                colSpan: 1,
            },
        ];
    });

    ngOnInit() {
        this.loadFormOptions();

        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.unitId.set(id);
                this.loadUnitData(id);
            }
        });
    }

    private loadFormOptions() {
        this.unitApi.getFormOptions().subscribe({
            next: (res) => this.formOptions.set(res),
            error: () => toast.error('Error al cargar opciones del formulario'),
        });
    }

    private loadUnitData(id: string) {
        this.isLoading.set(true);
        this.unitApi.getUnit(id).subscribe({
            next: (res) => {
                // En select de FormCreateEditComponent el valor debe ser string si el value del option es string
                const data = {
                    ...res.data,
                    base_unit_id: res.data.base_unit_id?.toString() || ''
                };
                this.initialData.set(data as any);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                toast.error('Error al cargar unidad de medida');
                this.router.navigate(['/sistema/unidades-medida']);
            },
        });
    }

    onFormSubmit(data: any) {
        this.isSubmitting.set(true);
        this.error.set(null);

        // Convert empty string back to null for base_unit_id
        if (data.base_unit_id === '') {
            data.base_unit_id = null;
        }

        const id = this.unitId();
        const request = id ? this.unitApi.updateUnit(id, data) : this.unitApi.createUnit(data);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message);
                this.router.navigate(['/sistema/unidades-medida']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message || 'Error al guardar la unidad de medida';
                this.error.set(msg);
                toast.error('Error', { description: msg });
            },
        });
    }

    onCancel() {
        this.router.navigate(['/sistema/unidades-medida']);
    }
}
