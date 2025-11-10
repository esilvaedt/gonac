/**
 * Métricas Consolidadas (Consolidated Metrics) Types
 * Types for home page KPI metrics from materialized view
 */

/**
 * Consolidated metrics from gonac.mvw_metricas_consolidadas
 * Materialized view with aggregated KPI data
 */
export interface MetricasConsolidadas {
  ventas_totales_pesos: number;              // Total sales in pesos (numeric)
  crecimiento_vs_semana_anterior_pct: number; // Growth vs previous week percentage (numeric)
  ventas_totales_unidades: number;           // Total sales in units (bigint/int8)
  sell_through_pct: number;                  // Sell-through percentage (numeric)
  cobertura_pct: number;                     // Coverage percentage (numeric)
  cobertura_ponderada_pct: number;           // Weighted coverage percentage (numeric)
  promedio_dias_inventario: number;          // Average inventory days (double precision/float8)
  porcentaje_agotados_pct: number;           // Out of stock percentage (numeric)
  avg_venta_promedio_diaria: number;         // Average daily sales (double precision/float8)
}

/**
 * Formatted metrics with additional metadata
 */
export interface MetricasConsolidadasFormatted extends MetricasConsolidadas {
  ventas_totales_pesos_formatted: string;
  crecimiento_formatted: string;
  ventas_totales_unidades_formatted: string;
  sell_through_formatted: string;
  cobertura_formatted: string;
  cobertura_ponderada_formatted: string;
  promedio_dias_inventario_formatted: string;
  porcentaje_agotados_formatted: string;
  avg_venta_promedio_diaria_formatted: string;
}

/**
 * API Response for consolidated metrics
 */
export interface MetricasConsolidadasResponse {
  data: MetricasConsolidadas;
  timestamp: string;
  source: string; // 'mvw_metricas_consolidadas'
}

/**
 * API Response wrapper
 */
export interface MetricasApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Individual KPI card data
 */
export interface KPICard {
  id: string;
  label: string;
  value: number;
  formatted_value: string;
  unit: 'currency' | 'percentage' | 'number' | 'days';
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

