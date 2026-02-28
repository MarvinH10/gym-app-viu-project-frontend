import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton/skeleton.component';

export type DetailFieldType = 'text' | 'date' | 'datetime' | 'badge' | 'boolean' | 'currency';

export interface DetailSection {
  title: string;
  fields: DetailField[];
}

export interface DetailField {
  name: string;
  label: string;
  type?: DetailFieldType;
  colSpan?: 1 | 2;
  badgeVariant?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline';
  transform?: (value: any) => string;
  fallback?: string;
}

@Component({
  selector: 'app-form-detail',
  standalone: true,
  imports: [CommonModule, ZardIconComponent, ZardSkeletonComponent, ...ZardBadgeImports],
  templateUrl: './form-detail.component.html',
  styleUrl: './form-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDetailComponent {
  sections = input<DetailSection[]>([]);
  data = input<Record<string, any> | null>(null);
  loading = input(false);

  getValue(field: DetailField): string {
    const raw = this.data()?.[field.name];
    if (raw === null || raw === undefined || raw === '') {
      return field.fallback ?? '—';
    }
    if (field.transform) {
      return field.transform(raw);
    }
    if (field.type === 'date') {
      try {
        return new Date(raw).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch {
        return String(raw);
      }
    }
    if (field.type === 'datetime') {
      try {
        return new Date(raw).toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return String(raw);
      }
    }
    if (field.type === 'boolean') {
      return raw ? 'Sí' : 'No';
    }
    if (field.type === 'currency') {
      return `S/ ${Number(raw).toFixed(2)}`;
    }
    return String(raw);
  }

  getBadgeVariant(field: DetailField): 'default' | 'secondary' | 'destructive' | 'outline' {
    const raw = this.data()?.[field.name];
    return field.badgeVariant ? field.badgeVariant(raw) : 'outline';
  }

  readonly skeletonRows = [1, 2, 3, 4, 5, 6];
}
