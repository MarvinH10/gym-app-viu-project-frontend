import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@/core/services/auth';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardIdDirective } from '@/shared/core';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardIdDirective,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  isProfileLoading = signal(false);
  isPasswordLoading = signal(false);
  isDeleteLoading = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isProfileLoading.set(true);
    setTimeout(() => this.isProfileLoading.set(false), 1000);
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;
    this.isPasswordLoading.set(true);
    setTimeout(() => this.isPasswordLoading.set(false), 1000);
  }

  deleteAccount(): void {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.')) {
      this.isDeleteLoading.set(true);
      setTimeout(() => this.isDeleteLoading.set(false), 1000);
    }
  }
}
