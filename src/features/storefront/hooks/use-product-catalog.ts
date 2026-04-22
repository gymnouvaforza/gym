"use client";

import { useMemo, useState } from "react";

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variants: unknown[];
  tags: string[];
  collection_id?: string;
}

export function useProductCatalog(initialProducts: Product[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const title = product.title ?? "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCollection = selectedCollection 
        ? product.collection_id === selectedCollection 
        : true;
      return matchesSearch && matchesCollection;
    });
  }, [initialProducts, searchQuery, selectedCollection]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCollection,
    setSelectedCollection,
    filteredProducts,
  };
}
