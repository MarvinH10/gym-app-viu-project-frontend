import { CompanyResource, PaginatedResponse } from './index';

export interface SupplierResource {
    id: number;
    is_supplier: boolean;
    is_member: boolean;
    document_type: string;
    document_number: string;
    business_name: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    district: string;
    province: string;
    department: string;
    payment_terms: number | null;
    provider_category: string | null;
    status: string; // active, inactive, suspended, blacklisted
    notes: string | null;
    company_id: number | null;
    company?: CompanyResource;
    full_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
}

export interface SupplierQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    company_id?: string;
    status?: string;
}

export interface SupplierRequest {
    company_id?: number | null;
    document_type: string;
    document_number: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
    address?: string | null;
    ubigeo?: string | null;
    payment_terms?: number | null;
    provider_category?: string | null;
    supplier_category?: string | null;
    notes?: string | null;
    status?: string | null;
}

export interface SupplierFormOptions {
    companies: CompanyResource[];
}

export type SupplierPaginatedResponse = PaginatedResponse<SupplierResource>;
