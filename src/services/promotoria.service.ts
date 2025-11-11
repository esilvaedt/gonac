import { PromotoriaRepository, PromotoriaSummary, PromotoriaTienda, PromotoriaProduct } from '@/repositories/promotoria.repository';

/**
 * API Response wrapper interfaces
 */
export interface PromotoriaSummaryResponse {
  success: boolean;
  data: PromotoriaSummary;
  timestamp: string;
}

export interface PromotoriaTiendaResponse {
  success: boolean;
  data: PromotoriaTienda;
  timestamp: string;
}

export interface PromotoriaProductsResponse {
  success: boolean;
  data: PromotoriaProduct[];
  total: number;
  timestamp: string;
}

/**
 * Promotoria Service
 * Business logic layer for promotoria operations
 */
export class PromotoriaService {
  constructor(private repository: PromotoriaRepository) {}

  /**
   * Get global promotoria summary
   */
  async getSummary(): Promise<PromotoriaSummaryResponse> {
    try {
      const data = await this.repository.getSummary();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting promotoria summary: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get single store with highest risk
   */
  async getTiendaTopRiesgo(): Promise<PromotoriaTiendaResponse> {
    try {
      const data = await this.repository.getTiendaTopRiesgo();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting promotoria tienda top riesgo: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get top products without sales for a specific store (highest risk)
   * 
   * @param id_store - Store ID to filter products
   * @param limit - Number of products to return (default: 3)
   */
  async getProductsSinVentaByStore(id_store: number, limit: number = 3): Promise<PromotoriaProductsResponse> {
    try {
      const data = await this.repository.getProductsSinVentaByStore(id_store, limit);
      return {
        success: true,
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Service error getting products sin venta by store: ${(error as Error).message}`
      );
    }
  }
}

