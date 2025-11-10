import { useState, useEffect, useCallback } from 'react';
import {
  AccionReabastoSummaryResponse,
  AccionReabastoPorTiendaResponse,
  AccionReabastoDetalleResponse
} from '@/types/accionReabasto';

type FormatType = 'summary' | 'por-tienda' | 'detalle';

interface UseAccionReabastoOptions {
  format?: FormatType;
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAccionReabastoReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch Acción #1: Reabasto Urgente data
 * 
 * @example
 * ```tsx
 * // Get summary
 * const { data, loading, error } = useAccionReabasto({ format: 'summary' });
 * 
 * // Get details grouped by store
 * const { data } = useAccionReabasto({ format: 'por-tienda' });
 * 
 * // Get full details
 * const { data } = useAccionReabasto({ format: 'detalle' });
 * 
 * // Auto-refresh every 5 minutes
 * const { data } = useAccionReabasto({ 
 *   format: 'summary', 
 *   refreshInterval: 5 * 60 * 1000 
 * });
 * ```
 */
export function useAccionReabasto<T = AccionReabastoSummaryResponse>(
  options: UseAccionReabastoOptions = {}
): UseAccionReabastoReturn<T> {
  const {
    format = 'summary',
    autoFetch = true,
    refreshInterval,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (format !== 'summary') {
        params.append('format', format);
      }

      const response = await fetch(`/api/accion-reabasto?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result as T);
    } catch (err) {
      setError(err as Error);
      console.error('useAccionReabasto error:', err);
    } finally {
      setLoading(false);
    }
  }, [format]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for summary metrics
 * Returns total amount, total units, and impacted stores count
 */
export function useAccionReabastoSummary(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;

  return useAccionReabasto<AccionReabastoSummaryResponse>({
    format: 'summary',
    autoFetch
  });
}

/**
 * Hook for store-grouped data
 * Returns restocking details grouped by store
 */
export function useAccionReabastoPorTienda(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;

  return useAccionReabasto<AccionReabastoPorTiendaResponse>({
    format: 'por-tienda',
    autoFetch
  });
}

/**
 * Hook for detailed data
 * Returns complete restocking details by store and SKU
 */
export function useAccionReabastoDetalle(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;

  return useAccionReabasto<AccionReabastoDetalleResponse>({
    format: 'detalle',
    autoFetch
  });
}

