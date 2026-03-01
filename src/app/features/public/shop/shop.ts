import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductApi } from '@/core/services/api/product.api';
import { MembershipPlanApi } from '@/core/services/api/membership-plan.api';
import { CartService, CartItem } from '@/core/services/cart.service';
import { ZardCardComponent } from '@/shared/components/card/card.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ZardCardComponent, ZardButtonComponent, ZardIconComponent],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {
  private readonly productApi = inject(ProductApi);
  private readonly planApi = inject(MembershipPlanApi);
  private readonly cartService = inject(CartService);

  readonly activeTab = signal<'plans' | 'products'>('plans');
  readonly loading = signal(true);

  readonly plans = signal<any[]>([]);
  readonly products = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  switchTab(tab: 'plans' | 'products') {
    this.activeTab.set(tab);
  }

  loadData() {
    this.loading.set(true);

    // Carga de planes
    this.planApi.getPlans({ per_page: 50, status: 'active' }).subscribe({
      next: (res) => {
        this.plans.set(res.data || []);

        // Carga de productos después
        this.productApi.getProducts({ per_page: 50 }).subscribe({
          next: (prodRes) => {
            if (prodRes && prodRes.data) {
              this.products.set(prodRes.data);
            }
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(item: any, type: 'plan' | 'product') {
    const cartItem: CartItem = {
      id: item.id,
      type,
      name: item.name,
      price: Number(item.price || item.list_price || 0),
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
    toast.success('Añadido al carrito', {
      description: `${item.name} ha sido agregado correctamente.`,
    });
  }
}
