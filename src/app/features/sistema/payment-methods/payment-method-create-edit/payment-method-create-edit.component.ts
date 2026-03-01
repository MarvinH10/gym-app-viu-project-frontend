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

import { PaymentMethodApi } from '@/core/services/api/payment-method.api';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { JournalResource } from '@/core/models';

@Component({
  selector: 'app-payment-method-create-edit',
  standalone: true,
  imports: [ZardCardComponent, ...ZardSkeletonImports, ...FormCreateEditImports],
  templateUrl: './payment-method-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly paymentMethodApi = inject(PaymentMethodApi);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly paymentMethodId = signal<string | null>(null);
  readonly initialData = signal<any | undefined>({ is_active: true });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.paymentMethodId.set(id);
        this.isLoading.set(true);
        this.paymentMethodApi.getPaymentMethod(id).subscribe({
          next: (res) => {
            this.initialData.set(res.data);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            toast.error('Error al cargar la información.');
            this.router.navigate(['/sistema/payment-methods']);
          },
        });
      }
    });
  }

  readonly paymentMethodFormFields = computed<DynamicField[]>(() => [
    {
      name: 'name',
      label: 'Nombre del Método de Pago',
      type: 'text',
      placeholder: 'Ej. Transferencia Bancaria',
      validators: [Validators.required, Validators.maxLength(255)],
      colSpan: 2,
    },
    {
      name: 'is_active',
      label: '¿Está Activo?',
      type: 'switch',
      colSpan: 1,
    },
  ]);

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    const id = this.paymentMethodId();
    const request = id
      ? this.paymentMethodApi.updatePaymentMethod(id, data)
      : this.paymentMethodApi.createPaymentMethod(data);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(res.message);
        this.router.navigate(['/sistema/payment-methods']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar.';
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/sistema/payment-methods']);
  }
}
