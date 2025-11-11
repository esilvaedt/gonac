import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Promotoria Summary Interface
 */
export interface PromotoriaSummary {
  tiendas_a_visitar: number;
  riesgo_total: number;
}

/**
 * Promotoria Aggregate Interface
 */
export interface PromotoriaAggregate {
  count: number;
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
   * Get aggregate data from promotoria tienda view
   * Fetches from: gonac.vw_promotoria_tienda
   * 
   * @returns Aggregated metrics: count, ventas_acumuladas, riesgo_total, inventario_sin_rotacion_total
   */
  async getAggregate(): Promise<PromotoriaAggregate> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .rpc('get_promotoria_aggregate');

    // If RPC doesn't exist, use direct query
    if (error && error.message.includes('function')) {
      const { data: queryData, error: queryError } = await this.supabase
        .schema('gonac')
        .from('vw_promotoria_tienda')
        .select('id_store, ventas_acumuladas, riesgo_total, inventario_sin_rotacion_total');

      if (queryError) {
        throw new Error(`Error fetching promotoria aggregate: ${queryError.message}`);
      }

      if (!queryData || queryData.length === 0) {
        throw new Error('No data returned from promotoria tienda view');
      }

      // Manually aggregate
      const count = queryData.length;
      const ventas_acumuladas = queryData.reduce((sum, row) => sum + (Number(row.ventas_acumuladas) || 0), 0);
      const riesgo_total = queryData.reduce((sum, row) => sum + (Number(row.riesgo_total) || 0), 0);
      const inventario_sin_rotacion_total = queryData.reduce((sum, row) => sum + (Number(row.inventario_sin_rotacion_total) || 0), 0);

      return {
        count,
        ventas_acumuladas: ventas_acumuladas.toString(),
        riesgo_total,
        inventario_sin_rotacion_total: inventario_sin_rotacion_total.toString(),
      };
    }

    if (error) {
      throw new Error(`Error fetching promotoria aggregate: ${error.message}`);
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('No data returned from promotoria aggregate');
    }

    const result = Array.isArray(data) ? data[0] : data;

    return {
      count: Number(result.count) || 0,
      ventas_acumuladas: result.ventas_acumuladas || '0',
      riesgo_total: Number(result.riesgo_total) || 0,
      inventario_sin_rotacion_total: result.inventario_sin_rotacion_total || '0',
    };
  }

  /**
   * Get top products without sales
   * Fetches from: gonac.vw_promotoria_tienda_sku
   * 
   * @param limit - Number of products to return (default: 3)
   * @returns Array of products ordered by risk (descending)
   */
  async getProductsSinVenta(limit: number = 3): Promise<PromotoriaProduct[]> {
    // Fetch all data first, then group and limit
    // This ensures we get the top N products after grouping, not top N rows before grouping
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
      .order('riesgo', { ascending: false });

    if (error) {
      throw new Error(`Error fetching products sin venta: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by product name and aggregate
    const productMap = new Map<string, {
      ventas_totales_unidades: number;
      inventario_sin_rotacion: number;
      precio_individual: number;
      riesgos: number[];
    }>();

    data.forEach((item: any) => {
      const productName = item.core_cat_product?.product_name || 'Unknown Product';
      
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          ventas_totales_unidades: 0,
          inventario_sin_rotacion: 0,
          precio_individual: 0,
          riesgos: [],
        });
      }

      const product = productMap.get(productName)!;
      product.ventas_totales_unidades += Number(item.ventas_totales_unidades) || 0;
      product.inventario_sin_rotacion += Number(item.inventario_sin_rotacion) || 0;
      product.precio_individual += Number(item.precio_individual) || 0;
      product.riesgos.push(Number(item.riesgo) || 0);
    });

    // Convert map to array and calculate averages
    const products: PromotoriaProduct[] = Array.from(productMap.entries()).map(([product_name, data]) => ({
      product_name,
      ventas_totales_unidades: data.ventas_totales_unidades,
      inventario_sin_rotacion: data.inventario_sin_rotacion,
      precio_individual: data.precio_individual,
      riesgo: data.riesgos.reduce((sum, r) => sum + r, 0) / data.riesgos.length,
    }));

    // Sort by average riesgo descending and limit to requested number
    return products
      .sort((a, b) => b.riesgo - a.riesgo)
      .slice(0, limit);
  }
}

