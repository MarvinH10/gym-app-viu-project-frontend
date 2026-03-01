import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceApi } from '@/core/services/api/attendance.api';
import { AttendanceResource } from '@/core/models/attendance.model';
import { FormDetailComponent, DetailSection } from '@/shared/components/form-detail';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-attendance-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    FormDetailComponent,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
  ],
  templateUrl: './attendance-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attendanceApi = inject(AttendanceApi);

  readonly attendance = signal<AttendanceResource | null>(null);
  readonly loading = signal(true);

  readonly detailSections = signal<DetailSection[]>([
    {
      title: 'Información de Registro',
      fields: [
        { name: 'partner', label: 'Socio', transform: (v) => v?.name || '—' },
        { name: 'partner', label: 'Documento', transform: (v) => v?.document_number || '—' },
        {
          name: 'status',
          label: 'Estado Acceso',
          type: 'badge',
          badgeVariant: (v) => (v === 'valid' ? 'secondary' : 'destructive'),
          transform: (v) => (v === 'valid' ? 'Válido' : 'Denegado'),
        },
        {
          name: 'validation_message',
          label: 'Mensaje Validación',
          transform: (v) => v || 'Sin mensaje de validación',
        },
      ],
    },
    {
      title: 'Tiempos y Frecuencia',
      fields: [
        { name: 'check_in_time', label: 'Hora Entrada', type: 'datetime' },
        { name: 'check_out_time', label: 'Hora Salida', type: 'datetime', fallback: 'Pendiente' },
        { name: 'formatted_duration', label: 'Duración' },
        { name: 'is_manual_entry', label: 'Registro Manual', type: 'boolean' },
      ],
    },
    {
      title: 'Suscripción Asociada',
      fields: [
        { name: 'subscription', label: 'Plan', transform: (v) => v?.plan?.name || 'N/A' },
        { name: 'subscription', label: 'Vencimiento', transform: (v) => v?.end_date || 'N/A' },
        { name: 'subscription', label: 'Estado Suscripción', transform: (v) => v?.status || 'N/A' },
      ],
    },
  ]);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadAttendance(id);
    }
  }

  loadAttendance(id: string) {
    this.loading.set(true);
    this.attendanceApi.getAttendance(id).subscribe({
      next: (res) => {
        this.attendance.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        toast.error('No se pudo cargar la información de la asistencia');
        this.router.navigate(['/gym/attendance']);
      },
    });
  }

  goBack() {
    this.router.navigate(['/gym/attendance']);
  }
}
