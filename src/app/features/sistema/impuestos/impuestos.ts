import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { TaxApi } from '@/core/services/api/tax.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { TaxResource, PaginatedResponse, TaxQueryParams } from '@/core/models';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSearchFiltersImports, FilterSection } from '@/shared/components/search-filters';
import {
  TableDetailsImports,
  TableDetailsColumn,
  TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
  selector: 'app-impuestos',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './impuestos.html',
  styleUrl: './impuestos.css',
})
export class Impuestos {
  private readonly router = inject(Router);
  private readonly taxApi = inject(TaxApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly taxes = signal<TaxResource[]>([]);
  readonly pagination = signal<PaginatedResponse<TaxResource>['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(10);

  readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

  readonly columns: TableDetailsColumn<TaxResource>[] = [
    {
      key: 'name',
      label: 'Impuesto',
      type: 'stack',
      subKey: 'tax_type',
      subTransform: (v) => `Tipo: ${v}`,
    },
    {
      key: 'invoice_label',
      label: 'Etiqueta Factura',
      type: 'text',
      fallback: 'Sin etiqueta',
    },
    {
      key: 'rate_percent',
      label: 'Tasa $(\%)$',
      type: 'text',
      transform: (v) => `${v}%`,
    },
    {
      key: 'is_active',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v) => (v ? 'secondary' : 'outline'),
      transform: (v) => (v ? 'Activo' : 'Inactivo'),
    },
    {
      key: 'is_default',
      label: 'Predeterminado',
      type: 'badge',
      badgeVariant: (v) => (v ? 'default' : 'outline'),
      transform: (v) => (v ? 'Sí' : 'No'),
    },
  ];

  readonly actions: TableDetailsAction<TaxResource>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (t) => this.router.navigate(['/sistema/impuestos', t.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (t) => this.router.navigate(['/sistema/impuestos', t.id, 'edit']),
    },
    {
      label: 'Cambiar estado',
      icon: 'refresh-cw',
      onAction: (t) => this.toggleStatus(t),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (t) => this.confirmDeleteTax(t),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.loadTaxes();
    });
  }

  goToNewTax() {
    this.router.navigate(['/sistema/impuestos/new']);
  }

  loadTaxes() {
    this.loading.set(true);
    const params: TaxQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };

    this.taxApi.getTaxes(params).subscribe({
      next: (res) => {
        this.taxes.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los impuestos. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  toggleStatus(tax: TaxResource) {
    this.taxApi.toggleStatus(tax.id).subscribe({
      next: (res) => {
        toast.success(res.message);
        this.loadTaxes();
      },
      error: () => toast.error('Error al actualizar estado'),
    });
  }

  confirmDeleteTax(tax: TaxResource) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Impuesto',
      zContent: `¿Estás seguro de que deseas eliminar el impuesto <strong>${tax.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.taxApi.deleteTax(tax.id).subscribe({
          next: () => {
            toast.success('Impuesto eliminado');
            this.loadTaxes();
          },
          error: () => toast.error('No se pudo eliminar el impuesto'),
        });
      },
    });
  }
}
