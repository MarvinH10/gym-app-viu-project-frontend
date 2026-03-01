import { CompanyResource } from './company.model';
import { MembershipSubscriptionResource } from './subscription.model';

export interface MemberUserResource {
  id: string;
  name: string;
  email: string;
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
