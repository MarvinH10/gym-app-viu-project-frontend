export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: any;
}
