import { CompanyResource } from './company.model';

export interface MemberUserResource {
  id: string;
  name: string;
  email: string;
}

export interface MembershipPlanResource {
  id: number | string;
  company_id: number | string;
  product_product_id: number | string;
  name: string;
  description: string;
  duration_days: number;
  duration_months: number;
  price: number;
  max_entries_per_month: number;
  max_entries_per_day: number;
  time_restricted: boolean;
  allowed_time_start: string | null;
  allowed_time_end: string | null;
  allowed_days: string | null;
  allows_freezing: boolean;
  max_freeze_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_unlimited_entries: boolean;
  has_time_restriction: boolean;
  has_day_restriction: boolean;
  allows_freeze: boolean;
  formatted_price: string;
  company?: CompanyResource;
}

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
  id: number | string;
  partner_id: number | string;
  membership_plan_id: number | string;
  company_id: number | string;
  start_date: string;
  end_date: string;
  original_end_date: string;
  amount_paid: number;
  payment_method: string;
  payment_reference: string;
  sold_by: number | string;
  entries_used: number;
  last_entry_date: string | null;
  entries_this_month: number;
  current_month_start: string;
  total_days_frozen: number;
  remaining_freeze_days: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_expired: boolean;
  is_frozen: boolean;
  can_entry: boolean;
  progress: number;
  days_remaining: number;
  plan?: MembershipPlanResource;
  freezes?: MembershipFreezeResource[];
}

export interface Member {
  id: string;
  company_id: string;
  user_id: string | null;
  document_type: string;
  document_number: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  ubigeo: string;
  birth_date: string | null;
  gender: string;
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  is_customer: boolean;
  is_supplier: boolean;
  is_member: boolean;
  has_portal_access: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  company?: CompanyResource;
  user?: MemberUserResource;
  subscriptions?: MembershipSubscriptionResource[];
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
  active_count?: string;
  suspended_count?: string;
  with_portal_count?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface MemberQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  'status[]'?: string[];
  'portal[]'?: string[];
}

export interface MemberFormOptions {
  companies: { id: string | number; business_name: string; trade_name: string }[];
}
