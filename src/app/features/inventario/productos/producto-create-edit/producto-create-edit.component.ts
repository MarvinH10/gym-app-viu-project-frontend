import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ViewChild,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import {
  FormCreateEditImports,
  DynamicField,
  DefaultOption,
  FormCreateEditComponent,
} from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ProductApi } from '@/core/services/api/product.api';
import { ProductTemplateResource, CategoryResource, AttributeResource } from '@/core/models';

interface AttributeLine {
  attribute_id: number;
  attribute_name: string;
  predefinedValues: string[];
  values: string[];
  inputValue: string;
}

@Component({
  selector: 'app-producto-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardCardComponent,
    ZardIconComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
    ...ZardSelectImports,
    ...ZardBadgeImports,
  ],
  templateUrl: './producto-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productApi = inject(ProductApi);

  @ViewChild(FormCreateEditComponent) formRef!: FormCreateEditComponent;

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly productId = signal<string | null>(null);
  readonly initialData = signal<ProductTemplateResource | undefined>(undefined);

  readonly categories = signal<CategoryResource[]>([]);
  readonly attributes = signal<AttributeResource[]>([]);

  readonly attributeLines = signal<AttributeLine[]>([]);
  readonly selectedAttributeId = signal<string>('');

  readonly availableAttributes = computed(() => {
    const lines = this.attributeLines();
    const usedIds = new Set(lines.map((l) => l.attribute_id));
    return this.attributes().filter((a) => !usedIds.has(a.id));
  });

  constructor() {
    effect(() => {
      const attrs = this.attributes();
      const product = this.initialData();
      if (attrs.length > 0 && product && untracked(() => this.attributeLines().length === 0)) {
        this.preloadAttributeLines(product);
      }
    });
  }

  ngOnInit() {
    this.loadFormOptions();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.productId.set(id);
        this.loadProduct(id);
      }
    });
  }

  private loadFormOptions() {
    this.productApi.getFormOptions().subscribe({
      next: (res) => {
        this.categories.set(res.data.categories || []);
        this.attributes.set(res.data.attributes || []);
      },
      error: () => toast.error('Error al cargar opciones del formulario'),
    });
  }

  private loadProduct(id: string) {
    this.loading.set(true);
    this.productApi.getProduct(id).subscribe({
      next: (res) => {
        this.initialData.set(res.data);
        this.loading.set(false);
        this.preloadAttributeLines(res.data);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Error al cargar el producto');
        this.router.navigate(['/inventario/productos']);
      },
    });
  }

  private preloadAttributeLines(product: ProductTemplateResource) {
    if (!product.variants?.length) return;

    const attributeMap = new Map<
      number,
      { name: string; values: Set<string>; predefined: string[] }
    >();

    for (const variant of product.variants) {
      for (const attr of variant.attributes ?? []) {
        if (!attributeMap.has(attr.attribute_id)) {
          const catalogAttr = this.attributes().find((a) => a.id === attr.attribute_id);
          attributeMap.set(attr.attribute_id, {
            name: attr.attribute_name ?? `Atributo ${attr.attribute_id}`,
            values: new Set(),
            predefined: (catalogAttr?.values ?? []).map((v) => v.value),
          });
        }
        attributeMap.get(attr.attribute_id)!.values.add(attr.value);
      }
    }

    const lines: AttributeLine[] = Array.from(attributeMap.entries()).map(([id, data]) => ({
      attribute_id: id,
      attribute_name: data.name,
      predefinedValues: data.predefined,
      values: Array.from(data.values),
      inputValue: '',
    }));

    this.attributeLines.set(lines);
  }

  addAttributeLine() {
    const id = parseInt(this.selectedAttributeId(), 10);
    if (!id) return;

    const attr = this.attributes().find((a) => a.id === id);
    if (!attr) return;

    this.attributeLines.update((lines) => [
      ...lines,
      {
        attribute_id: id,
        attribute_name: attr.name,
        predefinedValues: (attr.values ?? []).map((v) => v.value),
        values: [],
        inputValue: '',
      },
    ]);
    this.selectedAttributeId.set('');
  }

  addValueToLine(lineIndex: number) {
    this.attributeLines.update((lines) => {
      const updated = [...lines];
      const line = { ...updated[lineIndex] };
      const val = line.inputValue.trim();
      if (val && !line.values.includes(val)) {
        line.values = [...line.values, val];
      }
      line.inputValue = '';
      updated[lineIndex] = line;
      return updated;
    });
  }

  onValueKeydown(event: KeyboardEvent, lineIndex: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addValueToLine(lineIndex);
    }
  }

  updateLineInput(lineIndex: number, value: string) {
    this.attributeLines.update((lines) => {
      const updated = [...lines];
      updated[lineIndex] = { ...updated[lineIndex], inputValue: value };
      return updated;
    });
  }

  removeValueFromLine(lineIndex: number, value: string) {
    this.attributeLines.update((lines) => {
      const updated = [...lines];
      const line = { ...updated[lineIndex] };
      line.values = line.values.filter((v) => v !== value);
      updated[lineIndex] = line;
      return updated;
    });
  }

  removeAttributeLine(lineIndex: number) {
    this.attributeLines.update((lines) => lines.filter((_, i) => i !== lineIndex));
  }

  getPredefinedSelection(line: { values: string[]; predefinedValues: string[] }): string[] {
    return line.values.filter((v) => line.predefinedValues.includes(v));
  }

  onPredefinedSelectionChange(lineIndex: number, event: string | string[]) {
    const selected = Array.isArray(event) ? event : [event].filter(Boolean);
    this.attributeLines.update((lines) => {
      const updated = [...lines];
      const line = { ...updated[lineIndex] };
      const customVals = line.values.filter((v) => !line.predefinedValues.includes(v));
      line.values = [...selected, ...customVals];
      updated[lineIndex] = line;
      return updated;
    });
  }

  getCustomValues(line: { values: string[]; predefinedValues: string[] }): string[] {
    return line.values.filter((v) => !line.predefinedValues.includes(v));
  }

  readonly productFormFields = computed<DynamicField[]>(() => {
    const isEdit = !!this.productId();
    const catOptions: DefaultOption[] = this.categories().map((c) => ({
      label: c.full_name || c.name,
      value: c.id.toString(),
    }));

    const fields: DynamicField[] = [
      {
        name: 'name',
        label: 'Nombre del Producto',
        type: 'text',
        placeholder: 'Ej. Manzanas Rojas',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'price',
        label: 'Precio de Venta',
        type: 'number',
        placeholder: 'Ej. 10.50',
        validators: [Validators.required, Validators.min(0)],
        colSpan: 1,
      },
      {
        name: 'category_id',
        label: 'Categoría',
        type: 'select',
        options: catOptions,
        validators: [Validators.required],
        colSpan: 1,
      },
      {
        name: 'sku',
        label: 'SKU (Opcional)',
        type: 'text',
        placeholder: 'Ej. PROD-001',
        validators: [Validators.maxLength(255)],
        colSpan: 1,
      },
      {
        name: 'barcode',
        label: 'Código de Barras (Opcional)',
        type: 'text',
        placeholder: 'Ej. 123456789',
        validators: [Validators.maxLength(255)],
        colSpan: 1,
      },
      {
        name: 'description',
        label: 'Descripción (Opcional)',
        type: 'textarea',
        placeholder: 'Detalles del producto...',
        colSpan: 2,
      },
      {
        name: 'is_pos_visible',
        label: 'Visible en Punto de Venta (POS)',
        type: 'switch',
        defaultValue: true,
        colSpan: 1,
      },
      {
        name: 'tracks_inventory',
        label: 'Controlar Inventario (Stock)',
        type: 'switch',
        defaultValue: true,
        colSpan: 1,
      },
      {
        name: 'is_service',
        label: 'El producto es un Servicio (No físico)',
        type: 'switch',
        defaultValue: false,
        colSpan: 1,
      },
    ];

    if (isEdit) {
      fields.push({
        name: 'is_active',
        label: 'Estado del Producto',
        type: 'switch',
        defaultValue: true,
        colSpan: 1,
      });
    }

    return fields;
  });

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.productId();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);

    if (data.category_id) {
      formData.append('category_id', data.category_id);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.sku) {
      formData.append('sku', data.sku);
    }
    if (data.barcode) {
      formData.append('barcode', data.barcode);
    }

    formData.append('is_pos_visible', data.is_pos_visible ? '1' : '0');
    formData.append('tracks_inventory', data.tracks_inventory ? '1' : '0');
    formData.append('is_service', data.is_service ? '1' : '0');

    if (id) {
      const active = data.is_active === undefined ? true : data.is_active;
      formData.append('is_active', active ? '1' : '0');
    }

    const lines = this.attributeLines();
    lines.forEach((line, li) => {
      formData.append(`attributeLines[${li}][attribute_id]`, line.attribute_id.toString());
      line.values.forEach((val, vi) => {
        formData.append(`attributeLines[${li}][values][${vi}]`, val);
      });
    });

    const request = id
      ? this.productApi.updateProduct(id, formData)
      : this.productApi.createProduct(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        toast.success(id ? 'Producto actualizado' : 'Producto creado');
        this.router.navigate(['/inventario/productos']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar el producto';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/inventario/productos']);
  }
}
