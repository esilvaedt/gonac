import { MetricasRepository } from '@/repositories/metricas.repository';
import {
  MetricasConsolidadasResponse,
  MetricasConsolidadasFormatted,
  KPICard,
} from '@/types/metricas';

/**
 * Metricas Service
 * Contains business logic for consolidated metrics and KPIs
 */
export class MetricasService {
  constructor(private repository: MetricasRepository) { }

  /**
   * Get consolidated metrics for home page KPIs
   */
  async getMetricasConsolidadas(): Promise<MetricasConsolidadasResponse> {
    try {
      const data = await this.repository.getMetricasConsolidadas();

      return {
        data,
        timestamp: new Date().toISOString(),
        source: 'mvw_metricas_consolidadas',
      };
    } catch (error) {
      throw new Error(
        `Service error getting consolidated metrics: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get formatted metrics with currency and percentage formatting
   */
  async getMetricasConsolidadasFormatted(): Promise<MetricasConsolidadasFormatted> {
    const { data } = await this.getMetricasConsolidadas();

    return {
      ...data,
      // Base Metrics Formatted
      ventas_totales_pesos_formatted: this.formatCurrency(data.ventas_totales_pesos),
      crecimiento_formatted: this.formatPercentage(data.crecimiento_vs_semana_anterior_pct),
      ventas_totales_unidades_formatted: this.formatNumber(data.ventas_totales_unidades),
      inventario_inicial_total_formatted: this.formatNumber(data.inventario_inicial_total),
      venta_total_inventario_formatted: this.formatCurrency(data.venta_total_inventario),
      sell_through_formatted: this.formatPercentage(data.sell_through_pct),
      cobertura_formatted: this.formatPercentage(data.cobertura_pct),
      cobertura_ponderada_formatted: this.formatPercentage(data.cobertura_ponderada_pct),
      promedio_dias_inventario_formatted: this.formatDays(data.promedio_dias_inventario),
      porcentaje_agotados_formatted: this.formatPercentage(data.porcentaje_agotados_pct),
      avg_venta_promedio_diaria_formatted: this.formatCurrency(data.avg_venta_promedio_diaria),
      
      // Objectives Formatted
      objetivo_ventas_totales_pesos_formatted: this.formatCurrency(data.objetivo_ventas_totales_pesos),
      objetivo_sell_through_formatted: this.formatPercentage(data.objetivo_sell_through_pct),
      objetivo_promedio_dias_inventario_formatted: this.formatDays(data.objetivo_promedio_dias_inventario),
      objetivo_avg_venta_promedio_diaria_formatted: this.formatCurrency(data.objetivo_avg_venta_promedio_diaria),
      objetivo_cobertura_formatted: this.formatPercentage(data.objetivo_cobertura_pct),
      objetivo_cobertura_ponderada_formatted: this.formatPercentage(data.objetivo_cobertura_ponderada_pct),
      objetivo_porcentaje_agotados_formatted: this.formatPercentage(data.objetivo_porcentaje_agotados_pct),
      
      // Differences Formatted
      diferencia_ventas_totales_pesos_formatted: this.formatCurrencySigned(data.diferencia_ventas_totales_pesos),
      diferencia_sell_through_formatted: this.formatPercentageSigned(data.diferencia_sell_through_pct),
      diferencia_promedio_dias_inventario_formatted: this.formatDaysSigned(data.diferencia_promedio_dias_inventario),
      diferencia_avg_venta_promedio_diaria_formatted: this.formatCurrencySigned(data.diferencia_avg_venta_promedio_diaria),
      diferencia_cobertura_formatted: this.formatPercentageSigned(data.diferencia_cobertura_pct),
      diferencia_cobertura_ponderada_formatted: this.formatPercentageSigned(data.diferencia_cobertura_ponderada_pct),
      diferencia_porcentaje_agotados_formatted: this.formatPercentageSigned(data.diferencia_porcentaje_agotados_pct),
      
      // Variations Formatted
      variacion_ventas_totales_formatted: this.formatPercentageSigned(data.variacion_ventas_totales_pct),
      variacion_promedio_dias_inventario_formatted: this.formatPercentageSigned(data.variacion_promedio_dias_inventario_pct),
      variacion_avg_venta_promedio_diaria_formatted: this.formatPercentageSigned(data.variacion_avg_venta_promedio_diaria_pct),
      variacion_cobertura_formatted: this.formatPercentageSigned(data.variacion_cobertura_pct),
      variacion_cobertura_ponderada_formatted: this.formatPercentageSigned(data.variacion_cobertura_ponderada_pct),
      variacion_porcentaje_agotados_formatted: this.formatPercentageSigned(data.variacion_porcentaje_agotados_pct),
    };
  }

  /**
   * Get metrics as individual KPI cards for dashboard
   */
  async getKPICards(): Promise<KPICard[]> {
    const { data } = await this.getMetricasConsolidadas();

    return [
      {
        id: 'ventas_totales_pesos',
        label: 'Ventas Totales',
        value: data.ventas_totales_pesos,
        formatted_value: this.formatCurrency(data.ventas_totales_pesos),
        unit: 'currency',
        trend: this.getTrend(data.crecimiento_vs_semana_anterior_pct),
        icon: 'currency',
      },
      {
        id: 'crecimiento_vs_semana_anterior',
        label: 'Crecimiento vs Semana Anterior',
        value: data.crecimiento_vs_semana_anterior_pct,
        formatted_value: this.formatPercentage(data.crecimiento_vs_semana_anterior_pct),
        unit: 'percentage',
        trend: this.getTrend(data.crecimiento_vs_semana_anterior_pct),
        icon: 'trending',
      },
      {
        id: 'ventas_totales_unidades',
        label: 'Ventas Totales (Unidades)',
        value: data.ventas_totales_unidades,
        formatted_value: this.formatNumber(data.ventas_totales_unidades),
        unit: 'number',
        icon: 'package',
      },
      {
        id: 'sell_through',
        label: 'Sell Through',
        value: data.sell_through_pct,
        formatted_value: this.formatPercentage(data.sell_through_pct),
        unit: 'percentage',
        trend: data.sell_through_pct >= 80 ? 'up' : data.sell_through_pct >= 60 ? 'neutral' : 'down',
        icon: 'chart',
      },
      {
        id: 'cobertura',
        label: 'Cobertura',
        value: data.cobertura_pct,
        formatted_value: this.formatPercentage(data.cobertura_pct),
        unit: 'percentage',
        trend: data.cobertura_pct >= 90 ? 'up' : data.cobertura_pct >= 75 ? 'neutral' : 'down',
        icon: 'coverage',
      },
      {
        id: 'cobertura_ponderada',
        label: 'Cobertura Ponderada',
        value: data.cobertura_ponderada_pct,
        formatted_value: this.formatPercentage(data.cobertura_ponderada_pct),
        unit: 'percentage',
        icon: 'weight',
      },
      {
        id: 'promedio_dias_inventario',
        label: 'Promedio Días Inventario',
        value: data.promedio_dias_inventario,
        formatted_value: this.formatDays(data.promedio_dias_inventario),
        unit: 'days',
        trend: data.promedio_dias_inventario <= 30 ? 'up' : data.promedio_dias_inventario <= 60 ? 'neutral' : 'down',
        icon: 'calendar',
      },
      {
        id: 'porcentaje_agotados',
        label: 'Porcentaje Agotados',
        value: data.porcentaje_agotados_pct,
        formatted_value: this.formatPercentage(data.porcentaje_agotados_pct),
        unit: 'percentage',
        trend: data.porcentaje_agotados_pct <= 5 ? 'up' : data.porcentaje_agotados_pct <= 15 ? 'neutral' : 'down',
        icon: 'alert',
      },
      {
        id: 'avg_venta_promedio_diaria',
        label: 'Venta Promedio Diaria',
        value: data.avg_venta_promedio_diaria,
        formatted_value: this.formatCurrency(data.avg_venta_promedio_diaria),
        unit: 'currency',
        icon: 'daily',
      },
    ];
  }

  /**
   * Refresh materialized view
   */
  async refreshMetrics(): Promise<boolean> {
    try {
      return await this.repository.refreshMetricasConsolidadas();
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
   * Helper: Format currency with sign (for differences)
   */
  private formatCurrencySigned(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return sign + this.formatCurrency(value);
  }

  /**
   * Helper: Format percentage
   */
  private formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Helper: Format percentage with sign (for differences)
   */
  private formatPercentageSigned(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * Helper: Format number with thousand separators
   */
  private formatNumber(value: number): string {
    return new Intl.NumberFormat('es-MX').format(value);
  }

  /**
   * Helper: Format days
   */
  private formatDays(value: number): string {
    const days = Math.round(value);
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }

  /**
   * Helper: Format days with sign (for differences)
   */
  private formatDaysSigned(value: number): string {
    const days = Math.round(value);
    const sign = days >= 0 ? '+' : '';
    return `${sign}${days} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
  }

  /**
   * Helper: Determine trend based on value
   */
  private getTrend(value: number): 'up' | 'down' | 'neutral' {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  }
}

