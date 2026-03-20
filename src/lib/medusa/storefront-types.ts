export type MedusaStoreProductListParams = {
  fields?: string;
  limit?: number;
  region_id?: string;
  handle?: string;
};

export type MedusaStoreProductOptionValue = {
  id?: string | null;
  value?: string | null;
  option_id?: string | null;
  option?: {
    id?: string | null;
    title?: string | null;
  } | null;
};

export type MedusaStoreProductOption = {
  id: string;
  title?: string | null;
  product_id?: string | null;
  product?: unknown;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  values?: Array<{
    id?: string | null;
    value?: string | null;
    option_id?: string | null;
    option?: {
      id?: string | null;
      title?: string | null;
    } | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
  }> | null;
};

export type MedusaCalculatedPrice = {
  calculated_amount?: number | null;
  original_amount?: number | null;
  currency_code?: string | null;
};

export type MedusaStoreProductVariant = {
  id: string;
  title?: string | null;
  sku?: string | null;
  inventory_quantity?: number | null;
  calculated_price?: MedusaCalculatedPrice | null;
  options?: MedusaStoreProductOptionValue[] | null;
};

export type MedusaStoreProduct = {
  id: string;
  title?: string | null;
  handle?: string | null;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  categories?: Array<{
    handle?: string | null;
    name?: string | null;
  }> | null;
  collection?: {
    handle?: string | null;
    title?: string | null;
  } | null;
  images?: Array<{
    url?: string | null;
  }> | null;
  tags?: Array<{
    value?: string | null;
  }> | null;
  options?: MedusaStoreProductOption[] | null;
  variants?: MedusaStoreProductVariant[] | null;
};
