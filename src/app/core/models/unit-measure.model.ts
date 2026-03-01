export interface UnitOfMeasureResource {
    id: number;
    name: string;
    symbol: string | null;
    family: string | null;
    base_unit_id: number | null;
    factor: number;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
    base_unit?: UnitOfMeasureResource | null;
    derived_units?: UnitOfMeasureResource[];
}

export interface UnitOfMeasureQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    family?: string;
    base_unit_id?: number | null;
    only_active?: boolean;
}

export interface UnitOfMeasureFormOptions {
    families: string[];
    unit_of_measures: UnitOfMeasureResource[];
}
