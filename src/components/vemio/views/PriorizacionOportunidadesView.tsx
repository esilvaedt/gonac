/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useValorizacionSummary,
  useAgotadoDetalle,
  useCaducidadDetalle,
  useSinVentasDetalle
} from "@/hooks/useValorizacion";

// Tipos de severidad/prioridad
type SeveridadType = "critica" | "alta" | "media" | "optimizacion";
type OpportunityType = 'agotado' | 'caducidad' | 'sinVenta' | 'bajoSellThrough';

export default function PriorizacionOportunidadesView() {
  const router = useRouter();
  const [expandedCard, setExpandedCard] = useState<OpportunityType | null>(null);

  // Fetch summary data from the database
  const { data: valorizacionData, loading, error } = useValorizacionSummary();

  // Fetch detailed data for each opportunity type
  const { data: agotadoDetalleData, loading: agotadoLoading } = useAgotadoDetalle();
  const { data: caducidadDetalleData, loading: caducidadLoading } = useCaducidadDetalle();
  const { data: sinVentasDetalleData, loading: sinVentasLoading } = useSinVentasDetalle();

  // Transform detailed data to match the expected format for the table
  const transformAgotadoData = (response: any) => {
    if (!response || !response.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((item: any, index: number) => ({
      id: `agotado-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      diasInventario: item.dias_inventario,
      segmentoTienda: item.segment.toLowerCase(),
      impactoEstimado: item.impacto,
      fechaDeteccion: item.detectado
    }));
  };

  const transformCaducidadData = (response: any) => {
    if (!response || !response.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((item: any, index: number) => ({
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

  const transformSinVentasData = (response: any) => {
    if (!response || !response.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map((item: any, index: number) => ({
      id: `sinventa-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      impactoEstimado: item.impacto
    }));
  };

  // Preparar datos de las 4 oportunidades
  const oportunidades = valorizacionData ? [
    {
      id: 'agotado',
      type: 'agotado' as OpportunityType,
      categoria: 'Agotado - Tiendas Hot',
      descripcion: 'SKUs sin inventario en tiendas de alta rotación',
      severidad: 'critica' as SeveridadType,
      impacto: valorizacionData.agotado.impacto,
      tiendas: valorizacionData.agotado.tiendas,
      registros: agotadoDetalleData ? transformAgotadoData(agotadoDetalleData) : [],
      accionSugerida: 'Reabasto urgente + Monitoreo continuo',
      icono: 'alert-triangle' as const
    },
    {
      id: 'bajoSellThrough',
      type: 'bajoSellThrough' as OpportunityType,
      categoria: 'Bajo Sell-Through - Top SKUs',
      descripcion: 'Productos estrella con rotación por debajo del objetivo',
      severidad: 'optimizacion' as SeveridadType,
      impacto: 98750, // Mock data - TODO: conectar con API real
      tiendas: 32,
      registros: [],
      accionSugerida: 'Promoción + Exhibición adicional',
      icono: 'trending-down' as const
    },
    {
      id: 'caducidad',
      type: 'caducidad' as OpportunityType,
      categoria: 'Caducidad - Tiendas Slow',
      descripcion: 'Inventario con riesgo de caducidad en tiendas lentas',
      severidad: 'alta' as SeveridadType,
      impacto: valorizacionData.caducidad.impacto,
      tiendas: valorizacionData.caducidad.tiendas,
      registros: caducidadDetalleData ? transformCaducidadData(caducidadDetalleData) : [],
      accionSugerida: 'Descuento agresivo + Redistribución',
      icono: 'warning' as const
    },
    {
      id: 'sinVenta',
      type: 'sinVenta' as OpportunityType,
      categoria: 'Sin Venta - Productos Críticos',
      descripcion: 'Productos sin movimiento en el período evaluado',
      severidad: 'media' as SeveridadType,
      impacto: valorizacionData.sinVentas.impacto,
      tiendas: valorizacionData.sinVentas.tiendas,
      registros: sinVentasDetalleData ? transformSinVentasData(sinVentasDetalleData) : [],
      accionSugerida: 'Promoción + Visita promotoría',
      icono: 'trending-down' as const
    }
  ] : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const getSeveridadConfig = (severidad: SeveridadType) => {
    const configs = {
      critica: {
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-800/50",
        badge: "bg-red-600",
        badgeText: "Crítica",
        text: "text-red-900 dark:text-red-100",
        icon: "text-red-600 dark:text-red-400"
      },
      alta: {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-800/50",
        badge: "bg-orange-600",
        badgeText: "Alta",
        text: "text-orange-900 dark:text-orange-100",
        icon: "text-orange-600 dark:text-orange-400"
      },
      optimizacion: {
        bg: "bg-purple-50 dark:bg-purple-950/20",
        border: "border-purple-200 dark:border-purple-800/50",
        badge: "bg-purple-600",
        badgeText: "Optimización",
        text: "text-purple-900 dark:text-purple-100",
        icon: "text-purple-600 dark:text-purple-400"
      },
      media: {
        bg: "bg-[#F9FAFC] dark:bg-slate-900/20",
        border: "border-slate-200 dark:border-slate-800/50",
        badge: "bg-slate-500",
        badgeText: "Media",
        text: "text-slate-900 dark:text-slate-100",
        icon: "text-slate-500 dark:text-slate-400"
      }
    };
    return configs[severidad];
  };

  const renderIcon = (tipo: 'alert-triangle' | 'trending-down' | 'warning', colorClass: string) => {
    const iconos = {
      "alert-triangle": (
        <svg className={`h-6 w-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      "trending-down": (
        <svg className={`h-6 w-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      "warning": (
        <svg className={`h-6 w-6 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    };
    return iconos[tipo];
  };

  const toggleCard = (type: OpportunityType) => {
    setExpandedCard(expandedCard === type ? null : type);
  };

  const getDetailLoading = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return agotadoLoading;
      case 'caducidad':
        return caducidadLoading;
      case 'sinVenta':
        return sinVentasLoading;
      case 'bajoSellThrough':
        return false; // TODO: implementar cuando exista el hook
      default:
        return false;
    }
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

  const renderOpportunityCard = (opp: any) => {
    const colors = getSeveridadConfig(opp.severidad);
    const isDetailLoading = getDetailLoading(opp.type);
    const isExpanded = expandedCard === opp.type;
    const hasRegistros = opp.registros && opp.registros.length > 0;

    return (
      <div
        key={opp.id}
        className={`rounded-xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} ${
          isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
        }`}
      >
        {/* Card Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              {/* Icono */}
              <div className="mt-1">
                {renderIcon(opp.icono, colors.icon)}
              </div>

              {/* Título y descripción */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg font-semibold ${colors.text}`}>
                    {opp.categoria}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${colors.badge}`}>
                    {colors.badgeText}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {opp.descripcion}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Impacto Monetario */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Impacto Monetario
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(opp.impacto)}
              </div>
            </div>

            {/* Tiendas Afectadas */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Tiendas Afectadas
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(opp.tiendas)}
              </div>
            </div>
          </div>

          {/* Acción Sugerida */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Acción Sugerida
            </div>
            <div className="text-sm text-gray-900 dark:text-white">
              {opp.accionSugerida}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            {(hasRegistros || opp.type === 'bajoSellThrough') && (
              <button
                onClick={() => toggleCard(opp.type)}
                disabled={isDetailLoading}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {isDetailLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalle
                  </>
                )}
              </button>
            )}
            <button 
              onClick={() => router.push('/demo/wizard-plan')}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Crear Plan Prescriptivo
              <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sección expandible de detalles */}
        {isExpanded && hasRegistros && (
          <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-6">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Registros Detallados - {opp.categoria}
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
                    {opp.type === 'agotado' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Días Inventario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Segmento
                        </th>
                      </>
                    )}
                    {opp.type === 'caducidad' && (
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Impacto
                    </th>
                    {opp.type !== 'sinVenta' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Detectado
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {opp.registros.map((registro: any) => (
                    <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {registro.tienda}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {registro.sku}
                      </td>
                      {opp.type === 'agotado' && (
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
                      {opp.type === 'caducidad' && (
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(registro.impactoEstimado)}
                      </td>
                      {opp.type !== 'sinVenta' && (
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

        {/* Mensaje para Bajo Sell-Through (sin datos aún) */}
        {isExpanded && opp.type === 'bajoSellThrough' && (
          <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 p-6">
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Detalles en desarrollo - Próximamente disponible
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading only if we don't have data
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Centro de Oportunidades
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Identifica y prioriza oportunidades de captura de valor con impacto medible
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
  if (!valorizacionData) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Centro de Oportunidades
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Identifica y prioriza oportunidades de captura de valor con impacto medible
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Calculate total impact
  const impactoTotal = oportunidades.reduce((sum, opp) => sum + opp.impacto, 0);
  const oportunidadesActivas = oportunidades.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Título y descripción */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Centro de Oportunidades
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Identifica y prioriza oportunidades de captura de valor con impacto medible
          </p>
        </div>

        {/* Card de resumen */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900/50 min-w-[280px]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Impacto Total Potencial
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            {formatCurrency(impactoTotal)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {oportunidadesActivas} oportunidades activas
          </div>
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
                Advertencia de conexión
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                Hubo un problema al cargar los datos. Asegúrate de que el esquema &apos;gonac&apos; esté expuesto en Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Oportunidades */}
      <div className="space-y-4">
        {oportunidades.map((opp) => renderOpportunityCard(opp))}
      </div>
    </div>
  );
}
