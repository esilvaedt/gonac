/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { VemioData, vemioMockData } from "@/data/vemio-mock-data";
import { ExhibicionesAdicionalesCalculator } from "@/utils/exhibicionesAdicionalesCalculator";
import { useCategoriasConCaducidad, useDescuento, useCategoryStats } from "@/hooks/useDescuento";
import { 
  useAccionReabastoSummary, 
  useAccionReabastoPorTienda, 
  useAccionReabastoDetalle 
} from "@/hooks/useAccionReabasto";

interface AccionesViewProps {
  data: VemioData["acciones"];
}

type ActionType = 'minimizarAgotados' | 'exhibicionesAdicionales' | 'promocionesSlow' | 'visitaPromotoria';

export default function AccionesView({ data }: AccionesViewProps) {
  const [expandedAction, setExpandedAction] = useState<ActionType | null>(null);
  const [showVemioAgent, setShowVemioAgent] = useState<ActionType | null>(null);

  // State for Promociones Slow configuration
  const [maxDescuento, setMaxDescuento] = useState(45);
  const [elasticidadPapas, setElasticidadPapas] = useState(1.5);
  const [elasticidadTotopos, setElasticidadTotopos] = useState(1.8);

  // Fetch categories with expiration risk
  const { data: categoriasData, loading: categoriasLoading, error: categoriasError } = useCategoriasConCaducidad({
    limit: 2,
    autoFetch: true
  });

  // Initialize discount calculation hook
  const { data: descuentoData, loading: descuentoLoading, calcular } = useDescuento();

  // Initialize category stats hook
  const { data: categoryStatsData, loading: statsLoading, fetchStats } = useCategoryStats();

  // Calculate discount when categories are loaded or parameters change
  useEffect(() => {
    if (categoriasData?.categorias && categoriasData.categorias.length > 0) {
      const items = categoriasData.categorias.map(cat => ({
        categoria: cat.category,
        elasticidad: cat.category.toUpperCase() === 'PAPAS' ? elasticidadPapas : elasticidadTotopos
      }));

      // Calculate discount with current parameters
      calcular({
        descuento: maxDescuento / 100, // Convert percentage to decimal
        items
      });

      // Fetch category stats
      fetchStats(categoriasData.categorias.map(c => c.category));
    }
  }, [categoriasData, maxDescuento, elasticidadPapas, elasticidadTotopos, calcular, fetchStats]);

  // State for Exhibiciones Adicionales configuration
  const [costoExhibicion, setCostoExhibicion] = useState(500);
  const [incrementoVentas, setIncrementoVentas] = useState(50);

  // State for Minimizar Agotados detail views
  const [showDetailBySKU, setShowDetailBySKU] = useState(false);
  const [showDetailByTienda, setShowDetailByTienda] = useState(false);

  // Fetch Acción #1: Reabasto Urgente data
  const { data: reabastoSummary, loading: reabastoSummaryLoading } = useAccionReabastoSummary();
  const { data: reabastoPorTienda, loading: reabastoPorTiendaLoading } = useAccionReabastoPorTienda();
  const { data: reabastoDetalle, loading: reabastoDetalleLoading } = useAccionReabastoDetalle();

  // Calculate exhibiciones adicionales dynamically
  const exhibicionesCalculadas = useMemo(() => {
    const calculator = new ExhibicionesAdicionalesCalculator(
      vemioMockData,
      costoExhibicion,
      incrementoVentas
    );
    return calculator.calcularOportunidades();
  }, [costoExhibicion, incrementoVentas]);

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

  const getActionIcon = (actionType: ActionType) => {
    switch (actionType) {
      case 'minimizarAgotados':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'exhibicionesAdicionales':
        return (
          <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'promocionesSlow':
        return (
          <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'visitaPromotoria':
        return (
          <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getActionTitle = (actionType: ActionType) => {
    switch (actionType) {
      case 'minimizarAgotados':
        return 'Reabasto Urgente (Tiendas HOT y Balanceadas)';
      case 'exhibicionesAdicionales':
        return exhibicionesCalculadas.metricas.hayOportunidadesViables
          ? `Exhibiciones Adicionales (${exhibicionesCalculadas.metricas.totalExhibiciones} Oportunidades Viables)`
          : 'Exhibiciones Adicionales (Sin Oportunidades Viables)';
      case 'promocionesSlow':
        return 'Promoción para Evacuar Inventario (Tiendas Slow y Dead)';
      case 'visitaPromotoria':
        return 'Visita Promotoría';
    }
  };

  const getROI = (valorPotencial: number, costoEjecucion: number) => {
    if (costoEjecucion === 0) return "∞";
    return ((valorPotencial / costoEjecucion) * 100).toFixed(1) + "%";
  };

  const toggleExpanded = (actionType: ActionType) => {
    setExpandedAction(expandedAction === actionType ? null : actionType);
  };

  const handleExecuteAction = (actionType: ActionType) => {
    alert(`Ejecutando acción: ${getActionTitle(actionType)}`);
  };

  const handleVemioAgent = (actionType: ActionType) => {
    setShowVemioAgent(showVemioAgent === actionType ? null : actionType);
  };

  const renderActionCard = (actionType: ActionType, actionData: Record<string, any>, actionNumber: number) => {
    // Get dynamic insight for exhibiciones adicionales
    const getInsight = () => {
      if (actionType === 'exhibicionesAdicionales') {
        if (exhibicionesCalculadas.metricas.hayOportunidadesViables) {
          return `Identificadas ${exhibicionesCalculadas.metricas.totalExhibiciones} tiendas HOT donde exhibiciones adicionales generarían retorno positivo sobre inversión`;
        }
        return 'No se detectaron oportunidades viables con los parámetros actuales. Ajusta el costo o incremento esperado.';
      }
      return actionData.insight;
    };

    return (
      <div key={actionType} className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 shadow-md border-2 border-blue-200 dark:border-blue-900">
        {/* Header */}
        <div className="p-6 border-b border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getActionIcon(actionType)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Acción #{actionNumber}: {getActionTitle(actionType)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getInsight()}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleExpanded(actionType)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${expandedAction === actionType ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-6">
          {actionType === 'minimizarAgotados' ? (
            <>
              {/* Loading State */}
              {reabastoSummaryLoading && (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando datos de reabasto...</p>
                </div>
              )}

              {/* Metrics Cards for Minimizar Agotados - Using Real Data */}
              {!reabastoSummaryLoading && reabastoSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Monto Total</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(reabastoSummary.data.monto_total)}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400">Unidades Totales</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatNumber(reabastoSummary.data.unidades_totales)}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Tiendas Impactadas</div>
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {reabastoSummary.data.tiendas_impactadas}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback to mock data if API fails */}
              {!reabastoSummaryLoading && !reabastoSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Monto Total</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(actionData.valorPotencial.pesos)}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400">Unidades Totales</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatNumber(actionData.valorPotencial.cantidad)}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Tiendas Impactadas</div>
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {actionData.valorPotencial.tiendasImpacto}
                    </div>
                  </div>
                </div>
              )}

              {/* Detail View Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setShowDetailBySKU(!showDetailBySKU)}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${showDetailBySKU
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                    }`}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ver detalle por SKU
                </button>
                <button
                  onClick={() => setShowDetailByTienda(!showDetailByTienda)}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${showDetailByTienda
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
                    }`}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Ver detalle por Tienda
                </button>
              </div>

              {/* Detail by SKU */}
              {showDetailBySKU && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Detalle por SKU
                    {reabastoDetalle && ` (${reabastoDetalle.total} registros)`}
                  </h4>
                  
                  {/* Loading State */}
                  {reabastoDetalleLoading && (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando detalles...</p>
                    </div>
                  )}

                  {/* Real Data Table - Grouped by Store */}
                  {!reabastoDetalleLoading && reabastoDetalle && reabastoDetalle.data.length > 0 && (
                    <div className="space-y-4">
                      {/* Group data by store */}
                      {Object.entries(
                        reabastoDetalle.data.reduce((acc: Record<string, typeof reabastoDetalle.data>, item) => {
                          if (!acc[item.store_name]) {
                            acc[item.store_name] = [];
                          }
                          acc[item.store_name].push(item);
                          return acc;
                        }, {})
                      ).map(([storeName, products]) => (
                        <div key={storeName} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          {/* Store Header */}
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Tienda {storeName}
                          </h5>

                          {/* Products Table */}
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                              <thead>
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Producto</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unidades</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Días Post-Reabasto</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                                {products.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{item.product_name}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">{formatNumber(item.unidades_a_pedir)}</td>
                                    <td className="px-3 py-3 text-sm text-green-600 font-medium">{formatCurrency(item.monto_necesario_pedido)}</td>
                                    <td className="px-3 py-3 text-sm text-blue-600">{item.dias_inventario_post_reabasto} días</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Data State */}
                  {!reabastoDetalleLoading && (!reabastoDetalle || reabastoDetalle.data.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              )}

              {/* Detail by Tienda */}
              {showDetailByTienda && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Detalle por Tienda
                    {reabastoPorTienda && ` (${reabastoPorTienda.total} tiendas)`}
                  </h4>

                  {/* Loading State */}
                  {reabastoPorTiendaLoading && (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando detalles por tienda...</p>
                    </div>
                  )}

                  {/* Real Data Table */}
                  {!reabastoPorTiendaLoading && reabastoPorTienda && reabastoPorTienda.data.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tienda</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unidades a Pedir</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monto Necesario</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {reabastoPorTienda.data.map((tienda, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">{tienda.store_name}</td>
                              <td className="px-3 py-2 text-sm text-blue-600">{formatNumber(tienda.unidades_a_pedir)} unidades</td>
                              <td className="px-3 py-2 text-sm text-green-600 font-medium">{formatCurrency(tienda.monto_necesario_pedido)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* No Data State */}
                  {!reabastoPorTiendaLoading && (!reabastoPorTienda || reabastoPorTienda.data.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : actionType === 'promocionesSlow' ? (
            <>
              {/* Configuration Card for Promociones Slow */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de Promoción</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Máximo Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={maxDescuento}
                      onChange={(e) => setMaxDescuento(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Elasticidad Papas
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={elasticidadPapas}
                      onChange={(e) => setElasticidadPapas(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugerido: 1.5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Elasticidad Totopos
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={elasticidadTotopos}
                      onChange={(e) => setElasticidadTotopos(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugerido: 1.8</p>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {(categoriasLoading || descuentoLoading || statsLoading) && (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Calculando promociones...</p>
                </div>
              )}

              {/* Error State */}
              {categoriasError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                  <p className="text-sm text-red-600 dark:text-red-400">Error: {categoriasError.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mostrando datos de ejemplo</p>
                </div>
              )}

              {/* Metrics Cards - Using Real Data */}
              {descuentoData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-sm text-red-600 dark:text-red-400">Costo Promoción</div>
                    <div className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(
                        Object.values(descuentoData.items).reduce((sum, item) => sum + item.costo, 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400">Valor a Capturar</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(
                        Object.values(descuentoData.items).reduce((sum, item) => sum + item.valor, 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Reducción Riesgo</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {(Object.values(descuentoData.items).reduce((sum, item) => sum + item.reduccion, 0) /
                        Object.values(descuentoData.items).length).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback to mock data if no real data */}
              {!descuentoData && !descuentoLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-sm text-red-600 dark:text-red-400">Costo Promoción</div>
                    <div className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(actionData.costoEjecucion)}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400">Valor a Capturar</div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(actionData.valorPotencial.pesos)}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Inventario Post</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {actionData.valorPotencial.inventarioEvacuado}%
                    </div>
                  </div>
                </div>
              )}

              {/* Product Category Cards - Using Real Data */}
              {descuentoData && categoryStatsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(descuentoData.items).map(([categoria, metrics], index) => {
                    const stats = categoryStatsData.stats.find(s => s.category === categoria);
                    const colors = [
                      { from: 'from-orange-50', to: 'to-yellow-50', darkFrom: 'dark:from-orange-900/20', darkTo: 'dark:to-yellow-900/20', border: 'border-orange-200 dark:border-orange-800', accent: 'text-orange-600 dark:text-orange-400' },
                      { from: 'from-blue-50', to: 'to-indigo-50', darkFrom: 'dark:from-blue-900/20', darkTo: 'dark:to-indigo-900/20', border: 'border-blue-200 dark:border-blue-800', accent: 'text-blue-600 dark:text-blue-400' }
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={categoria} className={`bg-gradient-to-br ${color.from} ${color.to} ${color.darkFrom} ${color.darkTo} rounded-lg p-5 border-2 ${color.border}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                              {categoria.toUpperCase()} {maxDescuento}% descuento
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stats?.unique_products || 0} SKUs en {stats?.unique_stores || 0} tiendas
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Reducción riesgo</div>
                            <div className={`text-xl font-bold ${color.accent}`}>
                              {metrics.reduccion.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Inv. Inicial</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatNumber(Math.round(metrics.inventario_inicial_total))}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Ventas +</div>
                            <div className="text-sm font-semibold text-green-600">
                              {formatNumber(Math.round(metrics.ventas_plus))}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Costo</div>
                            <div className="text-sm font-semibold text-red-600">
                              {formatCurrency(metrics.costo)}
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Valor</div>
                            <div className="text-sm font-semibold text-blue-600">
                              {formatCurrency(metrics.valor)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fallback to mock data if no real data */}
              {(!descuentoData || !categoryStatsData) && !descuentoLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* PAPAS Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-5 border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 dark:text-white">PAPAS 41% descuento</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">7 SKUs en 46 tiendas</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Reducción riesgo</div>
                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400">61.1%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Inv. Inicial</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">2,450</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ventas +</div>
                        <div className="text-sm font-semibold text-green-600">1,497</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Costo</div>
                        <div className="text-sm font-semibold text-red-600">$8,200</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Valor</div>
                        <div className="text-sm font-semibold text-blue-600">$27,500</div>
                      </div>
                    </div>
                  </div>

                  {/* TOTOPOS Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 dark:text-white">TOTOPOS 38% descuento</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2 SKUs en 46 tiendas</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Reducción riesgo</div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">68.4%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Inv. Inicial</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">1,820</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ventas +</div>
                        <div className="text-sm font-semibold text-green-600">1,245</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Costo</div>
                        <div className="text-sm font-semibold text-red-600">$7,600</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Valor</div>
                        <div className="text-sm font-semibold text-blue-600">$24,800</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Badge */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Cálculo:</span> Incremento ventas = Elasticidad × % Descuento |
                  <span className="font-semibold"> Ejemplo:</span> Con {maxDescuento}% descuento y elasticidad {elasticidadPapas}, las ventas aumentan {(elasticidadPapas * maxDescuento).toFixed(0)}%.
                </p>
                {descuentoData && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ Datos en vivo desde la base de datos
                  </p>
                )}
              </div>
            </>
          ) : actionType === 'exhibicionesAdicionales' ? (
            <>
              {/* Configuration Card for Exhibiciones Adicionales */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración de Exhibiciones</h4>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    📅 Cálculo a 30 días
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Costo Mensual por Exhibición (MXN)
                    </label>
                    <input
                      type="number"
                      value={costoExhibicion}
                      onChange={(e) => setCostoExhibicion(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Costo que cobra el autoservicio por rentar el espacio de exhibición durante 30 días
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Incremento Esperado en Ventas (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={incrementoVentas}
                      onChange={(e) => setIncrementoVentas(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Incremento proyectado en ventas diarias por la exhibición adicional
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {exhibicionesCalculadas.metricas.hayOportunidadesViables ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400">Exhibiciones Viables</div>
                      <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {exhibicionesCalculadas.metricas.totalExhibiciones}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-sm text-green-600 dark:text-green-400">Retorno a 30 días</div>
                      <div className="text-xl font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(exhibicionesCalculadas.metricas.valorPotencialTotal)}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="text-sm text-red-600 dark:text-red-400">Costo Total (30 días)</div>
                      <div className="text-xl font-bold text-red-700 dark:text-red-300">
                        {formatCurrency(exhibicionesCalculadas.metricas.costoTotalEjecucion)}
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="text-sm text-purple-600 dark:text-purple-400">ROI Promedio</div>
                      <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        {exhibicionesCalculadas.metricas.roiPromedio.toFixed(2)}x
                      </div>
                    </div>
                  </div>

                  {/* Pedido Extraordinario Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-5 border-2 border-orange-200 dark:border-orange-800 mb-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      📦 Pedido Extraordinario Requerido (30 días)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Para soportar el incremento del {incrementoVentas}% en ventas durante 30 días, se requiere el siguiente pedido adicional:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Unidades Totales</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(exhibicionesCalculadas.metricas.pedidoExtraordinarioTotal / 150)} {/* Aproximación */}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Valor del Pedido</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(exhibicionesCalculadas.metricas.pedidoExtraordinarioTotal)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      💡 Cómo se calcula la viabilidad (período de 30 días)
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-semibold">Ejemplo:</span> Si una tienda vende $50 pesos/día con sus TOP 5 SKUs:
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                      <li>• Venta incremental = $50 × {incrementoVentas}% = ${(50 * incrementoVentas / 100).toFixed(2)}/día</li>
                      <li>• Retorno a 30 días = ${(50 * incrementoVentas / 100).toFixed(2)} × 30 días = ${(50 * incrementoVentas / 100 * 30).toFixed(2)}</li>
                      <li>• Costo a 30 días = ${costoExhibicion}</li>
                      <li>• <span className="font-semibold text-green-600">Viable si:</span> Retorno a 30 días &gt; Costo a 30 días</li>
                    </ul>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                      Nota: Todos los cálculos están proyectados para un período de 30 días naturales.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 italic mb-2">
                    No hay oportunidades viables con los parámetros actuales
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Intenta ajustar el costo de exhibición o el incremento esperado en ventas
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={`grid grid-cols-1 ${actionType === 'visitaPromotoria' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 mb-6`}>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Costo de Ejecución</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {actionData.costoEjecucion === 0 ? "Sin costo directo" : formatCurrency(actionData.costoEjecucion)}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-sm text-green-600 dark:text-green-400">Valor Potencial</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(actionData.valorPotencial.pesos)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {formatNumber(actionData.valorPotencial.cantidad)} unidades
                </div>
              </div>
              {actionType !== 'visitaPromotoria' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400">ROI</div>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {getROI(actionData.valorPotencial.pesos, actionData.costoEjecucion)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phone Mockup for Visita Promotoria */}
          {actionType === 'visitaPromotoria' && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-800">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-3xl z-10"></div>

                {/* Phone screen */}
                <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 flex justify-between items-center text-white text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* App header */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">VEMIO Field App</h3>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-xs opacity-90">Visita de Promotoría</p>
                  </div>

                  {/* App content */}
                  <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-140px)]">
                    {/* Store info */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h4 className="font-semibold text-gray-900 text-sm">Supercito Oriente</h4>
                      </div>
                      <p className="text-xs text-gray-600">Zona Oriente</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Crítica</span>
                        <span className="text-xs text-gray-500">Venta: $3,200</span>
                      </div>
                    </div>

                    {/* Task checklist */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Tareas de Visita</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" className="rounded text-purple-600" />
                          <span>Verificar exhibición en anaquel</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" className="rounded text-purple-600" />
                          <span>Revisar precios y señalética</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" className="rounded text-purple-600" />
                          <span>Validar inventario disponible</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" className="rounded text-purple-600" />
                          <span>Implementar degustación</span>
                        </label>
                      </div>
                    </div>

                    {/* Photo capture section */}
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Evidencia Fotográfica</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Tomar Foto
                      </button>
                    </div>

                    {/* Submit button */}
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-sm shadow-lg">
                      Completar Visita
                    </button>
                  </div>
                </div>

                {/* Home button */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(actionType !== 'exhibicionesAdicionales' || exhibicionesCalculadas.metricas.hayOportunidadesViables) && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExecuteAction(actionType)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ejecutar Automáticamente
              </button>
              <button
                onClick={() => handleVemioAgent(actionType)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Agente VEMIO
              </button>
              <button
                onClick={() => toggleExpanded(actionType)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver Detalles
              </button>
            </div>
          )}
        </div>

        {/* VEMIO Agent Chat */}
        {showVemioAgent === actionType && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-purple-50 dark:bg-purple-900/10">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <strong>Agente VEMIO:</strong> Hola, estoy aquí para ayudarte con la acción &quot;{getActionTitle(actionType)}&quot;.
                    ¿Te gustaría ajustar algún parámetro o tienes alguna pregunta sobre esta recomendación?
                  </p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta o ajuste..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {expandedAction === actionType && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
            {renderActionDetails(actionType, actionData)}
          </div>
        )}
      </div>
    );
  };

  const renderActionDetails = (actionType: ActionType, actionData: Record<string, any>) => {
    switch (actionType) {
      case 'minimizarAgotados':
        return (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detalles del Plan de Reabastecimiento</h4>
            <div className="space-y-4">
              {actionData.detalles.tiendas.map((tienda: Record<string, any>) => (
                <div key={tienda.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">{tienda.nombre}</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Días Agotado</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inv. Actual</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inv. Óptimo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {tienda.skus.map((sku: Record<string, any>) => (
                          <tr key={sku.id}>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{sku.nombre}</td>
                            <td className="px-3 py-2 text-sm text-red-600 font-medium">{sku.diasAgotado}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{sku.inventarioActual}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{sku.inventarioOptimo}</td>
                            <td className="px-3 py-2 text-sm text-green-600 font-medium">{sku.pedidoSugerido}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'exhibicionesAdicionales':
        return (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plan de Exhibiciones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actionData.detalles.exhibiciones.map((exhibicion: Record<string, any>, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">{exhibicion.tienda}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exhibicion.sku}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Costo:</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(exhibicion.costoExhibicion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">V. Incremental:</span>
                      <span className="text-green-600 font-medium">{formatCurrency(exhibicion.ventaIncremental)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ROI:</span>
                      <span className="text-blue-600 font-medium">{exhibicion.retorno.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'promocionesSlow':
        return (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plan de Promociones para Mitigar Caducidad</h4>
            <div className="space-y-4">
              {actionData.detalles.promociones.map((promocion: Record<string, any>, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{promocion.tienda}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{promocion.sku}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      {promocion.descuento}% descuento
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Inv. Riesgo:</span>
                      <div className="font-medium text-gray-900 dark:text-white">{promocion.inventarioRiesgo}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Inv. Evacuado:</span>
                      <div className="font-medium text-green-600">{promocion.inventarioEvacuado}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">% Evacuado:</span>
                      <div className="font-medium text-blue-600">{promocion.porcentajeEvacuado}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Costo:</span>
                      <div className="font-medium text-red-600">{formatCurrency(promocion.costoPromocion)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Detalles específicos para esta acción en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-2">
          Plan de Acción Generado por VEMIO
        </h2>
        <p className="text-sm text-blue-50 mb-6">
          Cada insight/oportunidad identificada tiene recomendaciones específicas con costo de ejecución y valor potencial a capturar.
        </p>
      </div>

      {/* Action Cards */}
      <div className="space-y-6">
        {Object.entries(data)
          .filter(([actionType]) => actionType !== 'promocionesHot')
          .map(([actionType, actionData], index) =>
            renderActionCard(actionType as ActionType, actionData, index + 1)
          )}
      </div>
    </div>
  );
}