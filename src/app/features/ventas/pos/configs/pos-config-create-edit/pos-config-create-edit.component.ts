import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PosConfigApi,
  PosConfig,
  CreatePosConfigRequest,
} from '@/core/services/api/pos-config.api';
import { WarehouseApi } from '@/core/services/api/warehouse.api';
import { MemberApi } from '@/core/services/api/member.api';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';

// Zard Components
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';

import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardLabelDirective } from '@/shared/components/label';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardSwitchComponent } from '@/shared/components/switch';

@Component({
  selector: 'app-pos-config-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ZardButtonComponent,
    ZardIconComponent,

    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCardComponent,
    ZardLabelDirective,
    ZardInputDirective,
    ZardSwitchComponent,
  ],
  template: `
    <div class="page-container pos-config-create">
      <div class="page-header mb-6">
        <h1 class="page-title text-2xl font-bold">
          {{ isEditMode() ? 'Editar Terminal POS' : 'Nueva Terminal POS' }}
        </h1>
        <p class="text-muted-foreground mt-1">
          Configura las opciones por defecto para este punto de venta.
        </p>
      </div>

      <z-card>
        <div class="p-6 border-b border-border">
          <h2 class="text-xl font-semibold">
            {{ isEditMode() ? 'Editando: ' + form.value.name : 'Datos de la Terminal' }}
          </h2>
          <p class="text-sm text-muted-foreground mt-1">Completa los campos requeridos (*).</p>
        </div>

        <div class="p-6">
          <form [formGroup]="form" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre de Terminal -->
              <div class="space-y-2">
                <label z-label>Nombre de la Terminal <span class="text-destructive">*</span></label>
                <input z-input formControlName="name" placeholder="Ej. Caja Principal" />
              </div>

              <!-- Almacén -->
              <div class="space-y-2" style="z-index: 50;">
                <label z-label
                  >Almacén de Operaciones <span class="text-destructive">*</span></label
                >
                <z-select
                  formControlName="warehouse_id"
                  zPlaceholder="Seleccione el almacén"
                  [zDisabled]="isLoadingRelations()"
                >
                  @for (w of warehouses(); track w.id) {
                    <z-select-item [zValue]="w.id.toString()">{{ w.name }}</z-select-item>
                  } @empty {
                    <z-select-item [zValue]="''">Seleccionar...</z-select-item>
                  }
                </z-select>
              </div>

              <!-- Cliente -->
              <div class="space-y-2" style="z-index: 49;">
                <div class="flex flex-col mb-1">
                  <label z-label>Cliente por Defecto</label>
                  <span class="text-xs text-muted-foreground"
                    >Cliente a usar si no se selecciona uno específico al cobrar.</span
                  >
                </div>
                <z-select
                  formControlName="default_customer_id"
                  zPlaceholder="Seleccione (Opcional)"
                  [zDisabled]="isLoadingRelations()"
                >
                  @for (c of clients(); track c.id) {
                    <z-select-item [zValue]="c.id.toString()"
                      >{{ c.name }}
                      {{ c.document_number ? ' - ' + c.document_number : '' }}</z-select-item
                    >
                  } @empty {
                    <z-select-item [zValue]="''">Sin cliente...</z-select-item>
                  }
                </z-select>
              </div>

              <!-- Diario -->
              <div class="space-y-2" style="z-index: 48;">
                <label z-label
                  >Diario de Ventas Predeterminado <span class="text-destructive">*</span></label
                >
                <z-select
                  formControlName="journal_id"
                  zPlaceholder="Seleccione el diario"
                  [zDisabled]="isLoadingRelations()"
                >
                  @for (j of journals(); track j.id) {
                    <z-select-item [zValue]="j.id.toString()"
                      >{{ j.name }} ({{ j.code }})</z-select-item
                    >
                  } @empty {
                    <z-select-item [zValue]="''">Cargando...</z-select-item>
                  }
                </z-select>
              </div>

              <!-- Selectores booleanos (Switches) -->
              <div
                class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border"
              >
                <div class="flex items-center justify-between col-span-1">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Aplicar Impuestos</label>
                    <p class="text-xs text-muted-foreground">
                      Calcular IGV en productos aplicables
                    </p>
                  </div>
                  <z-switch formControlName="apply_tax"></z-switch>
                </div>

                <div class="flex items-center justify-between col-span-1">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Precios con Impuestos</label>
                    <p class="text-xs text-muted-foreground">
                      Los precios de catálogo ya incluyen IGV
                    </p>
                  </div>
                  <z-switch formControlName="prices_include_tax"></z-switch>
                </div>

                <div class="flex items-center justify-between col-span-1">
                  <div class="space-y-0.5">
                    <label class="text-sm font-medium">Estado</label>
                    <p class="text-xs text-muted-foreground">Terminal activa para turnos</p>
                  </div>
                  <z-switch formControlName="is_active"></z-switch>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="p-6 bg-muted/50 border-t border-border flex justify-end gap-3">
          <button z-button zType="outline" (click)="goBack()">Volver</button>
          <button
            z-button
            (click)="save()"
            [disabled]="isSaving() || isLoadingRelations() || isLoadingMode() || form.invalid"
          >
            <z-icon zType="save" class="mr-2" />
            {{ isEditMode() ? 'Guardar Cambios' : 'Crear Terminal' }}
          </button>
        </div>
      </z-card>
    </div>
  `,
})
export class PosConfigCreateEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly configApi = inject(PosConfigApi);
  private readonly warehouseApi = inject(WarehouseApi);
  private readonly clienteApi = inject(MemberApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  isEditMode = signal(false);
  isSaving = signal(false);
  isLoadingMode = signal(true);
  isLoadingRelations = signal(false);
  configId = signal<number | null>(null);

  warehouses = signal<any[]>([]);
  clients = signal<any[]>([]);
  journals = signal<any[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    warehouse_id: ['', Validators.required],
    default_customer_id: [''],
    journal_id: ['', Validators.required],
    apply_tax: [true],
    prices_include_tax: [true],
    is_active: [true],
  });

  ngOnInit(): void {
    this.checkEditMode();
    this.loadRelations();
  }

  private loadRelations(): void {
    this.warehouseApi
      .getWarehouses({ per_page: 100 })
      .subscribe((res: any) => this.warehouses.set(res.data?.data || []));
    this.clienteApi
      .getMembers({ per_page: 50 })
      .subscribe((res: any) => this.clients.set(res.data?.data || []));

    setTimeout(() => {
      this.journals.set([{ id: 1, name: 'Diario de Ventas', code: 'VEN' }]);
      this.isLoadingRelations.set(false);
    }, 100);
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.configId.set(+id);
      this.loadConfig(+id);
    } else {
      this.isLoadingMode.set(false);
    }
  }

  private loadConfig(id: number): void {
    this.configApi.getPosConfig(id).subscribe({
      next: (res) => {
        const config = res.data;
        this.form.patchValue({
          name: config.name,
          warehouse_id: config.warehouse?.id?.toString() || '',
          default_customer_id: config.default_customer?.id?.toString() || '',
          apply_tax: config.apply_tax,
          prices_include_tax: config.prices_include_tax,
          is_active: config.is_active,
        });
        this.isLoadingMode.set(false);
      },
      error: () => {
        toast.error('No se pudo cargar la terminal POS.');
        this.goBack();
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Por favor, revise los campos del formulario.');
      return;
    }

    this.isSaving.set(true);
    const formVals = this.form.getRawValue();

    const payload: CreatePosConfigRequest = {
      name: formVals.name,
      warehouse_id: +formVals.warehouse_id,
      apply_tax: formVals.apply_tax,
      prices_include_tax: formVals.prices_include_tax,
      is_active: formVals.is_active,
      journals: [
        {
          journal_id: +formVals.journal_id,
          document_type: 'invoice',
          is_default: true,
        },
      ],
    };

    if (formVals.default_customer_id) {
      payload.default_customer_id = +formVals.default_customer_id;
    }

    const request$ =
      this.isEditMode() && this.configId()
        ? this.configApi.updatePosConfig(this.configId()!, payload)
        : this.configApi.createPosConfig(payload);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (res) => {
        toast.success(res.message || 'Terminal guardada correctamente');
        this.goBack();
      },
      error: () => {
        toast.error('Error al guardar la terminal.');
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
