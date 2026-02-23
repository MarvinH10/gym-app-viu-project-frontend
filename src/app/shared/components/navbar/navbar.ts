import { Component, inject } from '@angular/core';
import { AuthService } from '@/core/services/auth';
import { SidebarService } from '@/core/services/sidebar.service';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { BreadcrumbService } from '@/core/services/breadcrumb.service';
import {
  ZardBreadcrumbComponent,
  ZardBreadcrumbItemComponent,
} from '@/shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-navbar',
  imports: [ZardIconComponent, ZardButtonComponent, ZardBreadcrumbComponent, ZardBreadcrumbItemComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  breadcrumbService = inject(BreadcrumbService);
}
