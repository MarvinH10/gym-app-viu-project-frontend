import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import {
  FormCreateEditImports,
  DynamicField,
  DefaultOption,
} from '@/shared/components/form-create-edit';
import { SupplierApi } from '@/core/services/api/supplier.api';
import { CompanyApi } from '@/core/services/api/company.api';
import { SupplierResource, SupplierFormOptions } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
  selector: 'app-proveedor-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './proveedor-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProveedorCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly supplierApi = inject(SupplierApi);
  private readonly companyApi = inject(CompanyApi);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly supplierId = signal<string | null>(null);
  readonly initialData = signal<any | undefined>(undefined);

  readonly formOptions = signal<SupplierFormOptions | null>(null);

  readonly supplierFormFields = computed<DynamicField[]>(() => {
    const options = this.formOptions();

    const companyOptions: DefaultOption[] =
      options?.companies.map((c) => ({ label: c.business_name, value: String(c.id) })) || [];

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
        label: 'Número de Documento',
        type: 'text',
        placeholder: 'Ej. 12345678',
        validators: [Validators.required, Validators.maxLength(20)],
        colSpan: 1,
      },
      {
        name: 'name',
        label: 'Nombre Comercial / Razón Social',
        type: 'text',
        placeholder: 'Ej. Corporación Acme S.A.C.',
        validators: [Validators.required, Validators.maxLength(200)],
        colSpan: 2,
      },
      {
        name: 'email',
        label: 'Correo Electrónico',
        type: 'text',
        placeholder: 'proveedor@ejemplo.com',
        validators: [Validators.email, Validators.maxLength(100)],
        colSpan: 1,
      },
      {
        name: 'phone',
        label: 'Teléfono Fijo',
        type: 'text',
        validators: [Validators.maxLength(20)],
        colSpan: 1,
      },
      {
        name: 'mobile',
        label: 'Celular',
        type: 'text',
        validators: [Validators.maxLength(20)],
        colSpan: 1,
      },
      {
        name: 'company_id',
        label: 'Asociar a Compañía',
        type: 'select',
        options: companyOptions,
        placeholder: 'Selecciona una compañía',
        colSpan: 1,
      },
      {
        name: 'address',
        label: 'Dirección Fiscal',
        type: 'text',
        colSpan: 2,
      },
      {
        name: 'payment_terms',
        label: 'Días de Crédito (Términos)',
        type: 'number',
        validators: [Validators.min(0)],
        colSpan: 1,
      },
      {
        name: 'provider_category',
        label: 'Categoría de Proveedor',
        type: 'text',
        placeholder: 'Ej. Insumos, Servicios, etc.',
        colSpan: 1,
      },
      {
        name: 'status',
        label: 'Estado Inicial',
        type: 'select',
        options: [
          { label: 'Activo', value: 'active' },
          { label: 'Inactivo', value: 'inactive' },
          { label: 'Suspendido', value: 'suspended' },
          { label: 'Lista Negra', value: 'blacklisted' },
        ],
        defaultValue: 'active',
        colSpan: 1,
      },
      {
        name: 'notes',
        label: 'Notas Adicionales',
        type: 'textarea',
        colSpan: 2,
      },
    ];
  });

  ngOnInit() {
    this.loadFormOptions();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.supplierId.set(id);
        this.loadSupplierData(id);
      }
    });
  }

  private loadFormOptions() {
    // Skipping supplierApi.getFormOptions() due to 500 error, using fallback
    this.companyApi.getCompanies({ per_page: 100 }).subscribe({
      next: (res: any) => {
        this.formOptions.set({
          companies: res.data || res.data?.data || []
        });
      },
      error: () => toast.error('Error al cargar compañías para el proveedor')
    });
  }

  private loadSupplierData(id: string) {
    this.isLoading.set(true);
    this.supplierApi.getSupplier(id).subscribe({
      next: (res) => {
        const data = {
          ...res.data,
          name: res.data.name || res.data.business_name || res.data.display_name || '',
          company_id: res.data.company_id?.toString(),
        };
        this.initialData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error('Error al cargar datos');
        this.onCancel();
      },
    });
  }

  onFormSubmit(formData: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const payload = {
      ...formData,
      company_id: formData.company_id ? Number(formData.company_id) : null,
      payment_terms: formData.payment_terms ? Number(formData.payment_terms) : null,
    };

    const id = this.supplierId();
    const request = id
      ? this.supplierApi.updateSupplier(id, payload)
      : this.supplierApi.createSupplier(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(res.message || 'Procesado con éxito');
        this.onCancel();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/compras/proveedores']);
  }
}
