import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { MembershipPlanResource } from '@/core/models/membership-plan.model';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-plane-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
    FormDetailComponent,
  ],
  templateUrl: './plane-detail.component.html',
})
export class PlaneDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planApi = inject(MembershipPlanApi);

  readonly plan = signal<MembershipPlanResource | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información General',
      fields: [
        { name: 'name', label: 'Nombre del Plan' },
        {
          name: 'price',
          label: 'Precio',
          transform: (v: any) => `S/ ${parseFloat(String(v)).toFixed(2)}`,
        },
        {
          name: 'duration_days',
          label: 'Duración',
          transform: (v: any) => `${v} días`,
        },
        {
          name: 'description',
          label: 'Descripción',
          fallback: 'Sin descripción adicional.',
          colSpan: 2,
        },
      ],
    },
    {
      title: 'Configuración de Entradas',
      fields: [
        {
          name: 'max_entries_per_month',
          label: 'Máx. Entradas / Mes',
          transform: (v: any) => (v === null || v === 0 ? 'Ilimitado' : `${v} visitas`),
        },
        {
          name: 'max_entries_per_day',
          label: 'Máx. Entradas / Día',
          transform: (v: any) => (v === 1 ? '1 visita' : `${v} visitas`),
        },
      ],
    },
    {
      title: 'Restricciones y Horarios',
      fields: [
        { name: 'time_restricted', label: 'Restricción Horaria', type: 'boolean' },
        { name: 'allowed_time_start', label: 'Hora Inicio', fallback: '—' },
        { name: 'allowed_time_end', label: 'Hora Fin', fallback: '—' },
        {
          name: 'allowed_days',
          label: 'Días Permitidos',
          transform: (v: any) => (Array.isArray(v) ? v.join(', ') : 'Todos'),
        },
      ],
    },
    {
      title: 'Congelamiento y Otros',
      fields: [
        { name: 'allows_freezing', label: 'Permite Congelar', type: 'boolean' },
        {
          name: 'max_freeze_days',
          label: 'Máx. Días Congelamiento',
          transform: (v: any) => `${v} días`,
        },
        {
          name: 'is_active',
          label: 'Estado del Plan',
          type: 'boolean',
        },
      ],
    },
  ];

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
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'No se pudo cargar la información del plan.';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onBack() {
    this.router.navigate(['/gym/plans']);
  }

  goToEdit() {
    if (this.plan()) {
      this.router.navigate(['/gym/plans', this.plan()!.id, 'edit']);
    }
  }

  confirmDelete() {
    const p = this.plan();
    if (!p) return;

    this.planApi.deletePlan(p.id).subscribe({
      next: () => {
        toast.success('Plan eliminado');
        this.onBack();
      },
      error: (err) => {
        toast.error('Error al eliminar', { description: err?.error?.message });
      },
    });
  }
}
