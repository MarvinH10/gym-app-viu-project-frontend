import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CompanyApi } from '@/core/services/api/company.api';
import { CompanyResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardBadgeImports } from '@/shared/components/badge';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...ZardBadgeImports,
    ...FormDetailImports,
  ],
  templateUrl: './company-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companyApi = inject(CompanyApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly company = signal<CompanyResource | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información de la Compañía',
      fields: [
        { name: 'business_name', label: 'Razón Social', colSpan: 2 },
        { name: 'trade_name', label: 'Nombre Comercial', fallback: 'No especificado', colSpan: 2 },
        { name: 'ruc', label: 'RUC' },
        { name: 'branch_code', label: 'Código de Sucursal', fallback: 'Principal' },
        { name: 'is_main', label: '¿Es Principal?', type: 'boolean' },
        { name: 'active', label: 'Estado', transform: (v) => (v ? 'Activo' : 'Inactivo') },
      ],
    },
    {
      title: 'Contacto y Ubicación',
      fields: [
        { name: 'email', label: 'Correo Electrónico', fallback: 'Sin correo' },
        { name: 'phone', label: 'Teléfono', fallback: 'Sin teléfono' },
        { name: 'address', label: 'Dirección Fiscal', fallback: 'Sin dirección', colSpan: 2 },
        { name: 'ubigeo', label: 'Ubigeo', fallback: 'Sin ubigeo' },
      ],
    },
    {
      title: 'Auditoría',
      fields: [
        { name: 'created_at', label: 'Fecha de Registro', type: 'datetime' },
        { name: 'updated_at', label: 'Última Modificación', type: 'datetime' },
      ],
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/sistema/companias']);
      return;
    }
    this.companyApi.getCompany(id).subscribe({
      next: (res) => {
        this.company.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'No se pudo cargar la información de la compañía.';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onBack() {
    this.router.navigate(['/sistema/companias']);
  }

  goToEdit() {
    const id = this.company()?.id;
    if (id) this.router.navigate(['/sistema/companias', id, 'edit']);
  }

  confirmDelete() {
    const c = this.company();
    if (!c) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Compañía',
      zContent: `¿Estás seguro de que deseas eliminar la compañía <strong>${c.business_name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.companyApi.deleteCompany(c.id).subscribe({
          next: () => {
            toast.success('Compañía eliminada');
            this.onBack();
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar la compañía');
          },
        });
      },
    });
  }
}
