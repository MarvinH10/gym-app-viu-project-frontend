import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AttendanceApi } from '@/core/services/api/attendance.api';
import { MemberApi } from '@/core/services/api/member.api';
import { Member, PaginatedResponse } from '@/core/models';
import {
  FormCreateEditComponent,
  DynamicField,
} from '@/shared/components/form-create-edit/form-create-edit.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-attendance-check-in',
  standalone: true,
  imports: [CommonModule, FormCreateEditComponent, ZardCardComponent, ...ZardSkeletonImports],
  templateUrl: './attendance-check-in.component.html',
})
export class AttendanceCheckInComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly attendanceApi = inject(AttendanceApi);
  private readonly memberApi = inject(MemberApi);

  readonly loading = signal(false);
  readonly loadingMembers = signal(true);

  readonly fields = signal<DynamicField[]>([
    {
      name: 'partner_id',
      label: 'Socio',
      type: 'select',
      placeholder: 'Selecciona el socio que ingresa...',
      options: [],
      colSpan: 2,
    },
    {
      name: 'is_manual_entry',
      label: 'Registro Manual',
      type: 'switch',
      defaultValue: true,
      colSpan: 2,
    },
    {
      name: 'validation_message',
      label: 'Mensaje/Nota de Validación',
      type: 'textarea',
      placeholder: 'Detalles adicionales o motivo del registro manual...',
      colSpan: 2,
    },
  ]);

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loadingMembers.set(true);
    this.memberApi.getMembers({ per_page: 100, 'status[]': ['active'] }).subscribe({
      next: (res: PaginatedResponse<Member>) => {
        const options = res.data.map((m: Member) => ({
          label: `${m.name} • ${m.document_type}: ${m.document_number}`,
          value: m.id.toString(),
        }));
        this.fields.update((fs) =>
          fs.map((f) => (f.name === 'partner_id' ? { ...f, options } : f)),
        );
        this.loadingMembers.set(false);
      },
      error: () => {
        toast.error('Error al cargar la lista de socios');
        this.loadingMembers.set(false);
      },
    });
  }

  onFormSubmit(data: any) {
    if (!data.partner_id) {
      toast.error('Debes seleccionar un socio');
      return;
    }

    this.loading.set(true);
    this.attendanceApi
      .checkIn({
        partner_id: parseInt(data.partner_id, 10),
        is_manual_entry: data.is_manual_entry ?? true,
        validation_message: data.validation_message || null,
      })
      .subscribe({
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
