import { PaginatedResponse } from './api-response.model';

export interface CategoryResource {
    id: number;
    name: string;
    full_name: string | null;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategoryQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface CategoryFormOptions {
    parent_categories: CategoryResource[];
}

export type PaginatedCategoriesResponse = PaginatedResponse<CategoryResource>;
