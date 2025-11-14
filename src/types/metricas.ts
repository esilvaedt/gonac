/**
 * Métricas Consolidadas (Consolidated Metrics) Types
 * Types for home page KPI metrics from materialized view
 */

/**
 * Consolidated metrics from gonac.mvw_metricas_consolidadas
 * Materialized view with aggregated KPI data
 */
export interface MetricasConsolidadas {
  // Base Metrics
  ventas_totales_pesos: number;              // Total sales in pesos (numeric)
  crecimiento_vs_semana_anterior_pct: number; // Growth vs previous week percentage (numeric)
  ventas_totales_unidades: number;           // Total sales in units (bigint/int8)
  inventario_inicial_total: number;          // Total initial inventory (numeric)
  venta_total_inventario: number;            // Total inventory sales (numeric)
  sell_through_pct: number;                  // Sell-through percentage (numeric)
  cobertura_pct: number;                     // Coverage percentage (numeric)
  cobertura_ponderada_pct: number;           // Weighted coverage percentage (numeric)
  promedio_dias_inventario: number;          // Average inventory days (double precision/float8)
  porcentaje_agotados_pct: number;           // Out of stock percentage (numeric)
  avg_venta_promedio_diaria: number;         // Average daily sales (double precision/float8)
  
  // Objectives
  objetivo_ventas_totales_pesos: number;     // Sales target in pesos
  objetivo_sell_through_pct: number;         // Sell-through target percentage
  objetivo_promedio_dias_inventario: number; // Target average inventory days
  objetivo_avg_venta_promedio_diaria: number; // Target average daily sales
  objetivo_cobertura_pct: number;            // Coverage target percentage
  objetivo_cobertura_ponderada_pct: number;  // Weighted coverage target percentage
  objetivo_porcentaje_agotados_pct: number;  // Out of stock target percentage
  
  // Differences (Actual - Target)
  diferencia_ventas_totales_pesos: number;
  diferencia_sell_through_pct: number;
  diferencia_promedio_dias_inventario: number;
  diferencia_avg_venta_promedio_diaria: number;
  diferencia_cobertura_pct: number;
  diferencia_cobertura_ponderada_pct: number;
  diferencia_porcentaje_agotados_pct: number;
  
  // Variations (Percentage change from target)
  variacion_ventas_totales_pct: number;
  variacion_promedio_dias_inventario_pct: number;
  variacion_avg_venta_promedio_diaria_pct: number;
  variacion_cobertura_pct: number;
  variacion_cobertura_ponderada_pct: number;
  variacion_porcentaje_agotados_pct: number;
}

/**
 * Formatted metrics with additional metadata
 */
export interface MetricasConsolidadasFormatted extends MetricasConsolidadas {
  // Base Metrics Formatted
  ventas_totales_pesos_formatted: string;
  crecimiento_formatted: string;
  ventas_totales_unidades_formatted: string;
  inventario_inicial_total_formatted: string;
  venta_total_inventario_formatted: string;
  sell_through_formatted: string;
  cobertura_formatted: string;
  cobertura_ponderada_formatted: string;
  promedio_dias_inventario_formatted: string;
  porcentaje_agotados_formatted: string;
  avg_venta_promedio_diaria_formatted: string;
  
  // Objectives Formatted
  objetivo_ventas_totales_pesos_formatted: string;
  objetivo_sell_through_formatted: string;
  objetivo_promedio_dias_inventario_formatted: string;
  objetivo_avg_venta_promedio_diaria_formatted: string;
  objetivo_cobertura_formatted: string;
  objetivo_cobertura_ponderada_formatted: string;
  objetivo_porcentaje_agotados_formatted: string;
  
  // Differences Formatted
  diferencia_ventas_totales_pesos_formatted: string;
  diferencia_sell_through_formatted: string;
  diferencia_promedio_dias_inventario_formatted: string;
  diferencia_avg_venta_promedio_diaria_formatted: string;
  diferencia_cobertura_formatted: string;
  diferencia_cobertura_ponderada_formatted: string;
  diferencia_porcentaje_agotados_formatted: string;
  
  // Variations Formatted
  variacion_ventas_totales_formatted: string;
  variacion_promedio_dias_inventario_formatted: string;
  variacion_avg_venta_promedio_diaria_formatted: string;
  variacion_cobertura_formatted: string;
  variacion_cobertura_ponderada_formatted: string;
  variacion_porcentaje_agotados_formatted: string;
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

