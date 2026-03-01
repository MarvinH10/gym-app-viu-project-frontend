import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  DestroyRef,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  imports: [CommonModule, RouterLink, RouterLinkActive, ZardIconComponent, ZardButtonComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  showUserMenu = signal(false);
  expandedSubmenus = signal<string | null>(null);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      if (this.sidebarService.isCollapsed()) {
        this.expandedSubmenus.set(null);
      }
      if (this.showUserMenu()) {
        this.showUserMenu.set(false);
      }
    }
  }

  ngOnInit() {
    this.expandActiveSubmenu();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.sidebarService.isCollapsed()) {
          this.expandedSubmenus.set(null);
        } else {
          this.expandActiveSubmenu();
        }
      });
  }

  expandActiveSubmenu() {
    if (this.sidebarService.isCollapsed()) return;
    for (const item of this._navItems) {
      if (item.children && this.isActive(item)) {
        this.expandedSubmenus.set(item.label);
      }
    }
  }

  isActive(item: NavItem): boolean {
    if (item.route) {
      return this.router.isActive(item.route, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    }
    if (item.children) {
      return item.children.some((child) => child.route && this.router.url.includes(child.route));
    }
    return false;
  }

  toggleUserMenu() {
    this.showUserMenu.update((v: boolean) => !v);
  }

  toggleSubmenu(label: string) {
    this.expandedSubmenus.update((current) => (current === label ? null : label));
  }

  isSubmenuExpanded(label: string): boolean {
    return this.expandedSubmenus() === label;
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
      label: 'Sistema',
      icon: 'settings',
      children: [
        { label: 'Compañías', route: '/sistema/companias', icon: 'house' },
        { label: 'Usuarios', route: '/sistema/usuarios', icon: 'users' },

        { label: 'Diarios', route: '/sistema/diarios', icon: 'calendar' },
        { label: 'Impuestos', route: '/sistema/impuestos', icon: 'dollar-sign' },
        { label: 'Unidades de Medida', route: '/sistema/unidades-medida', icon: 'layers' },
        { label: 'Métodos de Pago', route: '/sistema/payment-methods', icon: 'credit-card' },
      ],
    },
  ];

  readonly mainNavItems = computed(() => this._navItems);
}
