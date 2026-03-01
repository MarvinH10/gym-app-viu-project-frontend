import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { CustomerApi } from '@/core/services/api/customer.api';
import { CustomerResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';

@Component({
    selector: 'app-cliente-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSkeletonImports,
        ...FormDetailImports,
    ],
    templateUrl: './cliente-detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClienteDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly customerApi = inject(CustomerApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly customer = signal<CustomerResource | null>(null);
    readonly loading = signal(true);
    readonly isDeleting = signal(false);

    readonly detailSections: DetailSection[] = [
        {
            title: 'Información Personal',
            fields: [
                { name: 'name', label: 'Nombre Completo', colSpan: 2 },
                { name: 'document_type', label: 'Tipo Documento' },
                { name: 'document_number', label: 'Nro. Documento' },
                { name: 'birth_date', label: 'Fecha de Nacimiento', type: 'date' },
                { name: 'gender', label: 'Género' },
            ],
        },
        {
            title: 'Información de Contacto',
            fields: [
                { name: 'email', label: 'Correo Electrónico', fallback: 'No registrado' },
                { name: 'phone', label: 'Teléfono Fijo', fallback: '-' },
                { name: 'mobile', label: 'Celular', fallback: '-' },
                { name: 'address', label: 'Dirección', colSpan: 2, fallback: 'Sin dirección' },
            ],
        },
        {
            title: 'Estado y Sistema',
            fields: [
                { name: 'status', label: 'Estado Actual', transform: (v) => v.toUpperCase() },
                { name: 'id', label: 'ID Interno' },
                { name: 'created_at', label: 'Fecha de Registro', type: 'datetime' },
                { name: 'updated_at', label: 'Última Actualización', type: 'datetime' },
            ],
        },
    ];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/ventas/clientes']);
            return;
        }
        this.customerApi.getCustomer(id).subscribe({
            next: (res) => {
                this.customer.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                toast.error('No se encontró el cliente');
                this.router.navigate(['/ventas/clientes']);
            },
        });
    }

    goToEdit() {
        const id = this.customer()?.id;
        if (id) this.router.navigate(['/ventas/clientes', id, 'edit']);
    }

    confirmDelete() {
        const c = this.customer();
        if (!c) return;

        this.alertDialog.confirm({
            zTitle: 'Eliminar Cliente',
            zContent: `¿Estás seguro de que deseas eliminar al cliente <strong>${c.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.isDeleting.set(true);
                this.customerApi.deleteCustomer(c.id).subscribe({
                    next: () => {
                        toast.success('Cliente eliminado');
                        this.router.navigate(['/ventas/clientes']);
                    },
                    error: () => {
                        this.isDeleting.set(false);
                        toast.error('Error al eliminar el cliente');
                    },
                });
            },
        });
    }
}
