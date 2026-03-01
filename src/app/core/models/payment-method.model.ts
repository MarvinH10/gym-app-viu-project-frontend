import { PaginatedResponse } from './api-response.model';

export interface PaymentMethodResource {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface PaymentMethodQueryParams {
    page?: number;
    per_page?: number | null;
    q?: string | null;
    status?: 'active' | 'inactive' | null;
}

export type PaginatedPaymentMethodsResponse = PaginatedResponse<PaymentMethodResource>;
