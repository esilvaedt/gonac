import { useState } from "react";
import { VemioData } from "@/data/vemio-mock-data";
import { useSegmentacionFormatted, useSegmentacionDetalleGrouped } from "@/hooks/useSegmentacion";

interface TiendasViewProps {
  data: VemioData;
}

type SegmentType = 'hot' | 'balanceadas' | 'slow' | 'criticas';

// Map API segment names to UI segment types
const mapSegmentToType = (segment: string): SegmentType | null => {
  const normalized = segment.toLowerCase().trim();

  if (normalized === 'hot') return 'hot';
  if (normalized === 'balanceadas' || normalized === 'balanceada' || normalized === 'balanced') return 'balanceadas';
  if (normalized === 'slow') return 'slow';
  if (normalized === 'criticas' || normalized === 'critica' || normalized === 'críticas' || normalized === 'crítica' || normalized === 'dead') return 'criticas';

  return null;
};

export default function TiendasView({ data }: TiendasViewProps) {
  const [expandedSegment, setExpandedSegment] = useState<SegmentType | null>(null);

  // Fetch real segmentation data
  const { data: segmentacionData, loading, error } = useSegmentacionFormatted({ autoFetch: true });
  
  // Fetch grouped store details
  const { data: groupedStoresData, loading: loadingStores, error: errorStores } = useSegmentacionDetalleGrouped({ autoFetch: true });

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

  const getSegmentConfig = (segment: SegmentType) => {
    const configs = {
      hot: {
        title: 'Hot',
        description: 'Entidades que están haciendo la mayor contribución y donde el objetivo principal es maximizar la venta',
        color: 'red',
        bgColor: 'bg-red-50 dark:bg-red-900/10',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-900 dark:text-red-100',
        badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: (
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        ),
        actions: [
          {
            label: 'Evitar Agotados',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )
          },
          {
            label: 'Monitorear reabasto continuo',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            )
          },
          {
            label: 'Negociar exhibiciones',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            label: 'Concentrar inversión trade',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        ]
      },
      balanceadas: {
        title: 'Balanceadas',
        description: 'Entidades que están performando acorde al plan objetivo y por lo tanto no representan una oportunidad necesaria de ir a capturar',
        color: 'green',
        bgColor: 'bg-green-50 dark:bg-green-900/10',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-900 dark:text-green-100',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: (
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        actions: [
          {
            label: 'Mantener disponibilidad',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            label: 'Monitorear sell-through',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          },
          {
            label: 'Reabasto programado',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            label: 'Potencial de crecimiento',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )
          }
        ]
      },
      slow: {
        title: 'Slow',
        description: 'Entidades que tienen un desempeño por debajo de lo esperado y que por lo tanto debemos valorizar el gap que hay vs objetivo',
        color: 'yellow',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-900 dark:text-yellow-100',
        badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: (
          <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        actions: [
          {
            label: 'Riesgo de caducidad',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            label: 'Evaluar promociones',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )
          },
          {
            label: 'Activar promotoría',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )
          },
          {
            label: 'Optimizar inventario',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )
          }
        ]
      },
      criticas: {
        title: 'Críticas',
        description: 'Entidades que es urgente activar un plan de acción porque más allá del retorno, es inaceptable tener un desempeño en 0',
        color: 'purple',
        bgColor: 'bg-purple-50 dark:bg-purple-900/10',
        borderColor: 'border-purple-200 dark:border-purple-800',
        textColor: 'text-purple-900 dark:text-purple-100',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: (
          <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        actions: [
          {
            label: 'Sin rotación - Acción inmediata',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )
          },
          {
            label: 'Riesgo de caducidad alto',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            label: 'Revisar estrategia de distribución',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            )
          },
          {
            label: 'Evaluar descontinuación',
            enabled: true,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )
          }
        ]
      }
    };
    return configs[segment];
  };

  const getRecommendations = (segment: SegmentType) => {
    const recommendations = {
      hot: [
        'Asegurar disponibilidad continua de inventario',
        'Maximizar espacios de exhibición',
        'Implementar promociones para acelerar rotación',
        'Monitorear diariamente para prevenir quiebres'
      ],
      balanceadas: [
        'Mantener niveles de inventario actuales',
        'Monitoreo semanal de performance',
        'Continuar con estrategia actual',
        'Evaluar oportunidades de optimización'
      ],
      slow: [
        'Activar promociones para acelerar sell-through',
        'Revisar ubicación y visibilidad en tienda',
        'Evaluar transferencias a tiendas hot',
        'Implementar degustaciones o activaciones'
      ],
      criticas: [
        'Acción inmediata requerida - Visita de campo',
        'Validar exhibición y disponibilidad en anaquel',
        'Promociones agresivas para evacuar inventario',
        'Considerar transferencias urgentes'
      ]
    };
    return recommendations[segment];
  };

  const toggleExpand = (segment: SegmentType) => {
    setExpandedSegment(expandedSegment === segment ? null : segment);
  };

  // Use real data if available, fallback to mock data
  const segmentData = data.tiendasSegmentacion;
  const totalStores = segmentData.hot.count + segmentData.balanceadas.count + segmentData.slow.count + segmentData.criticas.count;

  // Build segment metrics from API data
  const buildSegmentMetrics = () => {
    if (!segmentacionData?.cards) return null;

    const metrics: Record<SegmentType, {
      count: number;
      percentage: number;
      contribution: number;
      metrics: {
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        ventaSemanalTiendaUnidades: number;
        diasInventario: number;
      };
      stores: Array<{
        id: string;
        nombre: string;
        ubicacion: string;
        ventasValor: number;
        ventasUnidades: number;
        ventaSemanalTienda: number;
        diasInventario: number;
      }>;
    }> = {
      hot: { count: 0, percentage: 0, contribution: 0, metrics: { ventasValor: 0, ventasUnidades: 0, ventaSemanalTienda: 0, ventaSemanalTiendaUnidades: 0, diasInventario: 0 }, stores: [] },
      balanceadas: { count: 0, percentage: 0, contribution: 0, metrics: { ventasValor: 0, ventasUnidades: 0, ventaSemanalTienda: 0, ventaSemanalTiendaUnidades: 0, diasInventario: 0 }, stores: [] },
      slow: { count: 0, percentage: 0, contribution: 0, metrics: { ventasValor: 0, ventasUnidades: 0, ventaSemanalTienda: 0, ventaSemanalTiendaUnidades: 0, diasInventario: 0 }, stores: [] },
      criticas: { count: 0, percentage: 0, contribution: 0, metrics: { ventasValor: 0, ventasUnidades: 0, ventaSemanalTienda: 0, ventaSemanalTiendaUnidades: 0, diasInventario: 0 }, stores: [] }
    };

    segmentacionData.cards.forEach(card => {
      const segmentType = mapSegmentToType(card.segment);
      if (segmentType) {
        // Get stores from grouped data if available
        const storesForSegment = groupedStoresData?.data?.[card.segment] || [];
        
        metrics[segmentType] = {
          count: card.num_tiendas_segmento,
          percentage: parseFloat(card.participacion_segmento),
          contribution: parseFloat(card.contribucion_porcentaje),
          metrics: {
            ventasValor: parseFloat(card.ventas_valor.replace(/[^0-9.-]+/g, '')),
            ventasUnidades: parseFloat(card.ventas_unidades.replace(/[^0-9.-]+/g, '')),
            ventaSemanalTienda: parseFloat(card.ventas_semana_promedio_tienda_pesos.replace(/[^0-9.-]+/g, '')),
            ventaSemanalTiendaUnidades: parseFloat(card.ventas_semana_promedio_tienda_unidades?.replace(/[^0-9.-]+/g, '') || '0'),
            diasInventario: parseFloat(card.dias_inventario)
          },
          // Map API stores to UI format
          stores: storesForSegment.map(store => ({
            id: store.store_name,
            nombre: store.store_name,
            ubicacion: store.store_name.includes('SUPERCITO') ? store.store_name.split('SUPERCITO')[1]?.trim() || '' : '',
            ventasValor: parseFloat(store.ventas_totales_pesos.toString()),
            ventasUnidades: store.ventas_totales_unidades,
            ventaSemanalTienda: store.venta_promedio_semanal,
            diasInventario: parseFloat(store.dias_inventario.toString())
          }))
        };
      }
    });

    return metrics;
  };

  const apiSegmentMetrics = buildSegmentMetrics();

  // Calculate totals from API data or fallback to mock
  const totalStoresFromAPI = segmentacionData?.summary.total_tiendas || totalStores;
  const totalVentasFromAPI = segmentacionData?.summary.total_ventas_valor 
    ? parseFloat(segmentacionData.summary.total_ventas_valor.replace(/[^0-9.-]+/g, ''))
    : (segmentData.hot.metrics.ventasValor + segmentData.balanceadas.metrics.ventasValor + segmentData.slow.metrics.ventasValor + segmentData.criticas.metrics.ventasValor);

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {(loading || loadingStores) && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Cargando datos de segmentación...' : 'Cargando detalles de tiendas...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {(error || errorStores) && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 shadow-sm border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar datos: {error?.message || errorStores?.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {!error && errorStores ? 'Métricas disponibles, detalles de tiendas no disponibles' : 'Mostrando datos de ejemplo'}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Segmentación de Tiendas
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Análisis de performance por tienda para identificar oportunidades de maximización de ventas y planes de acción específicos
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total de tiendas:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">{totalStoresFromAPI}</span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <span className="text-gray-500">Ventas totales:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalVentasFromAPI)}
            </span>
          </div>
          {segmentacionData && (
            <>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <span className="text-gray-500">Fuente:</span>
                <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">Datos en vivo</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Object.keys(segmentData) as SegmentType[]).map((segment) => {
          const config = getSegmentConfig(segment);
          // Use API data if available, otherwise use mock data
          const segData = apiSegmentMetrics?.[segment] || segmentData[segment];
          const isExpanded = expandedSegment === segment;

          return (
            <div
              key={segment}
              className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} overflow-hidden transition-all`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0">
                        {config.icon}
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${config.badgeColor}`}>
                        {config.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {segData.count}
                        </span>
                        <span className="text-sm text-gray-500">tiendas</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Metrics Summary */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">% del Total</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {segData.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">% Contribución</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {segData.contribution.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Ventas Valor</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(segData.metrics.ventasValor)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Ventas Unidades</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(segData.metrics.ventasUnidades)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Venta Semanal/Tienda</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(segData.metrics.ventaSemanalTienda)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Días Inventario</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {segData.metrics.diasInventario} días
                    </div>
                  </div>
                </div>

                {/* Recommendations Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    Recomendaciones de Gestión
                  </h4>
                  <div className="space-y-2 mb-4">
                    {getRecommendations(segment).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {config.actions.map((action, idx) => (
                    <button
                      key={idx}
                      disabled={!action.enabled}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${action.enabled
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        }`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => toggleExpand(segment)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Ver Detalle de Tiendas</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded Store Table */}
              {isExpanded && (
                <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {/* Header with data source badge */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Detalle de Tiendas - {config.title}
                    </h4>
                    {groupedStoresData && segData.stores.length > 0 && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                        Datos en vivo • {segData.stores.length} tiendas
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Tienda
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Ventas Valor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Unidades
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Venta Semanal
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Días Inv.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {segData.stores.length > 0 ? (
                          segData.stores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {store.nombre}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {store.ubicacion}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(store.ventasValor)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatNumber(store.ventasUnidades)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(store.ventaSemanalTienda)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {store.diasInventario.toFixed(0)} días
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {loadingStores ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                                    <span>Cargando tiendas...</span>
                                  </div>
                                ) : (
                                  <span>No hay tiendas disponibles en este segmento</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
