import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { CompanyApi } from '@/core/services/api/company.api';
import {
    FormCreateEditComponent,
    DynamicField,
} from '@/shared/components/form-create-edit/form-create-edit.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-plane-create-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormCreateEditComponent,
    ],
    templateUrl: './plane-create-edit.component.html',
})
export class PlaneCreateEditComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly planApi = inject(MembershipPlanApi);
    private readonly companyApi = inject(CompanyApi);

    readonly id = signal<string | null>(null);
    readonly loading = signal(false);
    readonly initialData = signal<any>(null);

    readonly fields = signal<DynamicField[]>([
        {
            name: 'name',
            label: 'Nombre del Plan',
            type: 'text',
            placeholder: 'Ej: Plan Mensual VIP',
            colSpan: 1,
        },
        {
            name: 'price',
            label: 'Precio',
            type: 'number',
            placeholder: '0.00',
            colSpan: 1,
        },
        {
            name: 'duration_days',
            label: 'Duración (Días)',
            type: 'number',
            placeholder: '30',
            colSpan: 1,
        },
        {
            name: 'company_id',
            label: 'Sede/Compañía',
            type: 'select',
            options: [],
            colSpan: 1,
        },
        {
            name: 'max_entries_per_month',
            label: 'Entradas Máx. por Mes',
            type: 'number',
            placeholder: 'En dejar vacío para ilimitadas',
            colSpan: 1,
        },
        {
            name: 'max_entries_per_day',
            label: 'Entradas Máx. por Día',
            type: 'number',
            defaultValue: 1,
            colSpan: 1,
        },
        {
            name: 'time_restricted',
            label: '¿Tiene restricción horaria?',
            type: 'switch',
            defaultValue: false,
            colSpan: 1,
        },
        {
            name: 'allows_freezing',
            label: '¿Permite congelamiento?',
            type: 'switch',
            defaultValue: false,
            colSpan: 1,
        },
        {
            name: 'allowed_time_start',
            label: 'Hora Inicio (H:i)',
            type: 'text',
            placeholder: '08:00',
            colSpan: 1,
        },
        {
            name: 'allowed_time_end',
            label: 'Hora Fin (H:i)',
            type: 'text',
            placeholder: '22:00',
            colSpan: 1,
        },
        {
            name: 'max_freeze_days',
            label: 'Días Máx. Congelamiento',
            type: 'number',
            defaultValue: 0,
            colSpan: 1,
        },
        {
            name: 'is_active',
            label: 'Plan Activo',
            type: 'switch',
            defaultValue: true,
            colSpan: 1,
        },
        {
            name: 'description',
            label: 'Descripción',
            type: 'textarea',
            colSpan: 2,
        }
    ]);

    ngOnInit() {
        this.id.set(this.route.snapshot.params['id']);
        this.loadOptions();
        if (this.id()) {
            this.loadPlan();
        }
    }

    loadOptions() {
        this.companyApi.getCompanies({}).subscribe((res) => {
            const companies = res.data.map((c: any) => ({ label: c.trade_name, value: c.id.toString() }));
            this.updateFieldOptions('company_id', companies);
        });
    }

    private updateFieldOptions(fieldName: string, options: any[]) {
        this.fields.update(fs => fs.map(f => f.name === fieldName ? { ...f, options } : f));
    }

    loadPlan() {
        this.loading.set(true);
        this.planApi.getPlan(this.id()!).subscribe({
            next: (res: { data: any }) => {
                this.initialData.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                toast.error('Error al cargar datos');
                this.goBack();
            },
        });
    }

    onFormSubmit(rawData: any) {
        this.loading.set(true);

        // Clonar y normalizar cada campo según la especificación del API (STRICT TYPES!)
        const data: any = {
            name: String(rawData.name || ''),
            description: rawData.description || null,
            duration_days: parseInt(rawData.duration_days, 10) || 0,
            price: parseFloat(rawData.price) || 0,
            max_entries_per_day: parseInt(rawData.max_entries_per_day, 10) || 0,
            max_freeze_days: parseInt(rawData.max_freeze_days, 10) || 0,
            time_restricted: rawData.time_restricted === true || rawData.time_restricted === 'true' || rawData.time_restricted === 1,
            allows_freezing: rawData.allows_freezing === true || rawData.allows_freezing === 'true' || rawData.allows_freezing === 1,
            is_active: rawData.is_active !== false && rawData.is_active !== 'false' && rawData.is_active !== 0,
            company_id: parseInt(rawData.company_id, 10),

            // Campos que requieren cálculo o manejo especial
            duration_months: parseInt(rawData.duration_months || Math.floor(parseInt(rawData.duration_days, 10) / 30) || (parseInt(rawData.duration_days, 10) > 0 ? 1 : 0), 10),
            max_entries_per_month: (rawData.max_entries_per_month !== undefined && rawData.max_entries_per_month !== null && rawData.max_entries_per_month !== '') ? parseInt(rawData.max_entries_per_month, 10) : null,
            product_product_id: (rawData.product_product_id !== undefined && rawData.product_product_id !== null && rawData.product_product_id !== '') ? parseInt(rawData.product_product_id, 10) : null,

            // Tiempos
            allowed_time_start: rawData.allowed_time_start || null,
            allowed_time_end: rawData.allowed_time_end || null,

            // Días permitidos (API requiere ARRAY aunque la documentación diga string)
            allowed_days: Array.isArray(rawData.allowed_days)
                ? rawData.allowed_days
                : (rawData.allowed_days ? rawData.allowed_days.split(',') : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        };

        const request = this.id()
            ? this.planApi.updatePlan(this.id()!, data)
            : this.planApi.createPlan(data);

        request.subscribe({
            next: () => {
                toast.success(this.id() ? 'Plan actualizado' : 'Plan creado');
                this.goBack();
            },
            error: (err) => {
                console.error('Plan error:', err);
                let detail = 'Error al procesar';
                if (err?.error?.errors) {
                    const errors = err.error.errors;
                    detail = Object.keys(errors).map(k => `${k}: ${errors[k].join(', ')}`).join(' | ');
                } else if (err?.error?.message) {
                    detail = err.error.message;
                }
                toast.error('Error de Validación', { description: detail });
                this.loading.set(false);
            },
        });
    }

    goBack() {
        this.router.navigate(['/gym/plans']);
    }
}
