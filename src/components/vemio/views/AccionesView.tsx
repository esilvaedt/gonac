/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from "react";
import { VemioData, vemioMockData } from "@/data/vemio-mock-data";
import { useCategoriasConCaducidad, useDescuento, useCategoryStats } from "@/hooks/useDescuento";
import {
  useAccionReabastoSummary,
  useAccionReabastoPorTienda,
  useAccionReabastoDetalle
} from "@/hooks/useAccionReabasto";
import { useExhibicionResumen } from "@/hooks/useExhibiciones";
import { 
  usePromotoriaSummary, 
  usePromotoriaTienda, 
  usePromotoriaProductsSinVentaByStore 
} from "@/hooks/usePromotoria";
import ExhibicionConfigCard from "@/components/vemio/ExhibicionConfigCard";
import ExhibicionMetricsCards from "@/components/vemio/ExhibicionMetricsCards";
import ExhibicionPedidoCard from "@/components/vemio/ExhibicionPedidoCard";
import ExhibicionViabilidadCard from "@/components/vemio/ExhibicionViabilidadCard";

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
  const [exhibicionMounted, setExhibicionMounted] = useState(false);

  // State for Minimizar Agotados detail views
  const [showDetailBySKU, setShowDetailBySKU] = useState(false);
  const [showDetailByTienda, setShowDetailByTienda] = useState(false);

  // Fetch Acción #1: Reabasto Urgente data
  const { data: reabastoSummary, loading: reabastoSummaryLoading } = useAccionReabastoSummary();
  const { data: reabastoPorTienda, loading: reabastoPorTiendaLoading } = useAccionReabastoPorTienda();
  const { data: reabastoDetalle, loading: reabastoDetalleLoading } = useAccionReabastoDetalle();

  // Fetch Acción #2: Exhibiciones Adicionales data
  const { 
    data: exhibicionResumen, 
    loading: exhibicionLoading,
    refetch: refetchExhibicion 
  } = useExhibicionResumen({
    dias_mes: 30,
    costo_exhibicion: costoExhibicion,
    incremento_venta: incrementoVentas / 100, // Convert percentage to decimal
    format: 'raw',
    autoFetch: true
  });

  // Extract resumen data safely
  const resumenData = exhibicionResumen && 'resumen' in exhibicionResumen 
    ? exhibicionResumen.resumen 
    : null;

  // Fetch Acción #4: Visita Promotoría data
  const { data: promotoriaSummary, loading: promotoriaSummaryLoading } = usePromotoriaSummary();
  const { data: promotoriaTienda, loading: promotoriaTiendaLoading } = usePromotoriaTienda();
  const { data: promotoriaProducts, loading: promotoriaProductsLoading, refetch: refetchProducts } = usePromotoriaProductsSinVentaByStore({ 
    id_store: promotoriaTienda?.data.id_store,
    limit: 3,
    autoFetch: false 
  });

  // Fetch products when store ID is available
  useEffect(() => {
    if (promotoriaTienda?.data.id_store) {
      refetchProducts(promotoriaTienda.data.id_store);
    }
  }, [promotoriaTienda?.data.id_store, refetchProducts]);

  // Mark as mounted after initial render
  useEffect(() => {
    setExhibicionMounted(true);
  }, []);

  // Debounce exhibicion params changes
  useEffect(() => {
    // Skip on initial mount (autoFetch handles that)
    if (!exhibicionMounted) {
      return;
    }

    const timer = setTimeout(() => {
      refetchExhibicion({
        costo_exhibicion: costoExhibicion,
        incremento_venta: incrementoVentas / 100,
        dias_mes: 30
      });
    }, 800);

    return () => clearTimeout(timer);
    // Intentionally excluding refetchExhibicion from deps to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costoExhibicion, incrementoVentas, exhibicionMounted]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleCostoChange = useCallback((value: number) => {
    setCostoExhibicion(value);
  }, []);

  const handleIncrementoChange = useCallback((value: number) => {
    setIncrementoVentas(value);
  }, []);

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
        if (resumenData && resumenData.tiendas_viables > 0) {
          return `Exhibiciones Adicionales (${resumenData.tiendas_viables} Oportunidades Viables)`;
        }
        return 'Exhibiciones Adicionales (Sin Oportunidades Viables)';
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
        if (resumenData && resumenData.tiendas_viables > 0) {
          return `Identificadas ${resumenData.tiendas_viables} tiendas HOT donde exhibiciones adicionales generarían retorno positivo sobre inversión`;
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

              {/* Detail View Buttons - Only show if data exists */}
              {((reabastoDetalle && reabastoDetalle.data.length > 0) || (reabastoPorTienda && reabastoPorTienda.data.length > 0)) && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {/* Ver detalle por SKU - Only show if detalle data exists */}
                  {reabastoDetalle && reabastoDetalle.data.length > 0 && (
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
                  )}
                  {/* Ver detalle por Tienda - Only show if tienda data exists */}
                  {reabastoPorTienda && reabastoPorTienda.data.length > 0 && (
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
                  )}
                </div>
              )}

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
                      Elasticidad Mix
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
                    <div className="text-sm text-blue-600 dark:text-blue-400">Reducción Riesgo Promedio</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {((Object.values(descuentoData.items).reduce((sum, item) => sum + item.reduccion, 0) /
                        Object.values(descuentoData.items).length) * 100).toFixed(1)}%
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
                            <div className="text-sm text-gray-600 dark:text-gray-400">Reducción Riesgo</div>
                            <div className={`text-xl font-bold ${color.accent}`}>
                              {(metrics.reduccion * 100).toFixed(1)}%
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
                        <div className="text-sm text-gray-600 dark:text-gray-400">Reducción Riesgo</div>
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
                        <div className="text-sm text-gray-600 dark:text-gray-400">Reducción Riesgo</div>
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
              {/* Configuration Card */}
              <ExhibicionConfigCard
                costoExhibicion={costoExhibicion}
                incrementoVenta={incrementoVentas}
                onCostoChange={handleCostoChange}
                onIncrementoChange={handleIncrementoChange}
              />

              {/* Loading State */}
              {exhibicionLoading && (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Calculando exhibiciones...</p>
                </div>
              )}

              {/* Results Summary */}
              {!exhibicionLoading && resumenData && resumenData.tiendas_viables > 0 ? (
                <>
                  {/* Metrics Cards */}
                  <ExhibicionMetricsCards
                    resumen={resumenData}
                    formatCurrency={formatCurrency}
                  />

                  {/* Pedido Extraordinario Card */}
                  <ExhibicionPedidoCard
                    resumen={resumenData}
                    incrementoVenta={incrementoVentas}
                    formatCurrency={formatCurrency}
                    formatNumber={formatNumber}
                  />

                  {/* Viability Explanation Card */}
                  <ExhibicionViabilidadCard
                    incrementoVenta={incrementoVentas}
                    costoExhibicion={costoExhibicion}
                  />
                </>
              ) : !exhibicionLoading && (!resumenData || resumenData.tiendas_viables === 0) ? (
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
              ) : null}
            </>
          ) : actionType === 'visitaPromotoria' ? (
            <>
              {/* Loading State */}
              {(promotoriaSummaryLoading || promotoriaTiendaLoading) && (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando datos de promotoría...</p>
                </div>
              )}

              {/* Summary Cards - Using Real Data */}
              {!promotoriaSummaryLoading && promotoriaSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Tiendas a Visitar</div>
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {promotoriaSummary.data.tiendas_a_visitar}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-sm text-red-600 dark:text-red-400">Riesgo a Recuperar</div>
                    <div className="text-xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(promotoriaSummary.data.riesgo_total)}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback to mock data if API fails */}
              {!promotoriaSummaryLoading && !promotoriaSummary && !promotoriaTiendaLoading && !promotoriaTienda && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-blue-600 dark:text-blue-400">ROI</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {getROI(actionData.valorPotencial.pesos, actionData.costoEjecucion)}
                </div>
              </div>
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
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold">VEMIO Promotoria</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">Nuevo</span>
                    </div>
                    <p className="text-[10px] opacity-90">Tarea asignada - Urgente</p>
                  </div>

                  {/* App content */}
                  <div className="p-3 space-y-3 overflow-y-auto h-[calc(100%-100px)]">
                    {/* Tienda info - Using Method 2 Data */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-[10px] text-gray-500 mb-1">Tienda</div>
                      <div className="text-xl font-bold text-gray-900">
                        {promotoriaTienda?.data.store_name || '798'}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1">
                        Ventas Acumuladas
                      </div>
                      <div className="text-xs text-gray-900">
                        {promotoriaTienda?.data.ventas_acumuladas || 0} unidades
                      </div>
                    </div>

                    {/* Products Without Sales - Using Method 3 Data */}
                    <div className="bg-white rounded-lg border-2 border-red-400 p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-semibold text-gray-900 text-xs">Productos Sin Venta</h4>
                      </div>
                      <div className="space-y-2">
                        {promotoriaProductsLoading ? (
                          <div className="text-center py-2">
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
                          </div>
                        ) : promotoriaProducts && promotoriaProducts.data.length > 0 ? (
                          promotoriaProducts.data.map((product, index) => (
                            <div key={index} className="text-[10px] text-gray-700 flex justify-between items-center py-1">
                              <span>{product.product_name} ({product.inventario_sin_rotacion})</span>
                              <span className="text-gray-500">{product.inventario_sin_rotacion} uds</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="text-[10px] text-gray-700 flex justify-between items-center py-1">
                              <span>Botana Chidas Francesas 65 Gr (3870701)</span>
                              <span className="text-gray-500">30 uds</span>
                            </div>
                            <div className="text-[10px] text-gray-700 flex justify-between items-center py-1">
                              <span>Mix Chidas Hot 50 Gr (3825949)</span>
                              <span className="text-gray-500">30 uds</span>
                            </div>
                            <div className="text-[10px] text-gray-700 flex justify-between items-center py-1">
                              <span>Papas Chidas Con Sal 85 Gr (2810364)</span>
                              <span className="text-gray-500">30 uds</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Riesgo - Using Method 2 Data */}
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-center gap-1 mb-1">
                        <svg className="h-3 w-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-900">Riesgo</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {promotoriaTienda ? formatCurrency(promotoriaTienda.data.riesgo_total) : '$1.7K'}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-[10px] text-gray-600 leading-relaxed">
                          Hay <span className="font-semibold text-gray-900">{promotoriaTienda ? formatNumber(Number(promotoriaTienda.data.inventario_sin_rotacion_total)) : '240'} unidades</span> en bodega sin rotar. Habla con el gerente para ganar espacio adicional en piso. Realiza exhibición extra. Toma fotos y marca como completado.
                        </div>
                      </div>
                    </div>

                    {/* Photo button */}
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      📷 Tomar Foto de Evidencia
                    </button>

                    {/* Checkbox */}
                    <label className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2.5 cursor-pointer">
                      <input type="checkbox" className="rounded text-green-600 w-4 h-4" />
                      <span className="text-xs text-gray-700">✓ Marcar como Realizado</span>
                    </label>
                  </div>
                </div>

                {/* Home button */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(actionType !== 'exhibicionesAdicionales' || (resumenData && resumenData.tiendas_viables > 0)) && (
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