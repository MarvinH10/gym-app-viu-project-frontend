import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardLabelDirective } from '@/shared/components/label';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIcon } from '@/shared/components/icon/icons';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardDatePickerImports } from '@/shared/components/date-picker';
import { ZardCheckboxImports } from '@/shared/components/checkbox/checkbox.imports';
import { ZardIconImports } from '@/shared/components/icon/icon.imports';
import { ZardSwitchImports } from '@/shared/components/switch';

export interface DefaultOption {
  label: string;
  value: string;
}

export interface DynamicField {
  name: string;
  label: string;
  type:
  | 'text'
  | 'email'
  | 'date'
  | 'select'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'switch'
  | 'tags';
  placeholder?: string;
  options?: DefaultOption[];
  colSpan?: 1 | 2;
  validators?: any[];
  defaultValue?: any;
}

@Component({
  selector: 'app-form-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardLabelDirective,
    ZardButtonComponent,
    ...ZardIconImports,
    ...ZardDatePickerImports,
    ...ZardSelectImports,
    ...ZardCheckboxImports,
    ...ZardSwitchImports,
    ...ZardBadgeImports,
  ],
  templateUrl: './form-create-edit.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCreateEditComponent implements OnInit {
  private fb = inject(FormBuilder);

  fields = input<DynamicField[]>([]);
  initialData = input<any | undefined>(undefined);
  loading = input(false);
  isSubmitting = input(false);
  submitLabel = input('Guardar');
  submitIcon = input<ZardIcon | undefined>(undefined);
  showActions = input(true);

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor() { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const initial = this.initialData();
    const group: { [key: string]: any } = {};

    this.fields().forEach((field) => {
      let initialValue = initial ? initial[field.name] : (field.defaultValue ?? null);

      if (field.type === 'date' && initialValue) {
        initialValue = new Date(initialValue);
      }

      if (field.type === 'select' && initialValue !== null && initialValue !== undefined) {
        initialValue = initialValue.toString();
      }

      group[field.name] = [initialValue, field.validators || []];
    });

    this.form = this.fb.group(group);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = { ...this.form.value };

    this.fields().forEach((field) => {
      if (field.type === 'date' && value[field.name] instanceof Date) {
        value[field.name] = value[field.name].toISOString().split('T')[0];
      }
    });

    this.formSubmit.emit(value);
  }

  submit() {
    this.onSubmit();
  }
  isFormInvalid(): boolean {
    return this.form?.invalid ?? true;
  }

  onCancel() {
    this.cancel.emit();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Tags logic
  addTag(fieldName: string, event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      const currentTags = this.form.get(fieldName)?.value || [];
      if (!currentTags.includes(value)) {
        this.form.get(fieldName)?.setValue([...currentTags, value]);
      }
      input.value = '';
    }
    event.preventDefault();
  }

  removeTag(fieldName: string, tag: string) {
    const currentTags = this.form.get(fieldName)?.value || [];
    this.form.get(fieldName)?.setValue(currentTags.filter((t: string) => t !== tag));
  }
}
