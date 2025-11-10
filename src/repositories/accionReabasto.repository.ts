import { SupabaseClient } from '@supabase/supabase-js';
import {
  AccionReabastoSummary,
  AccionReabastoPorTienda,
  AccionReabastoDetalle
} from '@/types/accionReabasto';

/**
 * Repository for Acción #1: Reabasto Urgente
 * Handles data access for urgent restocking actions in HOT and Balanced stores
 */
export class AccionReabastoRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get summary metrics for restocking action
   * Returns total amount, total units, and number of impacted stores
   */
  async getSummary(): Promise<AccionReabastoSummary> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('detalle_accion_uno')
      .select('monto_necesario_pedido, unidades_a_pedir, id_store');

    if (error) {
      throw new Error(`Error fetching reabasto summary: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        monto_total: 0,
        unidades_totales: 0,
        tiendas_impactadas: 0
      };
    }

    // Calculate aggregations
    const monto_total = data.reduce((sum, item) => sum + (Number(item.monto_necesario_pedido) || 0), 0);
    const unidades_totales = data.reduce((sum, item) => sum + (Number(item.unidades_a_pedir) || 0), 0);
    const tiendas_impactadas = new Set(data.map(item => item.id_store)).size;

    return {
      monto_total,
      unidades_totales,
      tiendas_impactadas
    };
  }

  /**
   * Get restocking details grouped by store
   * Joins with core_cat_store to get store names
   */
  async getPorTienda(): Promise<AccionReabastoPorTienda[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('detalle_accion_uno')
      .select(`
        unidades_a_pedir,
        monto_necesario_pedido,
        core_cat_store!inner(store_name)
      `);

    if (error) {
      throw new Error(`Error fetching reabasto por tienda: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by store name and sum values
    const storeMap = new Map<string, { unidades: number; monto: number }>();

    data.forEach((item: any) => {
      const storeName = item.core_cat_store?.store_name || '';
      const existing = storeMap.get(storeName) || { unidades: 0, monto: 0 };
      
      storeMap.set(storeName, {
        unidades: existing.unidades + (Number(item.unidades_a_pedir) || 0),
        monto: existing.monto + (Number(item.monto_necesario_pedido) || 0)
      });
    });

    // Convert map to array
    return Array.from(storeMap.entries()).map(([store_name, values]) => ({
      store_name,
      unidades_a_pedir: values.unidades,
      monto_necesario_pedido: values.monto
    }));
  }

  /**
   * Get detailed restocking information by store and SKU
   * Joins with core_cat_store and core_cat_product for names
   */
  async getDetalle(): Promise<AccionReabastoDetalle[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('detalle_accion_uno')
      .select(`
        id_store,
        sku,
        unidades_a_pedir,
        monto_necesario_pedido,
        dias_inventario_post_reabasto,
        core_cat_store!inner(store_name),
        core_cat_product!inner(product_name)
      `);

    if (error) {
      throw new Error(`Error fetching reabasto detalle: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested structure to flat objects
    return data.map((item: any) => ({
      store_name: String(item.core_cat_store?.store_name || ''),
      product_name: String(item.core_cat_product?.product_name || ''),
      id_store: Number(item.id_store) || 0,
      sku: Number(item.sku) || 0,
      unidades_a_pedir: Number(item.unidades_a_pedir) || 0,
      monto_necesario_pedido: Number(item.monto_necesario_pedido) || 0,
      dias_inventario_post_reabasto: Number(item.dias_inventario_post_reabasto) || 0
    }));
  }
}

