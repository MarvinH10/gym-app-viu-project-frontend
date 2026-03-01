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
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { CompanyApi } from '@/core/services/api/company.api';
import { CompanyResource } from '@/core/models';

@Component({
  selector: 'app-company-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './company-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companyApi = inject(CompanyApi);

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly companyId = signal<string | null>(null);
  readonly initialData = signal<CompanyResource | undefined>(undefined);
  readonly parentCompanies = signal<CompanyResource[]>([]);

  ngOnInit() {
    this.loadFormOptions();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.companyId.set(id);
        this.loadCompany(id);
      }
    });
  }

  private loadFormOptions() {
    this.companyApi.getFormOptions().subscribe({
      next: (res) => this.parentCompanies.set(res.data?.parent_companies || []),
      error: () => toast.error('Error al cargar opciones del formulario'),
    });
  }

  private loadCompany(id: string) {
    this.loading.set(true);
    this.companyApi.getCompany(id).subscribe({
      next: (res) => {
        this.initialData.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Error al cargar la compañía');
        this.router.navigate(['/sistema/companias']);
      },
    });
  }

  readonly companyFormFields = computed<DynamicField[]>(() => {
    const isEdit = !!this.companyId();
    const parentOptions: DefaultOption[] = [
      { label: 'Ninguna (Es Casa Matriz)', value: '' },
      ...this.parentCompanies().map((c) => ({
        label: c.business_name,
        value: c.id.toString(),
      })),
    ];

    const fields: DynamicField[] = [
      {
        name: 'business_name',
        label: 'Razón Social',
        type: 'text',
        placeholder: 'Ej. Mi Empresa S.A.C.',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'trade_name',
        label: 'Nombre Comercial',
        type: 'text',
        placeholder: 'Ej. Mi Marca',
        validators: [Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'ruc',
        label: 'RUC',
        type: 'text',
        placeholder: 'Ej. 20123456789',
        validators: [Validators.required, Validators.minLength(11), Validators.maxLength(11)],
        colSpan: 1,
      },
      {
        name: 'branch_code',
        label: 'Código de Sucursal',
        type: 'text',
        placeholder: 'Ej. 0001',
        validators: [Validators.maxLength(10)],
        colSpan: 1,
      },
      {
        name: 'parent_id',
        label: 'Compañía Padre',
        type: 'select',
        options: parentOptions,
        defaultValue: '',
        colSpan: 1,
      },
      {
        name: 'ubigeo',
        label: 'Ubigeo',
        type: 'text',
        placeholder: 'Ej. 150101',
        validators: [Validators.maxLength(6)],
        colSpan: 1,
      },
      {
        name: 'email',
        label: 'Correo Electrónico',
        type: 'email',
        placeholder: 'correo@ejemplo.com',
        validators: [Validators.email, Validators.maxLength(255)],
        colSpan: 1,
      },
      {
        name: 'phone',
        label: 'Teléfono / Celular',
        type: 'text',
        placeholder: 'Ej. 987654321',
        validators: [Validators.maxLength(20)],
        colSpan: 1,
      },
      {
        name: 'address',
        label: 'Dirección Fiscal',
        type: 'text',
        placeholder: 'Ej. Av. Las Flores 123...',
        validators: [Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'is_main',
        label: '¿Es Compañía Principal?',
        type: 'switch',
        colSpan: 1,
      },
    ];

    if (isEdit) {
      fields.push({
        name: 'active',
        label: 'Estado de la Compañía',
        type: 'switch',
        defaultValue: true,
        colSpan: 1,
      });
    }

    return fields;
  });

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.companyId();
    const payload = {
      business_name: data.business_name,
      trade_name: data.trade_name || null,
      ruc: data.ruc,
      branch_code: data.branch_code || null,
      parent_id: data.parent_id ? Number(data.parent_id) : null,
      ubigeo: data.ubigeo || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      is_main: !!data.is_main,
      active: id ? (data.active === undefined ? true : data.active) : true,
    };

    const request = id
      ? this.companyApi.updateCompany(id, payload)
      : this.companyApi.createCompany(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(id ? 'Compañía actualizada' : 'Compañía creada');
        this.router.navigate(['/sistema/companias']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar la compañía';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/sistema/companias']);
  }
}
