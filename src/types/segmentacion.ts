/**
 * Segmentación (Segmentation) Types
 * Types for store segmentation metrics
 */

/**
 * Store segment type
 */
export type SegmentType = 'Slow' | 'Dead' | string;

/**
 * Segmentation metrics from gonac.mvw_metricas_segmentacion_tiendas
 * Materialized view with segmented store metrics
 */
export interface SegmentacionMetrics {
  segment: string;                                    // Segment name (text)
  ventas_valor: number;                               // Sales value (numeric)
  ventas_unidades: number;                            // Sales units (bigint/int8)
  dias_inventario: number;                            // Inventory days (double precision/float8)
  contribucion_porcentaje: number;                    // Contribution percentage (numeric)
  num_tiendas_segmento: number;                       // Number of stores in segment (bigint/int8)
  participacion_segmento: number;                     // Segment participation (numeric)
  ventas_semana_promedio_tienda_pesos: number;        // Average weekly sales per store in pesos (numeric)
  ventas_semana_promedio_tienda_unidades: number;     // Average weekly sales per store in units (numeric)
}

/**
 * Formatted segmentation metrics
 */
export interface SegmentacionMetricsFormatted extends SegmentacionMetrics {
  ventas_valor_formatted: string;
  ventas_unidades_formatted: string;
  dias_inventario_formatted: string;
  contribucion_porcentaje_formatted: string;
  num_tiendas_segmento_formatted: string;
  participacion_segmento_formatted: string;
  ventas_semana_promedio_tienda_pesos_formatted: string;
  ventas_semana_promedio_tienda_unidades_formatted: string;
}

/**
 * Segmentation response
 */
export interface SegmentacionResponse {
  segments: SegmentacionMetrics[];
  total_ventas_valor: number;
  total_ventas_unidades: number;
  total_tiendas: number;
  timestamp: string;
  source: string; // 'mvw_metricas_segmentacion_tiendas'
}

/**
 * Formatted segmentation response
 */
export interface SegmentacionFormattedResponse {
  segments: SegmentacionMetricsFormatted[];
  total_ventas_valor: number;
  total_ventas_valor_formatted: string;
  total_ventas_unidades: number;
  total_ventas_unidades_formatted: string;
  total_tiendas: number;
  timestamp: string;
}

/**
 * Segment comparison data
 */
export interface SegmentComparison {
  segment: string;
  metrics: SegmentacionMetrics;
  rank: number; // 1 = best performing
}

/**
 * API Response wrapper
 */
export interface SegmentacionApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Segment card for dashboard
 */
export interface SegmentCard {
  segment: string;
  ventas_valor: string;
  ventas_unidades: string;
  contribucion: string;
  num_tiendas: number;
  participacion: string;
  performance: 'high' | 'medium' | 'low'; // Based on contribution
}

