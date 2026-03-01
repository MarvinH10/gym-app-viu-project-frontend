import { CompanyResource } from './company.model';
import { PaginatedResponse } from './api-response.model';

export interface JournalSequence {
    id: number;
    sequence_size: number;
    step: number;
    next_number: number;
}

export interface JournalResource {
    id: number;
    name: string;
    code: string;
    type: 'sale' | 'purchase' | 'purchase-order' | 'quote' | 'cash';
    is_fiscal: boolean;
    document_type_code: string | null;
    company_id: number | null;
    sequence_id: number;
    created_at: string | null;
    updated_at: string | null;
    company?: CompanyResource;
    sequence?: JournalSequence;
}

export interface JournalQueryParams {
    page?: number;
    per_page?: number | null;
    search?: string | null;
    type?: 'sale' | 'purchase' | 'purchase-order' | 'quote' | 'cash' | null;
}

export interface JournalFormOptions {
    companies: CompanyResource[];
}

export type PaginatedJournalsResponse = PaginatedResponse<JournalResource>;
