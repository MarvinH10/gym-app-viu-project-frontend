import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { JournalApi } from '@/core/services/api/journal.api';
import { CompanyApi } from '@/core/services/api/company.api';
import { JournalResource } from '@/core/models';
import { ZardButtonComponent } from '@/shared/components/button/button.component';

@Component({
    selector: 'app-journal-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        ZardIconComponent,
        ZardButtonComponent,
        ...ZardSkeletonImports,
        ...FormCreateEditImports,
    ],
    templateUrl: './journal-create-edit.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class JournalCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly journalApi = inject(JournalApi);
    private readonly companyApi = inject(CompanyApi);

    readonly isSubmitting = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);
    readonly journalId = signal<string | null>(null);
    readonly initialData = signal<any | undefined>(undefined);
    readonly companies = signal<{ label: string; value: any }[]>([]);

    ngOnInit() {
        this.loadFormOptions();
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.journalId.set(id);
                this.isLoading.set(true);
                this.journalApi.getJournal(id).subscribe({
                    next: (res) => {
                        const data = {
                            ...res.data,
                            sequence_size: res.data.sequence?.sequence_size,
                            step: res.data.sequence?.step,
                            next_number: res.data.sequence?.next_number,
                        };
                        this.initialData.set(data);
                        this.isLoading.set(false);
                    },
                    error: () => {
                        this.isLoading.set(false);
                        toast.error('Error al cargar diario');
                        this.router.navigate(['/sistema/diarios']);
                    },
                });
            }
        });
    }

    loadFormOptions() {
        // Intentamos obtener opciones específicas de diarios
        this.journalApi.getFormOptions().subscribe({
            next: (res: any) => {
                const companies = res.data?.companies || res.companies || [];
                const options = companies.map((c: any) => ({
                    label: c.business_name || c.name,
                    value: c.id,
                }));
                this.companies.set(options);
            },
            error: () => {
                // Fallback: Cargar compañías directamente
                this.companyApi.getCompanies({ per_page: 100 }).subscribe({
                    next: (res) => {
                        const options = res.data.map((c: any) => ({
                            label: c.business_name || c.name,
                            value: c.id,
                        }));
                        this.companies.set(options);
                    },
                    error: () => toast.error('Error al cargar sedes del sistema'),
                });
            },
        });
    }

    readonly journalFormFields = computed<DynamicField[]>(() => {
        const isEdit = !!this.journalId();
        const fields: DynamicField[] = [
            {
                name: 'name',
                label: 'Nombre del Diario',
                type: 'text',
                placeholder: 'Ej. Diario de Ventas Principal',
                validators: [Validators.required, Validators.maxLength(255)],
                colSpan: 2,
            },
            {
                name: 'code',
                label: 'Código',
                type: 'text',
                placeholder: 'Ej. VENT01',
                validators: [Validators.required, Validators.maxLength(10)],
                colSpan: 1,
            },
            {
                name: 'type',
                label: 'Tipo de Diario',
                type: 'select',
                options: [
                    { label: 'Venta', value: 'sale' },
                    { label: 'Compra', value: 'purchase' },
                    { label: 'Orden Compra', value: 'purchase-order' },
                    { label: 'Cotización', value: 'quote' },
                    { label: 'Efectivo', value: 'cash' },
                ],
                validators: [Validators.required],
                colSpan: 1,
            },
            {
                name: 'is_fiscal',
                label: '¿Es Comprobante Fiscal?',
                type: 'switch',
                colSpan: 1,
            },
            {
                name: 'document_type_code',
                label: 'Código Tipo Documento',
                type: 'text',
                placeholder: 'Ej. 01',
                validators: [Validators.maxLength(2)],
                colSpan: 1,
            },
            {
                name: 'company_id',
                label: 'Sede / Empresa',
                type: 'select',
                options: this.companies(),
                validators: [Validators.required],
                colSpan: 2,
            },
            {
                name: 'sequence_size',
                label: 'Tamaño de Secuencia (Dígitos)',
                type: 'number',
                placeholder: 'Ej. 8',
                validators: [Validators.min(4), Validators.max(12)],
                colSpan: 1,
            },
            {
                name: 'step',
                label: 'Incremento (Paso)',
                type: 'number',
                placeholder: 'Ej. 1',
                validators: [Validators.min(1)],
                colSpan: 1,
            },
            {
                name: 'next_number',
                label: 'Siguiente Número',
                type: 'number',
                placeholder: 'Ej. 1',
                validators: [Validators.min(1)],
                colSpan: 2,
            },
        ];

        return fields;
    });

    onFormSubmit(data: any) {
        this.isSubmitting.set(true);
        this.error.set(null);

        const id = this.journalId();
        const request = id ? this.journalApi.updateJournal(id, data) : this.journalApi.createJournal(data);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message);
                this.router.navigate(['/sistema/diarios']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message || 'Error al guardar el diario';
                this.error.set(msg);
                toast.error('Error', { description: msg });
            },
        });
    }

    onCancel() {
        this.router.navigate(['/sistema/diarios']);
    }
}
