export interface TaxResource {
  id: number;
  name: string;
  description: string | null;
  invoice_label: string | null;
  tax_type: string;
  affectation_type_code: string | null;
  rate_percent: number;
  is_price_inclusive: boolean;
  is_active: boolean;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaxQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface TaxFormOptions {
  taxes: TaxResource[];
}
