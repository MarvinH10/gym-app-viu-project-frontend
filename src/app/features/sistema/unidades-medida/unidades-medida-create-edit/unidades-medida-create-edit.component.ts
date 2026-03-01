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
import { UnitOfMeasureApi } from '@/core/services/api/unit-measure.api';
import { UnitOfMeasureResource, UnitOfMeasureFormOptions } from '@/core/models';

@Component({
  selector: 'app-unidades-medida-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './unidades-medida-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UnidadesMedidaCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly unitApi = inject(UnitOfMeasureApi);

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly unitId = signal<string | null>(null);
  readonly initialData = signal<UnitOfMeasureResource | undefined>(undefined);

  readonly formOptions = signal<UnitOfMeasureFormOptions | null>(null);

  readonly unitFormFields = computed<DynamicField[]>(() => {
    const options = this.formOptions();
    const isEdit = !!this.unitId();

    const familyOptions: DefaultOption[] =
      options?.families.map((f) => ({ label: f, value: f })) || [];
    const baseUnitOptions: DefaultOption[] =
      options?.unit_of_measures.map((u) => ({ label: u.name, value: u.id.toString() })) || [];

    const fields: DynamicField[] = [
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
        validators: [Validators.required, Validators.maxLength(50)],
        colSpan: 1,
      },
      {
        name: 'family',
        label: 'Familia',
        type: 'select',
        options: familyOptions,
        validators: [Validators.required],
        defaultValue: '',
        colSpan: 1,
      },
      {
        name: 'base_unit_id',
        label: 'Unidad Base',
        type: 'select',
        options: [{ label: 'Ninguna (Es Unidad Base)', value: '' }, ...baseUnitOptions],
        defaultValue: '',
        colSpan: 1,
      },
      {
        name: 'factor',
        label: 'Factor de Conversión',
        type: 'number',
        validators: [Validators.required, Validators.min(1e-8)],
        defaultValue: 1,
        colSpan: 1,
      },
    ];

    if (isEdit) {
      fields.push({
        name: 'is_active',
        label: 'Unidad Activa',
        type: 'switch',
        defaultValue: true,
        validators: [Validators.required],
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
    this.loading.set(true);
    this.unitApi.getUnit(id).subscribe({
      next: (res) => {
        // En select de FormCreateEditComponent el valor debe ser string si el value del option es string
        const data = {
          ...res.data,
          base_unit_id: res.data.base_unit_id?.toString() || '',
        };
        this.initialData.set(data as any);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
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
    const payload = id ? data : { ...data, is_active: true };
    const request = id ? this.unitApi.updateUnit(id, payload) : this.unitApi.createUnit(payload);

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
