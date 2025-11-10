import { useState, useCallback, useEffect } from 'react';
import {
  ExhibicionResumen,
  ExhibicionResumenResponse,
  ExhibicionResumenFormatted,
  ExhibicionROIResponse,
  ExhibicionROIFormatted,
  ExhibicionROI,
  ExhibicionParams,
  ExhibicionAnalisis,
  ExhibicionROIByStore,
} from '@/types/exhibiciones';

/**
 * Hook options for exhibition summary
 */
interface UseExhibicionResumenOptions {
  dias_mes?: number;
  costo_exhibicion?: number;
  incremento_venta?: number;
  format?: 'raw' | 'formatted';
  autoFetch?: boolean;
}

/**
 * Hook options for exhibition ROI
 */
interface UseExhibicionROIOptions {
  costo_exhibicion?: number;
  incremento_venta?: number;
  dias_mes?: number;
  id_store?: number;
  limit?: number;
  format?: 'raw' | 'formatted';
  autoFetch?: boolean;
}

/**
 * Hook return type for exhibition summary
 */
interface UseExhibicionResumenReturn {
  data: ExhibicionResumenResponse | ExhibicionResumenFormatted | null;
  loading: boolean;
  error: Error | null;
  refetch: (params?: Partial<UseExhibicionResumenOptions>) => Promise<void>;
}

/**
 * Hook return type for exhibition ROI
 */
