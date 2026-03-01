import { SupplierResource } from './supplier.model';
import { WarehouseResource } from './warehouse.model';
import { CompanyResource } from './company.model';
import { ProductProductResource } from './product.model';
import { TaxResource } from './tax.model';
import { PaginatedResponse } from './api-response.model';

export interface ProductableResource {
    id: number;
    quantity: number;
    price: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    quantity_uom: number;
    price_uom: number;
    uom_factor: number;
    product: ProductProductResource;
}

export interface PurchaseResource {
    id: number;
    serie: string;
    correlative: string;
    sequence_code: string;
    date: string;
    vendor_bill_number: string | null;
    vendor_bill_date: string;
    status: 'draft' | 'posted' | 'cancelled';
    payment_status: 'not_paid' | 'partial' | 'paid';
    total: number;
    observation: string | null;
    company_id: number;
    partner_id: number;
    warehouse_id: number;
    journal_id: number;
    partner: SupplierResource;
    warehouse: WarehouseResource;
    company: CompanyResource;
    lines: ProductableResource[];
    created_at: string;
    updated_at: string;
    purchase?: number; // Path parameter ref
}

export interface PurchaseProductPayload {
    product_product_id: number;
    quantity: number | null;
    price: number | null;
    tax_id: number | null;
    uom_id: number | null;
    quantity_uom: number | null;
    price_uom: number | null;
}

export interface CreatePurchasePayload {
    partner_id: number;
    warehouse_id: number;
    company_id: number | null;
    vendor_bill_number: string | null;
    vendor_bill_date: string | null;
    observation: string | null;
    products: PurchaseProductPayload[];
}

export interface PurchaseQueryParams {
    from?: string;
    per_page?: string | number;
    search?: string;
    status?: string;
    to?: string;
    page?: number;
}

export interface PurchaseFormOptions {
    suppliers: SupplierResource[];
    warehouses: WarehouseResource[];
    taxes: TaxResource[]; // Reusing TaxResource despite API doc sample "string"
}

export type PurchasePaginatedResponse = PaginatedResponse<PurchaseResource> & {
    draft_total?: string;
    posted_total?: string;
};
