import { useEffect, useState } from "react";
import type { CatalogCategory, Product } from "../app/types";
import { catalogService } from "../services/catalog.service";

export function useCatalog() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await catalogService.getCatalogData();
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

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    categories,
    products,
    loading,
    error,
  };
}
