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
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { AttributeApi } from '@/core/services/api/attribute.api';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
  selector: 'app-atributo-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './atributo-create-edit.html',
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
            const data = {
              ...res.data,
              values: res.data.values?.map((v) => v.value) || [],
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

  readonly attributeFormFields = computed<DynamicField[]>(() => {
    const isEdit = !!this.attributeId();

    const fields: DynamicField[] = [
      {
        name: 'name',
        label: 'Nombre del Atributo',
        type: 'text',
        placeholder: 'Ej. Color, Talla, Material',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'values',
        label: 'Valores / Variantes',
        type: 'tags',
        placeholder: 'Escribe un valor y presiona Enter...',
        colSpan: 2,
        defaultValue: [],
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

  onFormSubmit(formData: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const payload = {
      name: formData.name,
      is_active: formData.is_active ?? true,
      values: formData.values || [],
    };

    const id = this.attributeId();
    const request = id
      ? this.attributeApi.updateAttribute(id, payload)
      : this.attributeApi.createAttribute(payload);

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
