import { SupabaseClient } from '@supabase/supabase-js';
import {
  ExhibicionResumen,
  ExhibicionROI,
  ExhibicionParams,
} from '@/types/exhibiciones';

/**
 * Exhibiciones Repository
 * Handles all database operations related to exhibition ROI calculations
 */
export class ExhibicionesRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get exhibition summary
   * Calls: gonac.fn_obtener_resumen_exhibicion(p_costo_exhibicion, p_incremento_venta, p_dias_mes)
   * 
   * @param params - Exhibition parameters
   */
  async getResumenExhibicion(params: ExhibicionParams): Promise<ExhibicionResumen> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .rpc('fn_obtener_resumen_exhibicion', {
        p_costo_exhibicion: params.costo_exhibicion,
        p_incremento_venta: params.incremento_venta,
        p_dias_mes: params.dias_mes,
      });

    if (error) {
      throw new Error(
        `Error fetching exhibition summary: ${error.message}`
      );
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('No exhibition summary data returned');
    }

    // Handle both single object and array responses
    const result = Array.isArray(data) ? data[0] : data;

    return {
      tiendas_viables: Number(result.tiendas_viables) || 0,
      retorno_mensual_neto: Number(result.retorno_mensual_neto) || 0,
      costo_total_exhibicion: Number(result.costo_total_exhibicion) || 0,
      unidades_totales_pedido: Number(result.unidades_totales_pedido) || 0,
      valor_total_pedido: Number(result.valor_total_pedido) || 0,
      roi_promedio_x: Number(result.roi_promedio_x) || 0,
    };
  }

  /**
   * Calculate exhibition ROI
   * Calls: gonac.calcular_roi_exhibicion(p_costo_exhibicion, p_incremento_venta, p_dias_mes)
   * 
   * @param params - Exhibition parameters
   */
  async calcularROIExhibicion(
    params: ExhibicionParams
  ): Promise<ExhibicionROI[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .rpc('calcular_roi_exhibicion', {
        p_costo_exhibicion: params.costo_exhibicion,
        p_incremento_venta: params.incremento_venta,
        p_dias_mes: params.dias_mes,
      });

    if (error) {
      throw new Error(
        `Error calculating exhibition ROI: ${error.message}`
      );
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id_store: Number(item.id_store),
      sku: String(item.sku || ''),
      retorno_inversion_pesos: Number(item.retorno_inversion_pesos) || 0,
      venta_promedio_diaria: Number(item.venta_promedio_diaria) || 0,
      inventario_final: Number(item.inventario_final) || 0,
      pedido_extraordinario_unidades: Number(item.pedido_extraordinario_unidades) || 0,
      valor_pedido_extraordinario: Number(item.valor_pedido_extraordinario) || 0,
    }));
  }

  /**
   * Get exhibition ROI for a specific store
   * 
   * @param id_store - Store ID
   * @param params - Exhibition parameters
   */
  async getROIByStore(
    id_store: number,
    params: ExhibicionParams
  ): Promise<ExhibicionROI[]> {
    const allROI = await this.calcularROIExhibicion(params);
    return allROI.filter((item) => item.id_store === id_store);
  }

  /**
   * Get top N stores by ROI
   * 
   * @param limit - Number of top stores to return
   * @param params - Exhibition parameters
   */
  async getTopStoresByROI(
    limit: number,
    params: ExhibicionParams
  ): Promise<ExhibicionROI[]> {
    const allROI = await this.calcularROIExhibicion(params);

    // Sort by retorno_inversion_pesos descending
    const sorted = allROI.sort(
      (a, b) => b.retorno_inversion_pesos - a.retorno_inversion_pesos
    );

    // Get unique stores (take first occurrence which has highest ROI for that store)
    const uniqueStores = new Map<number, ExhibicionROI>();
    sorted.forEach((item) => {
      if (!uniqueStores.has(item.id_store)) {
        uniqueStores.set(item.id_store, item);
      }
    });

    return Array.from(uniqueStores.values()).slice(0, limit);
  }
}

