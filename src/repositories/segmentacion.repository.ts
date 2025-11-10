import { SupabaseClient } from '@supabase/supabase-js';
import { SegmentacionMetrics } from '@/types/segmentacion';

/**
 * Segmentacion Repository
 * Handles all database operations related to store segmentation metrics
 */
export class SegmentacionRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all segmentation metrics
   * Fetches from: gonac.mvw_metricas_segmentacion_tiendas
   */
  async getSegmentacionMetrics(): Promise<SegmentacionMetrics[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('mvw_metricas_segmentacion_tiendas')
      .select('*')
      .order('ventas_valor', { ascending: false }); // Order by sales value descending

    if (error) {
      throw new Error(`Error fetching segmentation metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      segment: String(item.segment || ''),
      ventas_valor: Number(item.ventas_valor) || 0,
      ventas_unidades: Number(item.ventas_unidades) || 0,
      dias_inventario: Number(item.dias_inventario) || 0,
      contribucion_porcentaje: Number(item.contribucion_porcentaje) || 0,
      num_tiendas_segmento: Number(item.num_tiendas_segmento) || 0,
      participacion_segmento: Number(item.participacion_segmento) || 0,
      ventas_semana_promedio_tienda_pesos: Number(item.ventas_semana_promedio_tienda_pesos) || 0,
      ventas_semana_promedio_tienda_unidades: Number(item.ventas_semana_promedio_tienda_unidades) || 0,
    }));
  }

  /**
   * Get metrics for a specific segment
   * 
   * @param segment - Segment name (e.g., 'Slow', 'Dead')
   */
  async getSegmentacionBySegment(segment: string): Promise<SegmentacionMetrics | null> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('mvw_metricas_segmentacion_tiendas')
      .select('*')
      .eq('segment', segment)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching segment metrics: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      segment: String(data.segment || ''),
      ventas_valor: Number(data.ventas_valor) || 0,
      ventas_unidades: Number(data.ventas_unidades) || 0,
      dias_inventario: Number(data.dias_inventario) || 0,
      contribucion_porcentaje: Number(data.contribucion_porcentaje) || 0,
      num_tiendas_segmento: Number(data.num_tiendas_segmento) || 0,
      participacion_segmento: Number(data.participacion_segmento) || 0,
      ventas_semana_promedio_tienda_pesos: Number(data.ventas_semana_promedio_tienda_pesos) || 0,
      ventas_semana_promedio_tienda_unidades: Number(data.ventas_semana_promedio_tienda_unidades) || 0,
    };
  }

  /**
   * Get metrics for multiple specific segments
   * 
   * @param segments - Array of segment names
   */
  async getSegmentacionBySegments(segments: string[]): Promise<SegmentacionMetrics[]> {
    if (!segments || segments.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .schema('gonac')
      .from('mvw_metricas_segmentacion_tiendas')
      .select('*')
      .in('segment', segments)
      .order('ventas_valor', { ascending: false });

    if (error) {
      throw new Error(`Error fetching segment metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      segment: String(item.segment || ''),
      ventas_valor: Number(item.ventas_valor) || 0,
      ventas_unidades: Number(item.ventas_unidades) || 0,
      dias_inventario: Number(item.dias_inventario) || 0,
      contribucion_porcentaje: Number(item.contribucion_porcentaje) || 0,
      num_tiendas_segmento: Number(item.num_tiendas_segmento) || 0,
      participacion_segmento: Number(item.participacion_segmento) || 0,
      ventas_semana_promedio_tienda_pesos: Number(item.ventas_semana_promedio_tienda_pesos) || 0,
      ventas_semana_promedio_tienda_unidades: Number(item.ventas_semana_promedio_tienda_unidades) || 0,
    }));
  }

  /**
   * Get top N segments by sales value
   * 
   * @param limit - Number of top segments to return
   */
  async getTopSegments(limit: number = 5): Promise<SegmentacionMetrics[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('mvw_metricas_segmentacion_tiendas')
      .select('*')
      .order('ventas_valor', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching top segments: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      segment: String(item.segment || ''),
      ventas_valor: Number(item.ventas_valor) || 0,
      ventas_unidades: Number(item.ventas_unidades) || 0,
      dias_inventario: Number(item.dias_inventario) || 0,
      contribucion_porcentaje: Number(item.contribucion_porcentaje) || 0,
      num_tiendas_segmento: Number(item.num_tiendas_segmento) || 0,
      participacion_segmento: Number(item.participacion_segmento) || 0,
      ventas_semana_promedio_tienda_pesos: Number(item.ventas_semana_promedio_tienda_pesos) || 0,
      ventas_semana_promedio_tienda_unidades: Number(item.ventas_semana_promedio_tienda_unidades) || 0,
    }));
  }

  /**
   * Refresh the materialized view (requires appropriate permissions)
   */
  async refreshSegmentacionMetrics(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .rpc('refresh_mvw_metricas_segmentacion_tiendas');

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
}

