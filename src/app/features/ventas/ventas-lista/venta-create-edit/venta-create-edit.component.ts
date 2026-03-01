import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDividerComponent } from '@/shared/components/divider/divider.component';
import { FormCreateEditImports, FormCreateEditComponent, DynamicField, DefaultOption } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { SaleApi } from '@/core/services/api/sale.api';
import { ProductApi } from '@/core/services/api/product.api';
import { TaxApi } from '@/core/services/api/tax.api';
import { SaleResource, CreateSalePayload, SaleProductPayload } from '@/core/models/sale.model';
import { ProductProductResource, ProductTemplateResource } from '@/core/models/product.model';
import { TaxResource } from '@/core/models/tax.model';
import { ZardComboboxComponent, ZardComboboxOption } from '@/shared/components/combobox/combobox.component';
import { ZardTableImports } from '@/shared/components/table/table.imports';

@Component({
    selector: 'app-venta-create-edit',
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
    templateUrl: './venta-create-edit.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaCreateEditComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly saleApi = inject(SaleApi);
    private readonly productApi = inject(ProductApi);
    private readonly taxApi = inject(TaxApi);

    @ViewChild('headerForm') headerForm?: FormCreateEditComponent;

    readonly isSubmitting = signal(false);
    readonly loading = signal(false);
    readonly saleId = signal<string | null>(null);
    readonly initialData = signal<SaleResource | undefined>(undefined);

    readonly customers = signal<DefaultOption[]>([]);
    readonly warehouses = signal<DefaultOption[]>([]);
    readonly taxes = signal<TaxResource[]>([]);
    readonly products = signal<ZardComboboxOption[]>([]);
    readonly rawProducts = signal<ProductProductResource[]>([]);

    readonly productLines = signal<any[]>([]);

    readonly isEdit = computed(() => !!this.saleId());

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
                this.saleId.set(id);
                this.loadSale(id);
            } else {
                this.addLine(); // Start with one empty line
            }
        });
    }

    private loadFormOptions() {
        this.saleApi.getFormOptions().subscribe({
            next: (res) => {
                this.customers.set(res.data.customers.map(c => ({ label: (c.name || 'Sin nombre') as string, value: c.id.toString() })));
                this.warehouses.set(res.data.warehouses.map(w => ({ label: (w.name || 'Sin nombre') as string, value: w.id.toString() })));
                this.taxes.set(res.data.taxes || []);
            },
            error: () => toast.error('Error al cargar opciones del formulario'),
        });
    }

    private loadProducts() {
        this.productApi.getProducts({ per_page: 100 }).subscribe({
            next: (res) => {
                const allVariants: ProductProductResource[] = [];
                const options: ZardComboboxOption[] = [];

                res.data.forEach((template: ProductTemplateResource) => {
                    template.variants.forEach(variant => {
                        allVariants.push(variant);
                        const attrLabel = variant.attributes?.map(a => a.value).join(', ');
                        const fullLabel = `${template.name}${attrLabel ? ' (' + attrLabel + ')' : ''} - ${variant.sku} | S/ ${variant.price}`;
                        options.push({
                            label: fullLabel,
                            value: variant.id.toString()
                        });
                    });
                });

                this.rawProducts.set(allVariants);
                this.products.set(options);
            },
            error: () => toast.error('Error al cargar productos'),
        });
    }

    private loadSale(id: string) {
        this.loading.set(true);
        this.saleApi.getSale(id).subscribe({
            next: (res) => {
                this.initialData.set(res.data);
                if (res.data.products) {
                    this.productLines.set(res.data.products.map(p => ({
                        product_product_id: p.product.id.toString(),
                        quantity: p.quantity,
                        price: p.price,
                        tax_id: this.taxes().find(t => t.rate_percent === p.tax_rate)?.id?.toString() || '',
                        subtotal: p.subtotal,
                        tax_amount: p.tax_amount,
                        total: p.total
                    })));
                }
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                toast.error('Error al cargar la venta');
                this.router.navigate(['/ventas/lista']);
            },
        });
    }

    readonly formFields = computed<DynamicField[]>(() => [
        {
            name: 'partner_id',
            label: 'Cliente',
            type: 'select',
            placeholder: 'Seleccionar cliente...',
            options: this.customers(),
            validators: [Validators.required],
            colSpan: 1,
        },
        {
            name: 'warehouse_id',
            label: 'Almacén',
            type: 'select',
            placeholder: 'Seleccionar almacén...',
            options: this.warehouses(),
            validators: [Validators.required],
            colSpan: 1,
        },
        {
            name: 'date',
            label: 'Fecha de Emisión',
            type: 'date',
            defaultValue: new Date().toISOString().split('T')[0],
            validators: [Validators.required],
            colSpan: 1,
        },
        {
            name: 'notes',
            label: 'Notas / Observaciones',
            type: 'textarea',
            placeholder: 'Comentarios adicionales...',
            colSpan: 2,
        },
    ]);

    onFormSubmit(data: any) {
        if (this.productLines().length === 0) {
            toast.error('Debe agregar al menos un producto');
            return;
        }

        this.isSubmitting.set(true);

        const id = this.saleId();
        const payload: CreateSalePayload = {
            partner_id: data.partner_id ? parseInt(data.partner_id) : null,
            warehouse_id: parseInt(data.warehouse_id),
            company_id: parseInt(localStorage.getItem('company_id') || '1'),
            notes: data.notes,
            products: this.productLines().map(line => ({
                product_product_id: parseInt(line.product_product_id),
                tax_id: line.tax_id ? parseInt(line.tax_id) : null,
                uom_id: null,
                quantity: line.quantity,
                price: line.price,
                quantity_uom: line.quantity,
                price_uom: line.price
            })),
            payments: []
        };

        const request = id ? this.saleApi.updateSale(id, payload) : this.saleApi.createSale(payload);

        request.subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                toast.success(res.message || 'Venta guardada');
                this.router.navigate(['/ventas/lista']);
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
        this.router.navigate(['/ventas/lista']);
    }

    addLine() {
        this.productLines.update(lines => [...lines, {
            product_product_id: '',
            quantity: 1,
            price: 0,
            tax_id: this.taxes().find(t => t.is_default)?.id?.toString() || '',
            subtotal: 0,
            tax_amount: 0,
            total: 0
        }]);
    }

    removeLine(index: number) {
        this.productLines.update(lines => lines.filter((_, i) => i !== index));
    }

    onProductChange(index: number, productId: string | null) {
        if (!productId) return;

        const product = this.rawProducts().find(v => v.id.toString() === productId);
        if (product) {
            this.updateLine(index, {
                product_product_id: productId,
                price: parseFloat(product.price)
            });
        }
    }

    updateLine(index: number, changes: any) {
        this.productLines.update(lines => {
            const newLines = [...lines];
            newLines[index] = { ...newLines[index], ...changes };

            // Recalculate line
            const line = newLines[index];
            const tax = this.taxes().find(t => t.id.toString() === line.tax_id);
            const subtotal = line.quantity * line.price;
            const taxRate = tax ? tax.rate_percent / 100 : 0;
            const taxAmount = subtotal * taxRate;
            const total = subtotal + taxAmount;

            newLines[index] = {
                ...line,
                subtotal,
                tax_amount: taxAmount,
                total
            };

            return newLines;
        });
    }
}
