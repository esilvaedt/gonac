import { ValorizacionRepository } from '@/repositories/valorizacion.repository';
import { ValorizacionResponse, ValorizacionSummary, ValorizacionItem } from '@/types/valorizacion';

/**
 * Valorizacion Service
 * Contains business logic for valorizacion data
 */
export class ValorizacionService {
  constructor(private repository: ValorizacionRepository) {}

  /**
   * Get complete valorizacion data with metadata
   */
  async getValorizacion(): Promise<ValorizacionResponse> {
    try {
      // Try using the separate queries method (more reliable with standard Supabase)
      const data = await this.repository.getValorizacionDataSeparate();

      const totalTiendas = data.reduce((sum, item) => sum + item.tiendas, 0);
      const totalImpacto = data.reduce((sum, item) => sum + item.impacto, 0);

      return {
        data,
        timestamp: new Date().toISOString(),
        totalTiendas,
        totalImpacto,
      };
    } catch (error) {
      throw new Error(`Service error: ${(error as Error).message}`);
    }
  }

  /**
   * Get valorizacion data as a summary object
   */
  async getValorizacionSummary(): Promise<ValorizacionSummary> {
    const { data, totalTiendas, totalImpacto } = await this.getValorizacion();

    const agotado = data.find((item) => item.valorizacion === 'Agotado') || {
      tiendas: 0,
      impacto: 0,
    };
    const caducidad = data.find((item) => item.valorizacion === 'Caducidad') || {
      tiendas: 0,
      impacto: 0,
    };
    const sinVentas = data.find((item) => item.valorizacion === 'Sin Ventas') || {
      tiendas: 0,
      impacto: 0,
    };

    return {
      agotado: {
        tiendas: agotado.tiendas,
        impacto: agotado.impacto,
      },
      caducidad: {
        tiendas: caducidad.tiendas,
        impacto: caducidad.impacto,
      },
      sinVentas: {
        tiendas: sinVentas.tiendas,
        impacto: sinVentas.impacto,
      },
      total: {
        tiendas: totalTiendas,
        impacto: totalImpacto,
      },
    };
  }

  /**
   * Get valorizacion data for a specific type
   */
  async getValorizacionByType(
    type: 'Agotado' | 'Caducidad' | 'Sin Ventas'
  ): Promise<ValorizacionItem> {
    return this.repository.getValorizacionByType(type);
  }

  /**
   * Calculate percentage impact for each valorizacion type
   */
  async getValorizacionPercentages(): Promise<
    Array<ValorizacionItem & { percentage: number }>
  > {
    const { data, totalImpacto } = await this.getValorizacion();

    return data.map((item) => ({
      ...item,
      percentage: totalImpacto > 0 ? (item.impacto / totalImpacto) * 100 : 0,
    }));
  }

  /**
   * Get the most critical valorizacion type
   */
  async getMostCritical(): Promise<ValorizacionItem> {
    const { data } = await this.getValorizacion();
    
    return data.reduce((max, item) => 
      item.impacto > max.impacto ? item : max
    , data[0]);
  }

  /**
   * Format impacto as currency
   */
  formatImpacto(impacto: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(impacto);
  }
}

