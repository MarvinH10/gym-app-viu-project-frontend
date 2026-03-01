import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { TaxApi } from '@/core/services/api/tax.api';
import { TaxResource } from '@/core/models';

@Component({
  selector: 'app-impuesto-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...FormCreateEditImports,
  ],
  templateUrl: './impuesto-create-edit.html',
  styleUrl: './impuesto-create-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImpuestoCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taxApi = inject(TaxApi);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly taxId = signal<string | null>(null);
  readonly initialData = signal<TaxResource | undefined>(undefined);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.taxId.set(id);
        this.isLoading.set(true);
        this.taxApi.getTax(id).subscribe({
          next: (res) => {
            this.initialData.set(res.data);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            toast.error('Error al cargar impuesto');
            this.router.navigate(['/sistema/impuestos']);
          },
        });
      }
    });
  }

  get taxFormFields(): DynamicField[] {
    return [
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
        colSpan: 2,
      },
      {
        name: 'invoice_label',
        label: 'Etiqueta en Factura',
        type: 'text',
        placeholder: 'Ej. IGV',
        validators: [Validators.maxLength(255)],
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
        validators: [Validators.maxLength(10)],
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
        type: 'boolean',
        colSpan: 1,
      },
      {
        name: 'is_active',
        label: 'Impuesto Activo',
        type: 'boolean',
        defaultValue: true,
        colSpan: 1,
      },
      {
        name: 'is_default',
        label: 'Impuesto Predeterminado',
        type: 'boolean',
        colSpan: 1,
      },
    ];
  }

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.taxId();
    const request = id ? this.taxApi.updateTax(id, data) : this.taxApi.createTax(data);

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
