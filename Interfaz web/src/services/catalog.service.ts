import type {
  CatalogCategory,
  CatalogDataResponse,
  Product,
} from "../app/types";

const categories: CatalogCategory[] = [];
const products: Product[] = [];

export const catalogService = {
  async getCatalogData(): Promise<CatalogDataResponse> {
    return {
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    };
  },

  async getCategories(): Promise<CatalogCategory[]> {
    return categories.map((category) => ({ ...category }));
  },

  async getProducts(): Promise<Product[]> {
    return products.map((product) => ({ ...product }));
  },

  async getProductById(id: number): Promise<Product | undefined> {
    return products.find((product) => product.id === id);
  },

  async getRelatedProducts(product: Product): Promise<Product[]> {
    return products.filter(
      (item) => item.category === product.category && item.id !== product.id,
    );
  },
};
