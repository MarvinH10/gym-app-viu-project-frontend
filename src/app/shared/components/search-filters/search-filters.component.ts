import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardButtonComponent } from '../button/button.component';
import { ZardInputDirective } from '../input/input.directive';
import { ZardInputGroupComponent } from '../input-group/input-group.component';
import { ZardCheckboxComponent } from '../checkbox/checkbox.component';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
}

@Component({
  selector: 'z-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardIconComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardCheckboxComponent,
  ],
  template: `
    <div class="flex justify-between items-center gap-6 w-full mb-2">
      <z-input-group
        [zAddonBefore]="searchIcon"
        [zAddonAfter]="resultsText"
        class="flex-1 max-w-[450px]"
      >
        <input
          z-input
          type="text"
          [placeholder]="placeholder()"
          (input)="onSearch($event)"
          [value]="initialSearch()"
          class="h-10"
        />
      </z-input-group>

      <ng-template #searchIcon>
        <z-icon zType="search" class="size-4 text-muted-foreground mr-2" />
      </ng-template>

      <ng-template #resultsText>
        @if (totalResults() > 0) {
          <span class="text-xs text-muted-foreground ml-2">{{ totalResults() }} resultados</span>
        }
      </ng-template>

      @if (sections().length > 0) {
        <div class="relative">
          <button
            z-button
            zType="outline"
            class="gap-2 px-4 h-10"
            [class.bg-accent]="isFiltersOpen()"
            [class.border-primary]="isFiltersOpen() || isAnyFilterActive()"
            (click)="toggleFilters()"
          >
            <z-icon zType="filter" class="size-4" />
            <span>Filtros</span>
            <z-icon
              zType="chevron-down"
              class="size-4 transition-transform"
              [class.rotate-180]="isFiltersOpen()"
            />
          </button>

          @if (isFiltersOpen()) {
            <div
              class="absolute top-[calc(100%+0.5rem)] right-0 w-60 bg-black/90 border border-border rounded-2xl shadow-2xl z-50 overflow-hidden p-5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              @for (section of sections(); track section.id; let last = $last) {
                <div class="flex flex-col gap-3">
                  <h3
                    class="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {{ section.title }}
                  </h3>
                  <div class="flex flex-col gap-2.5">
                    @for (option of section.options; track option.value) {
                      <z-checkbox
                        [ngModel]="selectedValues()[section.id]?.includes(option.value)"
                        (ngModelChange)="onFilterChange(section.id, option.value)"
                        class="group"
                      >
                        <span class="text-sm transition-colors group-hover:text-primary">{{
                          option.label
                        }}</span>
                      </z-checkbox>
                    }
                  </div>
                </div>
                @if (!last) {
                  <div class="h-px bg-border my-4 w-full"></div>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZardSearchFiltersComponent {
  readonly placeholder = input<string>('Buscar...');
  readonly initialSearch = input<string>('');
  readonly sections = input<FilterSection[]>([]);
  readonly selectedValues = input<Record<string, string[]>>({});
  readonly totalResults = input<number>(0);

  readonly searchChange = output<string>();
  readonly filterToggle = output<{ sectionId: string; value: string }>();

  isFiltersOpen = signal(false);

  toggleFilters() {
    this.isFiltersOpen.update((v) => !v);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onFilterChange(sectionId: string, value: string) {
    this.filterToggle.emit({ sectionId, value });
  }

  isSectionActive(sectionId: string): boolean {
    return (this.selectedValues()[sectionId]?.length ?? 0) > 0;
  }

  isAnyFilterActive(): boolean {
    return Object.values(this.selectedValues()).some((vals: string[]) => vals.length > 0);
  }
}
