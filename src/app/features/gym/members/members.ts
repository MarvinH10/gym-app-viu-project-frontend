import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { MemberApi } from '@/core/services/api/member.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { Member, PaginatedResponse, MemberQueryParams } from '@/core/models';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSearchFiltersImports, FilterSection } from '@/shared/components/search-filters';
import {
  TableDetailsImports,
  TableDetailsColumn,
  TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ...ZardSearchFiltersImports,
    ...TableDetailsImports,
  ],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members {
  private readonly router = inject(Router);
  private readonly memberApi = inject(MemberApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  readonly members = signal<Member[]>([]);
  readonly pagination = signal<PaginatedResponse<Member>['meta'] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly selectedStatuses = signal<string[]>([]);
  readonly selectedPortal = signal<string[]>([]);
  readonly currentPage = signal(1);
  readonly perPage = signal(10);

  readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

  readonly selectedFilters = computed(() => ({
    status: this.selectedStatuses(),
    portal: this.selectedPortal(),
  }));

  readonly filterSections: FilterSection[] = [
    {
      id: 'status',
      title: 'Estado',
      options: [
        { label: 'Activos', value: 'active' },
        { label: 'Inactivos', value: 'inactive' },
        { label: 'Suspendidos', value: 'suspended' },
      ],
    },
    {
      id: 'portal',
      title: 'Acceso Portal',
      options: [
        { label: 'Con acceso', value: 'with_portal' },
        { label: 'Sin acceso', value: 'without_portal' },
      ],
    },
  ];

  readonly columns: TableDetailsColumn<Member>[] = [
    {
      key: 'name',
      label: 'Miembro',
      type: 'avatar',
      subKey: 'id',
      subTransform: (id) => `ID: ${id}`,
    },
    {
      key: 'document_number',
      label: 'Documento',
      type: 'stack',
      subKey: 'document_type',
      subTransform: (v) => v,
    },
    {
      key: 'email',
      label: 'Contacto',
      type: 'stack',
      fallback: 'Sin correo',
      subKey: 'mobile',
      subIcon: 'smartphone',
      subTransform: (v, row) => v || row['phone'] || 'No registra',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeVariant: (v) =>
        v === 'active' ? 'secondary' : v === 'blacklisted' ? 'destructive' : 'outline',
      transform: (v) =>
        ({
          active: 'Activo',
          suspended: 'Suspendido',
          blacklisted: 'Lista Negra',
          inactive: 'Inactivo',
        })[v as string] ?? v,
    },
  ];

  readonly actions: TableDetailsAction<Member>[] = [
    {
      label: 'Ver detalles',
      icon: 'eye',
      onAction: (m) => this.router.navigate(['/gym/members', m.id]),
    },
    {
      label: 'Editar',
      icon: 'pencil',
      onAction: (m) => this.router.navigate(['/gym/members', m.id, 'edit']),
    },
    {
      label: 'Eliminar',
      icon: 'trash',
      destructive: true,
      onAction: (m) => this.confirmDeleteMember(m),
    },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.selectedStatuses();
      this.selectedPortal();
      this.currentPage();
      this.loadMembers();
    });
  }

  goToNewMember() {
    this.router.navigate(['/gym/members/new']);
  }

  loadMembers() {
    this.loading.set(true);
    const params: MemberQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };
    if (this.selectedStatuses().length) params['status[]'] = this.selectedStatuses();
    if (this.selectedPortal().length) params['portal[]'] = this.selectedPortal();

    this.memberApi.getMembers(params).subscribe({
      next: (res) => {
        this.members.set(res.data);
        this.pagination.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los miembros. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  handleFilterToggle(event: { sectionId: string; value: string }) {
    const toggle = (sig: ReturnType<typeof signal<string[]>>, v: string) =>
      sig.update((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

    if (event.sectionId === 'status') toggle(this.selectedStatuses, event.value);
    else if (event.sectionId === 'portal') toggle(this.selectedPortal, event.value);
    this.currentPage.set(1);
  }

  confirmDeleteMember(member: Member) {
    this.alertDialog.confirm({
      zTitle: 'Eliminar Miembro',
      zContent: `¿Estás seguro de que deseas eliminar a <strong>${member.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.memberApi.deleteMember(member.id).subscribe({
          next: () => {
            toast.success('Miembro eliminado', {
              description: `${member.name} fue eliminado correctamente.`,
            });
            this.loadMembers();
          },
          error: () =>
            toast.error('Error al eliminar', { description: 'No se pudo eliminar al miembro.' }),
        });
      },
    });
  }
}
