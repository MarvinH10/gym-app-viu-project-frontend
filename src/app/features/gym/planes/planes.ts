import { Component, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import {
  MembershipPlanResource,
  PaginatedMembershipPlansResponse,
  MembershipPlanQueryParams,
} from '@/core/models/membership-plan.model';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSearchFiltersImports } from '@/shared/components/search-filters';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import {
  TableDetailsImports,
  TableDetailsColumn,
  TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...ZardSkeletonImports,
    ...TableDetailsImports,
  ],
  templateUrl: './planes.html',
  styleUrl: './planes.css',
})
export class PlanesComponent {
  private readonly router = inject(Router);
  private readonly planApi = inject(MembershipPlanApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly plans = signal<MembershipPlanResource[]>([]);
  readonly pagination = signal<PaginatedMembershipPlansResponse['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(25);
  readonly status = signal<'active' | 'inactive' | undefined>(undefined);

  readonly columns: TableDetailsColumn<MembershipPlanResource>[] = [
    {
      key: 'name',
      label: 'Plan',
      type: 'stack',
      subKey: 'price',
      transform: (v: string) => v,
      subTransform: (v: any) => `S/ ${parseFloat(String(v)).toFixed(2)}`,
    },
    {
      key: 'duration_days',
      label: 'Duración',
      transform: (v: number) => `${v} días`,
    },
    {
      key: 'max_entries_per_month',
      label: 'Límite Mensual',
      transform: (v: any) => (v === null || v === 0 ? 'Ilimitado' : `${v} visitas`),
    },
    {
      key: 'is_active',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v: any) => (v ? 'secondary' : 'outline'),
      transform: (v: any) => (v ? 'Activo' : 'Inactivo'),
    },
  ];

  readonly tableActions: TableDetailsAction<MembershipPlanResource>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (p: MembershipPlanResource) => this.router.navigate(['/gym/plans', p.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (p: MembershipPlanResource) => this.router.navigate(['/gym/plans', p.id, 'edit']),
    },
    {
      label: 'Cambiar Estado',
      icon: 'refresh-cw',
      onAction: (p: MembershipPlanResource) => this.toggleStatus(p),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (p: MembershipPlanResource) => this.confirmDelete(p),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.status();
      this.loadPlans();
    });
  }

  goToNew() {
    this.router.navigate(['/gym/plans/new']);
  }

  loadPlans() {
    this.loading.set(true);
    const params: MembershipPlanQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      q: this.search(),
      status: this.status(),
    };

    this.planApi.getPlans(params).subscribe({
      next: (res) => {
        this.plans.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudieron cargar los planes de membresía.';
        this.error.set(msg);
        this.loading.set(false);
        toast.error('Error', { description: msg });
      },
    });
  }

  toggleStatus(plan: MembershipPlanResource) {
    this.planApi.toggleStatus(plan.id).subscribe({
      next: () => {
        toast.success('Estado actualizado');
        this.loadPlans();
      },
      error: (err) => {
        toast.error('Error al actualizar estado', { description: err?.error?.message });
      },
    });
  }

  confirmDelete(plan: MembershipPlanResource) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Plan',
      zContent: `¿Deseas eliminar el plan <strong>${plan.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Eliminar',
      zCancelText: 'Cancelar',
      zOnOk: () => {
        this.planApi.deletePlan(plan.id).subscribe({
          next: () => {
            toast.success('Plan eliminado');
            this.loadPlans();
          },
          error: (err) => {
            toast.error('Error al eliminar', { description: err?.error?.message });
          },
        });
      },
    });
  }
}
