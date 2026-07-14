# Plan: Mercaldas — Página Principal Tienda Virtual

## Context
Mercaldas es una cadena de supermercados en Manizales, Colombia. Se necesita una homepage de e-commerce completa que maximice la conversión desde el primer momento: sin barreras de autenticación previas al checkout, búsqueda prominente, categorías accesibles, y gran visibilidad para promociones.

## Aesthetic Direction

**Stance**: Bold retail / supermarket commercial. Blanco limpio como fondo, amarillo #FFF200 como color de marca dominante, navy oscuro (#1A1A2E) para texto y estructura. Badges de oferta en rojo-naranja (#FF4444). No editorial, no minimalista — funcional, energético, orientado a conversión.

**Fonts**:
- Display/headings: **Bricolage Grotesque** (bold, condensed, modern commercial — Google Fonts)
- Body: **Inter** (legible, neutral, universal)

**Design tokens a actualizar** en `src/styles/theme.css`:
- `--background`: #FFFFFF
- `--foreground`: #1A1A2E
- `--card`: #FFFFFF
- `--card-foreground`: #1A1A2E
- `--primary`: #FFF200
- `--primary-foreground`: #1A1A2E
- `--secondary`: #1A1A2E
- `--secondary-foreground`: #FFFFFF
- `--muted`: #F4F4F6
- `--muted-foreground`: #6B7280
- `--accent`: #FF4444
- `--accent-foreground`: #FFFFFF
- `--border`: rgba(0,0,0,0.08)
- `--radius`: 0.5rem

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `src/styles/fonts.css` | Agregar import Google Fonts (Bricolage Grotesque + Inter) |
| `src/styles/theme.css` | Actualizar tokens de color y tipografía (mantener estructura existente) |
| `src/app/App.tsx` | Reemplazar con la implementación completa |

## Estructura del componente App.tsx

### 1. Estado global (React state)
- `cartItems`: array de productos en carrito (id, nombre, precio, cantidad)
- `cartOpen`: boolean para panel lateral del carrito
- `activeTab`: string para tabs de productos ("vendidos" | "promociones" | "recomendados" | "novedades")
- `searchQuery`: string
- `currentSlide`: número para el hero carousel

### 2. Datos mockeados (datos realistas colombianos)
- `CATEGORIES`: 12 categorías con ícono lucide y slug
- `PRODUCTS`: ~20 productos con nombre, precio, precio original, imagen Unsplash, categoría, badge
- `HERO_SLIDES`: 3 slides con imagen, título, CTA
- `MARKETPLACE_SELLERS`: 4 vendedores marketplace
- `BENEFITS`: 6 beneficios del servicio

### 3. Secciones en orden

```
<Header />          → sticky top, logo + search + nav icons
<NavBar />          → categorías, inicio, promociones, marketplace, ayuda
<HeroBanner />      → carousel 3 slides con auto-play, indicadores
<QuickCategories /> → scroll horizontal, 12 categorías con íconos
<FeaturedProducts /> → tabs (Más vendidos / Promociones / Recomendados / Novedades)
                       grid 2-4 columnas, cada card: imagen, nombre, precios, botón +carrito
<MarketplaceSection /> → fondo diferenciado (muted), sellers grid
<BenefitsSection />    → 3 columnas / 2 filas, íconos + texto
<NewsletterSection />  → input email + submit, fondo amarillo
<Footer />             → 4 columnas: empresa, categorías, ayuda, contacto + pago
<CartDrawer />         → panel lateral derecho con items y subtotal
```

### 4. Interactividad
- `addToCart(product)`: añade o incrementa cantidad
- `removeFromCart(id)`: decrementa o elimina
- `CartDrawer` se abre al hacer click en ícono carrito
- Hero carousel: auto-play cada 4s con `useEffect` + `clearInterval`
- Tabs de productos: filtro por categoría con `useState`
- Search bar: campo controlado (sin navegación — solo UI en este sprint)
- Checkout CTA dentro del drawer: muestra modal/mensaje "Inicia sesión para continuar"

### 5. Imágenes Unsplash (IDs específicos para contenido supermercado)
- Hero: mercado fresco, ofertas, familia comprando
- Productos: frutas, carnes, lácteos, limpieza — búsquedas temáticas
- Marketplace: vendedores locales

## Detalles de implementación

### ProductCard
```tsx
// Muestra: imagen, badge oferta (rojo), nombre, precio tachado + precio oferta,
// botón "Agregar" que se convierte en contador +/- cuando ya está en carrito
```

### Logo Mercaldas
Texto tipográfico: `MERCALDAS` en Bricolage Grotesque bold con la `M` inicial en amarillo #FFF200 sobre fondo oscuro, o wordmark sobre fondo claro con rectángulo amarillo.

### Responsivo
- Header: en móvil colapsa a logo + búsqueda + carrito (íconos secundarios ocultos)
- Grid productos: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- NavBar: scroll horizontal en móvil
- Hero: altura reducida en móvil

## Verificación post-implementación
1. La app compila sin errores TypeScript
2. Botón "Agregar al carrito" incrementa el badge del carrito
3. El drawer del carrito muestra los items correctamente
4. Las tabs de productos filtran el grid
5. El carousel del hero avanza automáticamente
6. El diseño se ve correcto en viewport ~375px y ~1280px
