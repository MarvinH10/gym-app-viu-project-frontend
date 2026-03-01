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
import { WarehouseApi } from '@/core/services/api/warehouse.api';
import { WarehouseResource, WarehouseFormOptions } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
  selector: 'app-almacen-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './almacen-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlmacenCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly warehouseApi = inject(WarehouseApi);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly warehouseId = signal<string | null>(null);
  readonly initialData = signal<WarehouseResource | undefined>(undefined);

  readonly formOptions = signal<WarehouseFormOptions | null>(null);

  readonly warehouseFormFields = computed<DynamicField[]>(() => {
    const options = this.formOptions();
    const isEdit = !!this.warehouseId();

    const companyOptions: DefaultOption[] =
      options?.companies.map((c) => ({ label: c.business_name, value: String(c.id) })) || [];

    const fields: DynamicField[] = [
      {
        name: 'name',
        label: 'Nombre del Almacén',
        type: 'text',
        placeholder: 'Ej. Almacén Central, Depósito Norte',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'location',
        label: 'Ubicación',
        type: 'textarea',
        placeholder: 'Dirección o descripción de la ubicación...',
        validators: [Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'company_id',
        label: 'Compañía',
        type: 'select',
        options: companyOptions,
        placeholder: 'Selecciona una compañía',
        validators: [Validators.required],
        colSpan: 1,
      },
    ];

    if (isEdit) {
      fields.push({
        name: 'is_active',
        label: 'Estado Activo',
        type: 'switch',
        defaultValue: true,
        colSpan: 1,
      });
    }

    return fields;
  });

  ngOnInit() {
    this.loadFormOptions();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.warehouseId.set(id);
        this.loadWarehouseData(id);
      }
    });
  }

  private loadFormOptions() {
    this.warehouseApi.getFormOptions().subscribe({
      next: (res) => this.formOptions.set(res.data),
      error: () => toast.error('Error al cargar opciones de compañías'),
    });
  }

  private loadWarehouseData(id: string) {
    this.isLoading.set(true);
    this.warehouseApi.getWarehouse(id).subscribe({
      next: (res) => {
        const data = {
          ...res.data,
          company_id: res.data.company_id.toString(),
        };
        this.initialData.set(data as any);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error('Error al cargar datos del almacén');
        this.router.navigate(['/inventario/almacen']);
      },
    });
  }

  onFormSubmit(formData: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.warehouseId();
    const payload = {
      ...formData,
      company_id: Number(formData.company_id),
    };

    const request = id
      ? this.warehouseApi.updateWarehouse(id, payload)
      : this.warehouseApi.createWarehouse(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(res.message);
        this.router.navigate(['/inventario/almacen']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar el almacén';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/inventario/almacen']);
  }
}
