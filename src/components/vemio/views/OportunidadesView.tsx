/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { 
  useValorizacionSummary, 
  useAgotadoDetalle, 
  useCaducidadDetalle, 
  useSinVentasDetalle 
} from "@/hooks/useValorizacion";

interface OportunidadesViewProps {
  // Props are now optional since we're using the hook
  data?: any;
}

type OpportunityType = 'agotado' | 'caducidad' | 'sinVenta';

export default function OportunidadesView({ data: propData }: OportunidadesViewProps) {
  const [expandedCard, setExpandedCard] = useState<OpportunityType | null>(null);

  // Fetch summary data from the database
  const { data: valorizacionData, loading, error } = useValorizacionSummary();
  
  // Fetch detailed data for each opportunity type (only fetch when needed, but load on mount for better UX)
  const { data: agotadoDetalleData, loading: agotadoLoading } = useAgotadoDetalle();
  const { data: caducidadDetalleData, loading: caducidadLoading } = useCaducidadDetalle();
  const { data: sinVentasDetalleData, loading: sinVentasLoading } = useSinVentasDetalle();

  // Transform detailed data to match the expected format for the table
  const transformAgotadoData = (data: any) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item: any, index: number) => ({
      id: `agotado-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      diasInventario: item.dias_inventario,
      segmentoTienda: item.segment.toLowerCase(),
      impactoEstimado: item.impacto,
      fechaDeteccion: item.detectado
    }));
  };

  const transformCaducidadData = (data: any) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item: any, index: number) => ({
      id: `caducidad-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      inventarioRemanente: item.inventario_remanente,
      fechaCaducidad: item.fecha_caducidad,
      segmentoTienda: item.segment.toLowerCase(),
      impactoEstimado: item.impacto,
      fechaDeteccion: item.detectado
    }));
  };

  const transformSinVentasData = (data: any) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item: any, index: number) => ({
      id: `sinventa-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      diasSinVenta: 0, // Not provided in API
      ultimaVenta: new Date().toISOString(), // Not provided in API
      impactoEstimado: item.impacto,
      fechaDeteccion: new Date().toISOString() // Not provided in API
    }));
  };

  // Use real data if available, otherwise fall back to prop data
  // If there's an error, we'll use propData as fallback (graceful degradation)
  const data = valorizacionData ? {
    agotado: {
      impacto: valorizacionData.agotado.impacto,
      tiendas: valorizacionData.agotado.tiendas,
      registros: agotadoDetalleData ? transformAgotadoData(agotadoDetalleData) : (propData?.agotado?.registros || [])
    },
    caducidad: {
      impacto: valorizacionData.caducidad.impacto,
      tiendas: valorizacionData.caducidad.tiendas,
      registros: caducidadDetalleData ? transformCaducidadData(caducidadDetalleData) : (propData?.caducidad?.registros || [])
    },
    sinVenta: {
      impacto: valorizacionData.sinVentas.impacto,
      tiendas: valorizacionData.sinVentas.tiendas,
      registros: sinVentasDetalleData ? transformSinVentasData(sinVentasDetalleData) : (propData?.sinVenta?.registros || [])
    }
  } : propData;

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

  const getCardIcon = (type: OpportunityType, colorClass: string) => {
    switch (type) {
      case 'agotado':
        return (
          <svg className={`h-8 w-8 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'caducidad':
        return (
          <svg className={`h-8 w-8 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sinVenta':
        return (
          <svg className={`h-8 w-8 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
    }
  };

  const getCardTitle = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return 'Agotado';
      case 'caducidad':
        return 'Caducidad';
      case 'sinVenta':
        return 'Sin Venta';
    }
  };

  const getCardDescription = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return 'Inventario < 10 días (Tiendas Hot y Balanceadas)';
      case 'caducidad':
        return 'Inventario remanente al 1-feb-2025 (Tiendas Slow y Críticas)';
      case 'sinVenta':
        return 'Ventas <= 0 unidades';
    }
  };

  const getCardColor = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return {
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-400',
          icon: 'text-red-500 dark:text-red-400'
        };
      case 'caducidad':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/10',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-400',
          icon: 'text-amber-500 dark:text-amber-400'
        };
      case 'sinVenta':
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/10',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-400',
          icon: 'text-slate-500 dark:text-slate-400'
        };
    }
  };

  const toggleExpanded = (type: OpportunityType) => {
    setExpandedCard(expandedCard === type ? null : type);
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'balanceada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'slow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'critica':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDetailLoading = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return agotadoLoading;
      case 'caducidad':
        return caducidadLoading;
      case 'sinVenta':
        return sinVentasLoading;
    }
  };

  const renderOpportunityCard = (type: OpportunityType, opportunityData: any) => {
    const colors = getCardColor(type);
    const isDetailLoading = getDetailLoading(type);
    
    return (
      <div key={type} className={`rounded-lg shadow-sm border-2 ${colors.bg} ${colors.border}`}>
        {/* Card Header */}
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCardIcon(type, colors.icon)}
              <div>
                <h3 className={`text-xl font-bold ${colors.text}`}>{getCardTitle(type)}</h3>
                <p className={`text-sm mt-1 ${colors.text} opacity-75`}>{getCardDescription(type)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Metrics */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className={`text-sm ${colors.text} opacity-75`}>Impacto Total</div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {formatCurrency(opportunityData.impacto)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className={`text-sm ${colors.text} opacity-75`}>Tiendas Afectadas</div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {opportunityData.tiendas}
              </div>
            </div>
          </div>

          {/* Ver Detalle Button */}
          {isDetailLoading ? (
            <button
              disabled
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-400 text-white rounded-lg cursor-not-allowed"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Cargando detalles...
            </button>
          ) : opportunityData.registros && opportunityData.registros.length > 0 ? (
            <button
              onClick={() => toggleExpanded(type)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Detalle ({opportunityData.registros.length} registros)
              <svg
                className={`h-4 w-4 ml-2 transform transition-transform ${expandedCard === type ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registros detallados no disponibles
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expandedCard === type && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Registros Detallados - {getCardTitle(type)}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tienda
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    {type === 'agotado' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Días Inventario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Segmento
                        </th>
                      </>
                    )}
                    {type === 'caducidad' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Inv. Remanente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha Caducidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Segmento
                        </th>
                      </>
                    )}
                    {type !== 'sinVenta' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Impacto
                      </th>
                    )}
                    {type === 'sinVenta' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Impacto
                      </th>
                    )}
                    {type !== 'sinVenta' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Detectado
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {opportunityData.registros.map((registro: any) => (
                    <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {registro.tienda}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {registro.sku}
                      </td>
                      {type === 'agotado' && (
                        <>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {registro.diasInventario} días
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda)}`}>
                              {registro.segmentoTienda}
                            </span>
                          </td>
                        </>
                      )}
                      {type === 'caducidad' && (
                        <>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                            {registro.inventarioRemanente} unidades
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(registro.fechaCaducidad).toLocaleDateString('es-MX')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda)}`}>
                              {registro.segmentoTienda}
                            </span>
                          </td>
                        </>
                      )}
                      {type !== 'sinVenta' && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(registro.impactoEstimado)}
                        </td>
                      )}
                      {type === 'sinVenta' && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(registro.impactoEstimado)}
                        </td>
                      )}
                      {type !== 'sinVenta' && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(registro.fechaDeteccion).toLocaleDateString('es-MX')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading only if we don't have fallback data
  if (loading && !propData) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oportunidades Detectadas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análisis de riesgos operativos y oportunidades de mejora por categoría de problema.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando datos...</span>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oportunidades Detectadas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análisis de riesgos operativos y oportunidades de mejora por categoría de problema.
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oportunidades Detectadas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis de riesgos operativos y oportunidades de mejora por categoría de problema.
            </p>
          </div>
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Cargando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Connection Warning */}
      {error && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Mostrando datos de demostración
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                No se pudo conectar a la base de datos. Asegúrate de que el esquema &apos;gonac&apos; esté expuesto en Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Cards */}
      <div className={`space-y-6 relative ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
        {Object.entries(data).map(([type, opportunityData]) =>
          renderOpportunityCard(type as OpportunityType, opportunityData)
        )}
      </div>
    </div>
  );
}