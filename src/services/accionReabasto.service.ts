import { AccionReabastoRepository } from '@/repositories/accionReabasto.repository';
import {
  AccionReabastoSummaryResponse,
  AccionReabastoPorTiendaResponse,
  AccionReabastoDetalleResponse
} from '@/types/accionReabasto';

/**
 * Service for Acción #1: Reabasto Urgente
 * Business logic layer for urgent restocking actions
 */
export class AccionReabastoService {
  constructor(private repository: AccionReabastoRepository) {}

  /**
   * Get summary metrics for the restocking action
   * Returns total amount, total units, and number of impacted stores
   */
  async getSummary(): Promise<AccionReabastoSummaryResponse> {
    try {
      const data = await this.repository.getSummary();

      return {
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(
        `Service error getting reabasto summary: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get restocking details grouped by store
   * Returns units to order and amount needed per store
   */
  async getPorTienda(): Promise<AccionReabastoPorTiendaResponse> {
    try {
      const data = await this.repository.getPorTienda();

      return {
        data,
        total: data.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(
        `Service error getting reabasto por tienda: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get detailed restocking information by store and SKU
   * Returns complete details including product names and post-restocking inventory days
   */
  async getDetalle(): Promise<AccionReabastoDetalleResponse> {
    try {
      const data = await this.repository.getDetalle();

      return {
        data,
        total: data.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(
        `Service error getting reabasto detalle: ${(error as Error).message}`
      );
    }
  }
}

