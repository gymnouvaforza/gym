import { revalidateTag, unstable_cache } from "next/cache";

export const PUBLIC_CACHE_TAGS = {
  cms: "cms",
  marketing: "marketing",
  membershipPlans: "membership-plans",
  storeCatalog: "store-catalog",
} as const;

export const PUBLIC_CACHE_REVALIDATE_SECONDS = {
  cms: 300,
  marketing: 300,
  membershipPlans: 300,
  storeCatalog: 300,
} as const;

export type PublicCacheTag =
  (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS];

export function publicDataCache<Args extends unknown[], Result>(
  callback: (...args: Args) => Promise<Result>,
  keyParts: string[],
  options: {
    revalidate: number;
    tags: PublicCacheTag[];
  },
): (...args: Args) => Promise<Result> {
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return callback;
  }

  return unstable_cache(callback, keyParts, options) as (...args: Args) => Promise<Result>;
}

export function revalidatePublicCacheTag(tag: PublicCacheTag) {
  revalidateTag(tag, "max");
}

export function revalidatePublicCacheTags(tags: PublicCacheTag[]) {
  for (const tag of tags) {
    revalidatePublicCacheTag(tag);
  }
}
