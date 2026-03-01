import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string | number;
  type: 'product' | 'plan';
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  readonly items = this.cartItems.asReadonly();

  readonly totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0),
  );

  addToCart(item: CartItem) {
    this.cartItems.update((items) => {
      const existing = items.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        return items.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...items, item];
    });
  }

  removeFromCart(id: string | number, type: 'product' | 'plan') {
    this.cartItems.update((items) => items.filter((i) => !(i.id === id && i.type === type)));
  }

  updateQuantity(id: string | number, type: 'product' | 'plan', quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(id, type);
      return;
    }
    this.cartItems.update((items) =>
      items.map((i) => (i.id === id && i.type === type ? { ...i, quantity } : i)),
    );
  }

  clear() {
    this.cartItems.set([]);
  }
}
