import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { WarehouseApi } from '@/core/services/api/warehouse.api';
import { WarehouseResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardBadgeImports } from '@/shared/components/badge';

@Component({
  selector: 'app-almacen-detail',
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
  templateUrl: './almacen-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlmacenDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly warehouseApi = inject(WarehouseApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly warehouse = signal<WarehouseResource | null>(null);
  readonly loading = signal(true);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre del Almacén', colSpan: 2 },
        { name: 'location', label: 'Ubicación', fallback: 'Sin ubicación registrada' },
      ],
    },
    {
      title: 'Compañía',
      fields: [
        {
          name: 'company',
          label: 'Razón Social',
          transform: (v) => v?.business_name || 'No asignada',
          colSpan: 1,
        },
        {
          name: 'company',
          label: 'Nombre Comercial',
          transform: (v) => v?.trade_name || '—',
          colSpan: 1,
        },
        {
          name: 'company',
          label: 'RUC',
          transform: (v) => v?.ruc || '—',
          colSpan: 1,
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
      this.router.navigate(['/inventario/almacen']);
      return;
    }
    this.warehouseApi.getWarehouse(id).subscribe({
      next: (res) => {
        this.warehouse.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('No se encontró el almacén');
        this.router.navigate(['/inventario/almacen']);
      },
    });
  }

  goToEdit() {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/inventario/almacen', id, 'edit']);
  }

  confirmDelete() {
    const w = this.warehouse();
    if (!w) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Almacén',
      zContent: `¿Estás seguro de que deseas eliminar el almacén <strong>${w.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.warehouseApi.deleteWarehouse(w.id).subscribe({
          next: () => {
            toast.success('Almacén eliminado');
            this.router.navigate(['/inventario/almacen']);
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar el almacén');
          },
        });
      },
    });
  }

  onBack() {
    this.router.navigate(['/inventario/almacen']);
  }
}
