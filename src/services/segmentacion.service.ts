import { SegmentacionRepository } from '@/repositories/segmentacion.repository';
import {
  SegmentacionMetrics,
  SegmentacionResponse,
  SegmentacionFormattedResponse,
  SegmentacionMetricsFormatted,
  SegmentComparison,
  SegmentCard,
  StoreDetails,
  StoreDetailsResponse,
} from '@/types/segmentacion';

/**
 * Segmentacion Service
 * Contains business logic for store segmentation metrics
 */
export class SegmentacionService {
  constructor(private repository: SegmentacionRepository) {}

  /**
   * Get all segmentation metrics
   */
  async getSegmentacionMetrics(): Promise<SegmentacionResponse> {
    try {
      const segments = await this.repository.getSegmentacionMetrics();

      // Calculate totals
      const total_ventas_valor = segments.reduce(
        (sum, s) => sum + s.ventas_valor,
        0
      );
      const total_ventas_unidades = segments.reduce(
        (sum, s) => sum + s.ventas_unidades,
        0
      );
      const total_tiendas = segments.reduce(
        (sum, s) => sum + s.num_tiendas_segmento,
        0
      );

      return {
        segments,
        total_ventas_valor,
        total_ventas_unidades,
        total_tiendas,
        timestamp: new Date().toISOString(),
        source: 'mvw_metricas_segmentacion_tiendas',
      };
    } catch (error) {
      throw new Error(
        `Service error getting segmentation metrics: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get segmentation metrics with formatted values
   */
  async getSegmentacionMetricsFormatted(): Promise<SegmentacionFormattedResponse> {
    const { segments, total_ventas_valor, total_ventas_unidades, total_tiendas } =
      await this.getSegmentacionMetrics();

    const formattedSegments: SegmentacionMetricsFormatted[] = segments.map(
      (segment) => ({
        ...segment,
        ventas_valor_formatted: this.formatCurrency(segment.ventas_valor),
        ventas_unidades_formatted: this.formatNumber(segment.ventas_unidades),
        dias_inventario_formatted: this.formatDays(segment.dias_inventario),
        contribucion_porcentaje_formatted: this.formatPercentage(
          segment.contribucion_porcentaje
        ),
        num_tiendas_segmento_formatted: this.formatNumber(
          segment.num_tiendas_segmento
        ),
        participacion_segmento_formatted: this.formatPercentage(
          segment.participacion_segmento
        ),
        ventas_semana_promedio_tienda_pesos_formatted: this.formatCurrency(
          segment.ventas_semana_promedio_tienda_pesos
        ),
        ventas_semana_promedio_tienda_unidades_formatted: this.formatNumber(
          segment.ventas_semana_promedio_tienda_unidades
        ),
      })
    );

    return {
      segments: formattedSegments,
      total_ventas_valor,
      total_ventas_valor_formatted: this.formatCurrency(total_ventas_valor),
      total_ventas_unidades,
      total_ventas_unidades_formatted: this.formatNumber(total_ventas_unidades),
      total_tiendas,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get metrics for specific segment
   */
  async getSegmentMetrics(segment: string): Promise<SegmentacionMetrics | null> {
    try {
      return await this.repository.getSegmentacionBySegment(segment);
    } catch (error) {
      throw new Error(
        `Service error getting segment metrics: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get metrics for multiple segments
   */
  async getMultipleSegmentMetrics(
    segments: string[]
  ): Promise<SegmentacionMetrics[]> {
    try {
      return await this.repository.getSegmentacionBySegments(segments);
    } catch (error) {
      throw new Error(
        `Service error getting multiple segments: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get top performing segments
   */
  async getTopSegments(limit: number = 5): Promise<SegmentacionResponse> {
    try {
      const segments = await this.repository.getTopSegments(limit);

      const total_ventas_valor = segments.reduce(
        (sum, s) => sum + s.ventas_valor,
        0
      );
      const total_ventas_unidades = segments.reduce(
        (sum, s) => sum + s.ventas_unidades,
        0
      );
      const total_tiendas = segments.reduce(
        (sum, s) => sum + s.num_tiendas_segmento,
        0
      );

      return {
        segments,
        total_ventas_valor,
        total_ventas_unidades,
        total_tiendas,
        timestamp: new Date().toISOString(),
        source: 'mvw_metricas_segmentacion_tiendas',
      };
    } catch (error) {
      throw new Error(
        `Service error getting top segments: ${(error as Error).message}`
      );
    }
  }

  /**
   * Compare segments by performance
   */
  async compareSegments(): Promise<SegmentComparison[]> {
    const { segments } = await this.getSegmentacionMetrics();

    // Sort by contribution percentage descending
    const sorted = [...segments].sort(
      (a, b) => b.contribucion_porcentaje - a.contribucion_porcentaje
    );

    return sorted.map((segment, index) => ({
      segment: segment.segment,
      metrics: segment,
      rank: index + 1,
    }));
  }

  /**
   * Get segment cards for dashboard display
   */
  async getSegmentCards(): Promise<SegmentCard[]> {
    const { segments } = await this.getSegmentacionMetrics();

    return segments.map((segment) => ({
      segment: segment.segment,
      ventas_valor: this.formatCurrency(segment.ventas_valor),
      ventas_unidades: this.formatNumber(segment.ventas_unidades),
      contribucion: this.formatPercentage(segment.contribucion_porcentaje),
      num_tiendas: segment.num_tiendas_segmento,
      participacion: this.formatPercentage(segment.participacion_segmento),
      performance: this.getPerformanceLevel(segment.contribucion_porcentaje),
    }));
  }

  /**
   * Get segment summary statistics
   */
  async getSegmentSummary() {
    const { segments, total_ventas_valor, total_ventas_unidades, total_tiendas } =
      await this.getSegmentacionMetrics();

    const avg_ventas_valor =
      segments.length > 0 ? total_ventas_valor / segments.length : 0;
    const avg_ventas_unidades =
      segments.length > 0 ? total_ventas_unidades / segments.length : 0;
    const avg_dias_inventario =
      segments.length > 0
        ? segments.reduce((sum, s) => sum + s.dias_inventario, 0) /
          segments.length
        : 0;

    // Find best and worst performers
    const bestPerformer = segments.reduce(
      (best, current) =>
        current.contribucion_porcentaje > best.contribucion_porcentaje
          ? current
          : best,
      segments[0] || null
    );

    const worstPerformer = segments.reduce(
      (worst, current) =>
        current.contribucion_porcentaje < worst.contribucion_porcentaje
          ? current
          : worst,
      segments[0] || null
    );

    return {
      total_segments: segments.length,
      total_ventas_valor,
      total_ventas_valor_formatted: this.formatCurrency(total_ventas_valor),
      total_ventas_unidades,
      total_ventas_unidades_formatted: this.formatNumber(total_ventas_unidades),
      total_tiendas,
      avg_ventas_valor,
      avg_ventas_valor_formatted: this.formatCurrency(avg_ventas_valor),
      avg_ventas_unidades,
      avg_ventas_unidades_formatted: this.formatNumber(avg_ventas_unidades),
      avg_dias_inventario,
      avg_dias_inventario_formatted: this.formatDays(avg_dias_inventario),
      best_performer: bestPerformer
        ? {
            segment: bestPerformer.segment,
            contribucion: bestPerformer.contribucion_porcentaje,
            contribucion_formatted: this.formatPercentage(
              bestPerformer.contribucion_porcentaje
            ),
          }
        : null,
      worst_performer: worstPerformer
        ? {
            segment: worstPerformer.segment,
            contribucion: worstPerformer.contribucion_porcentaje,
            contribucion_formatted: this.formatPercentage(
              worstPerformer.contribucion_porcentaje
            ),
          }
        : null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get store details with stats for each segment group
   * 
   * @param segment - Optional filter by specific segment (Hot, Balanceadas, Slow, Criticas)
   */
  async getStoreDetails(segment?: string): Promise<StoreDetailsResponse> {
    try {
      const stores = await this.repository.getStoreDetails(segment);

      // Group stores by segment
      const groupedBySegment: { [segment: string]: StoreDetails[] } = {};
      const storesBySegment: { [segment: string]: number } = {};

      stores.forEach((store) => {
        const seg = store.segment;
        if (!groupedBySegment[seg]) {
          groupedBySegment[seg] = [];
          storesBySegment[seg] = 0;
        }
        groupedBySegment[seg].push(store);
        storesBySegment[seg]++;
      });

      return {
        stores,
        grouped_by_segment: groupedBySegment,
        summary: {
          total_stores: stores.length,
          stores_by_segment: storesBySegment,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting store details: ${(error as Error).message}`
      );
    }
  }

  /**
   * Refresh materialized view
   */
  async refreshMetrics(): Promise<boolean> {
    try {
      return await this.repository.refreshSegmentacionMetrics();
    } catch (error) {
      console.error('Service error refreshing metrics:', error);
      return false;
    }
  }

  /**
   * Helper: Format currency (Mexican Peso)
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Helper: Format percentage
   */
  private formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Helper: Format number with thousand separators
   */
  private formatNumber(value: number): string {
    return new Intl.NumberFormat('es-MX').format(Math.round(value));
  }

  /**
   * Helper: Format days
   */
  private formatDays(value: number): string {
    const days = Math.round(value);
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }

  /**
   * Helper: Determine performance level based on contribution
   */
  private getPerformanceLevel(
    contribucion: number
  ): 'high' | 'medium' | 'low' {
    if (contribucion >= 30) return 'high';
    if (contribucion >= 15) return 'medium';
    return 'low';
  }
}

