import { VemioData } from "@/data/vemio-mock-data";
import { useMetricasFormatted } from "@/hooks/useMetricas";

interface ResumenViewProps {
  data: VemioData["resumen"];
}

export default function ResumenView({ data }: ResumenViewProps) {
  // Fetch real metrics data
  const { data: metricasData, loading, error } = useMetricasFormatted({ autoFetch: true });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCardColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'from-green-500 to-green-600';
    if (percentage >= 80) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  // Use real data if available, otherwise fallback to mock
  const ventasTotalesPesos = metricasData?.ventas_totales_pesos ?? data.ventasTotales.valor;
  const ventasTotalesUnidades = metricasData?.ventas_totales_unidades ?? data.ventasTotales.unidadesVendidas;
  const crecimiento = metricasData?.crecimiento_vs_semana_anterior_pct ?? data.ventasTotales.crecimientoVsSemanaAnterior;
  const sellThroughPct = metricasData?.sell_through_pct ?? data.sellThrough.porcentaje;
  const coberturaPct = metricasData?.cobertura_pct ?? data.metricas.coberturaNumerica.porcentaje;
  const coberturaPonderadaPct = metricasData?.cobertura_ponderada_pct ?? data.metricas.coberturaPonderada.porcentaje;
  const diasInventario = metricasData?.promedio_dias_inventario ?? data.metricas.diasInventario.promedio;
  const porcentajeAgotados = metricasData?.porcentaje_agotados_pct ?? data.metricas.tasaQuiebre.porcentaje;
  const ventaPromedioDiaria = metricasData?.avg_venta_promedio_diaria ?? data.metricas.ventaPromedioOutlet.porcentaje;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando métricas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 shadow-sm border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">Error al cargar métricas: {error.message}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Mostrando datos de ejemplo</p>
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ventas Totales Card */}
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Ventas Totales</h3>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(ventasTotalesPesos)}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {formatNumber(ventasTotalesUnidades)} unidades vendidas
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
              +{crecimiento.toFixed(1)}%
            </div>
            <span className="ml-2 text-sm opacity-90">vs semana anterior</span>
          </div>
          {metricasData && (
            <div className="mt-2">
              <span className="text-xs font-medium text-green-100 bg-green-600/30 px-2 py-1 rounded-full">
                ✓ Datos en vivo
              </span>
            </div>
          )}
        </div>

        {/* Sell-Through Card */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Sell-Through</h3>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {sellThroughPct.toFixed(1)}%
                </div>
                <div className="text-sm opacity-90 mt-1">
                  vs {data.sellThrough.objetivo}% objetivo
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
              <span>Inventario inicial</span>
              <span>{formatCurrency(data.sellThrough.inventarioInicial)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${Math.min((sellThroughPct / data.sellThrough.objetivo) * 100, 100)}%` }}
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

        {/* Riesgo y Oportunidades Card */}
        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Riesgo Total</h3>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  {data.riesgoOportunidades.total}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  oportunidades detectadas
                </div>
              </div>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Detectadas</span>
              <span className="font-semibold">{data.riesgoOportunidades.detectadas}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Críticas</span>
              <span className="font-semibold">{data.riesgoOportunidades.criticas}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${(data.riesgoOportunidades.criticas / data.riesgoOportunidades.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Cobertura Numérica */}
        <div className={`rounded-lg bg-gradient-to-br ${getCardColor(coberturaPct, data.metricas.coberturaNumerica.objetivo)} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium opacity-90">Cobertura Numérica</h4>
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-2xl font-bold mb-1">
            {coberturaPct.toFixed(1)}%
          </div>
          <div className="text-xs opacity-90 mb-3">
            vs {data.metricas.coberturaNumerica.objetivo}% objetivo
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(coberturaPct, data.metricas.coberturaNumerica.objetivo)}`}
              style={{ width: `${Math.min((coberturaPct / data.metricas.coberturaNumerica.objetivo) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Cobertura Ponderada */}
        <div className={`rounded-lg bg-gradient-to-br ${getCardColor(coberturaPonderadaPct, data.metricas.coberturaPonderada.objetivo)} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium opacity-90">Cobertura Ponderada</h4>
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div className="text-2xl font-bold mb-1">
            {coberturaPonderadaPct.toFixed(1)}%
          </div>
          <div className="text-xs opacity-90 mb-3">
            vs {data.metricas.coberturaPonderada.objetivo}% objetivo
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(coberturaPonderadaPct, data.metricas.coberturaPonderada.objetivo)}`}
              style={{ width: `${Math.min((coberturaPonderadaPct / data.metricas.coberturaPonderada.objetivo) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Días de Inventario */}
        <div className={`rounded-lg bg-gradient-to-br ${getCardColor(data.metricas.diasInventario.objetivo, diasInventario)} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium opacity-90">Días de Inventario</h4>
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold mb-1">
            {diasInventario.toFixed(1)}
          </div>
          <div className="text-xs opacity-90 mb-3">
            vs {data.metricas.diasInventario.objetivo} objetivo
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(data.metricas.diasInventario.objetivo, diasInventario)}`}
              style={{ width: `${Math.min((data.metricas.diasInventario.objetivo / diasInventario) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Tasa de Quiebre (Agotados) */}
        <div className={`rounded-lg bg-gradient-to-br ${getCardColor(100 - porcentajeAgotados, 100 - data.metricas.tasaQuiebre.objetivo)} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium opacity-90">Tasa de Quiebre</h4>
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-2xl font-bold mb-1">
            {porcentajeAgotados.toFixed(1)}%
          </div>
          <div className="text-xs opacity-90 mb-3">
            vs {data.metricas.tasaQuiebre.objetivo}% objetivo
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(100 - porcentajeAgotados, 100 - data.metricas.tasaQuiebre.objetivo)}`}
              style={{ width: `${Math.min(((100 - porcentajeAgotados) / (100 - data.metricas.tasaQuiebre.objetivo)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Venta Promedio Diaria */}
        <div className={`rounded-lg bg-gradient-to-br ${getCardColor(ventaPromedioDiaria, data.metricas.ventaPromedioOutlet.objetivo)} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium opacity-90">Venta Promedio Diaria</h4>
            <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatCurrency(ventaPromedioDiaria)}
          </div>
          <div className="text-xs opacity-90 mb-3">
            promedio por tienda
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(ventaPromedioDiaria, data.metricas.ventaPromedioOutlet.objetivo)}`}
              style={{ width: `${Math.min((ventaPromedioDiaria / data.metricas.ventaPromedioOutlet.objetivo) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}