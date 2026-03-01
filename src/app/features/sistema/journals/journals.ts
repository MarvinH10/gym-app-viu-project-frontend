import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { JournalApi } from '@/core/services/api/journal.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { JournalResource, PaginatedResponse, JournalQueryParams } from '@/core/models';
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
    selector: 'app-journals',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './journals.html',
    styleUrl: './journals.css',
})
export class JournalsComponent {
    private readonly router = inject(Router);
    private readonly journalApi = inject(JournalApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly journals = signal<JournalResource[]>([]);
    readonly pagination = signal<PaginatedResponse<JournalResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly typeFilter = signal<JournalQueryParams['type']>(null);
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<JournalResource>[] = [
        {
            key: 'name',
            label: 'Diario',
            type: 'stack',
            subKey: 'code',
            subTransform: (v) => `Código: ${v}`,
        },
        {
            key: 'type',
            label: 'Tipo',
            type: 'badge',
            badgeVariant: (v) => {
                switch (v) {
                    case 'sale': return 'default';
                    case 'purchase': return 'secondary';
                    case 'cash': return 'outline';
                    default: return 'outline';
                }
            },
            transform: (v) => {
                const types: any = {
                    sale: 'Venta',
                    purchase: 'Compra',
                    'purchase-order': 'Orden Compra',
                    quote: 'Cotización',
                    cash: 'Efectivo',
                };
                return types[v] || v;
            },
        },
        {
            key: 'is_fiscal',
            label: 'Fiscal',
            type: 'badge',
            badgeVariant: (v) => (v ? 'default' : 'outline'),
            transform: (v) => (v ? 'Sí' : 'No'),
        },
        {
            key: 'sequence',
            label: 'Secuencia Act.',
            type: 'text',
            transform: (v: any) => v?.next_number ?? 'N/A',
        },
        {
            key: 'company',
            label: 'Sede/Empresa',
            type: 'text',
            transform: (v: any) => v?.business_name || 'N/A',
        },
    ];

    readonly actions: TableDetailsAction<JournalResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (j) => this.router.navigate(['/sistema/diarios', j.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            onAction: (j) => this.router.navigate(['/sistema/diarios', j.id, 'edit']),
        },
        {
            label: 'Reiniciar Secuencia',
            icon: 'refresh-cw',
            onAction: (j) => this.confirmResetSequence(j),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            onAction: (j) => this.confirmDeleteJournal(j),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.loadJournals();
        });
    }

    goToNewJournal() {
        this.router.navigate(['/sistema/diarios/new']);
    }

    loadJournals() {
        this.loading.set(true);
        const params: JournalQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
            type: this.typeFilter(),
        };

        this.journalApi.getJournals(params).subscribe({
            next: (res) => {
                const data = res.data || [];
                // Ordenar por nombre por defecto
                data.sort((a, b) => a.name.localeCompare(b.name));
                this.journals.set(data);
                this.pagination.set(res.meta);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar los diarios. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    confirmResetSequence(journal: JournalResource) {
        this.alertDialog.confirm({
            zTitle: 'Reiniciar Secuencia',
            zContent: `¿Estás seguro de que deseas reiniciar la secuencia del diario <strong>${journal.name}</strong> a 1?`,
            zOkText: 'Sí, reiniciar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.journalApi.resetSequence(journal.id).subscribe({
                    next: (res) => {
                        toast.success(res.message);
                        this.loadJournals();
                    },
                    error: () => toast.error('Error al reiniciar secuencia'),
                });
            },
        });
    }

    confirmDeleteJournal(journal: JournalResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Diario',
            zContent: `¿Estás seguro de que deseas eliminar el diario <strong>${journal.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.journalApi.deleteJournal(journal.id).subscribe({
                    next: () => {
                        toast.success('Diario eliminado');
                        this.loadJournals();
                    },
                    error: () => toast.error('No se pudo eliminar el diario'),
                });
            },
        });
    }
}
