import { DescuentoRepository } from '@/repositories/descuento.repository';
import {
  DescuentoParams,
  PromocionMetrics,
  PromocionResponse,
  CalcularPromocionRequest,
  TopCategoriasExpiracionResponse,
  CategoriaConCaducidad,
  PromocionItem,
  CategoryStatsResponse,
} from '@/types/descuento';

/**
 * Descuento Service
 * Contains business logic for discount promotion calculations
 */
export class DescuentoService {
  constructor(private repository: DescuentoRepository) { }

  /**
   * Calculate complete promotion metrics for multiple categories
   * Supports dynamic items with individual elasticity per category
   */
  async calcularPromocion(
    request: CalcularPromocionRequest
  ): Promise<PromocionResponse> {
    const { descuento, items } = request;

    try {

      // Calculate metrics for each item in parallel, handle possibly undefined promocionItems
      if (!items || !Array.isArray(items)) {
        throw new Error('promocionItems is undefined or not an array');
      }
      const results = await Promise.all(
        items.map(async (item) =>
          this.calcularMetricasCategoria(descuento, item.elasticidad, item.categoria)
        )
      );

      // Build response with dynamic items
      const itemsMap: Record<string, PromocionMetrics> = {};
      items.forEach((item, index) => {
        itemsMap[item.categoria] = results[index];
      });

      const response: PromocionResponse = {
        items: itemsMap,
        config: {
          descuento_maximo: descuento * 100,
          items: items,
        },
        timestamp: new Date().toISOString(),
      };
      return response;
    } catch (error) {
      throw new Error(`Service error calculating promotion: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate metrics for a single category
   */
  private async calcularMetricasCategoria(
    descuento: number,
    elasticidad: number,
    categoria: string
  ): Promise<PromocionMetrics> {
    const params: DescuentoParams = {
      descuento,
      elasticidad,
      categoria,
    };

    const rawMetrics = await this.repository.calcularMetricasDescuento(params);

    // Calculate additional business metrics
    const inventario_post =
      rawMetrics.inventario_inicial_total - rawMetrics.ventas_plus;

    const reduccion_riesgo = this.calcularReduccionRiesgo(
      rawMetrics.inventario_inicial_total,
      rawMetrics.ventas_plus
    );

    return {
      ...rawMetrics,
      descuento: descuento,
      elasticidad,
      categoria,
      // reduccion_riesgo,
      // costo_promocion: rawMetrics.valor,
      // valor_capturar: rawMetrics.venta_original,
      // inventario_post,
    };
  }

  /**
   * Calculate risk reduction percentage
   * Risk reduction = (ventas_plus / inventario_inicial) * 100
   */
  private calcularReduccionRiesgo(
    inventario_inicial: number,
    ventas_plus: number
  ): number {
    if (inventario_inicial === 0) return 0;
    return (ventas_plus / inventario_inicial) * 100;
  }

  /**
   * Calculate metrics for a specific discount percentage
   * @param descuento - Discount value (0.41 = 41%)
   * @param items - Promotion items with elasticity and category
   */
  async calcularMetricasPorDescuento(
    descuento: number,
    items: PromocionItem[]
  ): Promise<PromocionResponse> {
    return this.calcularPromocion({
      descuento,
      items,
    });
  }

  // /**
  //  * Calculate optimal discount (future enhancement)
  //  * This would find the discount that maximizes value or reduces risk most effectively
  //  */
  // async calcularDescuentoOptimo(
  //   categoria: string,
  //   elasticidad: number,
  //   objetivo: 'maximizar_valor' | 'minimizar_costo' | 'maximizar_reduccion_riesgo' = 'maximizar_valor'
  // ): Promise<{ descuento_optimo: number; metricas: PromocionMetrics }> {
  //   // This is a simplified version - in production you'd want to test multiple discount levels
  //   const descuentos = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

  //   const resultados = await Promise.all(
  //     descuentos.map(async (descuento) => {
  //       const metricas = await this.calcularMetricasCategoria(
  //         descuento,
  //         elasticidad,
  //         categoria
  //       );
  //       return { descuento, metricas };
  //     })
  //   );

  //   // Find optimal based on objective
  //   let optimo = resultados[0];
  //   for (const resultado of resultados) {
  //     if (objetivo === 'maximizar_valor') {
  //       if (resultado.metricas.valor_capturar > optimo.metricas.valor_capturar) {
  //         optimo = resultado;
  //       }
  //     } else if (objetivo === 'minimizar_costo') {
  //       if (resultado.metricas.costo_promocion < optimo.metricas.costo_promocion) {
  //         optimo = resultado;
  //       }
  //     } else if (objetivo === 'maximizar_reduccion_riesgo') {
  //       if (resultado.metricas.reduccion_riesgo > optimo.metricas.reduccion_riesgo) {
  //         optimo = resultado;
  //       }
  //     }
  //   }

  //   return {
  //     descuento_optimo: optimo.descuento,
  //     metricas: optimo.metricas,
  //   };
  // }

  /**
   * Compare multiple discount scenarios
   * @param descuentos - Array of discount values to compare
   * @param items - Promotion items with elasticity and category
   */
  async compararDescuentos(
    descuentos: number[],
    items: PromocionItem[]
  ): Promise<PromocionResponse[]> {
    const resultados = await Promise.all(
      descuentos.map((descuento) =>
        this.calcularPromocion({
          descuento,
          items,
        })
      )
    );

    return resultados;
  }

  /**
   * Get available categories
   */
  async getCategoriasDisponibles(): Promise<string[]> {
    return this.repository.getCategoriasDisponibles();
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format number with decimals
   */
  formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Get top categories with most close-to-expiration products
   * Returns categories ordered by expiration impact
   * 
   * @param limit - Number of top categories to return (default: 2)
   */
  async getTopCategoriasConCaducidad(
    limit: number = 2
  ): Promise<TopCategoriasExpiracionResponse> {
    try {
      const categorias = await this.repository.getTopCategoriasConCaducidad(limit);

      // Calculate total impact
      const total_impacto = categorias.reduce(
        (sum, cat) => sum + cat.impacto,
        0
      );

      return {
        categorias,
        total_impacto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting expiration categories: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get top expiration categories with formatted data
   */
  async getTopCategoriasConCaducidadFormatted(
    limit: number = 2
  ): Promise<Array<CategoriaConCaducidad & { impacto_formatted: string; percentage: number }>> {
    const { categorias, total_impacto } = await this.getTopCategoriasConCaducidad(limit);

    return categorias.map((cat) => ({
      ...cat,
      impacto_formatted: this.formatCurrency(cat.impacto),
      percentage: total_impacto > 0 ? (cat.impacto / total_impacto) * 100 : 0,
    }));
  }

  /**
   * Get category statistics (unique products and stores)
   * 
   * @param categories - Array of category names to filter by
   */
  async getCategoryStats(categories: string[]): Promise<CategoryStatsResponse> {
    try {
      if (!categories || categories.length === 0) {
        throw new Error('Categories array cannot be empty');
      }

      const stats = await this.repository.getCategoryStats(categories);

      // Calculate totals across all categories
      const total_products = new Set<string>();
      const total_stores = new Set<string>();

      // Note: We need to fetch the raw data again to calculate totals properly
      // because the stats are already aggregated per category
      const allStats = await Promise.all(
        categories.map(async (category) => {
          const categoryStats = stats.find(s => s.category === category);
          return categoryStats;
        })
      );

      // Sum up unique counts
      const totalProducts = stats.reduce((sum, stat) => sum + stat.unique_products, 0);
      const totalStores = stats.reduce((sum, stat) => sum + stat.unique_stores, 0);

      return {
        stats,
        total_products: totalProducts,
        total_stores: totalStores,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting category stats: ${(error as Error).message}`
      );
    }
  }
}

