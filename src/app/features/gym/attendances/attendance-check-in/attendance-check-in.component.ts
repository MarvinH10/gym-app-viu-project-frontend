import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AttendanceApi } from '@/core/services/api/attendance.api';
import { FormCreateEditComponent, DynamicField } from '@/shared/components/form-create-edit/form-create-edit.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-attendance-check-in',
    standalone: true,
    imports: [
        CommonModule,
        FormCreateEditComponent
    ],
    templateUrl: './attendance-check-in.component.html',
})
export class AttendanceCheckInComponent {
    private readonly router = inject(Router);
    private readonly attendanceApi = inject(AttendanceApi);

    readonly loading = signal(false);

    readonly fields: DynamicField[] = [
        {
            name: 'document_number',
            label: 'Número de Documento (DNI/Pasaporte)',
            type: 'text',
            placeholder: 'Ingresa el número de documento del socio...',
            colSpan: 2
        },
        {
            name: 'partner_id',
            label: 'O ID de Socio',
            type: 'number',
            placeholder: 'O ingresa el ID interno...',
            colSpan: 2
        },
        {
            name: 'is_manual_entry',
            label: 'Registro Manual',
            type: 'switch',
            defaultValue: true,
            colSpan: 2
        },
        {
            name: 'validation_message',
            label: 'Mensaje/Nota de Validación',
            type: 'textarea',
            placeholder: 'Detalles adicionales o motivo del registro manual...',
            colSpan: 2
        }
    ];

    onFormSubmit(data: any) {
        if (!data.document_number && !data.partner_id) {
            toast.error('Debes ingresar al menos un número de documento o un ID de socio');
            return;
        }

        this.loading.set(true);
        this.attendanceApi.checkIn(data).subscribe({
            next: (res) => {
                toast.success(res.message || 'Entrada registrada con éxito');
                this.loading.set(false);
                this.router.navigate(['/gym/attendance']);
            },
            error: (err) => {
                const msg = err?.error?.message || 'Error al registrar entrada';
                toast.error('Error', { description: msg });
                this.loading.set(false);
            },
        });
    }

    onCancel() {
        this.router.navigate(['/gym/attendance']);
    }
}
