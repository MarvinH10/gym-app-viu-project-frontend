import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { MembershipPlanResource } from '@/core/models/membership-plan.model';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-plane-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        FormDetailComponent
    ],
    templateUrl: './plane-detail.component.html',
})
export class PlaneDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly planApi = inject(MembershipPlanApi);

    readonly plan = signal<MembershipPlanResource | null>(null);
    readonly loading = signal(true);

    readonly detailSections = signal<DetailSection[]>([
        {
            title: 'Información General',
            fields: [
                { name: 'name', label: 'Nombre del Plan' },
                { name: 'price', label: 'Precio', type: 'currency' },
                { name: 'status', label: 'Estado', type: 'badge', badgeVariant: (v) => v ? 'secondary' : 'destructive', transform: (v) => v ? 'Activo' : 'Inactivo' },
                { name: 'description', label: 'Descripción' },
            ],
        },
        {
            title: 'Duración y Acceso',
            fields: [
                { name: 'duration_days', label: 'Duración (Días)' },
                { name: 'max_entries_per_month', label: 'Entradas por Mes', fallback: 'Ilimitadas' },
                { name: 'max_entries_per_day', label: 'Entradas por Día' },
            ],
        },
        {
            title: 'Restricciones y Congelamiento',
            fields: [
                { name: 'time_restricted', label: 'Restricción Horaria', type: 'boolean' },
                { name: 'allowed_time_start', label: 'Hora Inicio', fallback: '—' },
                { name: 'allowed_time_end', label: 'Hora Fin', fallback: '—' },
                { name: 'allows_freezing', label: 'Permite Congelar', type: 'boolean' },
                { name: 'max_freeze_days', label: 'Días Máx. Congelamiento' },
            ],
        }
    ]);

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.loadPlan(id);
        }
    }

    loadPlan(id: string) {
        this.loading.set(true);
        this.planApi.getPlan(id).subscribe({
            next: (res) => {
                this.plan.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                toast.error('No se pudo cargar el plan');
                this.goBack();
            },
        });
    }

    goBack() {
        this.router.navigate(['/gym/plans']);
    }
}
