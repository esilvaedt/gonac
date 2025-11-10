import { SupabaseClient } from '@supabase/supabase-js';
import { DescuentoParams, DescuentoMetrics, CategoriaConCaducidad, CategoryStats } from '@/types/descuento';

/**
 * Descuento Repository
 * Handles all database operations related to discount calculations
 */
export class DescuentoRepository {
  constructor(private supabase: SupabaseClient) { }

  /**
   * Calculate discount metrics using PostgreSQL function
   * Calls: gonac.calcular_metricas_descuento(p_descuento, p_elasticidad, p_categoria)
   */
  async calcularMetricasDescuento(
    params: DescuentoParams
  ): Promise<DescuentoMetrics> {
    const { data, error } = await this.supabase.schema('gonac').rpc('calcular_metricas_descuento', {
      p_descuento: params.descuento,
      p_elasticidad: params.elasticidad,
      p_categoria: params.categoria,
    });

    if (error) {
      throw new Error(`Database error calculating discount metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from discount calculation');
    }

    // The function returns a single row
    const result = Array.isArray(data) ? data[0] : data;

    return {
      inventario_inicial_total: Number(result.inventario_inicial_total) || 0,
      ventas_plus: Number(result.ventas_plus) || 0,
      venta_original: Number(result.venta_original) || 0,
      costo: Number(result.costo) || 0,
      valor: Number(result.valor) || 0,
      reduccion: Number(result.reduccion) || 0,
    };
  }

  /**
   * Calculate metrics for multiple categories in parallel
   */
  async calcularMetricasMultiples(
    descuento: number,
    categorias: Array<{ categoria: string; elasticidad: number }>
  ): Promise<Map<string, DescuentoMetrics>> {
    const results = await Promise.all(
      categorias.map(async ({ categoria, elasticidad }) => {
        try {
          const metrics = await this.calcularMetricasDescuento({
            descuento,
            elasticidad,
            categoria,
          });
          return { categoria, metrics };
        } catch (error) {
          console.error(`Error calculating for ${categoria}:`, error);
          return {
            categoria,
            metrics: {
              inventario_inicial_total: 0,
              ventas_plus: 0,
              venta_original: 0,
              costo: 0,
              valor: 0,
              reduccion: 0,
            },
          };
        }
      })
    );

    const metricsMap = new Map<string, DescuentoMetrics>();
    results.forEach(({ categoria, metrics }) => {
      metricsMap.set(categoria, metrics);
    });

    return metricsMap;
  }

  /**
   * Get available categories from the catalog
   */
  async getCategoriasDisponibles(): Promise<string[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('core_cat_product')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    // Get unique categories
    const categorias = [...new Set(data.map((item: any) => item.category))];
    return categorias;
  }

  /**
   * Get stores by segment
   */
  async getStoresBySegment(segments: string[]): Promise<string[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('core_segmentacion_tiendas')
      .select('id_store')
      .in('segment', segments);

    if (error) {
      throw new Error(`Error fetching stores: ${error.message}`);
    }

    const storeIds = [...new Set(data.map((item: any) => item.id_store))];
    return storeIds;
  }

  /**
   * Get SKU details for a category
   */
  async getSkusByCategoria(categoria: string, segments: string[] = ['Slow', 'Dead']): Promise<any[]> {
    // First get stores in the segments
    const stores = await this.getStoresBySegment(segments);

    // Then get SKUs
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('core_store_sku_metrics')
      .select(`
        sku,
        id_store,
        inventario_inicial,
        precio_sku_promedio,
        core_cat_product!inner(category)
      `)
      .in('id_store', stores)
      .eq('core_cat_product.category', categoria);

    if (error) {
      throw new Error(`Error fetching SKUs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get top categories with most close-to-expiration products
   * Returns categories ordered by expiration impact (descending)
   * Executes the exact SQL query from gonac schema
   * 
   * @param limit - Number of top categories to return (default: 2)
   */
  async getTopCategoriasConCaducidad(limit: number = 2): Promise<CategoriaConCaducidad[]> {
    const { data: caducidadData, error: caducidadError } = await this.supabase
      .schema('gonac')
      .from('caducidad_detalle')
      .select(`
        sku,
        impacto,
        core_cat_product!inner(category)
      `);

    if (caducidadError) {
      throw new Error(`Error fetching expiration data: ${caducidadError.message}`);
    }

    if (!caducidadData || caducidadData.length === 0) {
      return [];
    }

    // Aggregate by category in JavaScript (GROUP BY ccp.category)
    const categoryImpactMap = new Map<string, number>();

    caducidadData.forEach((item: any) => {
      const category = item.core_cat_product?.category;
      if (category) {
        const currentImpact = categoryImpactMap.get(category) || 0;
        categoryImpactMap.set(category, currentImpact + (Number(item.impacto) || 0));
      }
    });

    // Convert to array and sort by impacto descending (ORDER BY impacto DESC)
    const categorias = Array.from(categoryImpactMap.entries())
      .map(([category, impacto]) => ({
        category,
        impacto,
      }))
      .sort((a, b) => b.impacto - a.impacto)
      .slice(0, limit); // LIMIT

    return categorias;
  }

  /**
   * Get unique products and stores count by categories
   * 
   * SQL equivalent:
   * SELECT cp.category, 
   *        count(distinct cp.sku) as unique_products, 
   *        count(distinct skm.id_store) as unique_stores
   * FROM gonac.core_cat_product cp
   * LEFT JOIN gonac.core_store_sku_metrics skm ON skm.sku = cp.sku
   * WHERE category IN ('Papas', 'Mix')
   * GROUP BY category
   * 
   * @param categories - Array of category names to filter by
   */
  async getCategoryStats(categories: string[]): Promise<CategoryStats[]> {
    if (!categories || categories.length === 0) {
      throw new Error('Categories array cannot be empty');
    }

    // Fetch products filtered by categories
    const { data: productData, error: productError } = await this.supabase
      .schema('gonac')
      .from('core_cat_product')
      .select(`
        sku,
        category
      `)
      .in('category', categories);

    if (productError) {
      throw new Error(`Error fetching product data: ${productError.message}`);
    }

    if (!productData || productData.length === 0) {
      return categories.map(category => ({
        category,
        unique_products: 0,
        unique_stores: 0,
      }));
    }

    // Get all SKUs for the filtered categories
    const skus = productData.map((item: any) => item.sku);

    // Fetch store metrics for these SKUs
    const { data: storeData, error: storeError } = await this.supabase
      .schema('gonac')
      .from('core_store_sku_metrics')
      .select('sku, id_store')
      .in('sku', skus);

    if (storeError) {
      throw new Error(`Error fetching store metrics: ${storeError.message}`);
    }

    // Aggregate by category in JavaScript (GROUP BY category)
    const categoryStatsMap = new Map<string, { products: Set<string>; stores: Set<string> }>();

    // Initialize map for all requested categories
    categories.forEach(category => {
      categoryStatsMap.set(category, {
        products: new Set<string>(),
        stores: new Set<string>(),
      });
    });

    // Add unique products
    productData.forEach((item: any) => {
      const category = item.category;
      if (categoryStatsMap.has(category)) {
        categoryStatsMap.get(category)!.products.add(item.sku);
      }
    });

    // Add unique stores (LEFT JOIN behavior)
    if (storeData && storeData.length > 0) {
      storeData.forEach((item: any) => {
        // Find which category this SKU belongs to
        const productItem = productData.find((p: any) => p.sku === item.sku);
        if (productItem) {
          const category = productItem.category;
          if (categoryStatsMap.has(category)) {
            categoryStatsMap.get(category)!.stores.add(item.id_store);
          }
        }
      });
    }

    // Convert to CategoryStats array
    const stats: CategoryStats[] = Array.from(categoryStatsMap.entries()).map(
      ([category, data]) => ({
        category,
        unique_products: data.products.size,
        unique_stores: data.stores.size,
      })
    );

    return stats;
  }
}

