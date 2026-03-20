import type { StoreCategory, StoreDashboardProduct } from "@/lib/data/store";
import { createMedusaStoreAdminRepository } from "@/lib/data/store-admin/medusa-repository";
import type { StoreCategoryValues, StoreProductValues } from "@/lib/validators/store";

export interface StoreAdminSnapshot {
  categories: StoreCategory[];
  products: StoreDashboardProduct[];
  warning: string | null;
}

export type StoreAdminCategoryRecordInput = StoreCategoryValues;
export type StoreAdminProductRecordInput = StoreProductValues;

export interface StoreAdminRepository {
  provider: "medusa";
  source: "medusa";
  getSnapshot(): Promise<StoreAdminSnapshot>;
  getCategory(id: string): Promise<StoreCategory | null>;
  getProduct(id: string): Promise<StoreDashboardProduct | null>;
  saveCategory(values: StoreAdminCategoryRecordInput, categoryId?: string): Promise<string>;
  saveProduct(values: StoreAdminProductRecordInput, productId?: string): Promise<string>;
  deactivateCategory(id: string): Promise<void>;
  deactivateProduct(id: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  deleteProduct(id: string): Promise<void>;
}

export type StoreAdminRuntimeRepository = StoreAdminRepository & {
  listCategories(): Promise<StoreCategory[]>;
  listProducts(categories: StoreCategory[]): Promise<StoreDashboardProduct[]>;
  getCategoryById(id: string): Promise<StoreCategory | null>;
  getProductById(id: string, categories: StoreCategory[]): Promise<StoreDashboardProduct | null>;
};

function enrichRepository(
  repository: StoreAdminRepository &
    Partial<Pick<StoreAdminRuntimeRepository, "listCategories" | "listProducts" | "getCategoryById" | "getProductById">>,
): StoreAdminRuntimeRepository {
  return {
    ...repository,
    listCategories:
      repository.listCategories ??
      (async () => {
        const snapshot = await repository.getSnapshot();
        return snapshot.categories;
      }),
    listProducts:
      repository.listProducts ??
      (async () => {
        const snapshot = await repository.getSnapshot();
        return snapshot.products;
      }),
    getCategoryById: repository.getCategoryById ?? repository.getCategory,
    getProductById:
      repository.getProductById ??
      (async (id) => {
        return repository.getProduct(id);
      }),
  };
}

export function getStoreAdminRepository(): StoreAdminRuntimeRepository {
  return enrichRepository(createMedusaStoreAdminRepository());
}
