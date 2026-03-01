import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { AttributeApi } from '@/core/services/api/attribute.api';
import { AttributeResource } from '@/core/models';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
  selector: 'app-atributo-detail',
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
  templateUrl: './atributo-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AtributoDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly attributeApi = inject(AttributeApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly attribute = signal<AttributeResource | null>(null);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre del Atributo', colSpan: 2 },
        {
          name: 'values',
          label: 'Valores / Variantes',
          colSpan: 2,
          transform: (v: any[]) =>
            v?.map((val) => val.value).join(', ') || 'Sin valores registrados',
        },
      ],
    },
    {
      title: 'Configuración',
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
      this.router.navigate(['/inventario/atributos']);
      return;
    }
    this.attributeApi.getAttribute(id).subscribe({
      next: (res) => {
        this.attribute.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error('No se encontró el atributo');
        this.router.navigate(['/inventario/atributos']);
      },
    });
  }

  goToEdit() {
    const id = this.attribute()?.id;
    if (id) this.router.navigate(['/inventario/atributos', id, 'edit']);
  }

  confirmDelete() {
    const a = this.attribute();
    if (!a) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Atributo',
      zContent: `¿Estás seguro de que deseas eliminar el atributo <strong>${a.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.attributeApi.deleteAttribute(a.id).subscribe({
          next: () => {
            toast.success('Atributo eliminado');
            this.router.navigate(['/inventario/atributos']);
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar el atributo');
          },
        });
      },
    });
  }

  onBack() {
    this.router.navigate(['/inventario/atributos']);
  }
}
