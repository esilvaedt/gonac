import { SupabaseClient } from '@supabase/supabase-js';
import { MetricasConsolidadas } from '@/types/metricas';

/**
 * Metricas Repository
 * Handles all database operations related to consolidated metrics
 */
export class MetricasRepository {
  constructor(private supabase: SupabaseClient) { }

  /**
   * Get consolidated metrics from materialized view
   * Fetches from: gonac.mvw_metricas_consolidadas
   * 
   * This materialized view contains pre-aggregated KPI data for the home page
   */
  async getMetricasConsolidadas(): Promise<MetricasConsolidadas> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('mvw_metricas_consolidadas')
      .select('*')
      .single(); // Assuming the view returns a single row with aggregated metrics

    if (error) {
      throw new Error(`Error fetching consolidated metrics: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from consolidated metrics view');
    }

    // Map and parse the data
    return {
      // Base Metrics
      ventas_totales_pesos: Number(data.ventas_totales_pesos) || 0,
      crecimiento_vs_semana_anterior_pct: Number(data.crecimiento_vs_semana_anterior_pct) || 0,
      ventas_totales_unidades: Number(data.ventas_totales_unidades) || 0,
      inventario_inicial_total: Number(data.inventario_inicial_total) || 0,
      venta_total_inventario: Number(data.venta_total_inventario) || 0,
      sell_through_pct: Number(data.sell_through_pct) || 0,
      cobertura_pct: Number(data.cobertura_pct) || 0,
      cobertura_ponderada_pct: Number(data.cobertura_ponderada_pct) || 0,
      promedio_dias_inventario: Number(data.promedio_dias_inventario) || 0,
      porcentaje_agotados_pct: Number(data.porcentaje_agotados_pct) || 0,
      avg_venta_promedio_diaria: Number(data.avg_venta_promedio_diaria) || 0,
      
      // Objectives
      objetivo_ventas_totales_pesos: Number(data.objetivo_ventas_totales_pesos) || 0,
      objetivo_sell_through_pct: Number(data.objetivo_sell_through_pct) || 0,
      objetivo_promedio_dias_inventario: Number(data.objetivo_promedio_dias_inventario) || 0,
      objetivo_avg_venta_promedio_diaria: Number(data.objetivo_avg_venta_promedio_diaria) || 0,
      objetivo_cobertura_pct: Number(data.objetivo_cobertura_pct) || 0,
      objetivo_cobertura_ponderada_pct: Number(data.objetivo_cobertura_ponderada_pct) || 0,
      objetivo_porcentaje_agotados_pct: Number(data.objetivo_porcentaje_agotados_pct) || 0,
      
      // Differences
      diferencia_ventas_totales_pesos: Number(data.diferencia_ventas_totales_pesos) || 0,
      diferencia_sell_through_pct: Number(data.diferencia_sell_through_pct) || 0,
      diferencia_promedio_dias_inventario: Number(data.diferencia_promedio_dias_inventario) || 0,
      diferencia_avg_venta_promedio_diaria: Number(data.diferencia_avg_venta_promedio_diaria) || 0,
      diferencia_cobertura_pct: Number(data.diferencia_cobertura_pct) || 0,
      diferencia_cobertura_ponderada_pct: Number(data.diferencia_cobertura_ponderada_pct) || 0,
      diferencia_porcentaje_agotados_pct: Number(data.diferencia_porcentaje_agotados_pct) || 0,
      
      // Variations
      variacion_ventas_totales_pct: Number(data.variacion_ventas_totales_pct) || 0,
      variacion_promedio_dias_inventario_pct: Number(data.variacion_promedio_dias_inventario_pct) || 0,
      variacion_avg_venta_promedio_diaria_pct: Number(data.variacion_avg_venta_promedio_diaria_pct) || 0,
      variacion_cobertura_pct: Number(data.variacion_cobertura_pct) || 0,
      variacion_cobertura_ponderada_pct: Number(data.variacion_cobertura_ponderada_pct) || 0,
      variacion_porcentaje_agotados_pct: Number(data.variacion_porcentaje_agotados_pct) || 0,
    };
  }

  /**
   * Refresh the materialized view (if needed)
   * Note: This requires appropriate database permissions
   * 
   * @returns Success status
   */
  async refreshMetricasConsolidadas(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .rpc('refresh_mvw_metricas_consolidadas');

      if (error) {
        console.error('Error refreshing materialized view:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception refreshing materialized view:', error);
      return false;
    }
  }

  /**
   * Get metrics with optional filters
   * If the materialized view supports filtering (e.g., by store or category)
   * 
   * @param filters - Optional filters to apply
   */
  async getMetricasConsolidadasWithFilters(filters?: {
    store_id?: string;
    category?: string;
  }): Promise<MetricasConsolidadas[]> {
    let query = this.supabase
      .schema('gonac')
      .from('mvw_metricas_consolidadas')
      .select('*');

    if (filters?.store_id) {
      query = query.eq('store_id', filters.store_id);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching filtered metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: Record<string, unknown>) => ({
      // Base Metrics
      ventas_totales_pesos: Number(item.ventas_totales_pesos) || 0,
      crecimiento_vs_semana_anterior_pct: Number(item.crecimiento_vs_semana_anterior_pct) || 0,
      ventas_totales_unidades: Number(item.ventas_totales_unidades) || 0,
      inventario_inicial_total: Number(item.inventario_inicial_total) || 0,
      venta_total_inventario: Number(item.venta_total_inventario) || 0,
      sell_through_pct: Number(item.sell_through_pct) || 0,
      cobertura_pct: Number(item.cobertura_pct) || 0,
      cobertura_ponderada_pct: Number(item.cobertura_ponderada_pct) || 0,
      promedio_dias_inventario: Number(item.promedio_dias_inventario) || 0,
      porcentaje_agotados_pct: Number(item.porcentaje_agotados_pct) || 0,
      avg_venta_promedio_diaria: Number(item.avg_venta_promedio_diaria) || 0,
      
      // Objectives
      objetivo_ventas_totales_pesos: Number(item.objetivo_ventas_totales_pesos) || 0,
      objetivo_sell_through_pct: Number(item.objetivo_sell_through_pct) || 0,
      objetivo_promedio_dias_inventario: Number(item.objetivo_promedio_dias_inventario) || 0,
      objetivo_avg_venta_promedio_diaria: Number(item.objetivo_avg_venta_promedio_diaria) || 0,
      objetivo_cobertura_pct: Number(item.objetivo_cobertura_pct) || 0,
      objetivo_cobertura_ponderada_pct: Number(item.objetivo_cobertura_ponderada_pct) || 0,
      objetivo_porcentaje_agotados_pct: Number(item.objetivo_porcentaje_agotados_pct) || 0,
      
      // Differences
      diferencia_ventas_totales_pesos: Number(item.diferencia_ventas_totales_pesos) || 0,
      diferencia_sell_through_pct: Number(item.diferencia_sell_through_pct) || 0,
      diferencia_promedio_dias_inventario: Number(item.diferencia_promedio_dias_inventario) || 0,
      diferencia_avg_venta_promedio_diaria: Number(item.diferencia_avg_venta_promedio_diaria) || 0,
      diferencia_cobertura_pct: Number(item.diferencia_cobertura_pct) || 0,
      diferencia_cobertura_ponderada_pct: Number(item.diferencia_cobertura_ponderada_pct) || 0,
      diferencia_porcentaje_agotados_pct: Number(item.diferencia_porcentaje_agotados_pct) || 0,
      
      // Variations
      variacion_ventas_totales_pct: Number(item.variacion_ventas_totales_pct) || 0,
      variacion_promedio_dias_inventario_pct: Number(item.variacion_promedio_dias_inventario_pct) || 0,
      variacion_avg_venta_promedio_diaria_pct: Number(item.variacion_avg_venta_promedio_diaria_pct) || 0,
      variacion_cobertura_pct: Number(item.variacion_cobertura_pct) || 0,
      variacion_cobertura_ponderada_pct: Number(item.variacion_cobertura_ponderada_pct) || 0,
      variacion_porcentaje_agotados_pct: Number(item.variacion_porcentaje_agotados_pct) || 0,
    }));
  }
}

