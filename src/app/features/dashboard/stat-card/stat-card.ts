import { Component, input, output } from '@angular/core';
import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
  selector: 'app-stat-card',
  imports: [ZardCardComponent],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  title = input.required<string>();
  value = input.required<string>();
  icon = input<string>('📊');
  trend = input<string>('');

  cardClick = output<string>();

  onClick(): void {
    this.cardClick.emit(this.title());
  }
}
