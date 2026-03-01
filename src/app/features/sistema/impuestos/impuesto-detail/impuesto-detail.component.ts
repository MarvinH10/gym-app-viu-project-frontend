import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { TaxApi } from '@/core/services/api/tax.api';
import { TaxResource } from '@/core/models';

@Component({
  selector: 'app-impuesto-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...FormDetailImports,
  ],
  templateUrl: './impuesto-detail.html',
  styleUrl: './impuesto-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImpuestoDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taxApi = inject(TaxApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly tax = signal<TaxResource | null>(null);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre del Impuesto', colSpan: 2 },
        { name: 'description', label: 'Descripción', colSpan: 2, fallback: 'Sin descripción' },
        { name: 'invoice_label', label: 'Etiqueta en Factura', fallback: 'Sin etiqueta' },
        {
          name: 'tax_type',
          label: 'Tipo de Impuesto',
          transform: (v) => v || 'No especificado',
        },
      ],
    },
    {
      title: 'Configuración Técnica',
      fields: [
        { name: 'affectation_type_code', label: 'Cód. Tipo Afectación', fallback: 'N/A' },
        {
          name: 'rate_percent',
          label: 'Tasa / Porcentaje',
          transform: (v) => `${v}%`,
        },
        { name: 'is_price_inclusive', label: 'Precio Incluye Impuesto', type: 'boolean' },
      ],
    },
    {
      title: 'Estado y Preferencias',
      fields: [
        { name: 'is_active', label: 'Estado Activo', type: 'boolean' },
        { name: 'is_default', label: 'Impuesto por Defecto', type: 'boolean' },
      ],
    },
    {
      title: 'Auditoría',
      fields: [
        { name: 'created_at', label: 'Fecha de Creación', type: 'datetime' },
        { name: 'updated_at', label: 'Última Actualización', type: 'datetime' },
      ],
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/sistema/impuestos']);
      return;
    }
    this.taxApi.getTax(id).subscribe({
      next: (res) => {
        this.tax.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error('No se encontró el impuesto');
        this.router.navigate(['/sistema/impuestos']);
      },
    });
  }

  goToEdit() {
    const id = this.tax()?.id;
    if (id) this.router.navigate(['/sistema/impuestos', id, 'edit']);
  }

  confirmDelete() {
    const t = this.tax();
    if (!t) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Impuesto',
      zContent: `¿Estás seguro de que deseas eliminar el impuesto <strong>${t.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.taxApi.deleteTax(t.id).subscribe({
          next: () => {
            toast.success('Impuesto eliminado');
            this.router.navigate(['/sistema/impuestos']);
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar el impuesto');
          },
        });
      },
    });
  }
}
