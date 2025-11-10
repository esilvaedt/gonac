"use client";

/**
 * This file contains multiple examples of using the Valorizacion API
 * These are reference examples - you can copy and adapt them to your needs
 */

import { 
  useValorizacion, 
  useValorizacionSummary,
  useValorizacionPercentages,
  useValorizacionCritical 
} from '@/hooks/useValorizacion';

// ============================================================================
// EXAMPLE 1: Basic Usage - Full Data
// ============================================================================
export function Example1_BasicUsage() {
  const { data, loading, error } = useValorizacion();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Basic Usage</h2>
      <p>Total Stores: {data?.totalTiendas}</p>
      <p>Total Impact: ${data?.totalImpacto.toLocaleString()}</p>
      
      {data?.data.map((item) => (
        <div key={item.valorizacion}>
          <h3>{item.valorizacion}</h3>
          <p>Stores: {item.tiendas}</p>
          <p>Impact: ${item.impacto.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Summary Format
// ============================================================================
export function Example2_SummaryFormat() {
  const { data, loading } = useValorizacionSummary();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card">
        <h3>Agotado</h3>
        <p>{data?.agotado.tiendas} stores</p>
        <p>${data?.agotado.impacto.toLocaleString()}</p>
      </div>
      
      <div className="card">
        <h3>Caducidad</h3>
        <p>{data?.caducidad.tiendas} stores</p>
        <p>${data?.caducidad.impacto.toLocaleString()}</p>
      </div>
      
      <div className="card">
        <h3>Sin Ventas</h3>
        <p>{data?.sinVentas.tiendas} stores</p>
        <p>${data?.sinVentas.impacto.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: With Percentages
// ============================================================================
export function Example3_WithPercentages() {
  const { data, loading } = useValorizacionPercentages();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Impact Distribution</h2>
      {data?.map((item) => (
        <div key={item.valorizacion} className="mb-4">
          <div className="flex justify-between mb-2">
            <span>{item.valorizacion}</span>
            <span>{item.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded">
            <div 
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {item.tiendas} stores - ${item.impacto.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Critical Alert
// ============================================================================
export function Example4_CriticalAlert() {
  const { data } = useValorizacionCritical();

  if (!data) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <div className="flex items-center">
        <span className="text-2xl mr-3">🚨</span>
        <div>
          <h3 className="text-red-800 font-bold">
            Critical: {data.valorizacion}
          </h3>
          <p className="text-red-700">
            {data.tiendas} stores affected with impact of ${data.impacto.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: With Manual Refresh
// ============================================================================
export function Example5_WithRefresh() {
  const { data, loading, refetch } = useValorizacion();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Valorizacion Data</h2>
        <button 
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {data && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
          {/* Your data display here */}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Auto-Refresh Every 5 Minutes
// ============================================================================
export function Example6_AutoRefresh() {
  const { data, loading } = useValorizacion({
    refreshInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <span className="text-sm text-gray-600">
          {loading ? 'Updating...' : 'Live data (auto-refresh every 5 min)'}
        </span>
      </div>
      
      {data && (
        <div>
          {/* Your data display here */}
          <p>Total Impact: ${data.totalImpacto.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Specific Type Only
// ============================================================================
export function Example7_SpecificType() {
  const { data: agotado } = useValorizacion<any>({ 
    type: 'Agotado' 
  });
  
  const { data: caducidad } = useValorizacion<any>({ 
    type: 'Caducidad' 
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-red-50 rounded">
        <h3>Agotado</h3>
        <p>{agotado?.tiendas} stores</p>
        <p>${agotado?.impacto.toLocaleString()}</p>
      </div>
      
      <div className="p-4 bg-orange-50 rounded">
        <h3>Caducidad</h3>
        <p>{caducidad?.tiendas} stores</p>
        <p>${caducidad?.impacto.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: With Loading Skeleton
// ============================================================================
export function Example8_WithSkeleton() {
  const { data, loading } = useValorizacionSummary();

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Agotado</h3>
        <p className="text-3xl font-bold">{data?.agotado.tiendas}</p>
        <p className="text-sm opacity-90">
          ${data?.agotado.impacto.toLocaleString()}
        </p>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
        <h3 className="text-sm font-medium opacity-90">Caducidad</h3>
        <p className="text-3xl font-bold">{data?.caducidad.tiendas}</p>
        <p className="text-sm opacity-90">
          ${data?.caducidad.impacto.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Error Handling with Retry
// ============================================================================
export function Example9_ErrorHandling() {
  const { data, loading, error, refetch } = useValorizacion();
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, 3000); // Retry after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">Error loading data</p>
        <p className="text-red-600 text-sm">{error.message}</p>
        {retryCount < 3 && (
          <p className="text-red-500 text-xs mt-2">
            Retrying... (Attempt {retryCount + 1}/3)
          </p>
        )}
        <button 
          onClick={refetch}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm"
        >
          Retry Now
        </button>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return <div>{/* Your data display */}</div>;
}

// ============================================================================
// EXAMPLE 10: Combined Dashboard View
// ============================================================================
export function Example10_CombinedDashboard() {
  const { data: summary } = useValorizacionSummary();
  const { data: critical } = useValorizacionCritical();
  const { data: percentages } = useValorizacionPercentages();

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      {critical && (
        <div className="bg-red-600 text-white p-4 rounded-lg">
          <h3 className="font-bold text-lg">🚨 Critical: {critical.valorizacion}</h3>
          <p>Immediate action required - {critical.tiendas} stores affected</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-lg">
          <h4 className="text-gray-600 text-sm">Agotado</h4>
          <p className="text-2xl font-bold text-red-600">{summary?.agotado.tiendas}</p>
          <p className="text-sm text-gray-500">${summary?.agotado.impacto.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-white shadow rounded-lg">
          <h4 className="text-gray-600 text-sm">Caducidad</h4>
          <p className="text-2xl font-bold text-orange-600">{summary?.caducidad.tiendas}</p>
          <p className="text-sm text-gray-500">${summary?.caducidad.impacto.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-white shadow rounded-lg">
          <h4 className="text-gray-600 text-sm">Sin Ventas</h4>
          <p className="text-2xl font-bold text-yellow-600">{summary?.sinVentas.tiendas}</p>
          <p className="text-sm text-gray-500">${summary?.sinVentas.impacto.toLocaleString()}</p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Impact Distribution</h3>
        {percentages?.map((item) => (
          <div key={item.valorizacion} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>{item.valorizacion}</span>
              <span>{item.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm opacity-90">Total Stores Affected</h3>
            <p className="text-4xl font-bold">{summary?.total.tiendas}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm opacity-90">Total Impact</h3>
            <p className="text-4xl font-bold">${summary?.total.impacto.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import React for Example 9
import React from 'react';

// Export all examples as a collection
export const ValorizacionExamples = {
  Example1_BasicUsage,
  Example2_SummaryFormat,
  Example3_WithPercentages,
  Example4_CriticalAlert,
  Example5_WithRefresh,
  Example6_AutoRefresh,
  Example7_SpecificType,
  Example8_WithSkeleton,
  Example9_ErrorHandling,
  Example10_CombinedDashboard,
};

