import {
  Apple,
  Baby,
  Beef,
  Heart,
  Home,
  Laptop,
  Milk,
  PawPrint,
  ShoppingBag,
  Sparkles,
  Wine,
  Zap,
} from "lucide-react";
import type { CatalogCategory, Product } from "../app/types";

const categories: CatalogCategory[] = [
  {
    id: 1,
    name: "Carnes y Pollo",
    icon: Beef,
    color: "#FF6B6B",
    bg: "#FFF0F0",
  },
  {
    id: 2,
    name: "Cuidado del Bebé",
    icon: Baby,
    color: "#FF9F7F",
    bg: "#FFF5F0",
  },
  { id: 3, name: "Lácteos", icon: Milk, color: "#4FC3F7", bg: "#F0F9FF" },
  {
    id: 4,
    name: "Electrodomésticos",
    icon: Zap,
    color: "#FFB300",
    bg: "#FFFBF0",
  },
  { id: 5, name: "Mascotas", icon: PawPrint, color: "#A5D6A7", bg: "#F0FFF0" },
  {
    id: 6,
    name: "Frutas y Verduras",
    icon: Apple,
    color: "#66BB6A",
    bg: "#F0FBF0",
  },
  { id: 7, name: "Limpieza", icon: Sparkles, color: "#29B6F6", bg: "#F0F8FF" },
  {
    id: 8,
    name: "Despensa",
    icon: ShoppingBag,
    color: "#FF8A65",
    bg: "#FFF3F0",
  },
  { id: 9, name: "Tecnología", icon: Laptop, color: "#7986CB", bg: "#F3F0FF" },
  { id: 10, name: "Hogar", icon: Home, color: "#8D6E63", bg: "#FBF8F5" },
  {
    id: 11,
    name: "Vinos y Licores",
    icon: Wine,
    color: "#AB47BC",
    bg: "#F9F0FF",
  },
  {
    id: 12,
    name: "Cuidado Personal",
    icon: Heart,
    color: "#EC407A",
    bg: "#FFF0F6",
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Pechuga de Pollo Fresca x kg",
    price: 12900,
    originalPrice: 15900,
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo",
    badge: "19% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x kg",
  },
  {
    id: 2,
    name: "Leche Entera Alquería 1.1 L",
    price: 4350,
    image:
      "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    tabs: ["vendidos", "recomendados"],
    unit: "x 1.1 L",
  },
  {
    id: 3,
    name: "Arroz Diana Extra Premium 5 kg",
    price: 22500,
    originalPrice: 26000,
    image:
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "13% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 5 kg",
  },
  {
    id: 4,
    name: "Huevos AA Blancos x30",
    price: 18900,
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    tabs: ["vendidos", "recomendados"],
    unit: "x 30 und",
  },
  {
    id: 5,
    name: "Tomates Chonto Frescos x 500 g",
    price: 3200,
    originalPrice: 4500,
    image:
      "https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    badge: "29% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 6,
    name: "Aguacate Hass Mediano x und",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    tabs: ["vendidos", "recomendados"],
    unit: "x und",
  },
  {
    id: 7,
    name: "Detergente Ariel Líquido 3 L",
    price: 28900,
    originalPrice: 35900,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "20% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 3 L",
  },
  {
    id: 8,
    name: "Jabón Protex Original x3",
    price: 14500,
    originalPrice: 17000,
    image:
      "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "15% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 3 und",
  },
  {
    id: 9,
    name: "Pañales Huggies Talla M x40",
    price: 69900,
    originalPrice: 79900,
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé",
    badge: "13% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 40 und",
  },
  {
    id: 10,
    name: "Queso Campesino Fresco x500 g",
    price: 12500,
    image:
      "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 11,
    name: "Aceite Palmera Vegetal 3 L",
    price: 19900,
    originalPrice: 24500,
    image:
      "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "19% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 3 L",
  },
  {
    id: 12,
    name: "Vino Casillero Cabernet 750 mL",
    price: 38900,
    originalPrice: 46000,
    image:
      "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores",
    badge: "16% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 750 mL",
  },
  {
    id: 13,
    name: "Café Juan Valdez Molido 500 g",
    price: 32500,
    image:
      "https://images.unsplash.com/photo-1512106374988-c95f566d39ef?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    tabs: ["recomendados", "vendidos"],
    unit: "x 500 g",
  },
  {
    id: 14,
    name: "Shampoo Head & Shoulders 700 mL",
    price: 22900,
    originalPrice: 27500,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "17% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 700 mL",
  },
  {
    id: 15,
    name: "Pasta Doria Espagueti x500 g",
    price: 3800,
    image:
      "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 16,
    name: "Limpiapisos Fabuloso Lavanda 1.8 L",
    price: 9900,
    originalPrice: 12500,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "21% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 1.8 L",
  },
  {
    id: 17,
    name: "Plátano Maduro x kg",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1560960378-8435837546b7?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 18,
    name: "Papa Criolla Limpia x kg",
    price: 3800,
    originalPrice: 4800,
    image:
      "https://images.unsplash.com/photo-1589894308598-8ddba0593e91?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    badge: "21% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x kg",
  },
  {
    id: 19,
    name: "Carne Molida de Res x kg",
    price: 18500,
    image:
      "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 20,
    name: "Yogurt Alpina Trozos Fresa 200 g",
    price: 2900,
    image:
      "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 200 g",
  },
  {
    id: 21,
    name: "Mantequilla Anchor Sin Sal 200 g",
    price: 11900,
    originalPrice: 14200,
    image:
      "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "16% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 200 g",
  },
  {
    id: 22,
    name: "Frijoles Cargamanto x kg",
    price: 7200,
    image:
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 23,
    name: "Atún Van Camps en Agua x3",
    price: 14500,
    originalPrice: 17000,
    image:
      "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "15% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 3 und",
  },
  {
    id: 24,
    name: "Papel Higiénico Scott Doble Hoja x12",
    price: 22900,
    originalPrice: 27000,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "15% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 12 und",
  },
  {
    id: 25,
    name: "Crema Dental Colgate Triple Acción x2",
    price: 12800,
    image:
      "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    tabs: ["vendidos", "recomendados"],
    unit: "x 2 und",
  },
  {
    id: 26,
    name: "Pañales Pampers Baby-Dry Talla G x36",
    price: 74900,
    originalPrice: 89000,
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé",
    badge: "16% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 36 und",
  },
  {
    id: 27,
    name: "Comida Whiskas Gato Adulto 500 g",
    price: 9500,
    originalPrice: 11200,
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Mascotas",
    badge: "15% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 28,
    name: "Cerveza Águila Lata x6",
    price: 18500,
    image:
      "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores",
    tabs: ["vendidos", "recomendados"],
    unit: "x 6 und",
  },
  {
    id: 29,
    name: "Aceite de Oliva Dante Extra Virgen 500 mL",
    price: 29900,
    originalPrice: 35000,
    image:
      "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "15% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 500 mL",
  },
  {
    id: 30,
    name: "Shampoo Pantene Pro-V 400 mL",
    price: 19900,
    originalPrice: 24500,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "17% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 400 mL",
  },
];

export const catalogService = {
  async getCatalogData(): Promise<{
    categories: CatalogCategory[];
    products: Product[];
  }> {
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
