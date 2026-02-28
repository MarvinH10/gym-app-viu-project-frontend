import { Directive, ElementRef, inject, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '@/shared/utils/merge-classes';

@Directive({
  selector: 'label[z-label]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class ZardLabelDirective {
  readonly class = input<ClassValue>('');

  protected readonly classes = () =>
    mergeClasses(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.class(),
    );
}
