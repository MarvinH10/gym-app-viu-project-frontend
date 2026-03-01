import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { CustomerApi } from '@/core/services/api/customer.api';
import { CustomerResource } from '@/core/models';

@Component({
    selector: 'app-cliente-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ...ZardSkeletonImports,
        ...FormCreateEditImports,
    ],
    templateUrl: './cliente-create-edit.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClienteCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly customerApi = inject(CustomerApi);

    readonly isSubmitting = signal(false);
    readonly loading = signal(false);
    readonly customerId = signal<string | null>(null);
    readonly initialData = signal<CustomerResource | undefined>(undefined);

    readonly isEdit = computed(() => !!this.customerId());

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.customerId.set(id);
                this.loading.set(true);
                this.customerApi.getCustomer(id).subscribe({
                    next: (res) => {
                        this.initialData.set(res.data);
                        this.loading.set(false);
                    },
                    error: () => {
                        this.loading.set(false);
                        toast.error('Error al cargar cliente');
                        this.router.navigate(['/ventas/clientes']);
                    },
                });
            }
        });
    }

    get formFields(): DynamicField[] {
        return [
            {
                name: 'document_type',
                label: 'Tipo de Documento',
                type: 'select',
                options: [
                    { label: 'DNI', value: 'DNI' },
                    { label: 'RUC', value: 'RUC' },
                    { label: 'CE', value: 'CE' },
                    { label: 'Pasaporte', value: 'Passport' },
                ],
                validators: [Validators.required],
                colSpan: 1,
            },
            {
                name: 'document_number',
                label: 'Nro. de Documento',
                type: 'text',
                placeholder: 'Ej. 70123456',
                validators: [Validators.required, Validators.maxLength(20)],
                colSpan: 1,
            },
            {
                name: 'name',
                label: 'Nombre completo',
                type: 'text',
                placeholder: 'Ej. Juan Pérez López',
                validators: [Validators.required, Validators.maxLength(200)],
                colSpan: 2,
            },
            {
                name: 'email',
                label: 'Correo Electrónico',
                type: 'text',
                placeholder: 'ejemplo@correo.com',
                validators: [Validators.email, Validators.maxLength(100)],
                colSpan: 1,
            },
            {
                name: 'phone',
                label: 'Teléfono Fijo',
                type: 'text',
                placeholder: 'Ej. 01 1234567',
                validators: [Validators.maxLength(20)],
                colSpan: 1,
            },
            {
                name: 'mobile',
                label: 'Celular',
                type: 'text',
                placeholder: 'Ej. 987654321',
                validators: [Validators.maxLength(20)],
                colSpan: 1,
            },
            {
                name: 'birth_date',
                label: 'Fecha de Nacimiento',
                type: 'date',
                validators: [Validators.required],
                colSpan: 1,
            },
            {
                name: 'gender',
                label: 'Género',
                type: 'select',
                options: [
                    { label: 'Masculino', value: 'M' },
                    { label: 'Femenino', value: 'F' },
                    { label: 'Otro', value: 'Other' },
                ],
                colSpan: 1,
            },
            {
                name: 'status',
                label: 'Estado del Cliente',
                type: 'select',
                defaultValue: 'active',
                options: [
                    { label: 'Activo', value: 'active' },
                    { label: 'Inactivo', value: 'inactive' },
                    { label: 'Suspendido', value: 'suspended' },
                    { label: 'Lista Negra', value: 'blacklisted' },
                ],
                validators: [Validators.required],
                colSpan: 1,
            },
            {
                name: 'address',
                label: 'Dirección',
                type: 'text',
                placeholder: 'Av. Las Gardenias 123...',
                colSpan: 2,
            },
            {
                name: 'notes',
                label: 'Notas Adicionales',
                type: 'textarea',
                placeholder: 'Comentarios sobre el cliente...',
                colSpan: 2,
            },
        ];
    }

    onFormSubmit(data: any) {
        this.isSubmitting.set(true);

        const id = this.customerId();
        const request = id ? this.customerApi.updateCustomer(id, data) : this.customerApi.createCustomer(data);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message || 'Cliente guardado correctamente');
                this.router.navigate(['/ventas/clientes']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message || 'Error al guardar el cliente';
                toast.error('Error', { description: msg });
            },
        });
    }

    onCancel() {
        this.router.navigate(['/ventas/clientes']);
    }
}
