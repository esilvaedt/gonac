/**
 * Valorizacion Types
 * Types for risk valorization data (Agotado, Caducidad, Sin Ventas)
 */

export interface ValorizacionItem {
  valorizacion: 'Agotado' | 'Caducidad' | 'Sin Ventas';
  tiendas: number;
  impacto: number;
}

export interface ValorizacionResponse {
  data: ValorizacionItem[];
  timestamp: string;
  totalTiendas: number;
  totalImpacto: number;
}

export interface ValorizacionSummary {
  agotado: {
    tiendas: number;
    impacto: number;
  };
  caducidad: {
    tiendas: number;
    impacto: number;
  };
  sinVentas: {
    tiendas: number;
    impacto: number;
  };
  total: {
    tiendas: number;
    impacto: number;
  };
}

/**
 * Detail record for Agotado opportunities
 */
export interface AgotadoDetalle {
  segment: string;
  store_name: string;
  product_name: string;
  dias_inventario: number;
  impacto: number;
  detectado: string;
}

/**
 * Response for Agotado details
 */
export interface AgotadoDetalleResponse {
  data: AgotadoDetalle[];
  total: number;
  timestamp: string;
}

/**
 * Detail record for Caducidad opportunities
 */
export interface CaducidadDetalle {
  segment: string;
  store_name: string;
  product_name: string;
  fecha_caducidad: string;
  inventario_remanente: number;
  impacto: number;
  detectado: string;
}

/**
 * Response for Caducidad details
 */
export interface CaducidadDetalleResponse {
  data: CaducidadDetalle[];
  total: number;
  timestamp: string;
}

/**
 * Detail record for Sin Ventas opportunities
 */
export interface SinVentasDetalle {
  store_name: string;
  product_name: string;
  impacto: number;
}

/**
 * Response for Sin Ventas details
 */
export interface SinVentasDetalleResponse {
  data: SinVentasDetalle[];
  total: number;
  timestamp: string;
}

