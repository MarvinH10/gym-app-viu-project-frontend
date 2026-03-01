import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { UnitMeasureApi } from '@/core/services/api/unit-measure.api';
import { UnitMeasureResource } from '@/core/models';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UnidadesMedidaCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly unitApi = inject(UnitMeasureApi);

    readonly isSubmitting = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly unitId = signal<string | null>(null);
    readonly initialData = signal<UnitMeasureResource | undefined>(undefined);
    readonly families = signal<{ label: string; value: string }[]>([]);
    readonly baseUnits = signal<{ label: string; value: string }[]>([]);

    ngOnInit() {
        this.loadOptions();
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.unitId.set(id);
                this.isLoading.set(true);
                this.unitApi.getUnit(id).subscribe({
                    next: (res) => {
                        this.initialData.set(res.data);
                        this.isLoading.set(false);
                    },
                    error: () => {
                        this.isLoading.set(false);
                        toast.error('Error al cargar la unidad de medida');
                        this.router.navigate(['/sistema/unidades-medida']);
                    },
                });
            }
        });
    }

    loadOptions() {
        this.unitApi.getFormOptions().subscribe({
            next: (res) => {
                // According to the JSON, families is a string? "families": "string"
                // But usually it should be a list. If it's a string, maybe it's a comma separated list or just one.
                // I'll assume it's a string from the API spec provided in the prompt.
                // Wait, the prompt says: "families": "string" required.
                // And unit_of_measures: array[UnitOfMeasureResource]

                // I'll handle families as a single option or split if it looks like a list.
                // For now let's assume it's a string and we'll see.
                const familyList = res.families ? [{ label: res.families, value: res.families }] : [];
                this.families.set(familyList);

                const units = res.unit_of_measures.map(u => ({
                    label: `${u.name} (${u.symbol || 'N/A'})`,
                    value: u.id.toString()
                }));
                this.baseUnits.set(units);
            }
        });
    }

    get formFields(): DynamicField[] {
        return [
            {
                name: 'name',
                label: 'Nombre de la Unidad',
                type: 'text',
                placeholder: 'Ej. Kilogramos',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 1,
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
                type: 'text', // The user can type if options are limited
                placeholder: 'Ej. Peso, Longitud...',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 1,
            },
            {
                name: 'base_unit_id',
                label: 'Unidad Base',
                type: 'select',
                options: this.baseUnits(),
                placeholder: 'Seleccione unidad base (opcional)',
                colSpan: 1,
            },
            {
                name: 'factor',
                label: 'Factor de Conversión',
                type: 'number',
                defaultValue: 1,
                validators: [Validators.required, Validators.min(0.00000001)],
                colSpan: 1,
            },
            {
                name: 'is_active',
                label: 'Estado Activo',
                type: 'boolean',
                defaultValue: true,
                colSpan: 1,
            },
        ];
    }

    onFormSubmit(data: any) {
        this.isSubmitting.set(true);
        this.error.set(null);

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
