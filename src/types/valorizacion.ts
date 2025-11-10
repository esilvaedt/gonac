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

