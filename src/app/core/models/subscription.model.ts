import { Member } from './member.model';
import { PaginationLinks, PaginationMeta } from './api-response.model';
import { MembershipPlanResource } from './membership-plan.model';

export interface MembershipFreezeResource {
    id: number | string;
    membership_subscription_id: number | string;
    freeze_start_date: string;
    freeze_end_date: string;
    days_frozen: number;
    planned_days: number;
    status: string;
    reason: string;
    requested_by: number | string;
    approved_by: number | string;
    created_at: string;
    updated_at: string;
}

export interface MembershipSubscriptionResource {
    id: number;
    partner_id: number;
    membership_plan_id: number;
    company_id: number;
    start_date: string;
    end_date: string;
    original_end_date: string;
    amount_paid: number;
    payment_method: string | null;
    payment_reference: string | null;
    sold_by: number | null;
    entries_used: number;
    last_entry_date: string;
    entries_this_month: number;
    current_month_start: string;
    total_days_frozen: number;
    remaining_freeze_days: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    is_expired: boolean;
    is_frozen: boolean;
    can_entry: boolean;
    progress: number;
    days_remaining: number;
    plan?: MembershipPlanResource;
    partner?: Member;
    freezes?: MembershipFreezeResource[];
}

export interface SubscriptionQueryParams {
    page?: number;
    per_page?: number;
    q?: string;
    status?: 'active' | 'frozen' | 'expired';
}

export interface PaginatedSubscriptionsResponse {
    data: MembershipSubscriptionResource[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
