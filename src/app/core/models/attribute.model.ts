import { PaginatedResponse } from './member.model';

export interface AttributeValueResource {
    id: number;
    attribute_id: number;
    value: string;
    created_at: string;
    updated_at: string;
}

export interface AttributeResource {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    values: AttributeValueResource[];
}

export interface AttributeQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface AttributeFormOptions {
    types: any[];
}

export type PaginatedAttributesResponse = PaginatedResponse<AttributeResource>;
