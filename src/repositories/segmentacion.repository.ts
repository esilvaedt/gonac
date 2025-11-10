import { SupabaseClient } from '@supabase/supabase-js';
import { SegmentacionMetrics, StoreDetails } from '@/types/segmentacion';

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
   * Get store details with stats for each segment group
   * Joins core_segmentacion_tiendas with core_store_metrics
   * 
   * @param segment - Optional filter by specific segment (Hot, Balanceadas, Slow, Criticas)
   */
  async getStoreDetails(segment?: string): Promise<StoreDetails[]> {
    let query = this.supabase
      .schema('gonac')
      .from('core_segmentacion_tiendas')
      .select(`
        id_store,
        segment,
        core_store_metrics!inner(
          ventas_totales_pesos,
          ventas_totales_unidades,
          venta_promedio_diaria,
          inventario_inicial,
          inventario_final,
          dias_inventario,
          sell_through_pct,
          dias_con_venta,
          dias_en_periodo,
          inserted_at,
          venta_promedio_semanal,
          venta_promedio_diaria_pesos,
          precio_sku_promedio
        )
      `);

    // Filter by segment if provided
    if (segment) {
      query = query.eq('segment', segment);
    }

    const { data, error } = await query;

    // If Supabase join syntax fails (no FK relationship), use manual join
    if (error) {
      return await this.getStoreDetailsManual(segment);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested structure to flat StoreDetails objects
    return data.map((item: any) => {
      const metrics = item.core_store_metrics;
      return {
        id_store: Number(item.id_store),
        segment: String(item.segment || ''),
        ventas_totales_pesos: Number(metrics?.ventas_totales_pesos || 0),
        ventas_totales_unidades: Number(metrics?.ventas_totales_unidades || 0),
        venta_promedio_diaria: Number(metrics?.venta_promedio_diaria || 0),
        inventario_inicial: Number(metrics?.inventario_inicial || 0),
        inventario_final: Number(metrics?.inventario_final || 0),
        dias_inventario: Number(metrics?.dias_inventario || 0),
        sell_through_pct: Number(metrics?.sell_through_pct || 0),
        dias_con_venta: Number(metrics?.dias_con_venta || 0),
        dias_en_periodo: Number(metrics?.dias_en_periodo || 0),
        inserted_at: metrics?.inserted_at ? String(metrics.inserted_at) : '',
        venta_promedio_semanal: Number(metrics?.venta_promedio_semanal || 0),
        venta_promedio_diaria_pesos: Number(metrics?.venta_promedio_diaria_pesos || 0),
        precio_sku_promedio: Number(metrics?.precio_sku_promedio || 0),
      };
    });
  }

  /**
   * Manual join approach: fetch from both tables and join in memory
   * Used as fallback if Supabase join syntax doesn't work
   */
  private async getStoreDetailsManual(segment?: string): Promise<StoreDetails[]> {
    // Fetch segment data
    let segmentQuery = this.supabase
      .schema('gonac')
      .from('core_segmentacion_tiendas')
      .select('id_store, segment');

    if (segment) {
      segmentQuery = segmentQuery.eq('segment', segment);
    }

    const { data: segmentData, error: segmentError } = await segmentQuery;

    if (segmentError || !segmentData || segmentData.length === 0) {
      return [];
    }

    // Get all store IDs
    const storeIds = segmentData.map((item: any) => item.id_store);

    // Fetch metrics for these stores
    const { data: metricsData, error: metricsError } = await this.supabase
      .schema('gonac')
      .from('core_store_metrics')
      .select('*')
      .in('id_store', storeIds);

    if (metricsError || !metricsData) {
      throw new Error(`Error fetching store metrics: ${metricsError?.message || 'Unknown error'}`);
    }

    // Create a map of store metrics by id_store
    const metricsMap = new Map(
      metricsData.map((item: any) => [Number(item.id_store), item])
    );

    // Join the data
    return segmentData
      .map((item: any) => {
        const metrics = metricsMap.get(Number(item.id_store));
        if (!metrics) {
          return null; // Skip if no metrics found
        }

        return {
          id_store: Number(item.id_store),
          segment: String(item.segment || ''),
          ventas_totales_pesos: Number(metrics.ventas_totales_pesos || 0),
          ventas_totales_unidades: Number(metrics.ventas_totales_unidades || 0),
          venta_promedio_diaria: Number(metrics.venta_promedio_diaria || 0),
          inventario_inicial: Number(metrics.inventario_inicial || 0),
          inventario_final: Number(metrics.inventario_final || 0),
          dias_inventario: Number(metrics.dias_inventario || 0),
          sell_through_pct: Number(metrics.sell_through_pct || 0),
          dias_con_venta: Number(metrics.dias_con_venta || 0),
          dias_en_periodo: Number(metrics.dias_en_periodo || 0),
          inserted_at: metrics.inserted_at ? String(metrics.inserted_at) : '',
          venta_promedio_semanal: Number(metrics.venta_promedio_semanal || 0),
          venta_promedio_diaria_pesos: Number(metrics.venta_promedio_diaria_pesos || 0),
          precio_sku_promedio: Number(metrics.precio_sku_promedio || 0),
        };
      })
      .filter((item): item is StoreDetails => item !== null);
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

