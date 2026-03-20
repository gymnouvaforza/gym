"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { getStoreAdminRepository } from "@/lib/data/store-admin/repository";
import { getStoreAdminWriteDisabledReason } from "@/lib/data/store-admin";
import {
  storeCategorySchema,
  storeProductSchema,
  type StoreCategoryInput,
  type StoreProductInput,
} from "@/lib/validators/store";

async function getAuthenticatedStoreAdminRepository() {
  await requireAdminUser();

  const disabledReason = getStoreAdminWriteDisabledReason();
  if (disabledReason) {
    throw new Error(disabledReason);
  }

  return getStoreAdminRepository();
}

function revalidateStore() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tienda");
  revalidatePath("/dashboard/tienda/categorias");
  revalidatePath("/dashboard/tienda/productos");
  revalidatePath("/tienda");
}

export async function saveStoreCategory(values: StoreCategoryInput, categoryId?: string) {
  const parsed = storeCategorySchema.parse(values);
  const repository = await getAuthenticatedStoreAdminRepository();
  const id = await repository.saveCategory(parsed, categoryId);
  revalidateStore();
  return id;
}

export async function saveStoreProduct(values: StoreProductInput, productId?: string) {
  const parsed = storeProductSchema.parse(values);
  const repository = await getAuthenticatedStoreAdminRepository();
  const id = await repository.saveProduct(parsed, productId);
  revalidateStore();
  return id;
}

export async function deactivateStoreCategory(id: string) {
  const repository = await getAuthenticatedStoreAdminRepository();
  await repository.deactivateCategory(id);
  revalidateStore();
}

export async function deactivateStoreProduct(id: string) {
  const repository = await getAuthenticatedStoreAdminRepository();
  await repository.deactivateProduct(id);
  revalidateStore();
}

export async function deleteStoreCategory(id: string) {
  const repository = await getAuthenticatedStoreAdminRepository();
  await repository.deleteCategory(id);
  revalidateStore();
}

export async function deleteStoreProduct(id: string) {
  const repository = await getAuthenticatedStoreAdminRepository();
  await repository.deleteProduct(id);
  revalidateStore();
}
