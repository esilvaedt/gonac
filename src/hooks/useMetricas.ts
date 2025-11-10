import { useState, useCallback, useEffect } from 'react';
import {
  MetricasConsolidadasResponse,
  MetricasConsolidadasFormatted,
  KPICard,
} from '@/types/metricas';

/**
 * Hook options for fetching metrics
 */
interface UseMetricasOptions {
  format?: 'raw' | 'formatted' | 'cards';
  autoFetch?: boolean;
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

/**
 * Hook return type for raw metrics
 */
interface UseMetricasReturn {
  data: MetricasConsolidadasResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>; // Refresh materialized view
}

/**
 * Hook return type for formatted metrics
 */
interface UseMetricasFormattedReturn {
  data: MetricasConsolidadasFormatted | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook return type for KPI cards
 */
interface UseMetricasCardsReturn {
  cards: KPICard[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * React hook to fetch consolidated metrics (raw format)
 * 
 * @example
 * ```tsx
 * // Auto-fetch on mount
 * const { data, loading, error } = useMetricas({ autoFetch: true });
 * 
 * // Auto-refresh every 5 minutes
 * const { data, loading } = useMetricas({ 
 *   autoFetch: true, 
 *   refreshInterval: 5 * 60 * 1000 
 * });
 * 
 * // Manual fetch
 * const { data, loading, refetch } = useMetricas();
 * await refetch();
 * ```
 */
export function useMetricas(
  options: UseMetricasOptions = {}
): UseMetricasReturn {
  const { format = 'raw', autoFetch = false, refreshInterval } = options;

  const [data, setData] = useState<MetricasConsolidadasResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metricas?format=${format}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('useMetricas error:', err);
    } finally {
      setLoading(false);
    }
  }, [format]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/metricas', {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Failed to refresh materialized view');
        return;
      }

      // After refreshing, fetch the new data
      await fetchData();
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    }
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // Auto-refresh interval
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
    refresh,
  };
}

/**
 * React hook to fetch formatted consolidated metrics
 * 
 * @example
 * ```tsx
 * const { data, loading } = useMetricasFormatted({ autoFetch: true });
 * 
 * if (data) {
 *   console.log(data.ventas_totales_pesos_formatted); // "$15,000,000"
 *   console.log(data.crecimiento_formatted); // "8.50%"
 * }
 * ```
 */
export function useMetricasFormatted(
  options: Omit<UseMetricasOptions, 'format'> = {}
): UseMetricasFormattedReturn {
  const { autoFetch = false, refreshInterval } = options;

  const [data, setData] = useState<MetricasConsolidadasFormatted | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/metricas?format=formatted');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      // Extract the formatted data (without timestamp/source)
      const { timestamp, source, ...formattedData } = result;
      setData(formattedData as MetricasConsolidadasFormatted);
    } catch (err) {
      setError(err as Error);
      console.error('useMetricasFormatted error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/metricas', {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Failed to refresh materialized view');
        return;
      }

      await fetchData();
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    }
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

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
    refresh,
  };
}

/**
 * React hook to fetch metrics as KPI cards
 * 
 * @example
 * ```tsx
 * const { cards, loading } = useMetricasCards({ autoFetch: true });
 * 
 * return (
 *   <div className="kpi-grid">
 *     {cards?.map(card => (
 *       <KPICard
 *         key={card.id}
 *         label={card.label}
 *         value={card.formatted_value}
 *         trend={card.trend}
 *         icon={card.icon}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMetricasCards(
  options: Omit<UseMetricasOptions, 'format'> = {}
): UseMetricasCardsReturn {
  const { autoFetch = false, refreshInterval } = options;

  const [cards, setCards] = useState<KPICard[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/metricas?format=cards');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      setCards(result.cards);
    } catch (err) {
      setError(err as Error);
      console.error('useMetricasCards error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/metricas', {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Failed to refresh materialized view');
        return;
      }

      await fetchData();
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    }
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchData]);

  return {
    cards,
    loading,
    error,
    refetch: fetchData,
    refresh,
  };
}

