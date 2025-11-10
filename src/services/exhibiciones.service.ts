import { ExhibicionesRepository } from '@/repositories/exhibiciones.repository';
import {
  ExhibicionResumen,
  ExhibicionResumenFormatted,
  ExhibicionResumenResponse,
  ExhibicionROI,
  ExhibicionROIFormatted,
  ExhibicionROIResponse,
  ExhibicionROIByStore,
  ExhibicionParams,
  ExhibicionViabilidad,
  ExhibicionAnalisis,
} from '@/types/exhibiciones';

/**
 * Exhibiciones Service
 * Contains business logic for exhibition ROI calculations and analysis
 */
export class ExhibicionesService {
  constructor(private repository: ExhibicionesRepository) {}

  /**
   * Get exhibition summary
   */
  async getResumenExhibicion(
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionResumenResponse> {
    try {
      const fullParams: ExhibicionParams = {
        costo_exhibicion: params.costo_exhibicion ?? 500,
        incremento_venta: params.incremento_venta ?? 0.5,
        dias_mes: params.dias_mes ?? 30,
      };

      const resumen = await this.repository.getResumenExhibicion(fullParams);

      return {
        resumen,
        params: fullParams,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting exhibition summary: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get formatted exhibition summary
   */
  async getResumenExhibicionFormatted(
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionResumenFormatted> {
    const { resumen } = await this.getResumenExhibicion(params);

    return {
      ...resumen,
      retorno_mensual_neto_formatted: this.formatCurrency(
        resumen.retorno_mensual_neto
      ),
      costo_total_exhibicion_formatted: this.formatCurrency(
        resumen.costo_total_exhibicion
      ),
      unidades_totales_pedido_formatted: this.formatNumber(
        resumen.unidades_totales_pedido
      ),
      valor_total_pedido_formatted: this.formatCurrency(
        resumen.valor_total_pedido
      ),
      roi_promedio_formatted: `${resumen.roi_promedio_x.toFixed(2)}x`,
    };
  }

  /**
   * Calculate exhibition ROI
   */
  async calcularROIExhibicion(
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionROIResponse> {
    try {
      const fullParams: ExhibicionParams = {
        costo_exhibicion: params.costo_exhibicion ?? 500,
        incremento_venta: params.incremento_venta ?? 0.5,
        dias_mes: params.dias_mes ?? 30,
      };

      const items = await this.repository.calcularROIExhibicion(fullParams);

      // Group by store
      const groupedByStore = this.groupROIByStore(items);

      // Calculate summary
      const summary = this.calculateROISummary(items, groupedByStore);

      return {
        items,
        grouped_by_store: groupedByStore,
        summary,
        params: fullParams,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error calculating exhibition ROI: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get formatted exhibition ROI
   */
  async calcularROIExhibicionFormatted(
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionROIFormatted[]> {
    const { items } = await this.calcularROIExhibicion(params);

    return items.map((item) => ({
      ...item,
      retorno_inversion_pesos_formatted: this.formatCurrency(
        item.retorno_inversion_pesos
      ),
      venta_promedio_diaria_formatted: this.formatNumber(
        item.venta_promedio_diaria,
        2
      ),
      valor_pedido_extraordinario_formatted: this.formatCurrency(
        item.valor_pedido_extraordinario
      ),
    }));
  }

  /**
   * Get ROI for a specific store
   */
  async getROIByStore(
    id_store: number,
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionROI[]> {
    try {
      const fullParams: ExhibicionParams = {
        costo_exhibicion: params.costo_exhibicion ?? 500,
        incremento_venta: params.incremento_venta ?? 0.5,
        dias_mes: params.dias_mes ?? 30,
      };

      return await this.repository.getROIByStore(id_store, fullParams);
    } catch (error) {
      throw new Error(
        `Service error getting ROI by store: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get top N stores by ROI
   */
  async getTopStoresByROI(
    limit: number = 10,
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionROIByStore[]> {
    try {
      const fullParams: ExhibicionParams = {
        costo_exhibicion: params.costo_exhibicion ?? 500,
        incremento_venta: params.incremento_venta ?? 0.5,
        dias_mes: params.dias_mes ?? 30,
      };

      const topStoreItems = await this.repository.getTopStoresByROI(
        limit,
        fullParams
      );

      // Get all items for these stores
      const allItems = await this.repository.calcularROIExhibicion(fullParams);
      const topStoreIds = new Set(topStoreItems.map((item) => item.id_store));

      const filteredItems = allItems.filter((item) =>
        topStoreIds.has(item.id_store)
      );

      return this.groupROIByStore(filteredItems).slice(0, limit);
    } catch (error) {
      throw new Error(
        `Service error getting top stores: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get complete exhibition analysis
   */
  async getAnalisisCompleto(
    params: Partial<ExhibicionParams> = {}
  ): Promise<ExhibicionAnalisis> {
    try {
      const fullParams: ExhibicionParams = {
        costo_exhibicion: params.costo_exhibicion ?? 500,
        incremento_venta: params.incremento_venta ?? 0.5,
        dias_mes: params.dias_mes ?? 30,
      };

      // Get summary and ROI in parallel
      const [resumenResponse, roiResponse] = await Promise.all([
        this.getResumenExhibicion(fullParams),
        this.calcularROIExhibicion(fullParams),
      ]);

      // Calculate viability
      const viabilidad = this.calculateViabilidad(
        resumenResponse.resumen,
        fullParams
      );

      // Get top 10 stores
      const topStores = roiResponse.grouped_by_store
        .sort((a, b) => b.retorno_inversion_pesos - a.retorno_inversion_pesos)
        .slice(0, 10);

      return {
        resumen: resumenResponse.resumen,
        detalle_roi: roiResponse.items,
        viabilidad,
        top_stores: topStores,
        params: fullParams,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting complete analysis: ${(error as Error).message}`
      );
    }
  }

  /**
   * Calculate viability analysis
   */
  private calculateViabilidad(
    resumen: ExhibicionResumen,
    params: ExhibicionParams
  ): ExhibicionViabilidad {
    const retorno_neto = resumen.retorno_mensual_neto;
    const costo_total = resumen.costo_total_exhibicion;
    const rentabilidad_pct =
      costo_total > 0 ? ((retorno_neto - costo_total) / costo_total) * 100 : 0;

    // Es viable si el ROI promedio es > 1 (retorno > costo)
    const es_viable = resumen.roi_promedio_x > 1;

    return {
      es_viable,
      tiendas_viables: resumen.tiendas_viables,
      roi_promedio: resumen.roi_promedio_x,
      retorno_mensual_neto: retorno_neto,
      costo_total: costo_total,
      rentabilidad_pct,
    };
  }

  /**
   * Group ROI items by store
   */
  private groupROIByStore(items: ExhibicionROI[]): ExhibicionROIByStore[] {
    const storeMap = new Map<number, ExhibicionROI[]>();

    items.forEach((item) => {
      if (!storeMap.has(item.id_store)) {
        storeMap.set(item.id_store, []);
      }
      storeMap.get(item.id_store)!.push(item);
    });

    return Array.from(storeMap.entries())
      .map(([id_store, skus]) => {
        const total_unidades = skus.reduce(
          (sum, item) => sum + item.pedido_extraordinario_unidades,
          0
        );
        const total_valor_pedido = skus.reduce(
          (sum, item) => sum + item.valor_pedido_extraordinario,
          0
        );

        // Get the ROI (should be the same for all items in the store)
        const retorno_inversion_pesos = skus[0]?.retorno_inversion_pesos || 0;

        return {
          id_store,
          retorno_inversion_pesos,
          total_unidades,
          total_valor_pedido,
          skus,
        };
      })
      .sort((a, b) => b.retorno_inversion_pesos - a.retorno_inversion_pesos);
  }

  /**
   * Calculate ROI summary
   */
  private calculateROISummary(
    items: ExhibicionROI[],
    groupedByStore: ExhibicionROIByStore[]
  ) {
    const total_stores = groupedByStore.length;
    const total_skus = items.length;
    const total_unidades = items.reduce(
      (sum, item) => sum + item.pedido_extraordinario_unidades,
      0
    );
    const total_valor_pedido = items.reduce(
      (sum, item) => sum + item.valor_pedido_extraordinario,
      0
    );

    // Calculate average ROI across all stores
    const retorno_promedio =
      total_stores > 0
        ? groupedByStore.reduce(
            (sum, store) => sum + store.retorno_inversion_pesos,
            0
          ) / total_stores
        : 0;

    return {
      total_stores,
      total_skus,
      total_unidades,
      total_valor_pedido,
      retorno_promedio,
    };
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
   * Helper: Format number
   */
  private formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}

