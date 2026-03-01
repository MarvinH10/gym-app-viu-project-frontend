import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { FormCreateEditImports, DynamicField } from '@/shared/components/form-create-edit';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { UserApi } from '@/core/services/api/user.api';
import { User } from '@/core/models';

@Component({
  selector: 'app-usuario-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ZardCardComponent,
    ZardIconComponent,
    ...ZardSkeletonImports,
    ...FormCreateEditImports,
  ],
  templateUrl: './usuario-create-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioCreateEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userApi = inject(UserApi);

  readonly isSubmitting = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly initialData = signal<User | undefined>(undefined);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId.set(id);
        this.loadUser(id);
      }
    });
  }

  private loadUser(id: string) {
    this.loading.set(true);
    this.userApi.getUser(id).subscribe({
      next: (res) => {
        this.initialData.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Error al cargar el usuario');
        this.router.navigate(['/sistema/usuarios']);
      },
    });
  }

  readonly userFormFields = computed<DynamicField[]>(() => {
    const isEdit = !!this.userId();

    const fields: DynamicField[] = [
      {
        name: 'name',
        label: 'Nombre Completo',
        type: 'text',
        placeholder: 'Ej. Juan Pérez',
        validators: [Validators.required, Validators.maxLength(255)],
        colSpan: 2,
      },
      {
        name: 'email',
        label: 'Correo Electrónico',
        type: 'email',
        placeholder: 'correo@ejemplo.com',
        validators: [Validators.required, Validators.email, Validators.maxLength(255)],
        colSpan: 2,
      },
    ];

    if (!isEdit) {
      fields.push(
        {
          name: 'password',
          label: 'Contraseña',
          type: 'password',
          placeholder: 'Mínimo 8 caracteres',
          validators: [Validators.required, Validators.minLength(8)],
          colSpan: 1,
        },
        {
          name: 'password_confirmation',
          label: 'Confirmar Contraseña',
          type: 'password',
          placeholder: 'Repite la contraseña',
          validators: [Validators.required],
          colSpan: 1,
        },
      );
    } else {
      fields.push(
        {
          name: 'password',
          label: 'Nueva Contraseña (opcional)',
          type: 'password',
          placeholder: 'Dejar en blanco para no cambiar',
          validators: [Validators.minLength(8)],
          colSpan: 1,
        },
        {
          name: 'password_confirmation',
          label: 'Confirmar Nueva Contraseña',
          type: 'password',
          placeholder: 'Repite la nueva contraseña',
          colSpan: 1,
        },
      );
    }

    return fields;
  });

  onFormSubmit(data: any) {
    this.isSubmitting.set(true);
    this.error.set(null);

    const id = this.userId();

    if (data.password || data.password_confirmation) {
      if (data.password !== data.password_confirmation) {
        this.isSubmitting.set(false);
        const msg = 'Las contraseñas no coinciden';
        this.error.set(msg);
        toast.error(msg);
        return;
      }
    }

    const payload = {
      name: data.name,
      email: data.email,
    } as any;

    if (data.password) {
      payload.password = data.password;
      payload.password_confirmation = data.password_confirmation;
    }

    const request = id ? this.userApi.updateUser(id, payload) : this.userApi.createUser(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        toast.success(id ? 'Usuario actualizado' : 'Usuario creado');
        this.router.navigate(['/sistema/usuarios']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Error al guardar el usuario';
        this.error.set(msg);
        toast.error('Error', { description: msg });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/sistema/usuarios']);
  }
}
