/**
 * Exhibiciones Adicionales (Additional Exhibitions) Types
 * Types for exhibition ROI calculations and summaries
 */

/**
 * Exhibition summary from gonac.fn_obtener_resumen_exhibicion
 */
export interface ExhibicionResumen {
  tiendas_viables: number;                  // Number of viable stores
  retorno_mensual_neto: number;             // Net monthly return
  costo_total_exhibicion: number;           // Total exhibition cost
  unidades_totales_pedido: number;          // Total order units
  valor_total_pedido: number;               // Total order value
  roi_promedio_x: number;                   // Average ROI multiplier
}

/**
 * Formatted exhibition summary
 */
export interface ExhibicionResumenFormatted extends ExhibicionResumen {
  retorno_mensual_neto_formatted: string;
  costo_total_exhibicion_formatted: string;
  unidades_totales_pedido_formatted: string;
  valor_total_pedido_formatted: string;
  roi_promedio_formatted: string;           // e.g., "191.65x"
}

/**
 * Exhibition ROI calculation result from gonac.calcular_roi_exhibicion
 */
export interface ExhibicionROI {
  id_store: number;
  sku: string;
  retorno_inversion_pesos: number;          // ROI in pesos
  venta_promedio_diaria: number;            // Average daily sales
  inventario_final: number;                 // Final inventory
  pedido_extraordinario_unidades: number;   // Extraordinary order units
  valor_pedido_extraordinario: number;      // Extraordinary order value
}

/**
 * Formatted exhibition ROI
 */
export interface ExhibicionROIFormatted extends ExhibicionROI {
  retorno_inversion_pesos_formatted: string;
  venta_promedio_diaria_formatted: string;
  valor_pedido_extraordinario_formatted: string;
}

/**
 * Exhibition ROI grouped by store
 */
export interface ExhibicionROIByStore {
  id_store: number;
  retorno_inversion_pesos: number;
  total_unidades: number;
  total_valor_pedido: number;
  skus: ExhibicionROI[];
}

/**
 * Exhibition parameters for ROI calculation
 */
export interface ExhibicionParams {
  costo_exhibicion: number;     // Exhibition cost (default: 500)
  incremento_venta: number;     // Sales increment (default: 0.5 = 50%)
  dias_mes: number;             // Days in month (default: 30)
}

/**
 * Exhibition ROI response
 */
export interface ExhibicionROIResponse {
  items: ExhibicionROI[];
  grouped_by_store: ExhibicionROIByStore[];
  summary: {
    total_stores: number;
    total_skus: number;
    total_unidades: number;
    total_valor_pedido: number;
    retorno_promedio: number;
  };
  params: ExhibicionParams;
  timestamp: string;
}

/**
 * Exhibition summary response
 */
export interface ExhibicionResumenResponse {
  resumen: ExhibicionResumen;
  params: {
    dias_mes: number;
  };
  timestamp: string;
}

/**
 * Exhibition viability analysis
 */
export interface ExhibicionViabilidad {
  es_viable: boolean;
  tiendas_viables: number;
  roi_promedio: number;
  retorno_mensual_neto: number;
  costo_total: number;
  rentabilidad_pct: number; // (retorno - costo) / costo * 100
}

/**
 * Complete exhibition analysis
 */
export interface ExhibicionAnalisis {
  resumen: ExhibicionResumen;
  detalle_roi: ExhibicionROI[];
  viabilidad: ExhibicionViabilidad;
  top_stores: ExhibicionROIByStore[];
  params: ExhibicionParams;
  timestamp: string;
}

/**
 * API Response wrapper
 */
export interface ExhibicionApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

