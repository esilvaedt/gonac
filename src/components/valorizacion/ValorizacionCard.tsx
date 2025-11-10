"use client";

import { useValorizacionSummary } from '@/hooks/useValorizacion';

/**
 * Example component demonstrating the valorizacion hook usage
 * Can be integrated into your VemioDashboard
 */
export default function ValorizacionCard() {
  const { data, loading, error, refetch } = useValorizacionSummary();

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
          Error al cargar datos
        </h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          {error.message}
        </p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Valorización de Riesgos
        </h2>
        <button
          onClick={refetch}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          title="Actualizar datos"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Agotado Card */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-900 dark:text-red-200">
              Agotado
            </h3>
            <span className="text-2xl">🚨</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {data.agotado.tiendas}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">tiendas</p>
          <p className="text-sm font-semibold text-red-800 dark:text-red-300 mt-2">
            {formatCurrency(data.agotado.impacto)}
          </p>
        </div>

        {/* Caducidad Card */}
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900 dark:text-orange-200">
              Caducidad
            </h3>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {data.caducidad.tiendas}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400">tiendas</p>
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mt-2">
            {formatCurrency(data.caducidad.impacto)}
          </p>
        </div>

        {/* Sin Ventas Card */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              Sin Ventas
            </h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {data.sinVentas.tiendas}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">tiendas</p>
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mt-2">
            {formatCurrency(data.sinVentas.impacto)}
          </p>
        </div>
      </div>

      {/* Total Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Tiendas Afectadas
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.total.tiendas}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Impacto Total
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.total.impacto)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

