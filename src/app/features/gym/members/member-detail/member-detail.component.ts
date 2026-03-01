import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton/skeleton.component';
import { FormDetailImports, DetailSection } from '@/shared/components/form-detail';
import { ZardAlertDialogService } from '@/shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardLabelDirective } from '@/shared/components/label';

import { MemberApi } from '@/core/services/api/member.api';
import { Member } from '@/core/models';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardSkeletonComponent,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardLabelDirective,
    ...FormDetailImports,
  ],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MemberDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly memberApi = inject(MemberApi);
  private readonly alertDialog = inject(ZardAlertDialogService);

  private readonly dialogService = inject(ZardDialogService);
  private readonly fb = inject(FormBuilder);

  readonly member = signal<Member | null>(null);
  readonly isLoading = signal(true);
  readonly isDeleting = signal(false);
  readonly activatingPortal = signal(false);

  portalForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
  });

  @ViewChild('portalDialogTpl') portalDialogTpl!: TemplateRef<any>;
  portalDialogRef: ZardDialogRef<any> | null = null;

  readonly detailSections: DetailSection[] = [
    {
      title: 'Información Personal',
      fields: [
        { name: 'name', label: 'Nombre completo', colSpan: 2 },
        {
          name: 'status',
          label: 'Estado',
          type: 'badge',
          badgeVariant: (v) =>
            v === 'active' ? 'secondary' : v === 'blacklisted' ? 'destructive' : 'outline',
          transform: (v) =>
            ({
              active: 'Activo',
              suspended: 'Suspendido',
              blacklisted: 'Lista Negra',
              inactive: 'Inactivo',
            })[v as string] ?? v,
        },
        { name: 'document_type', label: 'Tipo de Documento' },
        { name: 'document_number', label: 'Número de Documento' },
        {
          name: 'gender',
          label: 'Género',
          transform: (v) => ({ M: 'Masculino', F: 'Femenino', Other: 'Otro' })[v as string] ?? v,
        },
        { name: 'birth_date', label: 'Fecha de Nacimiento', type: 'date' },
      ],
    },
    {
      title: 'Contacto y Dirección',
      fields: [
        { name: 'email', label: 'Correo Electrónico' },
        { name: 'mobile', label: 'Celular' },
        { name: 'phone', label: 'Teléfono Fijo' },
        { name: 'address', label: 'Dirección', colSpan: 2 },
        { name: 'ubigeo', label: 'Ubigeo' },
      ],
    },
    {
      title: 'Accesos y Flags',
      fields: [
        { name: 'has_portal_access', label: 'Acceso al Portal', type: 'boolean' },
        { name: 'is_member', label: 'Es Miembro', type: 'boolean' },
        { name: 'is_customer', label: 'Es Cliente', type: 'boolean' },
        { name: 'is_supplier', label: 'Es Proveedor', type: 'boolean' },
      ],
    },
    {
      title: 'Registro',
      fields: [
        { name: 'created_at', label: 'Creado', type: 'datetime' },
        { name: 'updated_at', label: 'Actualizado', type: 'datetime' },
      ],
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/gym/members']);
      return;
    }
    this.memberApi.getMember(id).subscribe({
      next: (res) => {
        this.member.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error('No se encontró el miembro');
        this.router.navigate(['/gym/members']);
      },
    });
  }

  goToEdit() {
    const id = this.member()?.id;
    if (id) this.router.navigate(['/gym/members', id, 'edit']);
  }

  confirmDelete() {
    const m = this.member();
    if (!m) return;

    this.alertDialog.confirm({
      zTitle: 'Eliminar Miembro',
      zContent: `¿Estás seguro de que deseas eliminar a <strong>${m.name}</strong>? Esta acción no se puede deshacer.`,
      zOkText: 'Sí, eliminar',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zOnOk: () => {
        this.isDeleting.set(true);
        this.memberApi.deleteMember(m.id).subscribe({
          next: () => {
            toast.success('Miembro eliminado', {
              description: `${m.name} fue eliminado correctamente.`,
            });
            this.router.navigate(['/gym/members']);
          },
          error: () => {
            this.isDeleting.set(false);
            toast.error('Error al eliminar', {
              description: 'No se pudo eliminar al miembro. Inténtalo de nuevo.',
            });
          },
        });
      },
    });
  }

  openPortalDialog() {
    this.portalForm.reset();
    this.portalDialogRef = this.dialogService.create({
      zTitle: 'Activar Acceso al Portal',
      zContent: this.portalDialogTpl,
      zHideFooter: true,
      zWidth: '400px',
    });
  }

  submitPortal() {
    if (this.portalForm.invalid) {
      this.portalForm.markAllAsTouched();
      return;
    }

    const m = this.member();
    if (!m) return;

    this.activatingPortal.set(true);
    this.memberApi.activatePortal(m.id, this.portalForm.value).subscribe({
      next: (res) => {
        toast.success('Portal activado', { description: res.message });
        this.activatingPortal.set(false);
        this.portalDialogRef?.close();
        this.member.set(res.data);
      },
      error: (err) => {
        this.activatingPortal.set(false);
        const msg = err?.error?.message || 'Error al activar portal';
        toast.error('Error', { description: msg });
      },
    });
  }
}
