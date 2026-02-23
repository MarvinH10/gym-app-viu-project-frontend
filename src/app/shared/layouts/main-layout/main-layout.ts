import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@/shared/components/navbar/navbar';
import { Footer } from '@/shared/components/footer/footer';
import { Sidebar } from '@/shared/components/sidebar/sidebar';
import { BreadcrumbService } from '@/core/services/breadcrumb.service';
import {
  ZardBreadcrumbComponent,
  ZardBreadcrumbItemComponent,
} from '@/shared/components/breadcrumb/breadcrumb.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { inject } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    Sidebar,
    ZardBreadcrumbComponent,
    ZardBreadcrumbItemComponent,
    ZardIconComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  breadcrumbService = inject(BreadcrumbService);
}
