import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { CompanyApi } from '@/core/services/api/company.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CompanyResource, PaginatedResponse, CompanyQueryParams } from '@/core/models';
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
  selector: 'app-companias',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './companias.html',
  styleUrl: './companias.css',
})
export class Companias {
  private readonly router = inject(Router);
  private readonly companyApi = inject(CompanyApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly companies = signal<CompanyResource[]>([]);
  readonly pagination = signal<PaginatedResponse<CompanyResource>['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(10);

  readonly columns: TableDetailsColumn<CompanyResource>[] = [
    {
      key: 'business_name',
      label: 'Compañía',
      type: 'stack',
      subKey: 'trade_name',
      subTransform: (v) => (v ? `N. Comercial: ${v}` : 'No especificado'),
    },
    {
      key: 'ruc',
      label: 'RUC',
      type: 'text',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      fallback: 'Sin email',
    },
    {
      key: 'phone',
      label: 'Teléfono',
      type: 'text',
      fallback: 'Sin teléfono',
    },
    {
      key: 'active',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v) => (v ? 'secondary' : 'outline'),
      transform: (v) => (v ? 'Activo' : 'Inactivo'),
    },
  ];

  readonly actions: TableDetailsAction<CompanyResource>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (c) => this.router.navigate(['/sistema/companias', c.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (c) => this.router.navigate(['/sistema/companias', c.id, 'edit']),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (c) => this.confirmDeleteCompany(c),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.loadCompanies();
    });
  }

  goToNewCompany() {
    this.router.navigate(['/sistema/companias/new']);
  }

  loadCompanies() {
    this.loading.set(true);
    const params: CompanyQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };

    this.companyApi.getCompanies(params).subscribe({
      next: (res) => {
        this.companies.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las compañías. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  confirmDeleteCompany(company: CompanyResource) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Compañía',
      zContent: `¿Estás seguro de que deseas eliminar la compañía <strong>${company.business_name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.companyApi.deleteCompany(company.id).subscribe({
          next: () => {
            toast.success('Compañía eliminada');
            this.loadCompanies();
          },
          error: () => toast.error('No se pudo eliminar la compañía'),
        });
      },
    });
  }
}
