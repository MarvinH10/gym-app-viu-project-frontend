import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDividerComponent } from '@/shared/components/divider/divider.component';
import {
  FormCreateEditImports,
  FormCreateEditComponent,
  DynamicField,
  DefaultOption,
} from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { PurchaseApi } from '@/core/services/api/purchase.api';
import { ProductApi } from '@/core/services/api/product.api';
import { TaxApi } from '@/core/services/api/tax.api';
import { SupplierApi } from '@/core/services/api/supplier.api';
import { WarehouseApi } from '@/core/services/api/warehouse.api';
import {
  PurchaseResource,
  CreatePurchasePayload,
  PurchaseProductPayload,
} from '@/core/models/purchase.model';
import { ProductProductResource, ProductTemplateResource } from '@/core/models/product.model';
import { TaxResource } from '@/core/models/tax.model';
import {
  ZardComboboxComponent,
  ZardComboboxOption,
} from '@/shared/components/combobox/combobox.component';
import { ZardTableImports } from '@/shared/components/table/table.imports';

@Component({
  selector: 'app-compra-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
    ZardComboboxComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardDividerComponent,
    ...ZardTableImports,
  ],
  templateUrl: './compra-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompraCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseApi = inject(PurchaseApi);
  private readonly productApi = inject(ProductApi);
  private readonly taxApi = inject(TaxApi);
  private readonly supplierApi = inject(SupplierApi);
  private readonly warehouseApi = inject(WarehouseApi);

  @ViewChild('headerForm') headerForm?: FormCreateEditComponent;

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly purchaseId = signal<string | null>(null);
  readonly initialData = signal<PurchaseResource | undefined>(undefined);

  readonly suppliers = signal<DefaultOption[]>([]);
  readonly warehouses = signal<DefaultOption[]>([]);
  readonly taxes = signal<TaxResource[]>([]);
  readonly products = signal<ZardComboboxOption[]>([]);
  readonly rawProducts = signal<ProductProductResource[]>([]);

  readonly productLines = signal<any[]>([]);

  readonly isEdit = computed(() => !!this.purchaseId());

  readonly totals = computed(() => {
    const lines = this.productLines();
    const subtotal = lines.reduce((acc, line) => acc + (line.subtotal || 0), 0);
    const taxAmount = lines.reduce((acc, line) => acc + (line.tax_amount || 0), 0);
    const total = lines.reduce((acc, line) => acc + (line.total || 0), 0);
    return { subtotal, taxAmount, total };
  });

  ngOnInit() {
    this.loadFormOptions();
    this.loadProducts();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.purchaseId.set(id);
        this.loadPurchase(id);
      } else {
        this.addLine();
      }
    });
  }

  private loadFormOptions() {
    console.info('Using fallbacks for form options (backend endpoint bypassed)');
    this.loadSuppliersFallback();
    this.loadWarehousesFallback();
    this.loadTaxesFallback();
  }

  private loadSuppliersFallback() {
    this.supplierApi.getSuppliers({ per_page: 100 }).subscribe({
      next: (res) => {
        this.suppliers.set(
          res.data.map((s: any) => ({
            label: (s.business_name || s.name || 'Sin nombre') as string,
            value: s.id.toString(),
          })),
        );
      },
      error: () => toast.error('Error al cargar proveedores (fallback)'),
    });
  }

  private loadWarehousesFallback() {
    this.warehouseApi.getWarehouses({ per_page: 100 }).subscribe({
      next: (res) => {
        this.warehouses.set(
          res.data.data.map((w: any) => ({
            label: (w.name || 'Sin nombre') as string,
            value: w.id.toString(),
          })),
        );
      },
      error: () => toast.error('Error al cargar almacenes (fallback)'),
    });
  }

  private loadTaxesFallback() {
    this.taxApi.getTaxes({ per_page: 100 }).subscribe({
      next: (res) => this.taxes.set(res.data),
      error: () => toast.error('Error al cargar impuestos (fallback)'),
    });
  }

  private loadProducts() {
    this.productApi.getProducts({ per_page: 100 }).subscribe({
      next: (res) => {
        const allVariants: ProductProductResource[] = [];
        const options: ZardComboboxOption[] = [];

        res.data.forEach((template: ProductTemplateResource) => {
          template.variants.forEach((variant) => {
            allVariants.push(variant);
            const attrLabel = variant.attributes?.map((a) => a.value).join(', ');
            const fullLabel = `${template.name}${attrLabel ? ' (' + attrLabel + ')' : ''} - ${variant.sku} | S/ ${variant.price}`;
            options.push({
              label: fullLabel,
              value: variant.id.toString(),
            });
          });
        });

        this.rawProducts.set(allVariants);
        this.products.set(options);
      },
      error: () => toast.error('Error al cargar productos'),
    });
  }

  private loadPurchase(id: string) {
    this.loading.set(true);
    this.purchaseApi.getPurchase(id).subscribe({
      next: (res) => {
        this.initialData.set(res.data);
        if (res.data.lines) {
          this.productLines.set(
            res.data.lines.map((p) => ({
              product_product_id: p.product.id.toString(),
              quantity: p.quantity,
              price: p.price,
              tax_id:
                this.taxes()
                  .find((t) => t.rate_percent === p.tax_rate)
                  ?.id?.toString() || '',
              subtotal: p.subtotal,
              tax_amount: p.tax_amount,
              total: p.total,
            })),
          );
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Error al cargar la compra');
        this.router.navigate(['/compras/lista']);
      },
    });
  }

  readonly formFields = computed<DynamicField[]>(() => [
    {
      name: 'partner_id',
      label: 'Proveedor',
      type: 'select',
      placeholder: 'Seleccionar proveedor...',
      options: this.suppliers(),
      validators: [Validators.required],
      colSpan: 1,
    },
    {
      name: 'warehouse_id',
      label: 'Almacén de Destino',
      type: 'select',
      placeholder: 'Seleccionar almacén...',
      options: this.warehouses(),
      validators: [Validators.required],
      colSpan: 1,
    },
    {
      name: 'date',
      label: 'Fecha de Orden',
      type: 'date',
      defaultValue: new Date().toISOString().split('T')[0],
      validators: [Validators.required],
      colSpan: 1,
    },
    {
      name: 'vendor_bill_date',
      label: 'Fecha de Factura',
      type: 'date',
      colSpan: 1,
    },
    {
      name: 'vendor_bill_number',
      label: 'Nro. Factura Proveedor',
      type: 'text',
      placeholder: 'Eje: F001-000123',
      colSpan: 2,
    },
    {
      name: 'observation',
      label: 'Observaciones',
      type: 'textarea',
      placeholder: 'Notas internas o detalles de la orden...',
      colSpan: 2,
    },
  ]);

  onFormSubmit(data: any) {
    if (this.productLines().length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    this.isSubmitting.set(true);

    const id = this.purchaseId();
    const payload: CreatePurchasePayload = {
      partner_id: parseInt(data.partner_id),
      warehouse_id: parseInt(data.warehouse_id),
      company_id: parseInt(localStorage.getItem('company_id') || '1'),
      vendor_bill_number: data.vendor_bill_number || null,
      vendor_bill_date: data.vendor_bill_date || null,
      observation: data.observation || null,
      products: this.productLines().map((line) => ({
        product_product_id: parseInt(line.product_product_id),
        tax_id: line.tax_id ? parseInt(line.tax_id) : null,
        uom_id: null,
        quantity: line.quantity,
        price: line.price,
        quantity_uom: line.quantity,
        price_uom: line.price,
      })),
    };

    const request = id
      ? this.purchaseApi.updatePurchase(id, payload)
      : this.purchaseApi.createPurchase(payload);

    request.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        toast.success(res.message || 'Compra guardada');
        this.router.navigate(['/compras/lista']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        toast.error(err.error?.message || 'Error al guardar');
      },
    });
  }

  submitHeaderForm() {
    this.headerForm?.submit();
  }

  onCancel() {
    this.router.navigate(['/compras/lista']);
  }

  addLine() {
    this.productLines.update((lines) => [
      ...lines,
      {
        product_product_id: '',
        quantity: 1,
        price: 0,
        tax_id:
          this.taxes()
            .find((t) => t.is_default)
            ?.id?.toString() || '',
        subtotal: 0,
        tax_amount: 0,
        total: 0,
      },
    ]);
  }

  removeLine(index: number) {
    this.productLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  onProductChange(index: number, productId: string | null) {
    if (!productId) return;

    const product = this.rawProducts().find((v) => v.id.toString() === productId);
    if (product) {
      this.updateLine(index, {
        product_product_id: productId,
        price: parseFloat(product.cost_price || product.price),
      });
    }
  }

  updateLine(index: number, changes: any) {
    this.productLines.update((lines) => {
      const newLines = [...lines];
      newLines[index] = { ...newLines[index], ...changes };

      const line = newLines[index];
      const tax = this.taxes().find((t) => t.id.toString() === line.tax_id);
      const subtotal = line.quantity * line.price;
      const taxRate = tax ? tax.rate_percent / 100 : 0;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      newLines[index] = {
        ...line,
        subtotal,
        tax_amount: taxAmount,
        total,
      };

      return newLines;
    });
  }
}
