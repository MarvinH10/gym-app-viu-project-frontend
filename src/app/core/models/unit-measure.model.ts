import { PaginationLinks, PaginationMeta } from './member.model';

export interface UnitMeasureResource {
    id: number;
    name: string;
    symbol: string | null;
    family: string | null;
    base_unit_id: number | null;
    factor: number;
    is_active: boolean;
    description?: string | null; // Mentioned in text
    created_at: string | null;
    updated_at: string | null;
    base_unit?: UnitMeasureResource | null;
    derived_units?: UnitMeasureResource[];
}

export interface UnitMeasureQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    q?: string;
    family?: string | null;
    base_unit_id?: number | null;
    only_active?: boolean | null;
}

export interface UnitMeasurePaginatedResponse {
    data: UnitMeasureResource[];
    links: PaginationLinks;
    meta: PaginationMeta & {
        stats: {
            active_count: string;
            base_count: string;
            family_count: string;
        };
    };
}

export interface UnitMeasureFormOptions {
    families: string; // The API says string, but usually it's string[]? I'll follow the provided JSON which says "string" for families? No, the JSON example says "families": "string". Wait.
    unit_of_measures: UnitMeasureResource[];
}
