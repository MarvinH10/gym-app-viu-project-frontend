import { CategoryResource } from './category.model';
import { AttributeValueResource, AttributeResource } from './attribute.model';
import { PaginatedResponse } from './api-response.model';

export interface ProductProductResource {
  id: number;
  product_template_id: number;
  sku: string;
  barcode: string;
  price: string;
  cost_price: string;
  is_principal: boolean;
  stock: string;
  attributes: AttributeValueResource[];
  created_at: string;
  updated_at: string;
}

export interface ProductTemplateResource {
  id: number;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
  is_pos_visible: boolean;
  tracks_inventory: boolean;
  is_service: boolean;
  image: string;
  sku: string;
  barcode: string;
  category_id?: number;
  category: CategoryResource;
  variants: ProductProductResource[];
  images: string;
  created_at: string;
  updated_at: string;
}

export interface ProductQueryParams {
  page?: number;
  per_page?: number | string;
  search?: string;
}

export interface ProductFormOptions {
  categories: CategoryResource[];
  attributes: AttributeResource[];
}
