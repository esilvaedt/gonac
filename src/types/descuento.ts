/**
 * Descuento (Discount) Types
 * Types for promotion discount calculation metrics
 */

export type SegmentType = 'Slow' | 'Dead';

export type CategoryType = 'PAPAS' | 'TOTOPOS' | string;

/**
 * Parameters for discount calculation
 */
export interface DescuentoParams {
  descuento: number;        // p_descuento - Discount percentage (0.41 = 41%)
  elasticidad: number;      // p_elasticidad - Price elasticity (1.5)
  categoria: string;        // p_categoria - Product category ('PAPAS', 'TOTOPOS')
}

/**
 * Raw result from the PostgreSQL function
 */
export interface DescuentoMetrics {
  inventario_inicial_total: number;  // Total initial inventory
  ventas_plus: number;               // Additional sales (increment)
  venta_original: number;            // Original sale value
  costo: number;                     // Cost after discount
  valor: number;                     // Value captured
  reduccion: number;                 // Reduction value (NEW FIELD from DB)
}

/**
 * Calculated metrics for a promotion
 */
export interface PromocionMetrics extends DescuentoMetrics {
  descuento: number;     // Discount as percentage (41)
  elasticidad: number;               // Elasticity used
  categoria: string;                 // Category
  // reduccion_riesgo: number;         // Risk reduction percentage
  // costo_promocion: number;          // Promotion cost (valor)
  // valor_capturar: number;           // Value to capture (venta_original)
  // inventario_post: number;          // Post-promotion inventory
}

/**
 * Complete promotion response
 */
export interface PromocionResponse {
  items: Record<string, PromocionMetrics>;  // Dynamic categories
  config: {
    descuento_maximo: number;
    items: PromocionItem[];
  };
  timestamp: string;
}

/**
 * Item configuration for promotion calculation
 */
export interface PromocionItem {
  elasticidad: number;
  categoria: string;
}

/**
 * Promotion calculation request
 */
export interface CalcularPromocionRequest {
  descuento: number;
  items?: PromocionItem[];
}

/**
 * API Response wrapper
 */
export interface DescuentoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Individual SKU detail (if needed for drill-down)
 */
export interface SkuDescuentoDetail {
  sku: string;
  inventario_inicial: number;
  ventas_estimadas: number;
  valor_capturado: number;
  costo_promocion: number;
}

/**
 * Store-level metrics (if needed)
 */
export interface StoreDescuentoMetrics {
  id_store: string;
  segment: SegmentType;
  inventario_inicial: number;
  ventas_plus: number;
  valor_capturar: number;
  costo_promocion: number;
}

/**
 * Category with expiration impact
 */
export interface CategoriaConCaducidad {
  category: string;
  impacto: number;
}

/**
 * Top categories close to expiration response
 */
export interface TopCategoriasExpiracionResponse {
  categorias: CategoriaConCaducidad[];
  total_impacto: number;
  timestamp: string;
}

