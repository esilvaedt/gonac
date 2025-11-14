/**
 * Metrics Section Component - Main KPIs Display
 */

import MetricCard from '../cards/MetricCard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { METRIC_TARGETS } from '@/constants/tiendas.constants';
import type { StoreMetrics } from '@/types/tiendas.types';

interface MetricasData {
  sell_through_pct?: number;
  cobertura_ponderada_pct?: number;
  crecimiento_vs_semana_anterior_pct?: number;
  porcentaje_agotados_pct?: number;
  avg_venta_promedio_diaria?: number;
  cobertura_pct?: number;
  ventas_totales_unidades?: number;
}

interface MetricsSectionProps {
  storeMetrics: StoreMetrics;
  metricasData: MetricasData | null;
}

export default function MetricsSection({ storeMetrics, metricasData }: MetricsSectionProps) {
  const sellThroughPct = metricasData?.sell_through_pct ?? 0.2;
  const coberturaPonderadaPct = metricasData?.cobertura_ponderada_pct ?? 0.823;
  const crecimientoPct = metricasData?.crecimiento_vs_semana_anterior_pct ?? 0.125;
  const tasaQuiebrePct = metricasData?.porcentaje_agotados_pct ?? 2.3;
  const ventaPromedioDiaria = metricasData?.avg_venta_promedio_diaria ?? (storeMetrics.ventaPromedio / 7);
  const coberturaPct = metricasData?.cobertura_pct ?? 0.83;

  return (
    <>
      {/* Main KPIs - 2 Large Cards */}
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        {/* Ventas Totales */}
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Ventas Totales</h3>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(storeMetrics.ventasTotales)}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {formatNumber(storeMetrics.unidadesVendidas)} unidades vendidas
                </div>
              </div>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex items-center rounded-full bg-white/20 px-2 py-1 text-sm">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +{formatPercentage(crecimientoPct)}
            </div>
            <span className="ml-2 text-sm opacity-90">vs semana anterior</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: '82%' }}></div>
          </div>
          {metricasData && (
            <div className="mt-2">
              <span className="text-xs font-medium text-green-100 bg-green-600/30 px-2 py-1 rounded-full">
                ✓ Datos en vivo
              </span>
            </div>
          )}
        </div>

        {/* Sell-Through */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Sell-Through</h3>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {formatPercentage(sellThroughPct)}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  vs {METRIC_TARGETS.SELL_THROUGH}% objetivo
                </div>
              </div>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>Inventario inicial: {formatNumber((metricasData?.ventas_totales_unidades ?? storeMetrics.unidadesVendidas) * 5)} unidades</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${Math.min(((sellThroughPct * 100) / METRIC_TARGETS.SELL_THROUGH) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          {metricasData && (
            <div className="mt-2">
              <span className="text-xs font-medium text-blue-100 bg-blue-600/30 px-2 py-1 rounded-full">
                ✓ Datos en vivo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics - 5 Small Cards */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Cobertura Numérica"
          value={formatNumber(Math.round(coberturaPct * 100))}
          subtitle="100% del universo"
          color="blue"
          size="small"
          icon={
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          progressValue={100}
        />

        <MetricCard
          title="Cobertura Ponderada"
          value={formatPercentage(coberturaPonderadaPct)}
          subtitle={`vs ${METRIC_TARGETS.COBERTURA_PONDERADA}% objetivo`}
          color="green"
          size="small"
          icon={
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
          progressValue={((coberturaPonderadaPct * 100) / METRIC_TARGETS.COBERTURA_PONDERADA) * 100}
        />

        <MetricCard
          title="Días de Inventario"
          value={storeMetrics.diasInventario.toFixed(1)}
          subtitle={`vs ${METRIC_TARGETS.DIAS_INVENTARIO} días objetivo`}
          color="red"
          size="small"
          icon={
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          progressValue={(METRIC_TARGETS.DIAS_INVENTARIO / storeMetrics.diasInventario) * 100}
        />

        <MetricCard
          title="Tasa de Quiebre"
          value={`${tasaQuiebrePct.toFixed(1)}%`}
          subtitle={`vs ${METRIC_TARGETS.TASA_QUIEBRE}% tolerancia`}
          color="orange"
          size="small"
          icon={
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          progressValue={((100 - tasaQuiebrePct) / (100 - METRIC_TARGETS.TASA_QUIEBRE)) * 100}
        />

        <MetricCard
          title="Venta Promedio Diaria"
          value={formatCurrency(ventaPromedioDiaria)}
          subtitle="Por día"
          color="purple"
          size="small"
          icon={
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          progressValue={94.7}
          progressColor="bg-green-500"
        />
      </div>
    </>
  );
}

