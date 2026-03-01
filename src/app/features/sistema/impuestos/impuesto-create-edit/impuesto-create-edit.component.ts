import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { TaxApi } from '@/core/services/api/tax.api';
import { TaxResource } from '@/core/models';

@Component({
  selector: 'app-impuesto-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './impuesto-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImpuestoCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taxApi = inject(TaxApi);

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly taxId = signal<string | null>(null);
  readonly initialData = signal<TaxResource | undefined>(undefined);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.taxId.set(id);
        this.loading.set(true);
        this.taxApi.getTax(id).subscribe({
          next: (res) => {
            this.initialData.set(res.data);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            toast.error('Error al cargar impuesto');
            this.router.navigate(['/sistema/impuestos']);
          },
        });
      }
    });
  }

  get taxFormFields(): DynamicField[] {
    const isEdit = !!this.taxId();
    const fields: DynamicField[] = [
      {
        name: 'name',
        label: 'Nombre del Impuesto',
        type: 'text',
        placeholder: 'Ej. IGV 18%',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Detalles adicionales...',
        validators: [Validators.required],
        colSpan: 2,
      },
      {
        name: 'invoice_label',
        label: 'Etiqueta en Factura',
        type: 'text',
        placeholder: 'Ej. IGV',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 1,
      },
      {
        name: 'tax_type',
        label: 'Tipo de Impuesto',
        type: 'text',
        validators: [Validators.required],
        colSpan: 1,
      },
      {
        name: 'affectation_type_code',
        label: 'Código Tipo Afectación',
        type: 'text',
        validators: [Validators.required, Validators.maxLength(10)],
        colSpan: 1,
      },
      {
        name: 'rate_percent',
        label: 'Tasa / Porcentaje',
        type: 'number',
        validators: [Validators.required, Validators.min(0), Validators.max(100)],
        colSpan: 1,
      },
      {
        name: 'is_price_inclusive',
        label: '¿El precio incluye el impuesto?',
        type: 'switch',
        validators: [Validators.required],
        colSpan: 1,
      },
      {
        name: 'is_default',
        label: 'Impuesto Predeterminado',
        type: 'switch',
        validators: [Validators.required],
        colSpan: 1,
      },
    ];

    if (isEdit) {
      fields.push({
        name: 'is_active',
        label: 'Impuesto Activo',
        type: 'switch',
        defaultValue: true,
        validators: [Validators.required],
        colSpan: 1,
      });
    }

    return fields;
  }

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.taxId();
    // Al crear un nuevo impuesto, is_active debe ser true por defecto
    const payload = id ? data : { ...data, is_active: true };
    const request = id ? this.taxApi.updateTax(id, payload) : this.taxApi.createTax(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(res.message);
        this.router.navigate(['/sistema/impuestos']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar el impuesto';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/sistema/impuestos']);
  }
}
