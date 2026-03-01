import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { UserApi } from '@/core/services/api/user.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { User, PaginatedResponse, UserQueryParams } from '@/core/models';
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
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  private readonly router = inject(Router);
  private readonly userApi = inject(UserApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly users = signal<User[]>([]);
  readonly pagination = signal<PaginatedResponse<User>['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly perPage = signal(10);

  readonly columns: TableDetailsColumn<User>[] = [
    {
      key: 'name',
      label: 'Usuario',
      type: 'avatar',
      subKey: 'email',
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      type: 'text',
      transform: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'email_verified_at',
      label: 'Verificado',
      type: 'badge',
      badgeVariant: (v) => (v ? 'secondary' : 'outline'),
      transform: (v) => (v ? 'Verificado' : 'Pendiente'),
    },
  ];

  readonly actions: TableDetailsAction<User>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (u) => this.router.navigate(['/sistema/usuarios', u.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (u) => this.router.navigate(['/sistema/usuarios', u.id, 'edit']),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (u) => this.confirmDeleteUser(u),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.currentPage();
      this.loadUsers();
    });
  }

  goToNewUser() {
    this.router.navigate(['/sistema/usuarios/new']);
  }

  loadUsers() {
    this.loading.set(true);
    const params: UserQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };

    this.userApi.getUsers(params).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  confirmDeleteUser(user: User) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Usuario',
      zContent: `¿Estás seguro de que deseas eliminar a <strong>${user.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.userApi.deleteUser(user.id).subscribe({
          next: () => {
            toast.success('Usuario eliminado', {
              description: `${user.name} fue eliminado correctamente.`,
            });
            this.loadUsers();
          },
          error: () =>
            toast.error('Error al eliminar', { description: 'No se pudo eliminar al usuario.' }),
        });
      },
    });
  }
}
