import { useState, useCallback, useEffect } from 'react';
import {
  SegmentacionResponse,
  SegmentacionFormattedResponse,
  SegmentacionMetrics,
  SegmentCard,
} from '@/types/segmentacion';

/**
 * Hook options for segmentation metrics
 */
interface UseSegmentacionOptions {
  format?: 'raw' | 'formatted' | 'cards' | 'summary' | 'comparison';
  segment?: string; // Fetch specific segment
  segments?: string[]; // Fetch multiple segments
  limit?: number; // Top N segments
  autoFetch?: boolean;
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

/**
 * Hook return type for segmentation metrics
 */
interface UseSegmentacionReturn {
  data: SegmentacionResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>; // Refresh materialized view
}

/**
 * Hook return type for formatted metrics
 */
interface UseSegmentacionFormattedReturn {
  data: SegmentacionFormattedResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook return type for segment cards
 */
interface UseSegmentacionCardsReturn {
  cards: SegmentCard[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook return type for single segment
 */
interface UseSegmentReturn {
  data: SegmentacionMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch segmentation metrics
 * 
 * @example
 * ```tsx
 * // Get all segments
 * const { data, loading } = useSegmentacion({ autoFetch: true });
 * 
 * // Get top 3 segments
 * const { data } = useSegmentacion({ limit: 3, autoFetch: true });
 * 
 * // Auto-refresh every 5 minutes
 * const { data } = useSegmentacion({
 *   autoFetch: true,
 *   refreshInterval: 5 * 60 * 1000
 * });
 * ```
 */
export function useSegmentacion(
  options: UseSegmentacionOptions = {}
): UseSegmentacionReturn {
  const {
    format = 'raw',
    limit,
    autoFetch = false,
    refreshInterval,
  } = options;

  const [data, setData] = useState<SegmentacionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/segmentacion?format=${format}`;
      if (limit) {
        url += `&limit=${limit}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch segmentation metrics');
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('useSegmentacion error:', err);
    } finally {
      setLoading(false);
    }
  }, [format, limit]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/segmentacion', {
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
 * React hook to fetch formatted segmentation metrics
 * 
 * @example
 * ```tsx
 * const { data, loading } = useSegmentacionFormatted({ autoFetch: true });
 * 
 * data?.segments.forEach(segment => {
 *   console.log(segment.ventas_valor_formatted); // "$5,000,000"
 *   console.log(segment.contribucion_porcentaje_formatted); // "35.20%"
 * });
 * ```
 */
export function useSegmentacionFormatted(
  options: Omit<UseSegmentacionOptions, 'format'> = {}
): UseSegmentacionFormattedReturn {
  const { autoFetch = false, refreshInterval, limit } = options;

  const [data, setData] = useState<SegmentacionFormattedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/segmentacion?format=formatted';
      if (limit) {
        url += `&limit=${limit}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch segmentation metrics');
      }

      setData(result as SegmentacionFormattedResponse);
    } catch (err) {
      setError(err as Error);
      console.error('useSegmentacionFormatted error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/segmentacion', {
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
 * React hook to fetch segment cards for dashboard
 * 
 * @example
 * ```tsx
 * const { cards, loading } = useSegmentacionCards({ autoFetch: true });
 * 
 * return (
 *   <div className="segment-grid">
 *     {cards?.map(card => (
 *       <SegmentCard
 *         key={card.segment}
 *         segment={card.segment}
 *         ventas={card.ventas_valor}
 *         contribucion={card.contribucion}
 *         performance={card.performance}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSegmentacionCards(
  options: Omit<UseSegmentacionOptions, 'format'> = {}
): UseSegmentacionCardsReturn {
  const { autoFetch = false, refreshInterval } = options;

  const [cards, setCards] = useState<SegmentCard[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/segmentacion?format=cards');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch segment cards');
      }

      setCards(result.cards);
    } catch (err) {
      setError(err as Error);
      console.error('useSegmentacionCards error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/segmentacion', {
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

/**
 * React hook to fetch a specific segment's metrics
 * 
 * @example
 * ```tsx
 * const { data, loading } = useSegment('Slow', { autoFetch: true });
 * 
 * if (data) {
 *   console.log(`Segment: ${data.segment}`);
 *   console.log(`Ventas: ${data.ventas_valor}`);
 *   console.log(`Tiendas: ${data.num_tiendas_segmento}`);
 * }
 * ```
 */
export function useSegment(
  segment: string,
  options: { autoFetch?: boolean } = {}
): UseSegmentReturn {
  const { autoFetch = false } = options;

  const [data, setData] = useState<SegmentacionMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!segment) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/segmentacion?segment=${encodeURIComponent(segment)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch segment data');
      }

      setData(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('useSegment error:', err);
    } finally {
      setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * React hook to fetch multiple segments
 * 
 * @example
 * ```tsx
 * const { data, loading } = useMultipleSegments(['Slow', 'Dead'], { autoFetch: true });
 * ```
 */
export function useMultipleSegments(
  segments: string[],
  options: { autoFetch?: boolean } = {}
): UseSegmentReturn {
  const { autoFetch = false } = options;

  const [data, setData] = useState<SegmentacionMetrics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!segments || segments.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const segmentsParam = segments.join(',');
      const response = await fetch(`/api/segmentacion?segments=${encodeURIComponent(segmentsParam)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch segments data');
      }

      setData(result.segments);
    } catch (err) {
      setError(err as Error);
      console.error('useMultipleSegments error:', err);
    } finally {
      setLoading(false);
    }
  }, [segments]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data: data as any,
    loading,
    error,
    refetch: fetchData,
  };
}

