import { useEffect, useState } from "react";
import type { CatalogCategory, Product } from "../app/types";
import {
  catalogService,
  type CatalogProductsQuery,
} from "../services/catalog.service";

export function useCatalog(filters?: CatalogProductsQuery) {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoriesKey = filters?.categories?.join("|") ?? "";
  const categoryIdsKey = filters?.categoryIds?.join("|") ?? "";

  // Load categories only once
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const data = await catalogService.getCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Error cargando categorías",
          );
        }
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // Load products when filters change
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await catalogService.getProducts(filters);
        if (mounted) {
          setProducts(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Error cargando productos",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, [
    categoriesKey,
    categoryIdsKey,
    filters?.productTypeCode,
    filters?.onSale,
    filters?.priceRange,
    filters?.sort,
    filters?.search,
    filters?.limit,
  ]);

  return {
    categories,
    products,
    loading,
    error,
  };
}
