import { Injectable, signal, computed } from '@angular/core';

export interface PosOrderLine {
  id: string; // uuid
  product: any; // ProductResource
  qty: number;
  price: number;
  discount: number; // percentage 0-100
  tax_id?: number;
  // calculados
  subtotal: number;
  total: number;
}

export type NumpadMode = 'Qty' | 'Disc' | 'Price';

@Injectable({
  providedIn: 'root',
})
export class PosStateService {
  currentSessionId = signal<number | null>(null);

  lines = signal<PosOrderLine[]>([]);
  selectedLineId = signal<string | null>(null);

  paymentMode = signal<boolean>(false);
  paymentMethods = signal<any[]>([
    { id: 1, name: 'Efectivo', type: 'cash' },
    { id: 2, name: 'Tarjeta', type: 'bank' },
  ]);
  payments = signal<{ method_id: number; name: string; amount: number }[]>([]);

  numpadMode = signal<NumpadMode>('Qty');

  customerId = signal<number | null>(null);

  subtotal = computed(() => this.lines().reduce((acc, line) => acc + line.subtotal, 0));
  total = computed(() => this.lines().reduce((acc, line) => acc + line.total, 0));
  totalItems = computed(() => this.lines().reduce((acc, line) => acc + line.qty, 0));

  totalPaid = computed(() => this.payments().reduce((acc, p) => acc + p.amount, 0));
  change = computed(() => Math.max(0, this.totalPaid() - this.total()));
  remaining = computed(() => Math.max(0, this.total() - this.totalPaid()));

  addLine(product: any, pricesIncludeTax: boolean) {
    const existingIndex = this.lines().findIndex(
      (l) => l.product.id === product.id && l.price === parseFloat(product.price),
    );

    if (existingIndex >= 0) {
      this.updateLineQty(this.lines()[existingIndex].id, this.lines()[existingIndex].qty + 1);
      this.selectedLineId.set(this.lines()[existingIndex].id);
    } else {
      const price = parseFloat(product.price || '0');
      const newLine: PosOrderLine = {
        id: crypto.randomUUID(),
        product,
        qty: 1,
        price,
        discount: 0,
        subtotal: price,
        total: price,
      };
      this.lines.update((vals) => [...vals, newLine]);
      this.selectedLineId.set(newLine.id);
    }
    this.numpadMode.set('Qty');
  }

  updateSelectedLineField(value: string | number) {
    const id = this.selectedLineId();
    if (!id) return;

    const mode = this.numpadMode();
    this.lines.update((vals) =>
      vals.map((line) => {
        if (line.id === id) {
          let newQty = line.qty;
          let newPrice = line.price;
          let newDisc = line.discount;

          if (mode === 'Qty') {
            if (typeof value === 'string') {
              if (value === 'Backspace') {
                const strQty = newQty.toString();
                newQty = strQty.length > 1 ? parseFloat(strQty.slice(0, -1)) : 0;
              } else if (value === '+/-') {
                newQty = -newQty;
              } else {
                const strQty = newQty === 0 ? value : newQty.toString() + value;
                newQty = parseFloat(strQty);
              }
            } else {
              newQty = value as number;
            }
          } else if (mode === 'Price') {
            if (typeof value === 'string') {
              if (value === 'Backspace') {
                const strPrice = newPrice.toString();
                newPrice = strPrice.length > 1 ? parseFloat(strPrice.slice(0, -1)) : 0;
              } else if (value !== '+/-') {
                const strPrice = newPrice === 0 ? value : newPrice.toString() + value;
                newPrice = parseFloat(strPrice);
              }
            } else {
              newPrice = value as number;
            }
          } else if (mode === 'Disc') {
            if (typeof value === 'string') {
              if (value === 'Backspace') {
                const strDisc = newDisc.toString();
                newDisc = strDisc.length > 1 ? parseFloat(strDisc.slice(0, -1)) : 0;
              } else if (value !== '+/-') {
                const strDisc = newDisc === 0 ? value : newDisc.toString() + value;
                newDisc = parseFloat(strDisc);
              }
            } else {
              newDisc = value as number;
            }
            if (newDisc > 100) newDisc = 100;
          }

          const subtotal = newQty * newPrice;
          const discountAmount = subtotal * (newDisc / 100);
          const total = subtotal - discountAmount;

          return { ...line, qty: newQty, price: newPrice, discount: newDisc, subtotal, total };
        }
        return line;
      }),
    );
  }

  updateLineQty(id: string, qty: number) {
    this.lines.update((vals) =>
      vals.map((l) => {
        if (l.id === id) {
          const subtotal = qty * l.price;
          const discountAmount = subtotal * (l.discount / 100);
          const total = subtotal - discountAmount;
          return { ...l, qty, subtotal, total };
        }
        return l;
      }),
    );
  }

  removeLine(id: string) {
    this.lines.update((vals) => vals.filter((l) => l.id !== id));
    if (this.selectedLineId() === id) {
      this.selectedLineId.set(null);
    }
  }

  addPayment(method: any) {
    const rem = this.remaining();
    if (rem <= 0) return;

    this.payments.update((vals) => {
      const existing = vals.find((v) => v.method_id === method.id);
      if (existing) {
        existing.amount += rem;
        return [...vals];
      }
      return [...vals, { method_id: method.id, name: method.name, amount: rem }];
    });
  }

  removePayment(methodId: number) {
    this.payments.update((vals) => vals.filter((v) => v.method_id !== methodId));
  }

  updatePaymentAmount(methodId: number, value: string | number) {
    this.payments.update((vals) =>
      vals.map((p) => {
        if (p.method_id === methodId) {
          let newAmt = p.amount;
          if (typeof value === 'string') {
            if (value === 'Backspace') {
              const str = newAmt.toString();
              newAmt = str.length > 1 ? parseFloat(str.slice(0, -1)) : 0;
            } else if (value !== '+/-') {
              const str = newAmt === 0 ? value : newAmt.toString() + value;
              newAmt = parseFloat(str);
            }
          } else {
            newAmt = value as number;
          }
          return { ...p, amount: newAmt };
        }
        return p;
      }),
    );
  }

  clearOrder() {
    this.lines.set([]);
    this.selectedLineId.set(null);
    this.customerId.set(null);
    this.numpadMode.set('Qty');
    this.paymentMode.set(false);
    this.payments.set([]);
  }
}
