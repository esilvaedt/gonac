/**
 * Mapper functions for Tiendas data transformations
 */

import type { 
  RiskLevel, 
  SegmentType, 
  DetailRecord 
} from '@/types/tiendas.types';
import { 
  RISK_COLORS, 
  SEGMENT_COLORS, 
  OPPORTUNITY_COLORS,
  SEGMENT_TITLES,
  OPPORTUNITY_DESCRIPTIONS 
} from '@/constants/tiendas.constants';

export const getRiskLevel = (
  segment: string, 
  diasInventario: number
): RiskLevel => {
  const normalized = segment.toLowerCase();
  
  if (normalized === 'criticas' || normalized === 'críticas') {
    return 'Crítico';
  }
  if (normalized === 'hot' && diasInventario < 30) {
    return 'Crítico';
  }
  if (normalized === 'slow' && diasInventario > 60) {
    return 'Alto';
  }
  return 'Medio';
};

export const getBadgeColor = (risk: RiskLevel): string => {
  return RISK_COLORS[risk] || 'bg-gray-500 text-white';
};

export const getSegmentColor = (segment: string): string => {
  const normalized = segment.toLowerCase() as SegmentType;
  return SEGMENT_COLORS[normalized] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

export const getOportunidadRiskLevel = (type: string): RiskLevel => {
  switch (type) {
    case 'agotado':
      return 'Crítico';
    case 'caducidad':
      return 'Alto';
    case 'sinVenta':
      return 'Medio';
    default:
      return 'Medio';
  }
};

export const getOportunidadTitle = (type: string): string => {
  const titles: Record<string, string> = {
    agotado: 'Agotado',
    caducidad: 'Caducidad',
    sinVenta: 'Sin Venta',
  };
  return titles[type] || type;
};

export const getOportunidadDescription = (type: string): string => {
  return OPPORTUNITY_DESCRIPTIONS[type] || '';
};

export const getOportunidadColor = (type: string): string => {
  return OPPORTUNITY_COLORS[type] || 'text-gray-600 dark:text-gray-400';
};

export const getSegmentTitle = (segment: string): string => {
  const normalized = segment.toLowerCase();
  return SEGMENT_TITLES[normalized] || segment;
};

export const getSegmentSubtitle = (segment: string): string => {
  const normalized = segment.toLowerCase();
  const subtitles: Record<string, string> = {
    hot: 'Hot',
    slow: 'Slow',
    criticas: 'Críticas',
    críticas: 'Críticas',
    balanceadas: 'Balanceadas',
    balanceada: 'Balanceadas',
  };
  return subtitles[normalized] || segment;
};

export const getImpactoColor = (segment: string): string => {
  const normalized = segment.toLowerCase();
  const colors: Record<string, string> = {
    hot: 'text-red-600 dark:text-red-400',
    slow: 'text-orange-600 dark:text-orange-400',
    criticas: 'text-purple-600 dark:text-purple-400',
    críticas: 'text-purple-600 dark:text-purple-400',
  };
  return colors[normalized] || 'text-green-600 dark:text-green-400';
};

// Data transformation functions
interface ApiResponse {
  data?: unknown[];
}

interface AgotadoItem {
  store_name: string;
  product_name: string;
  dias_inventario: number;
  segment?: string;
  impacto: number;
  detectado: string;
}

export const transformAgotadoData = (response: ApiResponse): DetailRecord[] => {
  if (!response?.data || !Array.isArray(response.data)) return [];
  
  return response.data.map((item: unknown, index: number) => {
    const agotadoItem = item as AgotadoItem;
    return {
      id: `agotado-${index}`,
      tienda: agotadoItem.store_name,
      sku: agotadoItem.product_name,
      diasInventario: agotadoItem.dias_inventario,
      segmentoTienda: agotadoItem.segment?.toLowerCase(),
      impactoEstimado: agotadoItem.impacto,
      fechaDeteccion: agotadoItem.detectado,
    };
  });
};

interface CaducidadItem {
  store_name: string;
  product_name: string;
  inventario_remanente: number;
  fecha_caducidad: string;
  segment?: string;
  impacto: number;
  detectado: string;
}

export const transformCaducidadData = (response: ApiResponse): DetailRecord[] => {
  if (!response?.data || !Array.isArray(response.data)) return [];
  
  return response.data.map((item: unknown, index: number) => {
    const caducidadItem = item as CaducidadItem;
    return {
      id: `caducidad-${index}`,
      tienda: caducidadItem.store_name,
      sku: caducidadItem.product_name,
      inventarioRemanente: caducidadItem.inventario_remanente,
      fechaCaducidad: caducidadItem.fecha_caducidad,
      segmentoTienda: caducidadItem.segment?.toLowerCase(),
      impactoEstimado: caducidadItem.impacto,
      fechaDeteccion: caducidadItem.detectado,
    };
  });
};

interface SinVentaItem {
  store_name: string;
  product_name: string;
  impacto: number;
}

export const transformSinVentasData = (response: ApiResponse): DetailRecord[] => {
  if (!response?.data || !Array.isArray(response.data)) return [];
  
  return response.data.map((item: unknown, index: number) => {
    const sinVentaItem = item as SinVentaItem;
    return {
      id: `sinventa-${index}`,
      tienda: sinVentaItem.store_name,
      sku: sinVentaItem.product_name,
      impactoEstimado: sinVentaItem.impacto,
    };
  });
};

