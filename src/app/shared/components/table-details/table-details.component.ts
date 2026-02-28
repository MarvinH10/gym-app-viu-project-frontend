import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardTableImports } from '@/shared/components/table/table.imports';
import { ZardPaginationImports } from '@/shared/components/pagination/pagination.imports';
import { ZardBadgeImports } from '@/shared/components/badge';
import { ZardSkeletonImports } from '@/shared/components/skeleton';
import { ZardButtonImports } from '@/shared/components/button/button.imports';
import { ZardIconImports } from '@/shared/components/icon/icon.imports';
import { ZardInputImports } from '@/shared/components/input/input.imports';
import { ZardDropdownImports } from '@/shared/components/dropdown/dropdown.imports';
import type { ZardIcon } from '@/shared/components/icon/icons';

export type TableDetailsColumnType = 'text' | 'badge' | 'avatar' | 'stack';

export interface TableDetailsColumn<T = any> {
  key: string;
  label: string;
  type?: TableDetailsColumnType;
  subKey?: string;
  subIcon?: ZardIcon;
  badgeVariant?: (value: any, row: T) => 'default' | 'secondary' | 'destructive' | 'outline';
  transform?: (value: any, row: T) => string;
  subTransform?: (value: any, row: T) => string;
  fallback?: string;
}

export interface TableDetailsAction<T = any> {
  label: string;
  icon?: ZardIcon;
  destructive?: boolean;
  onAction: (row: T) => void;
}

@Component({
  selector: 'app-table-details',
  standalone: true,
  imports: [
    CommonModule,
    ...ZardButtonImports,
    ...ZardIconImports,
    ...ZardInputImports,
    ...ZardTableImports,
    ...ZardPaginationImports,
    ...ZardBadgeImports,
    ...ZardSkeletonImports,
    ...ZardDropdownImports,
  ],
  templateUrl: './table-details.component.html',
  styleUrl: './table-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDetailsComponent<T extends Record<string, any> = any> {
  columns = input<TableDetailsColumn<T>[]>([]);
  data = input<T[]>([]);
  actions = input<TableDetailsAction<T>[]>([]);
  loading = input(false);
  error = input<string | null>(null);

  pagination = input<{
    from: number | null;
    to: number | null;
    total: number;
    last_page: number;
    current_page?: number;
  } | null>(null);
  currentPage = input(1);

  skeletonRows = input(5);
  emptyIcon = input<ZardIcon>('inbox');
  emptyLabel = input('No hay datos para mostrar');
  emptyHint = input('Intenta ajustar los filtros o añadir un nuevo registro');
  itemLabel = input('registros');

  pageChange = output<number>();
  retry = output<void>();

  skeletonArray(): number[] {
    return Array.from({ length: this.skeletonRows() }, (_, i) => i);
  }

  getValue(col: TableDetailsColumn<T>, row: T): string {
    const raw = row[col.key];
    if (raw === null || raw === undefined || raw === '') return col.fallback ?? '—';
    return col.transform ? col.transform(raw, row) : String(raw);
  }

  getSubValue(col: TableDetailsColumn<T>, row: T): string {
    if (!col.subKey) return '';
    const raw = row[col.subKey];
    if (raw === null || raw === undefined || raw === '') return '';
    return col.subTransform ? col.subTransform(raw, row) : String(raw);
  }

  getAvatarLetter(col: TableDetailsColumn<T>, row: T): string {
    const name = row[col.key];
    return name ? String(name).charAt(0).toUpperCase() : '?';
  }

  getBadgeVariant(
    col: TableDetailsColumn<T>,
    row: T,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    return col.badgeVariant ? col.badgeVariant(row[col.key], row) : 'outline';
  }

  totalCols(): number {
    return this.columns().length + (this.actions().length > 0 ? 1 : 0);
  }
}
