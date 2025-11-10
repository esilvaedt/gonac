'use client';

import { useMetricasCards } from '@/hooks/useMetricas';

/**
 * Home Page KPI Dashboard Component
 * Displays consolidated metrics as KPI cards
 */
export function HomeKPIDashboard() {
  const { cards, loading, error, refetch, refresh } = useMetricasCards({
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  if (loading && !cards) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading metrics: {error.message}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">KPIs Consolidados</h2>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            title="Refresh materialized view"
          >
            Recalcular
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards?.map((card) => (
          <KPICard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual KPI Card Component
 */
interface KPICardProps {
  card: {
    id: string;
    label: string;
    value: number;
    formatted_value: string;
    unit: 'currency' | 'percentage' | 'number' | 'days';
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
  };
}

function KPICard({ card }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-600">{card.label}</h3>
        {card.trend && (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              trendColors[card.trend]
            }`}
          >
            {trendIcons[card.trend]}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{card.formatted_value}</div>
      {card.unit === 'currency' && (
        <p className="text-xs text-gray-500 mt-1">MXN</p>
      )}
    </div>
  );
}

/**
 * Simple metrics display (alternative to cards)
 */
export function SimpleMetricsDisplay() {
  const { data, loading, error } = useMetricasCards({ autoFetch: true });

  if (loading) return <div>Cargando métricas...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.cards.map((card) => (
        <div key={card.id} className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-600">{card.label}</div>
          <div className="text-xl font-bold">{card.formatted_value}</div>
        </div>
      ))}
    </div>
  );
}

