import { Component, signal } from '@angular/core';
import { AuthService } from '@/core/services/auth';
import { StatCard } from './stat-card/stat-card';
import { RelativeTimePipe } from '@/shared/pipes/relative-time.pipe';

interface StatItem {
  title: string;
  value: string;
  icon: string;
  trend: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [StatCard, RelativeTimePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly selectedCard = signal<string | null>(null);

  /** Datos demo de estadísticas */
  readonly stats: StatItem[] = [
    { title: 'Entrenamientos', value: '24', icon: '🏋️', trend: '+3 esta semana' },
    { title: 'Calorías quemadas', value: '12,450', icon: '🔥', trend: '+850 hoy' },
    { title: 'Tiempo total', value: '36h', icon: '⏱️', trend: '+2h esta semana' },
    { title: 'Racha actual', value: '7 días', icon: '🎯', trend: '¡Récord personal!' },
  ];

  /** Video demo (pública, sin copyright) */
  readonly videoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  constructor(public authService: AuthService) {}

  onCardClick(title: string): void {
    this.selectedCard.set(title);
  }
}
