import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { SupplierApi } from '@/core/services/api/supplier.api';
import { SupplierResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
    selector: 'app-proveedor-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSkeletonImports,
        ...FormDetailImports,
    ],
    templateUrl: './proveedor-detail.html',
    styleUrl: './proveedor-detail.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProveedorDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly supplierApi = inject(SupplierApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly supplier = signal<SupplierResource | null>(null);
    readonly loading = signal(true);
    readonly isDeleting = signal(false);

    readonly detailSections: DetailSection[] = [
        {
            title: 'Información del Proveedor',
            fields: [
                { name: 'display_name', label: 'Nombre Comercial / Full Name', colSpan: 2 },
                { name: 'document_type', label: 'Tipo Doc.', colSpan: 1 },
                { name: 'document_number', label: 'Nro. Documento', colSpan: 1 },
                { name: 'provider_category', label: 'Categoría', fallback: 'General' },
                { name: 'payment_terms', label: 'Términos de Pago', transform: (v) => `${v || 0} días` },
            ],
        },
        {
            title: 'Contacto y Ubicación',
            fields: [
                { name: 'email', label: 'Correo Electrónico', fallback: 'Sin correo' },
                { name: 'mobile', label: 'Celular', fallback: '—' },
                { name: 'phone', label: 'Teléfono', fallback: '—' },
                { name: 'address', label: 'Dirección', colSpan: 2 },
                { name: 'district', label: 'Distrito', colSpan: 1 },
                { name: 'province', label: 'Provincia', colSpan: 1 },
            ],
        },
        {
            title: 'Estado y Notas',
            fields: [
                {
                    name: 'status',
                    label: 'Estado Actual',
                    type: 'badge',
                    badgeVariant: (v) => {
                        switch (v) {
                            case 'active': return 'secondary';
                            case 'inactive': return 'outline';
                            default: return 'destructive';
                        }
                    },
                    transform: (v) => {
                        switch (v) {
                            case 'active': return 'Activo';
                            case 'inactive': return 'Inactivo';
                            default: return v;
                        }
                    }
                },
                { name: 'notes', label: 'Notas / Observaciones', colSpan: 2, fallback: 'Sin notas' },
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
            this.onBack();
            return;
        }
        this.supplierApi.getSupplier(id).subscribe({
            next: (res) => {
                this.supplier.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                toast.error('No se encontró el proveedor');
                this.onBack();
            },
        });
    }

    goToEdit() {
        const id = this.supplier()?.id;
        if (id) this.router.navigate(['/compras/proveedores/editar', id]);
    }

    confirmDelete() {
        const s = this.supplier();
        if (!s) return;

        this.alertDialog.confirm({
            zTitle: 'Eliminar Proveedor',
            zContent: `¿Estás seguro de que deseas eliminar al proveedor <strong>${s.display_name}</strong>?`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.isDeleting.set(true);
                this.supplierApi.deleteSupplier(s.id).subscribe({
                    next: () => {
                        toast.success('Proveedor eliminado');
                        this.onBack();
                    },
                    error: () => {
                        this.isDeleting.set(false);
                        toast.error('Error al eliminar');
                    },
                });
            },
        });
    }

    onBack() {
        this.router.navigate(['/compras/proveedores']);
    }
}
