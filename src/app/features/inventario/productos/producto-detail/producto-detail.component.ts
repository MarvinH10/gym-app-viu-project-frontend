import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ProductApi } from '@/core/services/api/product.api';
import { ProductTemplateResource } from '@/core/models';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';

@Component({
  selector: 'app-producto-detail',
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
  templateUrl: './producto-detail.html',
})
export class ProductoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly product = signal<ProductTemplateResource | null>(null);

  readonly principalAttributes = computed(() => {
    const p = this.product();
    if (!p?.variants?.length) return [];
    const principal = p.variants.find((v) => v.is_principal) ?? p.variants[0];
    return principal?.attributes ?? [];
  });

  readonly attributedVariants = computed(() => {
    const p = this.product();
    if (!p?.variants?.length) return [];
    return p.variants.filter((v) => v.attributes && v.attributes.length > 0);
  });

  readonly hasVariants = computed(() => this.attributedVariants().length > 1);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre del Producto', colSpan: 2 },
        {
          name: 'price',
          label: 'Precio',
          type: 'currency',
        },
        {
          name: 'category',
          label: 'Categoría',
          transform: (v: any) => v?.name || 'General',
        },
        { name: 'sku', label: 'SKU', fallback: 'Sin SKU' },
        { name: 'barcode', label: 'Código de Barras', fallback: 'Sin Código' },
        { name: 'description', label: 'Descripción', colSpan: 2, fallback: 'Sin descripción' },
      ],
    },
    {
      title: 'Configuraciones',
      fields: [
        { name: 'is_pos_visible', label: 'Visible en POS', type: 'boolean' },
        { name: 'tracks_inventory', label: 'Control de Inventario', type: 'boolean' },
        { name: 'is_service', label: 'Es Servicio', type: 'boolean' },
      ],
    },
    {
      title: 'Auditoría',
      fields: [
        { name: 'created_at', label: 'Agregado el', type: 'datetime' },
        { name: 'updated_at', label: 'Última actualización', type: 'datetime' },
      ],
    },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error.set('No se especificó un ID de producto');
      this.loading.set(false);
    }
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.productApi.getProduct(id).subscribe({
      next: (res) => {
        this.product.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del producto');
        this.loading.set(false);
        toast.error('Error al cargar producto');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/inventario/productos']);
  }

  goToEdit(): void {
    const id = this.product()?.id;
    if (id) {
      this.router.navigate(['/inventario/productos', id, 'edit']);
    }
  }

  confirmDelete(): void {
    const p = this.product();
    if (!p) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Producto',
      zContent: `¿Estás seguro de que deseas eliminar <strong>${p.name}</strong>?`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.productApi.deleteProduct(p.id).subscribe({
          next: () => {
            toast.success('Producto eliminado');
            this.router.navigate(['/inventario/productos']);
          },
          error: () => toast.error('Error al eliminar producto'),
        });
      },
    });
  }
}
