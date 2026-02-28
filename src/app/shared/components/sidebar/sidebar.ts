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
    {
      label: 'Inventario',
      icon: 'archive',
      children: [
        { label: 'Categorías', route: '/inventario/categorias', icon: 'layers' },
        { label: 'Productos', route: '/inventario/productos', icon: 'square-library' },
        { label: 'Atributos', route: '/inventario/atributos', icon: 'tag' },
        { label: 'Almacén', route: '/inventario/almacen', icon: 'folder-open' },
      ],
    },
    {
      label: 'Compras',
      icon: 'dollar-sign',
      children: [
        { label: 'Compras', route: '/compras/lista', icon: 'clipboard' },
        { label: 'Proveedores', route: '/compras/proveedores', icon: 'users' },
      ],
    },
    {
      label: 'Ventas',
      icon: 'circle-dollar-sign',
      children: [
        { label: 'POS', route: '/ventas/pos', icon: 'zap' },
        { label: 'Ventas', route: '/ventas/lista', icon: 'file-text' },
        { label: 'Clientes', route: '/ventas/clientes', icon: 'user-plus' },
      ],
    },
    {
      label: 'Reportes',
      icon: 'book-open-text',
      children: [
        { label: 'Productos Vendidos', route: '/reportes/productos-vendidos', icon: 'arrow-up-right' },
      ],
    },
    {
      label: 'Sistema',
      icon: 'settings',
      children: [
        { label: 'Compañías', route: '/sistema/companias', icon: 'house' },
        { label: 'Usuarios', route: '/sistema/usuarios', icon: 'users' },
        { label: 'Roles', route: '/sistema/roles', icon: 'shield' },
        { label: 'Permisos', route: '/sistema/permisos', icon: 'badge-check' },
        { label: 'Diarios', route: '/sistema/diarios', icon: 'calendar' },
        { label: 'Impuestos', route: '/sistema/impuestos', icon: 'dollar-sign' },
        { label: 'Unidades de Medida', route: '/sistema/unidades-medida', icon: 'layers' },
      ],
    },
  ];

  readonly mainNavItems = computed(() => this._navItems);
}
