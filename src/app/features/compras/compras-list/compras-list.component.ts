import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/card/card.component';

@Component({
    selector: 'app-compras-list',
    standalone: true,
    imports: [CommonModule, ZardCardComponent],
    template: `
        <div class="p-6">
            <z-card zTitle="Gestión de Compras">
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p class="text-lg">Próximamente: Listado y Gestión de Órdenes de Compra.</p>
                </div>
            </z-card>
        </div>
    `,
})
export class ComprasListComponent { }
