import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { PaymentMethodApi } from '@/core/services/api/payment-method.api';
import { PaymentMethodResource } from '@/core/models';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';

@Component({
  selector: 'app-payment-method-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
    FormDetailComponent,
  ],
  templateUrl: './payment-method-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly paymentMethodApi = inject(PaymentMethodApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly paymentMethod = signal<PaymentMethodResource | null>(null);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);
  readonly error = signal<string | null>(null);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información del Método de Pago',
      icon: 'credit-card',
      fields: [
        { name: 'name', label: 'Nombre' },
        {
          name: 'is_active',
          label: 'Estado',
          type: 'badge',
          badgeVariant: (v: any) => (v ? 'secondary' : 'outline'),
          transform: (v: any) => (v ? 'Activo' : 'Inactivo'),
        },
      ],
    },
    {
      title: 'Auditoría',
      icon: 'clock',
      fields: [
        { name: 'created_at', label: 'Fecha de Creación', type: 'date' },
        { name: 'updated_at', label: 'Última Actualización', type: 'date' },
      ],
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/sistema/payment-methods']);
      return;
    }

    this.paymentMethodApi.getPaymentMethod(id).subscribe({
      next: (res) => {
        this.paymentMethod.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'No se pudo cargar la información.';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onBack() {
    this.router.navigate(['/sistema/payment-methods']);
  }

  goToEdit() {
    const id = this.paymentMethod()?.id;
    if (id) this.router.navigate(['/sistema/payment-methods', id, 'edit']);
  }

  confirmDelete() {
    const pm = this.paymentMethod();
    if (!pm) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Método de Pago',
      zContent: `¿Estás seguro de que deseas eliminar el método de pago <strong>${pm.name}</strong>?`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.paymentMethodApi.deletePaymentMethod(pm.id).subscribe({
          next: (res) => {
            toast.success(res.message || 'Eliminado exitosamente');
            this.router.navigate(['/sistema/payment-methods']);
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('No se pudo eliminar');
          },
        });
      },
    });
  }
}
