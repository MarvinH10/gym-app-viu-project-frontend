import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PosSessionApi, PosSession } from '@/core/services/api/pos-session.api';
import { ProductApi } from '@/core/services/api/product.api';
import { CategoryApi } from '@/core/services/api/category.api';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import { PosStateService, NumpadMode } from './pos-state.service';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SaleApi } from '@/core/services/api/sale.api';

@Component({
  selector: 'app-pos-layout',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardIconComponent, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-100 bg-background text-foreground flex flex-col font-sans h-screen overflow-hidden"
    >
      <header
        class="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-10"
      >
        <div class="flex items-center gap-4">
          <div class="font-bold text-lg tracking-tight text-primary flex items-center gap-2">
            <z-icon zType="monitor" class="size-5" /> TPV
          </div>
          <div class="h-5 w-px bg-border"></div>
          <span class="text-sm font-medium">{{
            session()?.config?.name ||
              (session() ? 'Caja #' + session()?.id + ' Abierta' : 'Cargando...')
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          @if (session()) {
            <div
              class="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-full"
            >
              <div
                class="size-2 bg-success rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.6)]"
              ></div>
              <span class="text-xs font-semibold">Conectado</span>
            </div>
          } @else {
            <div
              class="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-full"
            >
              <div class="size-2 bg-destructive rounded-full"></div>
              <span class="text-xs font-semibold">Desconectado</span>
            </div>
          }
          <button
            z-button
            zType="outline"
            size="sm"
            class="rounded-full shadow-sm text-xs font-semibold px-4 h-8 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
            (click)="showCloseSessionModal.set(true)"
          >
            <z-icon zType="log-out" class="mr-2 size-3.5" /> Cerrar Caja
          </button>
          <button
            z-button
            zType="outline"
            size="sm"
            class="rounded-full shadow-sm text-xs font-semibold px-4 h-8"
            (click)="closeTerminal()"
          >
            <z-icon zType="log-out" class="mr-2 size-3.5" /> Salir
          </button>
        </div>
      </header>

      <main class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <section
          class="flex-1 flex flex-col bg-muted/30 border-b md:border-b-0 md:border-r border-border min-w-0"
        >
          @if (!state.paymentMode()) {
            <div
              class="p-3 bg-card border-b border-border flex gap-2 overflow-x-auto items-center shrink-0"
            >
              <div class="relative flex-1 min-w-[250px] max-w-xs shrink-0">
                <z-icon
                  zType="search"
                  class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none"
                />
                <input
                  type="text"
                  class="w-full h-10 pl-10 pr-8 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Buscar..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearch($event)"
                />
                @if (searchQuery()) {
                  <button
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    (click)="onSearch('')"
                  >
                    <z-icon zType="x" class="size-4" />
                  </button>
                }
              </div>

              <div class="h-6 w-px bg-border mx-1"></div>

              <button
                class="px-4 h-10 rounded-md shrink-0 text-sm transition-colors"
                [class]="
                  !selectedCategoryId()
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-background border border-input hover:bg-muted'
                "
                (click)="selectCategory(null)"
              >
                Todos
              </button>
              @for (cat of categories(); track cat.id) {
                <button
                  class="px-4 h-10 rounded-md shrink-0 text-sm transition-colors whitespace-nowrap"
                  [class]="
                    selectedCategoryId() === cat.id
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'bg-background border border-input hover:bg-muted'
                  "
                  (click)="selectCategory(cat.id)"
                >
                  {{ cat.name }}
                </button>
              }
            </div>

            <div class="flex-1 overflow-y-auto p-4 content-container">
              @if (isLoadingProducts()) {
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  @for (i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track i) {
                    <div class="h-32 bg-muted rounded-xl animate-pulse"></div>
                  }
                </div>
              } @else if (products().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <z-icon zType="archive" class="size-16 mb-4 opacity-20" />
                  <p class="text-lg font-medium">No se encontraron productos</p>
                </div>
              } @else {
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 auto-rows-max"
                >
                  @for (prod of products(); track prod.id) {
                    <div
                      class="group relative flex flex-col items-center justify-between text-center p-3 h-36 bg-card rounded-xl border border-border/50 shadow-sm cursor-pointer select-none overflow-hidden hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]"
                      (click)="addProductToLine(prod)"
                    >
                      <div class="w-full h-16 mb-2 flex items-center justify-center">
                        @if (prod.image) {
                          <img
                            [src]="prod.image"
                            class="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        } @else {
                          <div
                            class="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center"
                          >
                            <z-icon zType="archive" class="size-6" />
                          </div>
                        }
                      </div>
                      <div class="w-full flex flex-col flex-1 justify-end">
                        <span class="text-xs font-semibold leading-tight line-clamp-2">{{
                          prod.name
                        }}</span>
                        <span class="text-xs font-bold text-primary mt-1"
                          >S/ {{ prod.price | number: '1.2-2' }}</span
                        >
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="flex-1 flex flex-col bg-background">
              <div
                class="flex items-center justify-between p-4 border-b border-border bg-card font-semibold"
              >
                <div class="flex items-center gap-3">
                  <button z-button zType="outline" size="sm" (click)="state.paymentMode.set(false)">
                    <z-icon zType="arrow-left" class="mr-2 size-4" /> Volver
                  </button>
                  <span class="text-lg">Pagos</span>
                </div>
                <div class="text-xl">
                  Por pagar:
                  <span class="text-primary ml-2"
                    >S/ {{ state.remaining() | number: '1.2-2' }}</span
                  >
                </div>
              </div>

              <div class="flex-1 flex flex-col sm:flex-row overflow-hidden">
                <div
                  class="w-full sm:w-1/3 border-r border-border p-4 overflow-y-auto space-y-3 bg-muted/10"
                >
                  <h3
                    class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Métodos de Pago
                  </h3>
                  @for (method of state.paymentMethods(); track method.id) {
                    <button
                      class="w-full text-left p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 hover:shadow transition-all group flex items-center justify-between"
                      (click)="state.addPayment(method)"
                    >
                      <span
                        class="font-bold text-base group-hover:text-primary transition-colors"
                        >{{ method.name }}</span
                      >
                      <z-icon
                        zType="chevron-right"
                        class="size-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all pr-2"
                      />
                    </button>
                  }
                </div>

                <div class="flex-1 flex flex-col bg-card">
                  <div class="flex-1 overflow-y-auto p-6">
                    @if (state.payments().length === 0) {
                      <div
                        class="flex flex-col items-center justify-center h-full text-muted-foreground/60 p-6 text-center"
                      >
                        <z-icon zType="credit-card" class="size-16 mb-4 opacity-30" />
                        <p class="font-medium text-lg">Seleccione un método de pago</p>
                      </div>
                    } @else {
                      <div class="space-y-4">
                        @for (payment of state.payments(); track payment.method_id) {
                          <div
                            class="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border group relative"
                          >
                            <span class="font-bold text-lg">{{ payment.name }}</span>
                            <div class="flex items-center gap-4">
                              <span class="font-bold text-xl text-primary"
                                >S/ {{ payment.amount | number: '1.2-2' }}</span
                              >
                              <button
                                class="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all absolute -top-3 -right-3 sm:static opacity-100 sm:opacity-0 sm:group-hover:opacity-100 bg-background sm:bg-transparent shadow sm:shadow-none border border-border sm:border-none"
                                (click)="state.removePayment(payment.method_id)"
                              >
                                <z-icon zType="x" class="size-4" />
                              </button>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="mt-8 border-t border-border pt-6 space-y-2 max-w-sm mx-auto">
                        <div
                          class="flex justify-between items-center text-muted-foreground text-sm font-medium"
                        >
                          <span>Total Pagado</span>
                          <span>S/ {{ state.totalPaid() | number: '1.2-2' }}</span>
                        </div>
                        <div
                          class="flex justify-between items-center text-destructive font-bold text-lg"
                        >
                          <span>Deuda Restante</span>
                          <span>S/ {{ state.remaining() | number: '1.2-2' }}</span>
                        </div>
                        <div
                          class="flex justify-between items-center text-success font-bold text-lg pt-2 border-t top-border-dashed border-border/50"
                        >
                          <span>Vuelto</span>
                          <span>S/ {{ state.change() | number: '1.2-2' }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="p-4 border-t border-border bg-muted/30">
                    <button
                      class="w-full h-14 rounded-xl text-xl font-bold flex items-center justify-center gap-3 shadow-md outline-none transition-all active:scale-[0.98]"
                      [class]="
                        state.remaining() > 0 || isProcessingPayment()
                          ? 'bg-muted text-muted-foreground pointer-events-none opacity-50'
                          : 'bg-success text-success-foreground hover:opacity-90'
                      "
                      [disabled]="state.remaining() > 0 || isProcessingPayment()"
                      (click)="validatePayment()"
                    >
                      @if (isProcessingPayment()) {
                        <z-icon zType="refresh-cw" class="size-6 animate-spin" />
                        PROCESANDO...
                      } @else {
                        <z-icon zType="check" class="size-6" /> VALIDAR PAGO
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </section>

        <section
          class="w-full h-1/2 md:h-auto md:w-80 lg:w-96 flex flex-col bg-card shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:shadow-[-4px_0_12px_rgba(0,0,0,0.03)] z-10"
        >
          <div
            class="p-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer flex justify-between items-center group"
          >
            <div class="flex items-center gap-3">
              <div
                class="p-2 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
              >
                <z-icon zType="user" class="size-4" />
              </div>
              <span class="text-sm font-medium">Consumidor Final</span>
            </div>
            <z-icon zType="chevron-right" class="size-4 text-muted-foreground mr-1" />
          </div>

          <div class="flex-1 overflow-y-auto flex flex-col">
            @if (state.lines().length === 0) {
              <div
                class="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center"
              >
                <z-icon zType="shopping-cart" class="size-16 mb-4 opacity-10" />
                <p class="font-medium text-lg text-foreground/40">El carrito está vacío</p>
              </div>
            } @else {
              <ul class="flex-1">
                @for (line of state.lines(); track line.id) {
                  <li
                    class="p-3 border-b border-border hover:bg-muted/30 cursor-pointer select-none transition-colors border-l-4"
                    [ngClass]="{
                      'bg-primary/15 border-l-primary text-primary':
                        state.selectedLineId() === line.id,
                      'border-l-transparent': state.selectedLineId() !== line.id,
                    }"
                    (click)="state.selectedLineId.set(line.id)"
                  >
                    <div class="flex justify-between items-start">
                      <span class="font-semibold text-sm line-clamp-2 leading-tight pr-2">{{
                        line.product.name
                      }}</span>
                      <span class="font-bold text-sm text-right shrink-0"
                        >S/ {{ line.total | number: '1.2-2' }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center mt-2 text-xs">
                      <div class="flex gap-2 text-muted-foreground font-medium">
                        <span
                          class="bg-background px-1.5 py-0.5 rounded border border-border shadow-sm"
                          >{{ line.qty }} Unds</span
                        >
                        <span>x S/ {{ line.price | number: '1.2-2' }}</span>
                        @if (line.discount > 0) {
                          <span class="text-destructive font-bold ml-1"
                            >(-{{ line.discount }}%)</span
                          >
                        }
                      </div>
                      @if (state.selectedLineId() === line.id) {
                        <button
                          class="text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                          (click)="state.removeLine(line.id); $event.stopPropagation()"
                        >
                          <z-icon zType="trash" class="size-3.5" />
                        </button>
                      }
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <div
            class="p-4 bg-background border-t border-border shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
          >
            <div
              class="flex justify-between items-center mb-1 text-sm text-muted-foreground font-medium px-1"
            >
              <span>Subtotal</span>
              <span>S/ {{ state.subtotal() | number: '1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-end mt-2 px-1">
              <span class="text-lg font-medium text-foreground">Total</span>
              <span class="text-3xl font-bold tracking-tight text-primary"
                >S/ {{ state.total() | number: '1.2-2' }}</span
              >
            </div>
          </div>

          @if (!state.paymentMode()) {
            <div class="bg-muted border-t border-border p-2 shrink-0 select-none">
              <div
                class="flex p-1 bg-background rounded-lg border border-border mb-2 shadow-sm font-medium text-sm"
              >
                <button
                  class="flex-1 py-1.5 rounded-md transition-all active:scale-95"
                  [class]="
                    state.numpadMode() === 'Qty'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'hover:bg-muted'
                  "
                  (click)="state.numpadMode.set('Qty')"
                >
                  Cant.
                </button>
                <button
                  class="flex-1 py-1.5 rounded-md transition-all active:scale-95"
                  [class]="
                    state.numpadMode() === 'Disc'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'hover:bg-muted'
                  "
                  (click)="state.numpadMode.set('Disc')"
                >
                  % Desc
                </button>
                <button
                  class="flex-1 py-1.5 rounded-md transition-all active:scale-95"
                  [class]="
                    state.numpadMode() === 'Price'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'hover:bg-muted'
                  "
                  (click)="state.numpadMode.set('Price')"
                >
                  Precio
                </button>
              </div>

              <div class="grid grid-cols-4 gap-2 h-48">
                <div class="col-span-3 grid grid-cols-3 gap-2">
                  @for (
                    num of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+/-', '0', '.'];
                    track num
                  ) {
                    <button
                      class="bg-background border border-border rounded-lg text-lg font-semibold hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all outline-none"
                      (click)="onNumpadClick(num)"
                    >
                      {{ num }}
                    </button>
                  }
                </div>
                <div class="col-span-1 flex flex-col gap-2">
                  <button
                    class="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex-1 flex items-center justify-center hover:bg-destructive/20 active:scale-95 transition-all outline-none"
                    (click)="onNumpadClick('Backspace')"
                  >
                    <z-icon zType="arrow-left" class="size-6" />
                  </button>
                  <button
                    class="bg-primary text-primary-foreground rounded-lg flex-2 text-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex flex-col items-center justify-center leading-tight outline-none"
                    [disabled]="state.totalItems() === 0"
                    [class.opacity-50]="state.totalItems() === 0"
                    (click)="openPaymentModal()"
                  >
                    <z-icon zType="chevron-right" class="size-6 mb-1" />
                    PAGAR
                  </button>
                </div>
              </div>
            </div>
          }
        </section>
      </main>

      <!-- Modal Cierre de Caja -->
      @if (showCloseSessionModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            class="bg-background rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
          >
            <div class="p-6 border-b border-border text-center bg-muted/30">
              <div
                class="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <z-icon zType="log-out" class="size-8" />
              </div>
              <h2 class="text-2xl font-bold tracking-tight">Cerrar Caja</h2>
              <p class="text-sm text-muted-foreground mt-2">
                Ingrese el dinero contado en la caja y notas si hay discrepancias.
              </p>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1.5 text-foreground"
                  >Efectivo Contado (S/)</label
                >
                <input
                  type="number"
                  class="w-full rounded-lg border border-input bg-background px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  placeholder="0.00"
                  [ngModel]="closingBalance()"
                  (ngModelChange)="closingBalance.set($event)"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5 text-foreground"
                  >Notas (Opcional)</label
                >
                <textarea
                  class="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  rows="3"
                  placeholder="Ej: Faltan S/ 5.00 de cambio..."
                  [ngModel]="closingNote()"
                  (ngModelChange)="closingNote.set($event)"
                ></textarea>
              </div>
            </div>

            <div
              class="p-4 bg-muted/50 border-t border-border flex justify-end gap-3 rounded-b-2xl"
            >
              <button
                class="px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors active:scale-95 text-foreground/80 hover:text-foreground"
                (click)="showCloseSessionModal.set(false)"
                [disabled]="isClosingSession()"
              >
                Cancelar
              </button>
              <button
                class="px-5 py-2.5 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                (click)="confirmCloseSession()"
                [disabled]="isClosingSession()"
              >
                @if (isClosingSession()) {
                  <z-icon zType="refresh-cw" class="size-4 animate-spin" />
                }
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PosLayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionApi = inject(PosSessionApi);
  private readonly productApi = inject(ProductApi);
  private readonly categoryApi = inject(CategoryApi);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public state = inject(PosStateService);
  private saleApi = inject(SaleApi);

  sessionId = signal<number | null>(null);
  session = signal<PosSession | null>(null);

  categories = signal<any[]>([]);
  products = signal<any[]>([]);

  searchQuery = signal('');
  selectedCategoryId = signal<number | null>(null);
  isLoadingProducts = signal(true);
  isProcessingPayment = signal(false);

  // Cierre de caja
  showCloseSessionModal = signal(false);
  closingBalance = signal<number | null>(null);
  closingNote = signal<string>('');
  isClosingSession = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('sessionId');
      if (id) {
        this.sessionId.set(+id);
        this.loadSession(+id);
      }
    });

    this.loadCategories();
    this.loadProducts();
  }

  loadSession(id: number) {
    this.sessionApi.getPosSession(id).subscribe({
      next: (res) => {
        this.session.set(res.data);
        this.state.currentSessionId.set(res.data.id);
      },
      error: () => {
        toast.error('Sesión no encontrada o cerrada.');
        this.router.navigate(['/ventas/pos']);
      },
    });
  }

  loadCategories() {
    this.categoryApi.getCategories({ per_page: 50 }).subscribe((res) => {
      if (res.success && res.data) {
        this.categories.set(res.data.data);
      }
    });
  }

  loadProducts() {
    this.isLoadingProducts.set(true);
    let params: any = { per_page: 50 };

    const catId = this.selectedCategoryId();
    if (catId) params.category_id = catId;

    const query = this.searchQuery();
    if (query) params.search = query;

    this.productApi
      .getProducts(params)
      .pipe(finalize(() => this.isLoadingProducts.set(false)))
      .subscribe({
        next: (res) => {
          let items = res.data || [];
          // Filtro lado cliente en caso de que backend ignore category_id
          const currentCat = this.selectedCategoryId();
          if (currentCat) {
            items = items.filter(
              (p: any) => p.category_id === currentCat || p.category?.id === currentCat,
            );
          }
          this.products.set(items);
        },
        error: () => {
          this.products.set([]);
        },
      });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.loadProducts();
  }

  onSearch(val: string) {
    this.searchQuery.set(val);
    this.loadProducts();
  }

  addProductToLine(product: any) {
    const sessionObj = this.session();
    const config = sessionObj ? sessionObj.config : null;
    const includeTax = config ? config.prices_include_tax : true;
    this.state.addLine(product, includeTax);
  }

  onNumpadClick(key: string) {
    this.state.updateSelectedLineField(key);
  }

  openPaymentModal() {
    if (this.state.totalItems() === 0) return;
    this.state.paymentMode.set(true);
  }

  validatePayment() {
    if (this.state.remaining() > 0) return;
    if (this.isProcessingPayment()) return;

    this.isProcessingPayment.set(true);

    const sessionObj = this.session();
    const config = sessionObj?.config as any;

    const warehouseId = config?.warehouse?.id || config?.warehouse_id;

    if (!warehouseId) {
      toast.error('No se encontró el almacén configurado en esta terminal.');
      this.isProcessingPayment.set(false);
      return;
    }

    const payload = {
      warehouse_id: warehouseId,
      company_id: config?.company_id,
      pos_session_id: sessionObj?.id,
      products: this.state.lines().map((line) => ({
        product_product_id: line.product?.variants?.[0]?.id || line.product?.id,
        quantity: line.qty,
        price: line.price,
      })),
      payments: this.state.payments().map((p) => ({
        payment_method_id: p.method_id,
        amount: p.amount,
      })),
    };

    this.saleApi.createSale(payload).subscribe({
      next: (res) => {
        const saleId = res.data.id;
        this.saleApi.postSale(saleId).subscribe({
          next: () => {
            toast.success('Pago completado correctamente.');
            this.state.clearOrder();
            this.state.paymentMode.set(false);
            this.isProcessingPayment.set(false);
          },
          error: (err: any) => {
            console.error('Error posting sale:', err);
            toast.error('La venta se registró pero no se pudo procesar el inventario.');
            this.state.clearOrder();
            this.state.paymentMode.set(false);
            this.isProcessingPayment.set(false);
          },
        });
      },
      error: (err: any) => {
        console.error('Error creating sale:', err);
        toast.error(err.error?.message || 'Ocurrió un error al procesar la venta.');
        this.isProcessingPayment.set(false);
      },
    });
  }

  confirmCloseSession() {
    const s = this.session();
    if (!s) return;

    this.isClosingSession.set(true);

    const payload = {
      pos_config_id: s.pos_config_id,
      closing_balance: this.closingBalance() || 0,
      closing_note: this.closingNote(),
    };

    this.sessionApi.closePosSession(s.id, payload).subscribe({
      next: () => {
        toast.success('Caja cerrada con éxito.');
        this.isClosingSession.set(false);
        this.showCloseSessionModal.set(false);
        this.router.navigate(['/ventas/pos']);
      },
      error: (err: any) => {
        toast.error(err.error?.message || 'Error al cerrar la caja.');
        this.isClosingSession.set(false);
      },
    });
  }

  closeTerminal() {
    this.router.navigate(['/ventas/pos']);
  }
}
