import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { MemberApi } from '@/core/services/api/member.api';

export interface MemberFormData {
  document_type: string;
  document_number: string;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  ubigeo: string | null;
  birth_date: string | null;
  gender: string | null;
  notes: string | null;
  company_id: string | null;
}

@Component({
  selector: 'app-member-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './member-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MemberCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly memberApi = inject(MemberApi);

  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly memberId = signal<string | null>(null);
  readonly initialData = signal<any | undefined>(undefined);
  readonly duplicateWarning = signal<string | null>(null);
  private _lastCheckedDoc = '';

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.memberId.set(id);
        this.isLoading.set(true);
        this.memberApi.getMember(id).subscribe({
          next: (res) => {
            this.initialData.set(res.data);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load member', err);
            this.isLoading.set(false);
            this.router.navigate(['/gym/members']);
          },
        });
      }
    });
  }

  get memberFormFields(): DynamicField[] {
    return [
      {
        name: 'document_type',
        label: 'Tipo de Documento',
        type: 'select' as const,
        validators: [Validators.required],
        options: [
          { label: 'DNI', value: 'DNI' },
          { label: 'RUC', value: 'RUC' },
          { label: 'Carné de Extranjería', value: 'CE' },
          { label: 'Pasaporte', value: 'Passport' },
        ],
        colSpan: 1 as const,
      },
      {
        name: 'document_number',
        label: 'Número de Documento',
        type: 'text' as const,
        placeholder: 'Ej. 12345678',
        validators: [Validators.required, Validators.maxLength(20)],
        colSpan: 1 as const,
      },
      {
        name: 'name',
        label: 'Nombres y Apellidos',
        type: 'text' as const,
        placeholder: 'John Doe',
        validators: [Validators.required, Validators.maxLength(200)],
        colSpan: 2 as const,
      },
      {
        name: 'email',
        label: 'Correo Electrónico',
        type: 'email' as const,
        placeholder: 'correo@ejemplo.com',
        validators: [Validators.email, Validators.maxLength(100)],
        colSpan: 1 as const,
      },
      {
        name: 'mobile',
        label: 'Celular',
        type: 'text' as const,
        placeholder: '+51 999 999 999',
        validators: [Validators.maxLength(20)],
        colSpan: 1 as const,
      },
      {
        name: 'phone',
        label: 'Teléfono Fijo',
        type: 'text' as const,
        placeholder: '(01) 123 4567',
        validators: [Validators.maxLength(20)],
        colSpan: 1 as const,
      },
      {
        name: 'gender',
        label: 'Género',
        type: 'select' as const,
        options: [
          { label: 'Masculino', value: 'M' },
          { label: 'Femenino', value: 'F' },
          { label: 'Otro', value: 'Other' },
        ],
        colSpan: 1 as const,
      },
      {
        name: 'birth_date',
        label: 'Fecha de Nacimiento',
        type: 'date' as const,
        colSpan: 1 as const,
      },
      {
        name: 'ubigeo',
        label: 'Ubigeo',
        type: 'text' as const,
        placeholder: 'Ej. 150101',
        validators: [Validators.maxLength(6)],
        colSpan: 1 as const,
      },
      {
        name: 'address',
        label: 'Dirección',
        type: 'text' as const,
        placeholder: 'Av. Principal 123',
        colSpan: 2 as const,
      },
      {
        name: 'notes',
        label: 'Notas u Observaciones',
        type: 'textarea' as const,
        placeholder: 'Información adicional (condiciones médicas, etc.)',
        colSpan: 2 as const,
      },
    ];
  }

  onFormSubmit(data: any) {
    const id = this.memberId();

    if (!id && data.document_type && data.document_number) {
      const docKey = `${data.document_type}-${data.document_number}`;
      if (docKey !== this._lastCheckedDoc) {
        this._lastCheckedDoc = docKey;
        this.memberApi.checkDocumentExists(data.document_type, data.document_number).subscribe({
          next: (res) => {
            const existing = res.data.find(
              (m) =>
                m.document_type === data.document_type &&
                m.document_number === data.document_number,
            );
            if (existing) {
              this.duplicateWarning.set(
                `Ya existe un socio con ${data.document_type} ${data.document_number}: ` +
                  `"${existing.name}". Para reactivarlo como miembro, ` +
                  `editá su perfil existente en lugar de crear uno nuevo.`,
              );
            } else {
              this.duplicateWarning.set(null);
              this._submitPayload(data, id);
            }
          },
          error: () => {
            this.duplicateWarning.set(null);
            this._submitPayload(data, id);
          },
        });
        return;
      }
    }

    this.duplicateWarning.set(null);
    this._submitPayload(data, id);
  }

  private _submitPayload(data: any, id: string | null) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const payload = { ...data, company_id: data.company_id ?? null };
    const request = id
      ? this.memberApi.updateMember(id, payload)
      : this.memberApi.createMember(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        if (id) {
          toast.success('Miembro actualizado', {
            description: 'Los datos del miembro se guardaron correctamente.',
          });
        } else {
          toast.success('Miembro creado', {
            description: 'El nuevo miembro fue registrado exitosamente.',
          });
          this.router.navigate(['/gym/members']);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const backendMsg: string = err?.error?.errors
          ? Object.values(err.error.errors as Record<string, string[]>)
              .flat()
              .join(' ')
          : (err?.error?.message ?? null);
        const fallback = id
          ? 'Hubo un error al actualizar el miembro.'
          : 'Hubo un error al registrar el miembro. Verifica los datos.';
        const msg = backendMsg || fallback;
        this.error.set(msg);
        toast.error(id ? 'Error al actualizar' : 'Error al crear', { description: msg });
        console.error(id ? 'Error updating member:' : 'Error creating member:', err);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/gym/members']);
  }
}
