import { useState, useEffect, useCallback } from 'react';
import {
  PromotoriaSummaryResponse,
  PromotoriaTiendaResponse,
  PromotoriaProductsResponse,
} from '@/services/promotoria.service';

interface UsePromotoriaOptions {
  autoFetch?: boolean;
  limit?: number;
}

interface UsePromotoriaReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching promotoria summary (tiendas_a_visitar, riesgo_total)
 */
export function usePromotoriaSummary(
  options: UsePromotoriaOptions = {}
): UsePromotoriaReturn<PromotoriaSummaryResponse> {
  const { autoFetch = true } = options;

  const [data, setData] = useState<PromotoriaSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/promotoria/summary');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch promotoria summary');
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('usePromotoriaSummary error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
 * Hook for fetching single store with highest risk
 */
export function usePromotoriaTienda(
  options: UsePromotoriaOptions = {}
): UsePromotoriaReturn<PromotoriaTiendaResponse> {
  const { autoFetch = true } = options;

  const [data, setData] = useState<PromotoriaTiendaResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/promotoria/aggregate');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch promotoria tienda');
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('usePromotoriaTienda error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

interface UsePromotoriaProductsOptions extends UsePromotoriaOptions {
  id_store?: number;
}

/**
 * Hook for fetching products without sales for a specific store (highest risk)
 */
export function usePromotoriaProductsSinVentaByStore(
  options: UsePromotoriaProductsOptions = {}
): UsePromotoriaReturn<PromotoriaProductsResponse> {
  const { autoFetch = false, limit = 3, id_store } = options;

  const [data, setData] = useState<PromotoriaProductsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (storeId?: number) => {
    const targetStoreId = storeId || id_store;
    
    if (!targetStoreId) {
      setError(new Error('Store ID is required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        id_store: targetStoreId.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/promotoria/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products sin venta by store');
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('usePromotoriaProductsSinVentaByStore error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, id_store]);

  useEffect(() => {
    if (autoFetch && id_store) {
      fetchData(id_store);
    }
  }, [autoFetch, id_store, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

