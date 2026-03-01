import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { UnitOfMeasureApi } from '@/core/services/api/unit-measure.api';
import { UnitOfMeasureResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardBadgeImports } from '@/shared/components/badge';

@Component({
  selector: 'app-unidades-medida-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
    ...FormDetailImports,
  ],
  templateUrl: './unidades-medida-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UnidadesMedidaDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly unitApi = inject(UnitOfMeasureApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly unit = signal<UnitOfMeasureResource | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre de la Unidad', colSpan: 2 },
        { name: 'symbol', label: 'Símbolo', fallback: 'Sin símbolo' },
        { name: 'family', label: 'Familia', fallback: 'Sin familia' },
      ],
    },
    {
      title: 'Configuración de Conversión',
      fields: [
        {
          name: 'base_unit',
          label: 'Unidad Base',
          transform: (v) => (v ? v.name : 'Es Unidad Base'),
        },
        {
          name: 'factor',
          label: 'Factor de Conversión',
          transform: (v) => (v ? v.toString() : '1'),
        },
      ],
    },
    {
      title: 'Estado',
      fields: [{ name: 'is_active', label: 'Estado Activo', type: 'boolean' }],
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
      this.router.navigate(['/sistema/unidades-medida']);
      return;
    }
    this.unitApi.getUnit(id).subscribe({
      next: (res) => {
        this.unit.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message || 'No se pudo cargar la información de la unidad de medida.';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onBack() {
    this.router.navigate(['/sistema/unidades-medida']);
  }

  goToEdit() {
    const id = this.unit()?.id;
    if (id) this.router.navigate(['/sistema/unidades-medida', id, 'edit']);
  }

  confirmDelete() {
    const u = this.unit();
    if (!u) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Unidad de Medida',
      zContent: `¿Estás seguro de que deseas eliminar la unidad <strong>${u.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.unitApi.deleteUnit(u.id).subscribe({
          next: () => {
            toast.success('Unidad de medida eliminada');
            this.onBack();
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar la unidad de medida');
          },
        });
      },
    });
  }
}
