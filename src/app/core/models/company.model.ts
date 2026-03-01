export interface CompanyResource {
  id: number;
  parent_id: number | null;
  branch_code: string | null;
  is_main: boolean;
  business_name: string;
  trade_name: string | null;
  ruc: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  ubigeo: string | null;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CompanyQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CompanyFormOptions {
  parent_companies: CompanyResource[];
}
