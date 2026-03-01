import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { JournalApi } from '@/core/services/api/journal.api';
import { JournalResource } from '@/core/models';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardBadgeImports } from '@/shared/components/badge';

@Component({
    selector: 'app-journal-detail',
    standalone: true,
    imports: [
        CommonModule,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardBadgeImports,
        ...ZardSkeletonImports,
        ...FormDetailImports,
    ],
    templateUrl: './journal-detail.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class JournalDetailComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly journalApi = inject(JournalApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly journal = signal<JournalResource | null>(null);
    readonly isLoading = signal(true);
    readonly error = signal<string | null>(null);
    readonly isDeleting = signal(false);

    readonly detailSections: DetailSection[] = [
        {
            title: 'Datos del Diario',
            fields: [
                { name: 'name', label: 'Nombre del Diario', colSpan: 2 },
                { name: 'code', label: 'Código', colSpan: 1 },
                {
                    name: 'type',
                    label: 'Tipo de Diario',
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
                { name: 'document_type_code', label: 'Cód. Tipo Documento', fallback: 'N/A' },
                { name: 'is_fiscal', label: '¿Es Fiscal?', type: 'boolean' },
            ],
        },
        {
            title: 'Sede / Empresa',
            fields: [
                {
                    name: 'company',
                    label: 'Razón Social',
                    transform: (v: any) => v?.business_name || 'No asignada',
                    colSpan: 2
                },
                {
                    name: 'company',
                    label: 'RUC',
                    transform: (v: any) => v?.ruc || 'N/A',
                },
            ],
        },
        {
            title: 'Configuración de Secuencia',
            fields: [
                {
                    name: 'sequence',
                    label: 'Tamaño Secuencia',
                    transform: (v: any) => v?.sequence_size || 'N/A',
                },
                {
                    name: 'sequence',
                    label: 'Incremento (Paso)',
                    transform: (v: any) => v?.step || 'N/A',
                },
                {
                    name: 'sequence',
                    label: 'Siguiente Número',
                    transform: (v: any) => v?.next_number || 'N/A',
                    colSpan: 2
                },
            ],
        },
        {
            title: 'Auditoría',
            fields: [
                { name: 'created_at', label: 'Fecha de Creación', type: 'datetime' },
                { name: 'updated_at', label: 'Última Actualización', type: 'datetime' },
            ],
        },
    ];

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/sistema/diarios']);
            return;
        }
        this.journalApi.getJournal(id).subscribe({
            next: (res) => {
                this.journal.set(res.data);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
                const msg = err?.error?.message || 'No se pudo cargar la información del diario.';
                this.error.set(msg);
                toast.error('Error', { description: msg });
            },
        });
    }

    onBack() {
        this.router.navigate(['/sistema/diarios']);
    }

    goToEdit() {
        const id = this.journal()?.id;
        if (id) this.router.navigate(['/sistema/diarios', id, 'edit']);
    }

    confirmResetSequence() {
        const j = this.journal();
        if (!j) return;

        this.alertDialog.confirm({
            zTitle: 'Reiniciar Secuencia',
            zContent: `¿Estás seguro de que deseas reiniciar la secuencia del diario <strong>${j.name}</strong> a 1?`,
            zOkText: 'Sí, reiniciar',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.journalApi.resetSequence(j.id).subscribe({
                    next: (res) => {
                        toast.success(res.message);
                        this.ngOnInit(); // Recargar datos
                    },
                    error: () => toast.error('Error al reiniciar secuencia'),
                });
            },
        });
    }

    confirmDelete() {
        const j = this.journal();
        if (!j) return;

        this.alertDialog.confirm({
            zTitle: 'Eliminar Diario',
            zContent: `¿Estás seguro de que deseas eliminar el diario <strong>${j.name}</strong>? Esta acción no se puede deshacer.`,
            zOkText: 'Sí, eliminar',
            zCancelText: 'Cancelar',
            zOkDestructive: true,
            zOnOk: () => {
                this.isDeleting.set(true);
                this.journalApi.deleteJournal(j.id).subscribe({
                    next: () => {
                        toast.success('Diario eliminado');
                        this.onBack();
                    },
                    error: () => {
                        this.isDeleting.set(false);
                        toast.error('Error al eliminar el diario');
                    },
                });
            },
        });
    }
}
