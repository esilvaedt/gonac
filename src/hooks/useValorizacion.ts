import { useState, useEffect, useCallback } from 'react';
import { ValorizacionResponse, ValorizacionSummary, ValorizacionItem } from '@/types/valorizacion';

type FormatType = 'default' | 'summary' | 'percentages' | 'critical';

interface UseValorizacionOptions {
  format?: FormatType;
  type?: 'Agotado' | 'Caducidad' | 'Sin Ventas';
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseValorizacionReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch valorizacion data
 * 
 * @example
 * ```tsx
 * // Default usage
 * const { data, loading, error } = useValorizacion();
 * 
 * // Get summary format
 * const { data, loading } = useValorizacion({ format: 'summary' });
 * 
 * // Get specific type
 * const { data } = useValorizacion({ type: 'Agotado' });
 * 
 * // Auto-refresh every 5 minutes
 * const { data } = useValorizacion({ refreshInterval: 5 * 60 * 1000 });
 * ```
 */
export function useValorizacion<T = ValorizacionResponse>(
  options: UseValorizacionOptions = {}
): UseValorizacionReturn<T> {
  const {
    format = 'default',
    type,
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
      if (format !== 'default') {
        params.append('format', format);
      }
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`/api/valorizacion?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('useValorizacion error:', err);
    } finally {
      setLoading(false);
    }
  }, [format, type]);

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
    refetch: fetchData,
  };
}

/**
 * Hook specifically for summary data
 */
export function useValorizacionSummary() {
  return useValorizacion<ValorizacionSummary>({ format: 'summary' });
}

/**
 * Hook specifically for percentages
 */
export function useValorizacionPercentages() {
  return useValorizacion<Array<ValorizacionItem & { percentage: number }>>({
    format: 'percentages',
  });
}

/**
 * Hook for the most critical valorizacion
 */
export function useValorizacionCritical() {
  return useValorizacion<ValorizacionItem>({ format: 'critical' });
}

