import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { SaleApi } from '@/core/services/api/sale.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { SaleResource, SaleQueryParams } from '@/core/models/sale.model';
import { ApiResponse, PaginatedResponse } from '@/core/models/api-response.model';
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
    selector: 'app-ventas',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './ventas.html',
    styleUrl: './ventas.css',
})
export class Ventas {
    private readonly router = inject(Router);
    private readonly saleApi = inject(SaleApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly sales = signal<SaleResource[]>([]);
    readonly pagination = signal<PaginatedResponse<SaleResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly status = signal<string>('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<SaleResource>[] = [
        {
            key: 'document_number',
            label: 'Documento',
            type: 'stack',
            subKey: 'serie',
            transform: (v, item) => `${item.serie}-${item.correlative}`,
            subTransform: () => 'Nro. correlativo',
        },
        {
            key: 'partner',
            label: 'Cliente',
            type: 'stack',
            subKey: 'partner',
            transform: (v) => v?.name || 'Cliente Varios',
            subTransform: (v) => v?.document_number || 'S/D',
        },
        {
            key: 'date',
            label: 'Fecha',
            type: 'text',
        },
        {
            key: 'total',
            label: 'Total',
            type: 'text',
            transform: (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v),
        },
        {
            key: 'status',
            label: 'Estado',
            type: 'badge',
            badgeVariant: (v) => {
                switch (v) {
                    case 'posted': return 'secondary';
                    case 'draft': return 'outline';
                    case 'cancelled': return 'destructive';
                    default: return 'outline';
                }
            },
            transform: (v) => {
                switch (v) {
                    case 'posted': return 'Publicado';
                    case 'draft': return 'Borrador';
                    case 'cancelled': return 'Cancelado';
                    default: return v;
                }
            },
        },
        {
            key: 'payment_status',
            label: 'Pago',
            type: 'badge',
            badgeVariant: (v) => {
                switch (v) {
                    case 'paid': return 'default';
                    case 'partial': return 'secondary';
                    case 'unpaid': return 'destructive';
                    default: return 'outline';
                }
            },
            transform: (v) => {
                switch (v) {
                    case 'paid': return 'Pagado';
                    case 'partial': return 'Parcial';
                    case 'unpaid': return 'Pendiente';
                    default: return v;
                }
            },
        },
    ];

    readonly actions: TableDetailsAction<SaleResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (s: SaleResource) => this.router.navigate(['/ventas/lista', s.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            show: (s: SaleResource) => s.status === 'draft',
            onAction: (s: SaleResource) => this.router.navigate(['/ventas/lista', s.id, 'edit']),
        },
        {
            label: 'Publicar',
            icon: 'badge-check',
            show: (s: SaleResource) => s.status === 'draft',
            onAction: (s: SaleResource) => this.confirmPostSale(s),
        },
        {
            label: 'Cancelar',
            icon: 'ban',
            show: (s: SaleResource) => s.status === 'posted',
            onAction: (s: SaleResource) => this.confirmCancelSale(s),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            show: (s: SaleResource) => s.status === 'draft',
            onAction: (s: SaleResource) => this.confirmDeleteSale(s),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.status();
            this.currentPage();
            this.loadSales();
        });
    }

    goToNewSale() {
        this.router.navigate(['/ventas/lista/new']);
    }

    loadSales() {
        this.loading.set(true);
        const params: SaleQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
            status: this.status(),
        };

        this.saleApi.getSales(params).subscribe({
            next: (res) => {
                this.sales.set(res.data.data);
                this.pagination.set(res.data.meta || null);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las ventas.');
                this.loading.set(false);
            },
        });
    }

    confirmPostSale(sale: SaleResource) {
        this.alertDialog.confirm({
            zTitle: 'Publicar Venta',
            zContent: `¿Estás seguro de que deseas publicar la venta <strong>${sale.serie}-${sale.correlative}</strong>? Esta acción generará el comprobante final.`,
            zOkText: 'Sí, publicar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.saleApi.postSale(sale.id).subscribe({
                    next: () => {
                        toast.success('Venta publicada correctamente');
                        this.loadSales();
                    },
                    error: (err) => toast.error(err.error?.message || 'No se pudo publicar la venta'),
                });
            },
        });
    }

    confirmCancelSale(sale: SaleResource) {
        this.alertDialog.confirm({
            zTitle: 'Cancelar Venta',
            zContent: `¿Estás seguro de que deseas cancelar la venta <strong>${sale.serie}-${sale.correlative}</strong>? Esta acción anulará el comprobante.`,
            zOkText: 'Sí, cancelar',
            zCancelText: 'Cerrar',
            zOkDestructive: true,
            zOnOk: () => {
                this.saleApi.cancelSale(sale.id).subscribe({
                    next: () => {
                        toast.success('Venta cancelada');
                        this.loadSales();
                    },
                    error: (err) => toast.error(err.error?.message || 'No se pudo cancelar la venta'),
                });
            },
        });
    }

    confirmDeleteSale(sale: SaleResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Venta',
            zContent: `¿Estás seguro de que deseas eliminar el borrador de venta <strong>${sale.serie}-${sale.correlative}</strong>?`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.saleApi.deleteSale(sale.id).subscribe({
                    next: () => {
                        toast.success('Venta eliminada');
                        this.loadSales();
                    },
                    error: () => toast.error('No se pudo eliminar la venta'),
                });
            },
        });
    }
}
