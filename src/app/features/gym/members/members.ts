import { Component, effect, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { MemberApi } from '@/core/services/api/member.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { Member, PaginatedResponse, MemberQueryParams } from '@/core/models';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardDropdownImports } from '@/shared/components/dropdown/dropdown.imports';
import { ZardTableImports } from '@/shared/components/table/table.imports';
import { ZardPaginationImports } from '@/shared/components/pagination/pagination.imports';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSearchFiltersImports, FilterSection } from '@/shared/components/search-filters';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ...ZardTableImports,
    ...ZardPaginationImports,
    ...ZardBadgeImports,
    ...ZardSearchFiltersImports,
    ...ZardSkeletonImports,
    ...ZardSelectImports,
    ...ZardDropdownImports,
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
  loading = signal(false);
  error = signal<string | null>(null);

  search = signal('');
  selectedStatuses = signal<string[]>([]);
  selectedPortal = signal<string[]>([]);
  currentPage = signal(1);
  perPage = signal(10);

  filterSections: FilterSection[] = [
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

  selectedFilters = computed(() => ({
    status: this.selectedStatuses(),
    portal: this.selectedPortal(),
  }));

  totalPages = computed(() => this.pagination()?.last_page || 1);

  constructor() {
    effect(() => {
      this.loadMembers();
    });
  }

  goToNewMember() {
    this.router.navigate(['/gym/members/new']);
  }

  goToMemberDetail(id: string) {
    this.router.navigate(['/gym/members', id]);
  }

  goToEditMember(id: string) {
    this.router.navigate(['/gym/members', id, 'edit']);
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
          error: () => {
            toast.error('Error al eliminar', {
              description: 'No se pudo eliminar al miembro. Inténtalo de nuevo.',
            });
          },
        });
      },
    });
  }

  loadMembers() {
    this.loading.set(true);
    const params: MemberQueryParams = {
      page: this.currentPage(),
      per_page: this.perPage(),
      search: this.search(),
    };

    if (this.selectedStatuses().length > 0) {
      params['status[]'] = this.selectedStatuses();
    }
    if (this.selectedPortal().length > 0) {
      params['portal[]'] = this.selectedPortal();
    }

    this.memberApi.getMembers(params).subscribe({
      next: (response) => {
        this.members.set(response.data);
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los miembros. Inténtelo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.currentPage.set(1);
  }

  toggleStatus(status: string) {
    this.selectedStatuses.update((current) =>
      current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    );
    this.currentPage.set(1);
  }

  togglePortal(portal: string) {
    this.selectedPortal.update((current) =>
      current.includes(portal) ? current.filter((p) => p !== portal) : [...current, portal],
    );
    this.currentPage.set(1);
  }

  handleFilterToggle(event: { sectionId: string; value: string }) {
    if (event.sectionId === 'status') {
      this.toggleStatus(event.value);
    } else if (event.sectionId === 'portal') {
      this.togglePortal(event.value);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'suspended':
        return 'Suspendido';
      case 'blacklisted':
        return 'Lista Negra';
      default:
        return 'Inactivo';
    }
  }
}
