import { Component, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { AttendanceApi } from '@/core/services/api/attendance.api';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { AttendanceResource, PaginatedAttendancesResponse, AttendanceQueryParams } from '@/core/models';
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
    selector: 'app-attendances',
    standalone: true,
    imports: [
        CommonModule,
        ZardCardComponent,
        ZardButtonComponent,
        ZardIconComponent,
        ...ZardSearchFiltersImports,
        ...TableDetailsImports,
    ],
    templateUrl: './attendances.html',
    styleUrl: './attendances.css',
})
export class AttendancesComponent {
    private readonly router = inject(Router);
    private readonly attendanceApi = inject(AttendanceApi);
    private readonly alertDialog = inject(ZardAlertDialogService);

    readonly attendances = signal<AttendanceResource[]>([]);
    readonly pagination = signal<PaginatedAttendancesResponse['meta'] | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    readonly search = signal('');
    readonly currentPage = signal(1);
    readonly perPage = signal(25);
    readonly status = signal<'valid' | 'denied' | undefined>(undefined);

    readonly columns: TableDetailsColumn<AttendanceResource>[] = [
        {
            key: 'partner',
            label: 'Socio',
            type: 'stack',
            subKey: 'check_in_time',
            transform: (v: any) => v?.name || 'Socio desconocido',
            subTransform: (v: string) => `Entrada: ${new Date(v).toLocaleString()}`,
        },
        {
            key: 'status',
            label: 'Estado Acceso',
            type: 'badge',
            badgeVariant: (v: string) => (v === 'valid' ? 'secondary' : 'destructive'),
            transform: (v: string) => (v === 'valid' ? 'Válido' : 'Denegado'),
        },
        {
            key: 'formatted_duration',
            label: 'Duración',
            type: 'text',
            fallback: 'En curso...',
        },
        {
            key: 'check_out_time',
            label: 'Salida',
            type: 'text',
            transform: (v: string) => v ? new Date(v).toLocaleString() : 'Pendiente',
        },
        {
            key: 'is_manual_entry',
            label: 'Manual',
            type: 'badge',
            badgeVariant: (v: boolean) => (v ? 'default' : 'outline'),
            transform: (v: boolean) => (v ? 'Sí' : 'No'),
        }
    ];

    readonly tableActions: TableDetailsAction<AttendanceResource>[] = [
        {
            label: 'Ver detalles',
            icon: 'eye',
            onAction: (a: AttendanceResource) => this.router.navigate(['/gym/attendance', a.id]),
        },
        {
            label: 'Registrar Salida',
            icon: 'log-out',
            onAction: (a: AttendanceResource) => {
                if (!a.check_out_time && a.status === 'valid') {
                    this.confirmCheckOut(a);
                } else {
                    toast.error('Esta asistencia ya tiene registrada su salida o fue denegada.');
                }
            },
        }
    ];

    constructor() {
        effect(() => {
            this.search();
            this.currentPage();
            this.status();
            this.loadAttendances();
        });
    }

    goToCheckIn() {
        this.router.navigate(['/gym/attendance/check-in']);
    }

    loadAttendances() {
        this.loading.set(true);
        const params: AttendanceQueryParams = {
            page: this.currentPage(),
            per_page: this.perPage(),
            search: this.search(),
            status: this.status(),
        };

        this.attendanceApi.getAttendances(params).subscribe({
            next: (res) => {
                this.attendances.set(res.data);
                this.pagination.set(res.meta);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las asistencias. Inténtelo de nuevo.');
                this.loading.set(false);
            },
        });
    }

    confirmCheckOut(attendance: AttendanceResource) {
        this.alertDialog.confirm({
            zTitle: 'Registrar Salida',
            zContent: `¿Deseas registrar la salida para <strong>${attendance.partner?.name || 'el socio'}</strong>?`,
            zOkText: 'Registrar Salida',
            zCancelText: 'Cancelar',
            zOnOk: () => {
                this.attendanceApi.checkOut(attendance.id).subscribe({
                    next: () => {
                        toast.success('Salida registrada correctamente');
                        this.loadAttendances();
                    },
                    error: (err: any) => {
                        const msg = err?.error?.message || 'No se pudo registrar la salida';
                        toast.error('Error', { description: msg });
                    },
                });
            },
        });
    }
}
