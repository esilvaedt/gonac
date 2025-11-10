import { useState, useCallback, useEffect } from 'react';
import { 
  PromocionResponse, 
  CalcularPromocionRequest,
  TopCategoriasExpiracionResponse,
  CategoriaConCaducidad,
  PromocionItem,
  CategoryStatsResponse
} from '@/types/descuento';

interface UseDescuentoOptions {
  descuento?: number;
  items?: PromocionItem[];
  autoFetch?: boolean;
}

interface UseDescuentoReturn {
  data: PromocionResponse | null;
  loading: boolean;
  error: Error | null;
  calcular: (params: CalcularPromocionRequest) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * React hook to calculate discount promotion metrics
 * 
 * @example
 * ```tsx
 * const { data, loading, calcular } = useDescuento();
 * 
 * // Calculate for 41% discount with multiple items
 * await calcular({
 *   descuento: 0.41,
 *   items: [
 *     { elasticidad: 1.5, categoria: 'PAPAS' },
 *     { elasticidad: 1.8, categoria: 'TOTOPOS' }
 *   ]
 * });
 * 
 * // Access results dynamically
 * console.log(data.items['PAPAS'].costo_promocion);
 * console.log(data.items['TOTOPOS'].valor_capturar);
 * ```
 */
export function useDescuento(options: UseDescuentoOptions = {}): UseDescuentoReturn {
  const {
    descuento,
    items,
    autoFetch = false,
  } = options;

  const [data, setData] = useState<PromocionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const calcular = useCallback(async (params: CalcularPromocionRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Always use POST with items array
      const response = await fetch('/api/descuento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to calculate discount');
      }

      setData(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('useDescuento error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (descuento && items) {
      await calcular({
        descuento,
        items,
      });
    }
  }, [descuento, items, calcular]);

  // Auto-fetch on mount if configured
  useEffect(() => {
    if (autoFetch && descuento) {
      refetch();
    }
  }, [autoFetch, refetch, descuento]);

  return {
    data,
    loading,
    error,
    calcular,
    refetch,
  };
}

/**
 * Hook for comparing multiple discount scenarios
 */
export function useCompararDescuentos() {
  const [data, setData] = useState<PromocionResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const comparar = useCallback(
    async (
      descuentos: number[],
      items: PromocionItem[]
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/descuento/comparar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descuentos,
            items,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to compare discounts');
        }

        setData(result.data);
      } catch (err) {
        setError(err as Error);
        console.error('useCompararDescuentos error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    comparar,
  };
}

/**
 * Hook for getting top categories with close-to-expiration products
 */
export function useCategoriasConCaducidad(options: { limit?: number; autoFetch?: boolean } = {}) {
  const { limit = 2, autoFetch = true } = options;

  const [data, setData] = useState<TopCategoriasExpiracionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      const response = await fetch(`/api/descuento/categorias-caducidad?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch expiration categories');
      }

      setData(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('useCategoriasConCaducidad error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

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
 * Hook options for category stats
 */
interface UseCategoryStatsOptions {
  categories?: string[];
  autoFetch?: boolean;
}

/**
 * Hook return type for category stats
 */
interface UseCategoryStatsReturn {
  data: CategoryStatsResponse | null;
  loading: boolean;
  error: Error | null;
  fetchStats: (categories: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch category statistics (unique products and stores)
 * 
 * @example
 * ```tsx
 * // Auto-fetch on mount
 * const { data, loading } = useCategoryStats({
 *   categories: ['Papas', 'Totopos'],
 *   autoFetch: true
 * });
 * 
 * // Manual fetch
 * const { data, loading, fetchStats } = useCategoryStats();
 * await fetchStats(['Papas', 'Mix', 'Galletas']);
 * 
 * // Access results
 * data?.stats.forEach(stat => {
 *   console.log(`${stat.category}: ${stat.unique_products} products, ${stat.unique_stores} stores`);
 * });
 * ```
 */
export function useCategoryStats(
  options: UseCategoryStatsOptions = {}
): UseCategoryStatsReturn {
  const { categories, autoFetch = false } = options;

  const [data, setData] = useState<CategoryStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async (categoriesToFetch: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/descuento/category-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: categoriesToFetch }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch category stats');
      }

      setData(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('useCategoryStats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (categories && categories.length > 0) {
      await fetchStats(categories);
    }
  }, [categories, fetchStats]);

  useEffect(() => {
    if (autoFetch && categories && categories.length > 0) {
      fetchStats(categories);
    }
  }, [autoFetch, categories, fetchStats]);

  return {
    data,
    loading,
    error,
    fetchStats,
    refetch,
  };
}

