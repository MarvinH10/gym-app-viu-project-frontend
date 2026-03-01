import { CompanyResource } from './company.model';

export interface WarehouseResource {
    id: number;
    name: string;
    location: string | null;
    company_id: number;
    company?: CompanyResource;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WarehouseQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface WarehouseRequest {
    name: string;
    location?: string | null;
    company_id?: number | null;
    is_active?: boolean;
}

export interface WarehouseFormOptions {
    companies: CompanyResource[];
}
