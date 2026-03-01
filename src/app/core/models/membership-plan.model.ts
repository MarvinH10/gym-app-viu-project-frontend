import { CompanyResource } from './company.model';
import { PaginatedResponse } from './api-response.model';

export interface MembershipPlanResource {
    id: number;
    company_id: number;
    product_product_id: number | null;
    name: string;
    description: string | null;
    duration_days: number;
    duration_months: number;
    price: number;
    max_entries_per_month: number | null;
    max_entries_per_day: number;
    time_restricted: boolean;
    allowed_time_start: string | null;
    allowed_time_end: string | null;
    allowed_days: string[];
    allows_freezing: boolean;
    max_freeze_days: number;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
    is_unlimited_entries: boolean;
    has_time_restriction: boolean;
    has_day_restriction: boolean;
    allows_freeze: boolean;
    formatted_price: string;
    company?: CompanyResource;
}

export interface MembershipPlanQueryParams {
    page?: number;
    per_page?: number;
    q?: string;
    status?: 'active' | 'inactive';
}

export interface PaginatedMembershipPlansResponse extends PaginatedResponse<MembershipPlanResource> {
    meta: any;
}
