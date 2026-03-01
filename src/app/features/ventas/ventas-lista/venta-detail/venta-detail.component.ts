import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { SaleApi } from '@/core/services/api/sale.api';
import { SaleResource } from '@/core/models/sale.model';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
    selector: 'app-venta-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSkeletonImports,
        ...FormDetailImports,
    ],
    templateUrl: './venta-detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly saleApi = inject(SaleApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly sale = signal<SaleResource | null>(null);
    readonly loading = signal(true);
    readonly isActionLoading = signal(false);

    readonly detailSections = computed<DetailSection[]>(() => {
        const s = this.sale();
        if (!s) return [];

        return [
            {
                title: 'Información del Comprobante',
                fields: [
                    { name: 'document_number', label: 'Número de Comprobante', colSpan: 1 },
                    { name: 'date', label: 'Fecha de Emisión', colSpan: 1 },
                    {
                        name: 'status',
                        label: 'Estado',
                        type: 'badge',
                        badgeVariant: (v) => v === 'posted' ? 'secondary' : (v === 'cancelled' ? 'destructive' : 'outline'),
                        transform: (v) => v === 'posted' ? 'Publicado' : (v === 'cancelled' ? 'Cancelado' : 'Borrador')
                    },
                    {
                        name: 'payment_status',
                        label: 'Estado de Pago',
                        type: 'badge',
                        badgeVariant: (v) => v === 'paid' ? 'default' : (v === 'partial' ? 'secondary' : 'destructive'),
                        transform: (v) => v === 'paid' ? 'Pagado' : (v === 'partial' ? 'Parcial' : 'Pendiente')
                    },
                ],
            },
            {
                title: 'Información del Cliente',
                fields: [
                    { name: 'partner_name', label: 'Nombre / Razón Social', colSpan: 2, transform: () => s.partner?.name || 'Cliente Varios' },
                    { name: 'partner_doc', label: 'Documento', colSpan: 1, transform: () => s.partner?.document_number || 'S/D' },
                    { name: 'partner_email', label: 'Correo', colSpan: 1, transform: () => s.partner?.email || '—' },
                ],
            },
            {
                title: 'Totales',
                fields: [
                    { name: 'subtotal', label: 'Subtotal', type: 'currency' },
                    { name: 'tax_amount', label: 'Impuesto (IGV)', type: 'currency' },
                    { name: 'total', label: 'Total a Pagar', type: 'currency', colSpan: 2 },
                ],
            },
            {
                title: 'Notas',
                fields: [
                    { name: 'notes', label: 'Observaciones', colSpan: 2, fallback: 'Sin observaciones' },
                ],
            },
            {
                title: 'Información del Sistema',
                fields: [
                    { name: 'created_at', label: 'Registrado el', type: 'datetime' },
                    { name: 'updated_at', label: 'Última actualización', type: 'datetime' },
                ],
            },
        ];
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/ventas/lista']);
            return;
        }
        this.loadSale(id);
    }

    loadSale(id: string) {
        this.loading.set(true);
        this.saleApi.getSale(id).subscribe({
            next: (res) => {
                this.sale.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                toast.error('No se encontró la venta');
                this.router.navigate(['/ventas/lista']);
            },
        });
    }

    goToEdit() {
        const s = this.sale();
        if (s && s.status === 'draft') {
            this.router.navigate(['/ventas/lista', s.id, 'edit']);
        } else {
            toast.error('Solo se pueden editar ventas en estado borrador');
        }
    }

    confirmPost() {
        const s = this.sale();
        if (!s) return;

        this.alertDialog.confirm({
            zTitle: 'Publicar Venta',
            zContent: `¿Deseas publicar la venta ${s.serie}-${s.correlative}?`,
            zOkText: 'Sí, publicar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.isActionLoading.set(true);
                this.saleApi.postSale(s.id).subscribe({
                    next: () => {
                        toast.success('Venta publicada');
                        this.loadSale(s.id.toString());
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
