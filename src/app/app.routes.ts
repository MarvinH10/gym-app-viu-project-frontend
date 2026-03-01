import { Routes } from '@angular/router';
import { authGuard } from '@/core/guards/auth-guard';
import { guestGuard } from '@/core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
        pathMatch: 'full',
      },
      {
        path: 'tienda',
        loadComponent: () => import('./features/public/shop/shop').then((m) => m.Shop),
        title: 'Tienda | GymZone',
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/public/checkout/checkout').then((m) => m.Checkout),
        title: 'Checkout | GymZone',
      },
      {
        path: 'quienes-somos',
        loadComponent: () =>
          import('./features/public/quienes-somos/quienes-somos').then(
            (m) => m.QuienesSomosComponent,
          ),
        title: 'Quiénes Somos | GymZone',
      },
    ],
  },
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
        title: 'Dashboard | GymZone',
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
        title: 'Mi Perfil | GymZone',
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
                title: 'Miembros | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/gym/members/member-create-edit/member-create-edit.component'),
                title: 'Nuevo Miembro | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/gym/members/member-detail/member-detail.component'),
                title: 'Detalle de Miembro | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/gym/members/member-create-edit/member-create-edit.component'),
                title: 'Editar Miembro | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'plans',
            data: { breadcrumb: 'Planes' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/gym/planes/planes').then((m) => m.PlanesComponent),
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/gym/planes/plane-create-edit/plane-create-edit.component').then(
                    (m) => m.PlaneCreateEditComponent,
                  ),
                data: { breadcrumb: 'Nuevo' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/gym/planes/plane-detail/plane-detail.component').then(
                    (m) => m.PlaneDetailComponent,
                  ),
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/gym/planes/plane-create-edit/plane-create-edit.component').then(
                    (m) => m.PlaneCreateEditComponent,
                  ),
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'recovery',
            loadComponent: () =>
              import('./features/gym/recovery.component').then((m) => m.RecoveryComponent),
          },
          {
            path: 'subscriptions',
            data: { breadcrumb: 'Suscripciones' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/gym/subscriptions/subscriptions').then(
                    (m) => m.SubscriptionsComponent,
                  ),
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/gym/subscriptions/subscription-create-edit/subscription-create-edit.component').then(
                    (m) => m.SubscriptionCreateEditComponent,
                  ),
                data: { breadcrumb: 'Nuevo' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/gym/subscriptions/subscription-detail/subscription-detail.component').then(
                    (m) => m.SubscriptionDetailComponent,
                  ),
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/gym/subscriptions/subscription-create-edit/subscription-create-edit.component').then(
                    (m) => m.SubscriptionCreateEditComponent,
                  ),
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'attendance',
            data: { breadcrumb: 'Asistencias' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/gym/attendances/attendances').then(
                    (m) => m.AttendancesComponent,
                  ),
              },
              {
                path: 'check-in',
                loadComponent: () =>
                  import('./features/gym/attendances/attendance-check-in/attendance-check-in.component').then(
                    (m) => m.AttendanceCheckInComponent,
                  ),
                data: { breadcrumb: 'Registrar Entrada' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/gym/attendances/attendance-detail/attendance-detail.component').then(
                    (m) => m.AttendanceDetailComponent,
                  ),
                data: { breadcrumb: 'Detalle' },
              },
            ],
          },
        ],
      },
      {
        path: 'inventario',
        data: { breadcrumb: 'Inventario' },
        children: [
          {
            path: 'categorias',
            data: { breadcrumb: 'Categorías' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventario/categorias/categorias').then((m) => m.Categorias),
                title: 'Categorías | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/inventario/categorias/categoria-create-edit/categoria-create-edit.component'),
                title: 'Nueva Categoría | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/inventario/categorias/categoria-detail/categoria-detail.component'),
                title: 'Detalle de Categoría | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/inventario/categorias/categoria-create-edit/categoria-create-edit.component'),
                title: 'Editar Categoría | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'almacen',
            data: { breadcrumb: 'Almacenes' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventario/almacen/almacenes').then((m) => m.Almacenes),
                title: 'Almacenes | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/inventario/almacen/almacen-create-edit/almacen-create-edit.component'),
                title: 'Nuevo Almacén | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/inventario/almacen/almacen-detail/almacen-detail.component'),
                title: 'Detalle de Almacén | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/inventario/almacen/almacen-create-edit/almacen-create-edit.component'),
                title: 'Editar Almacén | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'productos',
            data: { breadcrumb: 'Productos' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventario/productos/productos').then((m) => m.Productos),
                title: 'Productos | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/inventario/productos/producto-create-edit/producto-create-edit.component').then(
                    (m) => m.ProductoCreateEditComponent,
                  ),
                title: 'Nuevo Producto | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/inventario/productos/producto-detail/producto-detail.component').then(
                    (m) => m.ProductoDetailComponent,
                  ),
                title: 'Detalle de Producto | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/inventario/productos/producto-create-edit/producto-create-edit.component').then(
                    (m) => m.ProductoCreateEditComponent,
                  ),
                title: 'Editar Producto | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'atributos',
            data: { breadcrumb: 'Atributos' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/inventario/atributos/atributos').then((m) => m.Atributos),
                title: 'Atributos | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/inventario/atributos/atributo-create-edit/atributo-create-edit.component'),
                title: 'Nuevo Atributo | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/inventario/atributos/atributo-detail/atributo-detail.component'),
                title: 'Detalle de Atributo | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/inventario/atributos/atributo-create-edit/atributo-create-edit.component'),
                title: 'Editar Atributo | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
        ],
      },
      {
        path: 'compras',
        data: { breadcrumb: 'Ordenes de Compra' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'lista',
          },
          {
            path: 'lista',
            data: { breadcrumb: 'Compras' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/compras/compras-list/compras-list.component').then(
                    (m) => m.ComprasListComponent,
                  ),
                title: 'Listado de Compras | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/compras/compras-list/compra-create-edit/compra-create-edit.component').then(
                    (m) => m.CompraCreateEditComponent,
                  ),
                title: 'Nueva Orden de Compra | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/compras/compras-list/compra-detail/compra-detail.component').then(
                    (m) => m.CompraDetailComponent,
                  ),
                title: 'Detalle de Compra | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/compras/compras-list/compra-create-edit/compra-create-edit.component').then(
                    (m) => m.CompraCreateEditComponent,
                  ),
                title: 'Editar Compra | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'proveedores',
            data: { breadcrumb: 'Proveedores' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/compras/proveedores/proveedores').then((m) => m.Proveedores),
                title: 'Proveedores | GymZone',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/compras/proveedores/proveedor-create-edit/proveedor-create-edit.component').then(
                    (m) => m.default,
                  ),
                title: 'Crear Proveedor | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/compras/proveedores/proveedor-create-edit/proveedor-create-edit.component').then(
                    (m) => m.default,
                  ),
                title: 'Editar Proveedor | GymZone',
                data: { breadcrumb: 'Editar' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/compras/proveedores/proveedor-detail/proveedor-detail.component').then(
                    (m) => m.default,
                  ),
                title: 'Detalle de Proveedor | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
            ],
          },
        ],
      },
      {
        path: 'ventas',
        data: { breadcrumb: 'Ventas Generales' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'lista',
          },
          {
            path: 'pos',
            data: { breadcrumb: 'Terminales POS' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/ventas/pos/configs/pos-config-list/pos-config-list.component').then(
                    (m) => m.PosConfigListComponent,
                  ),
                title: 'Terminales POS | GymZone',
              },
              {
                path: 'create',
                loadComponent: () =>
                  import('./features/ventas/pos/configs/pos-config-create-edit/pos-config-create-edit.component').then(
                    (m) => m.PosConfigCreateEditComponent,
                  ),
                title: 'Nueva Terminal | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: 'edit/:id',
                loadComponent: () =>
                  import('./features/ventas/pos/configs/pos-config-create-edit/pos-config-create-edit.component').then(
                    (m) => m.PosConfigCreateEditComponent,
                  ),
                title: 'Editar Terminal | GymZone',
                data: { breadcrumb: 'Editar' },
              },
              {
                path: 'open/:configId',
                loadComponent: () =>
                  import('./features/ventas/pos/interactive/pos-session-open.component').then(
                    (m) => m.PosSessionOpenComponent,
                  ),
                title: 'Apertura de Caja | GymZone',
                data: { breadcrumb: 'Apertura' },
              },
              {
                path: 'session/:sessionId',
                loadComponent: () =>
                  import('./features/ventas/pos/interactive/pos-layout.component').then(
                    (m) => m.PosLayoutComponent,
                  ),
                title: 'Terminal PDV | GymZone',
                data: { breadcrumb: 'Terminal' },
              },
            ],
          },
          {
            path: 'lista',
            data: { breadcrumb: 'Ventas' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/ventas/ventas-lista/ventas').then((m) => m.Ventas),
                title: 'Listado de Ventas | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/ventas/ventas-lista/venta-create-edit/venta-create-edit.component'),
                title: 'Nueva Venta | GymZone',
                data: { breadcrumb: 'Nueva' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/ventas/ventas-lista/venta-detail/venta-detail.component'),
                title: 'Detalle de Venta | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/ventas/ventas-lista/venta-create-edit/venta-create-edit.component'),
                title: 'Editar Venta | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'clientes',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/ventas/clientes/clientes').then((m) => m.Clientes),
                title: 'Clientes | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/ventas/clientes/cliente-create-edit/cliente-create-edit.component'),
                title: 'Nuevo Cliente | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/ventas/clientes/cliente-detail/cliente-detail.component'),
                title: 'Detalle de Cliente | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/ventas/clientes/cliente-create-edit/cliente-create-edit.component'),
                title: 'Editar Cliente | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
            data: { breadcrumb: 'Clientes' },
          },
        ],
      },

      {
        path: 'sistema',
        data: { breadcrumb: 'Sistema' },
        children: [
          {
            path: 'companias',
            data: { breadcrumb: 'Compañías' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/sistema/companias/companias').then((m) => m.Companias),
                title: 'Compañías | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/sistema/companias/company-create-edit/company-create-edit.component').then(
                    (m) => m.CompanyCreateEditComponent,
                  ),
                title: 'Nueva Compañía | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/sistema/companias/company-detail/company-detail.component').then(
                    (m) => m.CompanyDetailComponent,
                  ),
                title: 'Detalle de Compañía | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/sistema/companias/company-create-edit/company-create-edit.component').then(
                    (m) => m.CompanyCreateEditComponent,
                  ),
                title: 'Editar Compañía | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'usuarios',
            loadComponent: () =>
              import('./features/sistema/usuarios/usuarios').then((m) => m.Usuarios),
            title: 'Usuarios | GymZone',
            data: { breadcrumb: 'Usuarios' },
          },

          {
            path: 'diarios',
            data: { breadcrumb: 'Diarios' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/sistema/journals/journals').then((m) => m.JournalsComponent),
                title: 'Diarios | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/sistema/journals/journal-create-edit/journal-create-edit.component'),
                title: 'Nuevo Diario | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/sistema/journals/journal-detail/journal-detail.component'),
                title: 'Detalle de Diario | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/sistema/journals/journal-create-edit/journal-create-edit.component'),
                title: 'Editar Diario | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'payment-methods',
            data: { breadcrumb: 'Métodos de Pago' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/sistema/payment-methods/payment-methods').then(
                    (m) => m.PaymentMethodsComponent,
                  ),
                title: 'Métodos de Pago | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/sistema/payment-methods/payment-method-create-edit/payment-method-create-edit.component').then(
                    (m) => m.PaymentMethodCreateEditComponent,
                  ),
                title: 'Nuevo Método de Pago | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/sistema/payment-methods/payment-method-detail/payment-method-detail.component').then(
                    (m) => m.PaymentMethodDetailComponent,
                  ),
                title: 'Detalle de Método de Pago | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/sistema/payment-methods/payment-method-create-edit/payment-method-create-edit.component').then(
                    (m) => m.PaymentMethodCreateEditComponent,
                  ),
                title: 'Editar Método de Pago | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'impuestos',
            data: { breadcrumb: 'Impuestos' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/sistema/impuestos/impuestos').then((m) => m.Impuestos),
                title: 'Impuestos | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/sistema/impuestos/impuesto-create-edit/impuesto-create-edit.component'),
                title: 'Nuevo Impuesto | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/sistema/impuestos/impuesto-detail/impuesto-detail.component'),
                title: 'Detalle de Impuesto | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/sistema/impuestos/impuesto-create-edit/impuesto-create-edit.component'),
                title: 'Editar Impuesto | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
          {
            path: 'unidades-medida',
            data: { breadcrumb: 'Unidades de Medida' },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/sistema/unidades-medida/unidades-medida').then(
                    (m) => m.UnidadesMedida,
                  ),
                title: 'Unidades de Medida | GymZone',
              },
              {
                path: 'new',
                loadComponent: () =>
                  import('./features/sistema/unidades-medida/unidades-medida-create-edit/unidades-medida-create-edit.component'),
                title: 'Nueva Unidad | GymZone',
                data: { breadcrumb: 'Crear' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/sistema/unidades-medida/unidades-medida-detail/unidades-medida-detail.component'),
                title: 'Detalle de Unidad | GymZone',
                data: { breadcrumb: 'Detalle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/sistema/unidades-medida/unidades-medida-create-edit/unidades-medida-create-edit.component'),
                title: 'Editar Unidad | GymZone',
                data: { breadcrumb: 'Editar' },
              },
            ],
          },
        ],
      },
      // El path '' (raíz) ya no redirige a dashboard de manera silenciosa aquí
      // porque lo atrapa el layout público primero.
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
