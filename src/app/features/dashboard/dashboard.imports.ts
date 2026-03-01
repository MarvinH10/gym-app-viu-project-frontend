import { CommonModule } from '@angular/common';
import { NgxApexchartsModule } from 'ngx-apexcharts';
import { LucideAngularModule } from 'lucide-angular';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { RelativeTimePipe } from '@/shared/pipes/relative-time.pipe';

export const DashboardImports = [
  CommonModule,
  NgxApexchartsModule,
  LucideAngularModule,
  ZardCardComponent,
  ZardButtonComponent,
  ZardIconComponent,
  RelativeTimePipe,
];
