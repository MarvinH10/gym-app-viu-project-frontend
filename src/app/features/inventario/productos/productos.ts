import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ProductApi } from '@/core/services/api/product.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { ProductTemplateResource, PaginatedResponse, ProductQueryParams } from '@/core/models';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSearchFiltersImports } from '@/shared/components/search-filters';
import {
  TableDetailsImports,
  TableDetailsColumn,
  TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly products = signal<ProductTemplateResource[]>([]);
  readonly pagination = signal<PaginatedResponse<ProductTemplateResource>['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(25);

  readonly columns: TableDetailsColumn<ProductTemplateResource>[] = [
    {
      key: 'name',
      label: 'Producto',
      type: 'stack',
      subKey: 'sku',
      subTransform: (v) => (v ? `SKU: ${v}` : 'Sin SKU'),
    },
    {
      key: 'category',
      label: 'Categoría',
      type: 'text',
      transform: (v: any) => v?.name || 'Gral',
    },
    {
      key: 'price',
      label: 'Precio',
      type: 'text',
      transform: (v) => `S/ ${parseFloat(String(v)).toFixed(2)}`,
    },
    {
      key: 'is_active',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v) => (v ? 'secondary' : 'outline'),
      transform: (v) => (v ? 'Activo' : 'Inactivo'),
    },
    {
      key: 'is_pos_visible',
      label: 'Visible POS',
      type: 'badge',
      badgeVariant: (v) => (v ? 'default' : 'outline'),
      transform: (v) => (v ? 'Sí' : 'No'),
    },
  ];

  readonly actions: TableDetailsAction<ProductTemplateResource>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (p) => this.router.navigate(['/inventario/productos', p.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (p) => this.router.navigate(['/inventario/productos', p.id, 'edit']),
    },
    {
      label: 'Cambiar estado',
      icon: 'refresh-cw',
      onAction: (p) => this.toggleStatus(p),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (p) => this.confirmDeleteProduct(p),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.loadProducts();
    });
  }

  goToNewProduct() {
    this.router.navigate(['/inventario/productos/new']);
  }

  loadProducts() {
    this.loading.set(true);
    const params: ProductQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };

    this.productApi.getProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  toggleStatus(product: ProductTemplateResource) {
    this.productApi.toggleStatus(product.id).subscribe({
      next: () => {
        toast.success('Estado actualizado correctamente');
        this.loadProducts();
      },
      error: () => {
        toast.error('No se pudo cambiar el estado del producto');
      },
    });
  }

  confirmDeleteProduct(product: ProductTemplateResource) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Producto',
      zContent: `¿Estás seguro de que deseas eliminar el producto <strong>${product.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.productApi.deleteProduct(product.id).subscribe({
          next: () => {
            toast.success('Producto eliminado');
            this.loadProducts();
          },
          error: () => toast.error('No se pudo eliminar el producto'),
        });
      },
    });
  }
}
