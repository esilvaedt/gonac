import { useState, useEffect, useCallback } from 'react';
import { AccionesResumen, AccionesDetalleResponse } from '@/types/acciones';

type FormatType = 'default' | 'with-metrics' | 'detalle';

interface UseAccionesOptions {
  format?: FormatType;
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAccionesReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch acciones resumen data
 * 
 * @example
 * ```tsx
 * // Default usage
 * const { data, loading, error } = useAcciones();
 * 
 * // Get with calculated metrics
 * const { data, loading } = useAcciones({ format: 'with-metrics' });
 * 
 * // Auto-refresh every 5 minutes
 * const { data } = useAcciones({ refreshInterval: 5 * 60 * 1000 });
 * ```
 */
export function useAcciones<T = AccionesResumen>(
  options: UseAccionesOptions = {}
): UseAccionesReturn<T> {
  const {
    format = 'default',
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

      const response = await fetch(`/api/acciones?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      // For detail format, the API spreads the service response
      // So we get { success: true, data: [...], total: number, timestamp: string }
      // For other formats, we get { success: true, data: {...}, timestamp: string }
      if (format === 'detalle') {
        // For detail format, pass the entire response structure
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { success, ...detailData } = result;
        setData(detailData as T);
      } else {
        // For other formats, just pass the data
        setData(result.data as T);
      }
    } catch (err) {
      setError(err as Error);
      console.error('useAcciones error:', {
        format,
        error: err,
        message: (err as Error).message
      });
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
    refetch: fetchData,
  };
}

/**
 * Hook specifically for acciones data with calculated metrics
 */
export function useAccionesWithMetrics() {
  return useAcciones({
    format: 'with-metrics',
  });
}

/**
 * Hook for detailed acciones list
 * Returns complete information for all tasks and actions
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAccionesDetalle();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <h2>Historial de Acciones ({data?.total} acciones)</h2>
 *     <table>
 *       <thead>
 *         <tr>
 *           <th>Folio</th>
 *           <th>Tipo</th>
 *           <th>Tienda</th>
 *           <th>Responsable</th>
 *           <th>Status</th>
 *           <th>Prioridad</th>
 *           <th>ROI</th>
 *           <th>Fecha Creación</th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {data?.data.map((accion) => (
 *           <tr key={accion.id_accion}>
 *             <td>{accion.folio}</td>
 *             <td>{accion.tipo_accion}</td>
 *             <td>{accion.store_name}</td>
 *             <td>{accion.responsable}</td>
 *             <td>{accion.status}</td>
 *             <td>{accion.prioridad}</td>
 *             <td>{accion.roi_calculado || 'N/A'}</td>
 *             <td>{new Date(accion.fecha_creacion).toLocaleDateString()}</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   </div>
 * );
 * ```
 */
export function useAccionesDetalle(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;

  return useAcciones<AccionesDetalleResponse>({
    format: 'detalle',
    autoFetch
  });
}