interface UseExhibicionROIReturn {
  data: ExhibicionROIResponse | ExhibicionROIFormatted[] | ExhibicionROI[] | null;
  loading: boolean;
  error: Error | null;
  calcular: (params?: Partial<ExhibicionParams>) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook return type for complete analysis
 */
interface UseExhibicionAnalisisReturn {
  data: ExhibicionAnalisis | null;
  loading: boolean;
  error: Error | null;
  calcular: (params?: Partial<ExhibicionParams>) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch exhibition summary
 * 
 * @example
 * ```tsx
 * // Get summary with default 30 days
 * const { data, loading } = useExhibicionResumen({ autoFetch: true });
 * 
 * // Get formatted summary
 * const { data } = useExhibicionResumen({
 *   format: 'formatted',
 *   autoFetch: true
 * });
 * 
 * // Custom days
 * const { data } = useExhibicionResumen({
 *   dias_mes: 15,
 *   autoFetch: true
 * });
 * ```
 */
export function useExhibicionResumen(
  options: UseExhibicionResumenOptions = {}
): UseExhibicionResumenReturn {
  const { 
    dias_mes: initialDiasMes = 30, 
    costo_exhibicion: initialCosto = 500,
    incremento_venta: initialIncremento = 0.5,
    format = 'raw', 
    autoFetch = false 
  } = options;

  const [data, setData] = useState<
    ExhibicionResumenResponse | ExhibicionResumenFormatted | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep track of current parameters
  const [currentParams, setCurrentParams] = useState({
    dias_mes: initialDiasMes,
    costo_exhibicion: initialCosto,
    incremento_venta: initialIncremento,
  });

  const fetchData = useCallback(async (overrideParams?: Partial<UseExhibicionResumenOptions>) => {
    try {
      setLoading(true);
      setError(null);

      // Merge current params with any overrides
      const params = {
        ...currentParams,
        ...overrideParams,
      };

      // Update current params if overrides provided
      if (overrideParams) {
        setCurrentParams(prev => ({ ...prev, ...overrideParams }));
      }

      const queryParams = new URLSearchParams({
        type: 'resumen',
        format,
        costo_exhibicion: params.costo_exhibicion.toString(),
        incremento_venta: params.incremento_venta.toString(),
        dias_mes: params.dias_mes.toString(),
      });

      const response = await fetch(`/api/exhibiciones?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch exhibition summary');
      }

      if (format === 'formatted') {
        setData(result.data);
      } else {
        setData(result as ExhibicionResumenResponse);
      }
    } catch (err) {
      setError(err as Error);
      console.error('useExhibicionResumen error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentParams, format]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * React hook to calculate exhibition ROI
 * 
 * @example
 * ```tsx
 * // Calculate with default parameters
 * const { data, loading, calcular } = useExhibicionROI();
 * 
 * useEffect(() => {
 *   calcular();
 * }, []);
 * 
 * // Auto-fetch with custom parameters
 * const { data } = useExhibicionROI({
 *   costo_exhibicion: 500,
 *   incremento_venta: 0.5,
 *   dias_mes: 30,
 *   autoFetch: true
 * });
 * 
 * // Get ROI for specific store
 * const { data } = useExhibicionROI({
 *   id_store: 1010,
 *   autoFetch: true
 * });
 * 
 * // Get top 10 stores
 * const { data } = useExhibicionROI({
 *   limit: 10,
 *   autoFetch: true
 * });
 * ```
 */
export function useExhibicionROI(
  options: UseExhibicionROIOptions = {}
): UseExhibicionROIReturn {
  const {
    costo_exhibicion = 500,
    incremento_venta = 0.5,
    dias_mes = 30,
    id_store,
    limit,
    format = 'raw',
    autoFetch = false,
  } = options;

  const [data, setData] = useState<
    ExhibicionROIResponse | ExhibicionROIFormatted[] | ExhibicionROI[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const calcular = useCallback(
    async (customParams?: Partial<ExhibicionParams>) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          type: 'roi',
          format,
          costo_exhibicion: (
            customParams?.costo_exhibicion ?? costo_exhibicion
          ).toString(),
          incremento_venta: (
            customParams?.incremento_venta ?? incremento_venta
          ).toString(),
          dias_mes: (customParams?.dias_mes ?? dias_mes).toString(),
        });

        if (id_store) {
          params.append('id_store', id_store.toString());
        }

        if (limit) {
          params.append('limit', limit.toString());
        }

        const response = await fetch(`/api/exhibiciones?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to calculate exhibition ROI');
        }

        // Handle different response types
        if (id_store) {
          setData(result.items); // Array of ROI for specific store
        } else if (limit) {
          setData(result.top_stores); // Array of top stores
        } else if (format === 'formatted') {
          setData(result.items); // Formatted array
        } else {
          setData(result as ExhibicionROIResponse); // Full response
        }
      } catch (err) {
        setError(err as Error);
        console.error('useExhibicionROI error:', err);
      } finally {
        setLoading(false);
      }
    },
    [costo_exhibicion, incremento_venta, dias_mes, id_store, limit, format]
  );

  useEffect(() => {
    if (autoFetch) {
      calcular();
    }
  }, [autoFetch, calcular]);

  return {
    data,
    loading,
    error,
    calcular,
    refetch: calcular,
  };
}

/**
 * React hook to get complete exhibition analysis
 * 
 * @example
 * ```tsx
 * const { data, loading, calcular } = useExhibicionAnalisis({
 *   autoFetch: true
 * });
 * 
 * // Access all analysis data
 * if (data) {
 *   console.log('Summary:', data.resumen);
 *   console.log('Viability:', data.viabilidad);
 *   console.log('Top stores:', data.top_stores);
 *   console.log('ROI details:', data.detalle_roi);
 * }
 * ```
 */
export function useExhibicionAnalisis(
  options: Omit<UseExhibicionROIOptions, 'id_store' | 'limit'> = {}
): UseExhibicionAnalisisReturn {
  const {
    costo_exhibicion = 500,
    incremento_venta = 0.5,
    dias_mes = 30,
    autoFetch = false,
  } = options;

  const [data, setData] = useState<ExhibicionAnalisis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const calcular = useCallback(
    async (customParams?: Partial<ExhibicionParams>) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          type: 'analisis',
          costo_exhibicion: (
            customParams?.costo_exhibicion ?? costo_exhibicion
          ).toString(),
          incremento_venta: (
            customParams?.incremento_venta ?? incremento_venta
          ).toString(),
          dias_mes: (customParams?.dias_mes ?? dias_mes).toString(),
        });

        const response = await fetch(`/api/exhibiciones?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to get exhibition analysis');
        }

        setData(result as ExhibicionAnalisis);
      } catch (err) {
        setError(err as Error);
        console.error('useExhibicionAnalisis error:', err);
      } finally {
        setLoading(false);
      }
    },
    [costo_exhibicion, incremento_venta, dias_mes]
  );

  useEffect(() => {
    if (autoFetch) {
      calcular();
    }
  }, [autoFetch, calcular]);

  return {
    data,
    loading,
    error,
    calcular,
    refetch: calcular,
  };
}

/**
 * React hook to get top stores by ROI
 * 
 * @example
 * ```tsx
 * const { stores, loading } = useTopStoresByROI({
 *   limit: 5,
 *   autoFetch: true
 * });
 * ```
 */
export function useTopStoresByROI(
  options: UseExhibicionROIOptions & { limit?: number } = {}
): {
  stores: ExhibicionROIByStore[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { limit = 10, autoFetch = true, ...restOptions } = options;

  const { data, loading, error, refetch } = useExhibicionROI({
    ...restOptions,
    limit,
    autoFetch,
  });

  return {
    stores: data as ExhibicionROIByStore[] | null,
    loading,
    error,
    refetch,
  };
}

