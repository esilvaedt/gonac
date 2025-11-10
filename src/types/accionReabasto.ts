/**
 * Types for Acción #1: Reabasto Urgente (Tiendas HOT y Balanceadas)
 * 
 * This module defines TypeScript interfaces for the urgent restocking action
 * which targets HOT and Balanced stores with low inventory levels.
 */

/**
 * Summary metrics for Acción #1
 */
export interface AccionReabastoSummary {
  monto_total: number;
  unidades_totales: number;
  tiendas_impactadas: number;
}

/**
 * Response for summary endpoint
 */
export interface AccionReabastoSummaryResponse {
  data: AccionReabastoSummary;
  timestamp: string;
}

/**
 * Store-level details for restocking action
 */
export interface AccionReabastoPorTienda {
  store_name: string;
  unidades_a_pedir: number;
  monto_necesario_pedido: number;
}

/**
 * Response for store-grouped endpoint
 */
export interface AccionReabastoPorTiendaResponse {
  data: AccionReabastoPorTienda[];
  total: number;
  timestamp: string;
}

/**
 * Detailed record for restocking action (store + SKU level)
 */
export interface AccionReabastoDetalle {
  store_name: string;
  product_name: string;
  id_store: number;
  sku: number;
  unidades_a_pedir: number;
  monto_necesario_pedido: number;
  dias_inventario_post_reabasto: number;
}

/**
 * Response for detailed endpoint
 */
export interface AccionReabastoDetalleResponse {
  data: AccionReabastoDetalle[];
  total: number;
  timestamp: string;
}

