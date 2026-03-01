import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '@/core/services/cart.service';
import { SaleApi } from '@/core/services/api/sale.api';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ZardButtonComponent, ZardIconComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  readonly cartService = inject(CartService);
  private readonly saleApi = inject(SaleApi);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  checkoutForm: FormGroup;
  isSubmitting = signal(false);

  constructor() {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      document: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  processCheckout() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor completa todos los campos requeridos.',
      });
      return;
    }

    if (this.cartService.items().length === 0) {
      toast.error('Carrito vacío', {
        description: 'Agrega productos a tu carrito antes de continuar.',
      });
      return;
    }

    this.isSubmitting.set(true);

    // Simulando retraso de red y pasarela de pago
    setTimeout(() => {
      // En un entorno real, aquí registraríamos al cliente si no existe
      // y luego llamaríamos a this.saleApi.createSale() con el payload formateado.

      toast.success('¡Compra exitosa!', {
        description:
          'Tu orden ha sido procesada correctamente. Te hemos enviado un correo con los detalles.',
      });

      this.cartService.clear();
      this.isSubmitting.set(false);
      this.router.navigate(['/']);
    }, 2000);
  }

  removeItem(id: string | number, type: 'product' | 'plan') {
    this.cartService.removeFromCart(id, type);
  }
}
