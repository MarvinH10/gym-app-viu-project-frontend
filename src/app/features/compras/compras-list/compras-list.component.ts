import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { PurchaseApi } from '@/core/services/api/purchase.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { PurchaseResource, PurchaseQueryParams } from '@/core/models/purchase.model';
import { PaginatedResponse } from '@/core/models/api-response.model';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import {
    ZardSearchFiltersImports,
    FilterSection
} from '@/shared/components/search-filters';
import {
    TableDetailsImports,
    TableDetailsColumn,
    TableDetailsAction,
} from '@/shared/components/table-details/table-details.imports';

@Component({
    selector: 'app-compras-list',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './compras-list.component.html',
    styleUrl: './compras-list.component.css',
})
export class ComprasListComponent {
    private readonly router = inject(Router);
    private readonly purchaseApi = inject(PurchaseApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly purchases = signal<PurchaseResource[]>([]);
    readonly pagination = signal<PaginatedResponse<PurchaseResource>['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly status = signal<string>('');
    readonly currentPage = signal(1);
    readonly perPage = signal(10);

    readonly filterSections: FilterSection[] = [
        {
            id: 'status',
            title: 'Estado',
            options: [
                { label: 'Borrador', value: 'draft' },
                { label: 'Publicado', value: 'posted' },
                { label: 'Cancelado', value: 'cancelled' }
            ]
        }
    ];

    readonly selectedFilters = computed<Record<string, string[]>>(() => {
        const s = this.status();
        return { status: s ? [s] : [] };
    });

    readonly totalPages = computed(() => this.pagination()?.last_page ?? 1);

    readonly columns: TableDetailsColumn<PurchaseResource>[] = [
        {
            key: 'correlative',
            label: 'Documento',
            type: 'stack',
            subKey: 'serie',
            transform: (v, item) => `${item.serie}-${item.correlative}`,
            subTransform: () => 'Nro. correlativo',
        },
        {
            key: 'partner',
            label: 'Proveedor',
            type: 'stack',
            subKey: 'partner',
            transform: (v) => v?.business_name || v?.name || 'Proveedor Desconocido',
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
                    case 'not_paid': return 'destructive';
                    default: return 'outline';
                }
            },
            transform: (v) => {
                switch (v) {
                    case 'paid': return 'Pagado';
                    case 'partial': return 'Parcial';
                    case 'not_paid': return 'Pendiente';
                    default: return v;
                }
            },
        },
    ];

    readonly actions: TableDetailsAction<PurchaseResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (p: PurchaseResource) => this.router.navigate(['/compras/lista', p.id]),
        },
        {
            label: 'Editar',
            icon: 'pencil',
            show: (p: PurchaseResource) => p.status === 'draft',
            onAction: (p: PurchaseResource) => this.router.navigate(['/compras/lista', p.id, 'edit']),
        },
        {
            label: 'Publicar',
            icon: 'badge-check',
            show: (p: PurchaseResource) => p.status === 'draft',
            onAction: (p: PurchaseResource) => this.confirmPostPurchase(p),
        },
        {
            label: 'Cancelar',
            icon: 'ban',
            show: (p: PurchaseResource) => p.status === 'posted',
            onAction: (p: PurchaseResource) => this.confirmCancelPurchase(p),
        },
        {
            label: 'Eliminar',
            icon: 'trash',
            destructive: true,
            show: (p: PurchaseResource) => p.status === 'draft',
            onAction: (p: PurchaseResource) => this.confirmDeletePurchase(p),
        },
    ];

    constructor() {
        effect(() => {
            this.search();
            this.status();
            this.currentPage();
            this.loadPurchases();
        });
    }

    onFilterToggle(event: { sectionId: string; value: string }) {
        if (event.sectionId === 'status') {
            const current = this.status();
            this.status.set(current === event.value ? '' : event.value);
            this.currentPage.set(1);
        }
    }

    goToNewPurchase() {
        this.router.navigate(['/compras/lista/new']);
    }

    loadPurchases() {
        this.loading.set(true);
        const params: PurchaseQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
            status: this.status(),
        };

        this.purchaseApi.getPurchases(params).subscribe({
            next: (res) => {
                this.purchases.set(res.data.data);
                this.pagination.set(res.data.meta || null);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las compras.');
                this.loading.set(false);
            },
        });
    }

    confirmPostPurchase(purchase: PurchaseResource) {
        this.alertDialog.confirm({
            zTitle: 'Publicar Compra',
            zContent: `¿Estás seguro de que deseas publicar la compra <strong>${purchase.serie}-${purchase.correlative}</strong>? Esta acción registrará el ingreso de stock.`,
            zOkText: 'Sí, publicar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.purchaseApi.postPurchase(purchase.id).subscribe({
                    next: () => {
                        toast.success('Compra publicada correctamente');
                        this.loadPurchases();
                    },
                    error: (err) => toast.error(err.error?.message || 'No se pudo publicar la compra'),
                });
            },
        });
    }

    confirmCancelPurchase(purchase: PurchaseResource) {
        this.alertDialog.confirm({
            zTitle: 'Cancelar Compra',
            zContent: `¿Estás seguro de que deseas cancelar la compra <strong>${purchase.serie}-${purchase.correlative}</strong>? Esta acción anulará el ingreso de stock.`,
            zOkText: 'Sí, cancelar',
            zCancelText: 'Cerrar',
            zOkDestructive: true,
            zOnOk: () => {
                this.purchaseApi.cancelPurchase(purchase.id).subscribe({
                    next: () => {
                        toast.success('Compra cancelada');
                        this.loadPurchases();
                    },
                    error: (err) => toast.error(err.error?.message || 'No se pudo cancelar la compra'),
                });
            },
        });
    }

    confirmDeletePurchase(purchase: PurchaseResource) {
        this.alertDialog.confirm({
            zTitle: 'Eliminar Compra',
            zContent: `¿Estás seguro de que deseas eliminar el borrador de compra <strong>${purchase.serie}-${purchase.correlative}</strong>?`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.purchaseApi.deletePurchase(purchase.id).subscribe({
                    next: () => {
                        toast.success('Compra eliminada');
                        this.loadPurchases();
                    },
                    error: () => toast.error('No se pudo eliminar la compra'),
                });
            },
        });
    }
}
