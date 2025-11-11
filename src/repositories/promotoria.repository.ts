import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Promotoria Summary Interface
 */
export interface PromotoriaSummary {
  tiendas_a_visitar: number;
  riesgo_total: number;
}

/**
 * Promotoria Tienda Interface (single store with highest risk)
 */
export interface PromotoriaTienda {
  id_store: number;
  store_name: string;
  ventas_acumuladas: string;
  riesgo_total: number;
  inventario_sin_rotacion_total: string;
}

/**
 * Promotoria Product Interface
 */
export interface PromotoriaProduct {
  product_name: string;
  ventas_totales_unidades: number;
  inventario_sin_rotacion: number;
  precio_individual: number;
  riesgo: number;
}

/**
 * Promotoria Repository
 * Handles all database operations related to promotoria visits
 */
export class PromotoriaRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get global promotoria summary
   * Fetches from: gonac.vw_promotoria_global
   * 
   * @returns Summary with tiendas_a_visitar and riesgo_total
   */
  async getSummary(): Promise<PromotoriaSummary> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('vw_promotoria_global')
      .select('tiendas_a_visitar, riesgo_total')
      .single();

    if (error) {
      throw new Error(`Error fetching promotoria summary: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from promotoria summary view');
    }

    return {
      tiendas_a_visitar: Number(data.tiendas_a_visitar) || 0,
      riesgo_total: Number(data.riesgo_total) || 0,
    };
  }

  /**
   * Get single store with highest risk from promotoria tienda view
   * Fetches from: gonac.vw_promotoria_tienda
   * 
   * @returns Single store with highest risk: id_store, store_name, ventas_acumuladas, riesgo_total, inventario_sin_rotacion_total
   */
  async getTiendaTopRiesgo(): Promise<PromotoriaTienda> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('vw_promotoria_tienda')
      .select(`
        id_store,
        ventas_acumuladas,
        riesgo_total,
        inventario_sin_rotacion_total,
        core_cat_store!inner(store_name)
      `)
      .order('riesgo_total', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Error fetching promotoria tienda: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from promotoria tienda view');
    }

    return {
      id_store: Number(data.id_store) || 0,
      store_name: (data.core_cat_store as any)?.store_name || 'Unknown Store',
      ventas_acumuladas: data.ventas_acumuladas || '0',
      riesgo_total: Number(data.riesgo_total) || 0,
      inventario_sin_rotacion_total: data.inventario_sin_rotacion_total || '0',
    };
  }

  /**
   * Get top products without sales for a specific store
   * Fetches from: gonac.vw_promotoria_tienda_sku
   * 
   * @param id_store - Store ID to filter products (required)
   * @param limit - Number of products to return (default: 3)
   * @returns Array of products ordered by risk (descending)
   */
  async getProductsSinVentaByStore(id_store: number, limit: number = 3): Promise<PromotoriaProduct[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('vw_promotoria_tienda_sku')
      .select(`
        sku,
        ventas_totales_unidades,
        inventario_sin_rotacion,
        precio_individual,
        riesgo,
        core_cat_product!inner(product_name)
      `)
      .eq('id_store', id_store)
      .order('riesgo', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching products sin venta by store: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map to PromotoriaProduct interface
    return data.map((item: any) => ({
      product_name: item.core_cat_product?.product_name || 'Unknown Product',
      ventas_totales_unidades: Number(item.ventas_totales_unidades) || 0,
      inventario_sin_rotacion: Number(item.inventario_sin_rotacion) || 0,
      precio_individual: Number(item.precio_individual) || 0,
      riesgo: Number(item.riesgo) || 0,
    }));
  }
}

