import { CompanyResource } from './company.model';
import { PaginationLinks, PaginationMeta } from './api-response.model';

export interface CustomerResource {
    id: number;
    is_customer: boolean;
    is_member: boolean;
    document_type: string;
    document_number: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    ubigeo: string | null;
    birth_date: string;
    gender: string | null;
    status: string;
    notes: string | null;
    company_id: number | null;
    user_id: number | null;
    company?: CompanyResource;
    created_at: string;
    updated_at: string;
}

export interface CustomerQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    company_id?: string;
    status?: string;
    'portal_filters[]'?: string[];
}

export interface CustomerFormOptions {
    companies: CompanyResource[];
}

export interface PaginatedCustomersResponse {
    success: boolean;
    message: string;
    data: CustomerResource[];
    links?: PaginationLinks;
    meta?: PaginationMeta;
}
