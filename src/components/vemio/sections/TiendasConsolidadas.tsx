/**
 * TiendasConsolidadas Component
 * Main component for displaying consolidated store data with metrics, opportunities, and actions
 * Refactored following SOLID principles for better maintainability and reusability
 */

"use client";

import MetricsSection from './MetricsSection';
import OpportunitiesSection from './OpportunitiesSection';
import ActionsSection from './ActionsSection';
import ImpactoTotalBanner from './ImpactoTotalBanner';
import { useTiendasData } from '@/hooks/useTiendasData';
import { buildActions } from '@/utils/tiendas.actions';

export default function TiendasConsolidadas() {
  const {
    storeMetrics,
    opportunities,
    segments,
    metricasData,
    impactoTotal,
    tiendasConOportunidades,
    loading,
    error,
  } = useTiendasData();

  const actions = buildActions(segments);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando datos de tiendas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 shadow-sm border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">Error al cargar datos: {error.message}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Mostrando datos de ejemplo</p>
        </div>
      )}

      {/* Main Card - Consolidated View */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-100 dark:bg-brand-900/20 p-2">
              <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Todas las Tiendas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resumen general del universo de tiendas y oportunidades detectadas
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <MetricsSection storeMetrics={storeMetrics} metricasData={metricasData} />

        {/* Opportunities Section */}
        <OpportunitiesSection opportunities={opportunities} />

        {/* Impacto Total Banner */}
        <ImpactoTotalBanner
          impactoTotal={impactoTotal}
          tiendasConOportunidades={tiendasConOportunidades}
          totalTiendas={storeMetrics.totalTiendas}
        />

        {/* Actions Section */}
        <ActionsSection actions={actions} />
      </div>
    </div>
  );
}
