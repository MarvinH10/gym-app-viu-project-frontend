import { CustomerResource } from './customer.model';
import { WarehouseResource } from './warehouse.model';
import { CompanyResource } from './company.model';
import { ProductProductResource } from './product.model';
import { TaxResource } from './tax.model';

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

export interface SaleResource {
    id: number;
    document_number: string;
    serie: string;
    correlative: string;
    date: string | null;
    notes: string | null;
    status: string;
    payment_status: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    partner_id: number | null;
    warehouse_id: number;
    journal_id: number;
    company_id: number;
    user_id: number;
    created_at: string | null;
    updated_at: string | null;
    partner?: CustomerResource;
    warehouse?: WarehouseResource;
    company?: CompanyResource;
    products?: ProductableResource[];
    journal?: {
        id: number;
        name: string;
        code: string;
        document_type_code: string;
    };
    user?: {
        id: number;
        name: string;
    };
    original_sale?: {
        id: number;
        document: string;
        status: string;
        journal_code: string;
        doc_type: string;
    };
    credit_notes?: string;
}

export interface SaleQueryParams {
    page?: number;
    per_page?: number | string;
    search?: string;
    status?: string;
    payment_status?: string;
    from?: string;
    to?: string;
}

export interface SaleProductPayload {
    product_product_id: number;
    tax_id: number | null;
    uom_id: number | null;
    quantity: number;
    price: number;
    quantity_uom: number;
    price_uom: number;
}

export interface SalePaymentPayload {
    payment_method_id: number;
    amount: number;
}

export interface CreateSalePayload {
    partner_id: number | null;
    warehouse_id: number;
    company_id: number | null;
    notes: string | null;
    pos_session_id?: number | null;
    products: SaleProductPayload[];
    payments?: SalePaymentPayload[];
}

export interface SaleFormOptions {
    customers: CustomerResource[];
    warehouses: WarehouseResource[];
    taxes: TaxResource[];
}
