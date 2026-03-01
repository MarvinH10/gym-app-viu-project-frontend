import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { PurchaseApi } from '@/core/services/api/purchase.api';
import { PurchaseResource } from '@/core/models/purchase.model';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
    selector: 'app-compra-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSkeletonImports,
        ...FormDetailImports,
    ],
    templateUrl: './compra-detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompraDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly purchaseApi = inject(PurchaseApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly purchase = signal<PurchaseResource | null>(null);
    readonly loading = signal(true);
    readonly isActionLoading = signal(false);

    readonly detailSections = computed<DetailSection[]>(() => {
        const p = this.purchase();
        if (!p) return [];

        return [
            {
                title: 'Información de la Compra',
                fields: [
                    { name: 'document_number', label: 'Correlativo', colSpan: 1, transform: () => `${p.serie}-${p.correlative}` },
                    { name: 'date', label: 'Fecha de Compra', colSpan: 1 },
                    {
                        name: 'status',
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
                        }
                    },
                    {
                        name: 'payment_status',
                        label: 'Estado de Pago',
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
                        }
                    },
                    { name: 'vendor_bill_number', label: 'Nro. Factura Proveedor', colSpan: 1, fallback: 'N/A' },
                    { name: 'vendor_bill_date', label: 'Fecha Factura Proveedor', colSpan: 1, type: 'datetime', fallback: '—' },
                ],
            },
            {
                title: 'Información del Proveedor',
                fields: [
                    { name: 'partner_name', label: 'Razón Social', colSpan: 1, transform: () => p.partner?.business_name || p.partner?.name || 'Proveedor' },
                    { name: 'partner_doc', label: 'RUC / Documento', colSpan: 1, transform: () => p.partner?.document_number || 'S/D' },
                    { name: 'partner_email', label: 'Correo Electrónico', colSpan: 1, transform: () => p.partner?.email || '—' },
                    { name: 'partner_phone', label: 'Teléfono / Celular', colSpan: 1, transform: () => p.partner?.phone || p.partner?.mobile || '—' },
                ],
            },
            {
                title: 'Totales y Montos',
                fields: [
                    { name: 'total', label: 'Total de la Compra', type: 'currency', colSpan: 1 },
                    { name: 'warehouse_name', label: 'Almacén de Destino', colSpan: 1, transform: () => p.warehouse?.name || 'Almacén General' },
                ],
            },
            {
                title: 'Observaciones',
                fields: [
                    { name: 'observation', label: 'Notas Adicionales', colSpan: 2, fallback: 'Sin observaciones' },
                ],
            },
        ];
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/compras/lista']);
            return;
        }
        this.loadPurchase(id);
    }

    loadPurchase(id: string) {
        this.loading.set(true);
        this.purchaseApi.getPurchase(id).subscribe({
            next: (res) => {
                this.purchase.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                toast.error('No se encontró la compra');
                this.router.navigate(['/compras/lista']);
            },
        });
    }

    goToEdit() {
        const p = this.purchase();
        if (p && p.status === 'draft') {
            this.router.navigate(['/compras/lista', p.id, 'edit']);
        } else {
            toast.error('Solo se pueden editar compras en estado borrador');
        }
    }

    confirmPost() {
        const p = this.purchase();
        if (!p) return;

        this.alertDialog.confirm({
            zTitle: 'Publicar Compra',
            zContent: `¿Deseas publicar la compra ${p.serie}-${p.correlative}? Esto registrará el ingreso de mercadería.`,
            zOkText: 'Sí, publicar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.isActionLoading.set(true);
                this.purchaseApi.postPurchase(p.id).subscribe({
                    next: () => {
                        toast.success('Compra publicada correctamente');
                        this.loadPurchase(p.id.toString());
                        this.isActionLoading.set(false);
                    },
                    error: (err) => {
                        this.isActionLoading.set(false);
                        toast.error(err.error?.message || 'Error al publicar');
                    }
                });
            }
        });
    }
}
