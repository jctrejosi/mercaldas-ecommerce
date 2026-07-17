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

  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await catalogService.getCatalogData(filters);
        if (mounted) {
          setCategories(data.categories);
          setProducts(data.products);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Error cargando catálogo",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      mounted = false;
    };
  }, [
    categoriesKey,
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
