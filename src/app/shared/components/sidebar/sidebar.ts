import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@/core/services/auth';
import { SidebarService } from '@/core/services/sidebar.service';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';

import { ZardIcon } from '@/shared/components/icon/icons';

interface NavItem {
  label: string;
  route?: string;
  icon: ZardIcon;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, ZardIconComponent, ZardButtonComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  showUserMenu = signal(false);
  expandedSubmenus = signal<Set<string>>(new Set());

  toggleUserMenu() {
    this.showUserMenu.update((v: boolean) => !v);
  }

  toggleSubmenu(label: string) {
    this.expandedSubmenus.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }

  isSubmenuExpanded(label: string): boolean {
    return this.expandedSubmenus().has(label);
  }

  navigateToProfile() {
    this.showUserMenu.set(false);
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showUserMenu.set(false);
    this.authService.logout();
  }

  private readonly _navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
    {
      label: 'Gimnasio',
      icon: 'activity',
      children: [
        { label: 'Miembros', route: '/gym/members', icon: 'users' },
        { label: 'Planes', route: '/gym/plans', icon: 'credit-card' },
        { label: 'Suscripciones', route: '/gym/subscriptions', icon: 'calendar' },
        { label: 'Asistencias', route: '/gym/attendance', icon: 'clipboard' },
      ],
    },
  ];

  readonly mainNavItems = computed(() => this._navItems);
}
