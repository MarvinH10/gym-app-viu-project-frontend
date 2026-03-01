import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { UserApi } from '@/core/services/api/user.api';
import { User } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardBadgeImports } from '@/shared/components/badge';

@Component({
  selector: 'app-usuario-detail',
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
  templateUrl: './usuario-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userApi = inject(UserApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isDeleting = signal(false);

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información del Usuario',
      fields: [
        { name: 'name', label: 'Nombre Completo', colSpan: 2 },
        { name: 'email', label: 'Correo Electrónico', colSpan: 2 },
        {
          name: 'email_verified_at',
          label: 'Estado de Verificación',
          transform: (v) => (v ? 'Verificado' : 'Pendiente'),
          fallback: 'Pendiente',
        },
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
      this.router.navigate(['/sistema/usuarios']);
      return;
    }
    this.userApi.getUser(id).subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'No se pudo cargar la información del usuario.';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onBack() {
    this.router.navigate(['/sistema/usuarios']);
  }

  goToEdit() {
    const id = this.user()?.id;
    if (id) this.router.navigate(['/sistema/usuarios', id, 'edit']);
  }

  confirmDelete() {
    const u = this.user();
    if (!u) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Usuario',
      zContent: `¿Estás seguro de que deseas eliminar al usuario <strong>${u.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.userApi.deleteUser(u.id).subscribe({
          next: () => {
            toast.success('Usuario eliminado');
            this.onBack();
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar el usuario');
          },
        });
      },
    });
  }
}
