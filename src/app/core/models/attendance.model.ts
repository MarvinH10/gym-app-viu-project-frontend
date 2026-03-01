import { PaginatedResponse } from './api-response.model';
import { CompanyResource } from './company.model';

export interface AttendanceResource {
    id: number;
    partner_id: number;
    membership_subscription_id: number | null;
    company_id: number;
    check_in_time: string;
    check_out_time: string | null;
    duration_minutes: number | null;
    formatted_duration: string | null;
    is_active: boolean;
    status: 'valid' | 'denied';
    validation_message: string | null;
    is_manual_entry: boolean;
    registered_by: number | null;
    created_at: string | null;
    updated_at: string | null;
    partner?: any; // Will use Member/Customer resource type if needed
    subscription?: any;
}

export interface AttendanceQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    status?: 'valid' | 'denied';
}

export interface AttendanceCheckInRequest {
    partner_id?: number | null;
    document_number?: string | null;
    is_manual_entry: boolean;
    validation_message?: string | null;
}

export type PaginatedAttendancesResponse = PaginatedResponse<AttendanceResource>;
