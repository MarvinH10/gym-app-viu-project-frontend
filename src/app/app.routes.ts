import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth-guard';
import { guestGuard } from '@/core/guards/guest-guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: 'verify-email/:id/:hash',
        loadComponent: () =>
          import('./features/auth/email-verification/email-verification').then(
            (m) => m.EmailVerification,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
        data: { breadcrumb: 'Perfil' },
      },
      {
        path: 'gym',
        data: { breadcrumb: 'Gimnasio' },
        children: [
          {
            path: 'members',
            data: { breadcrumb: 'Miembros' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/gym/members/members').then((m) => m.Members),
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/gym/members/member-create-edit/member-create-edit.component'),
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/gym/members/member-detail/member-detail.component'),
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/gym/members/member-create-edit/member-create-edit.component'),
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'plans',
            loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard), // Temporary reuse
            data: { breadcrumb: 'Planes' },
          },
          {
            path: 'subscriptions',
            loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard), // Temporary reuse
            data: { breadcrumb: 'Suscripciones' },
          },
          {
            path: 'attendance',
            loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard), // Temporary reuse
            data: { breadcrumb: 'Asistencias' },
          },
        ],
      },
      {
        path: 'inventario',
        data: { breadcrumb: 'Inventario' },
        children: [
          {
            path: 'categorias',
            loadComponent: () =>
              import('./features/inventario/categorias/categorias').then((m) => m.Categorias),
            data: { breadcrumb: 'Categorías' },
          },
          {
            path: 'productos',
            loadComponent: () =>
              import('./features/inventario/productos/productos').then((m) => m.Productos),
            data: { breadcrumb: 'Productos' },
          },
          {
            path: 'atributos',
            loadComponent: () =>
              import('./features/inventario/atributos/atributos').then((m) => m.Atributos),
            data: { breadcrumb: 'Atributos' },
          },
          {
            path: 'almacen',
            loadComponent: () =>
              import('./features/inventario/almacen/almacen').then((m) => m.Almacen),
            data: { breadcrumb: 'Almacén' },
          },
        ],
      },
      {
        path: 'compras',
        data: { breadcrumb: 'Compras' },
        children: [
          {
            path: 'lista',
            loadComponent: () =>
              import('./features/compras/compras/compras').then((m) => m.Compras),
            data: { breadcrumb: 'Compras' },
          },
          {
            path: 'proveedores',
            loadComponent: () =>
              import('./features/compras/proveedores/proveedores').then((m) => m.Proveedores),
            data: { breadcrumb: 'Proveedores' },
          },
        ],
      },
      {
        path: 'ventas',
        data: { breadcrumb: 'Ventas' },
        children: [
          {
            path: 'pos',
            loadComponent: () =>
              import('./features/ventas/pos/pos').then((m) => m.Pos),
            data: { breadcrumb: 'POS' },
          },
          {
            path: 'lista',
            loadComponent: () =>
              import('./features/ventas/ventas/ventas').then((m) => m.Ventas),
            data: { breadcrumb: 'Ventas' },
          },
          {
            path: 'clientes',
            loadComponent: () =>
              import('./features/ventas/clientes/clientes').then((m) => m.Clientes),
            data: { breadcrumb: 'Clientes' },
          },
        ],
      },
      {
        path: 'reportes',
        data: { breadcrumb: 'Reportes' },
        children: [
          {
            path: 'productos-vendidos',
            loadComponent: () =>
              import('./features/reportes/productos-vendidos/productos-vendidos').then(
                (m) => m.ProductosVendidos,
              ),
            data: { breadcrumb: 'Productos Vendidos' },
          },
        ],
      },
      {
        path: 'sistema',
        data: { breadcrumb: 'Sistema' },
        children: [
          {
            path: 'companias',
            loadComponent: () =>
              import('./features/sistema/companias/companias').then((m) => m.Companias),
            data: { breadcrumb: 'Compañías' },
          },
          {
            path: 'usuarios',
            loadComponent: () =>
              import('./features/sistema/usuarios/usuarios').then((m) => m.Usuarios),
            data: { breadcrumb: 'Usuarios' },
          },
          {
            path: 'roles',
            loadComponent: () =>
              import('./features/sistema/roles/roles').then((m) => m.Roles),
            data: { breadcrumb: 'Roles' },
          },
          {
            path: 'permisos',
            loadComponent: () =>
              import('./features/sistema/permisos/permisos').then((m) => m.Permisos),
            data: { breadcrumb: 'Permisos' },
          },
          {
            path: 'diarios',
            loadComponent: () =>
              import('./features/sistema/diarios/diarios').then((m) => m.Diarios),
            data: { breadcrumb: 'Diarios' },
          },
          {
            path: 'impuestos',
            loadComponent: () =>
              import('./features/sistema/impuestos/impuestos').then((m) => m.Impuestos),
            data: { breadcrumb: 'Impuestos' },
          },
          {
            path: 'unidades-medida',
            loadComponent: () =>
              import('./features/sistema/unidades-medida/unidades-medida').then(
                (m) => m.UnidadesMedida,
              ),
            data: { breadcrumb: 'Unidades de Medida' },
          },
        ],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
