import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChild,
  ViewEncapsulation,
  type TemplateRef,
  ElementRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ZardButtonComponent, type ZardButtonTypeVariants } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/popover';
import { mergeClasses, noopFn } from '@/shared/utils/merge-classes';
import { ZardTimePickerSizeVariants } from './time-picker.variants';

const HEIGHT_BY_SIZE: Record<ZardTimePickerSizeVariants, string> = {
  xs: 'h-7',
  sm: 'h-8',
  default: 'h-9',
  lg: 'h-11',
  icon: 'h-10',
};

@Component({
  selector: 'z-time-picker, [z-time-picker]',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardButtonComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardIconComponent,
  ],
  template: `
    <button
      z-button
      type="button"
      [zType]="zType()"
      [zSize]="zSize()"
      [disabled]="disabled()"
      [class]="buttonClasses()"
      zPopover
      #popoverDirective="zPopover"
      [zContent]="timeTemplate"
      zTrigger="click"
      (zVisibleChange)="onPopoverVisibilityChange($event)"
      [attr.aria-expanded]="false"
      [attr.aria-haspopup]="true"
      aria-label="Escoger hora"
    >
      <z-icon zType="clock" class="mr-2" />
      <span [class]="textClasses()">
        {{ displayText() }}
      </span>
    </button>

    <ng-template #timeTemplate>
      <z-popover class="w-[280px] p-0 overflow-hidden">
        <div class="flex flex-col">
          <div class="p-3 border-b border-border bg-muted/30">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Seleccionar Hora
            </p>
          </div>

          <div class="flex h-[280px]">
            <!-- Horas -->
            <div
              class="flex-1 overflow-y-auto scrollbar-thin border-r border-border py-1"
              #hourColumn
            >
              @for (hour of hours; track hour) {
                <button
                  type="button"
                  class="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors flex items-center justify-between"
                  [class.bg-primary/10]="selectedHour() === hour"
                  [class.text-primary]="selectedHour() === hour"
                  [class.font-semibold]="selectedHour() === hour"
                  (click)="selectHour(hour)"
                >
                  {{ hour | number: '2.0' }}
                  @if (selectedHour() === hour) {
                    <z-icon zType="check" class="size-3.5" />
                  }
                </button>
              }
            </div>

            <div class="flex-1 overflow-y-auto scrollbar-thin py-1" #minuteColumn>
              @for (minute of minutes; track minute) {
                <button
                  type="button"
                  class="w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors flex items-center justify-between"
                  [class.bg-primary/10]="selectedMinute() === minute"
                  [class.text-primary]="selectedMinute() === minute"
                  [class.font-semibold]="selectedMinute() === minute"
                  (click)="selectMinute(minute)"
                >
                  {{ minute | number: '2.0' }}
                  @if (selectedMinute() === minute) {
                    <z-icon zType="check" class="size-3.5" />
                  }
                </button>
              }
            </div>
          </div>

          <div class="p-2 border-t border-border bg-muted/10 flex justify-end gap-2">
            <button z-button zSize="xs" zType="ghost" (click)="clear()">Limpiar</button>
            <button z-button zSize="xs" (click)="confirm()">Confirmar</button>
          </div>
        </div>
      </z-popover>
    </ng-template>
  `,
  styles: [
    `
      .scrollbar-thin::-webkit-scrollbar {
        width: 4px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: hsl(var(--border));
        border-radius: 20px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--muted-foreground) / 0.5);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardTimePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zTimePicker',
})
export class ZardTimePickerComponent implements ControlValueAccessor {
  readonly timeTemplate = viewChild.required<TemplateRef<unknown>>('timeTemplate');
  readonly popoverDirective = viewChild.required<ZardPopoverDirective>('popoverDirective');
  readonly hourColumn = viewChild<ElementRef<HTMLDivElement>>('hourColumn');
  readonly minuteColumn = viewChild<ElementRef<HTMLDivElement>>('minuteColumn');

  readonly class = input<string>('');
  protected readonly classes = computed(() => mergeClasses('block', this.class()));

  readonly zType = input<ZardButtonTypeVariants>('outline');
  readonly zSize = input<ZardTimePickerSizeVariants>('default');
  readonly value = model<string | null>(null); // Format: "HH:mm"
  readonly placeholder = input<string>('00:00');
  readonly disabled = model<boolean>(false);
  readonly minuteStep = input<number>(1);

  readonly timeChange = output<string | null>();

  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);
  protected readonly minutes = Array.from({ length: 60 }, (_, i) => i);

  protected readonly selectedHour = computed(() => {
    const val = this.value();
    if (!val) return null;
    const [h] = val.split(':').map(Number);
    return isNaN(h) ? null : h;
  });

  protected readonly selectedMinute = computed(() => {
    const val = this.value();
    if (!val) return null;
    const [, m] = val.split(':').map(Number);
    return isNaN(m) ? null : m;
  });

  private onChange: (value: string | null) => void = noopFn;
  private onTouched: () => void = noopFn;

  protected readonly buttonClasses = computed(() => {
    const hasValue = !!this.value();
    const size = this.zSize();
    const height = HEIGHT_BY_SIZE[size];
    return mergeClasses(
      'w-full justify-start text-left font-normal',
      !hasValue && 'text-muted-foreground',
      height,
    );
  });

  protected readonly textClasses = computed(() => {
    const hasValue = !!this.value();
    return mergeClasses(!hasValue && 'text-muted-foreground');
  });

  protected readonly displayText = computed(() => {
    return this.value() || this.placeholder();
  });

  protected selectHour(h: number) {
    const m = this.selectedMinute() ?? 0;
    this.updateTime(h, m);
  }

  protected selectMinute(m: number) {
    const h = this.selectedHour() ?? 0;
    this.updateTime(h, m);
  }

  private updateTime(h: number, m: number) {
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    this.value.set(timeStr);
    this.onChange(timeStr);
    this.onTouched();
    this.timeChange.emit(timeStr);
  }

  protected clear() {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
    this.timeChange.emit(null);
    this.popoverDirective().hide();
  }

  protected confirm() {
    this.popoverDirective().hide();
  }

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onPopoverVisibilityChange(visible: boolean): void {
    if (visible) {
      setTimeout(() => {
        this.scrollToSelected();
      }, 0);
    }
  }

  private scrollToSelected() {
    const h = this.selectedHour();
    const m = this.selectedMinute();

    if (h !== null && this.hourColumn()) {
      const el = this.hourColumn()!.nativeElement;
      const item = el.children[h] as HTMLElement;
      if (item) {
        el.scrollTop = item.offsetTop - el.offsetTop - el.clientHeight / 2 + item.clientHeight / 2;
      }
    }

    if (m !== null && this.minuteColumn()) {
      const el = this.minuteColumn()!.nativeElement;
      const item = el.children[m] as HTMLElement;
      if (item) {
        el.scrollTop = item.offsetTop - el.offsetTop - el.clientHeight / 2 + item.clientHeight / 2;
      }
    }
  }
}
