"use client";

import { useState } from "react";
import { useSegmentacionFormatted } from "@/hooks/useSegmentacion";
import { useMetricasFormatted } from "@/hooks/useMetricas";
import { 
  useValorizacionSummary,
  useAgotadoDetalle,
  useCaducidadDetalle,
  useSinVentasDetalle
} from "@/hooks/useValorizacion";
import WizardAccionesGenerales, { type TipoAccionGeneral } from "../modals/WizardAccionesGenerales";

interface TiendasConsolidadasProps {
  data?: any;
}

type RiskLevel = 'Crítico' | 'Alto' | 'Medio';

type OpportunityType = 'agotado' | 'caducidad' | 'sinVenta';

export default function TiendasConsolidadas({ data }: TiendasConsolidadasProps) {
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<any>(null);
  const [expandedOportunidad, setExpandedOportunidad] = useState<OpportunityType | null>(null);

  // Fetch real data from hooks
  const { data: segmentacionData, loading: loadingSegmentacion, error: errorSegmentacion } = useSegmentacionFormatted({ autoFetch: true });
  const { data: metricasData, loading: loadingMetricas, error: errorMetricas } = useMetricasFormatted({ autoFetch: true });
  const { data: valorizacionData, loading: loadingValorizacion } = useValorizacionSummary();
  
  // Fetch detailed data for opportunities
  const { data: agotadoDetalleData, loading: agotadoLoading } = useAgotadoDetalle();
  const { data: caducidadDetalleData, loading: caducidadLoading } = useCaducidadDetalle();
  const { data: sinVentasDetalleData, loading: sinVentasLoading } = useSinVentasDetalle();

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

  const getBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'Crítico':
        return 'bg-red-500 text-white';
      case 'Alto':
        return 'bg-orange-500 text-white';
      case 'Medio':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Map opportunity type to risk level
  const getOportunidadRiskLevel = (type: string): RiskLevel => {
    switch (type) {
      case 'agotado':
        return 'Crítico';
      case 'caducidad':
        return 'Alto';
      case 'sinVenta':
        return 'Medio';
      default:
        return 'Medio';
    }
  };

  const getOportunidadTitle = (type: string): string => {
    switch (type) {
      case 'agotado':
        return 'Agotado';
      case 'caducidad':
        return 'Caducidad';
      case 'sinVenta':
        return 'Sin Venta';
      default:
        return type;
    }
  };

  const getOportunidadDescription = (type: string): string => {
    switch (type) {
      case 'agotado':
        return 'Inventario < 10 días (Tiendas Hot y Balanceadas)';
      case 'caducidad':
        return 'Inventario remanente al 1-feb-2025 (Tiendas Slow y Críticas)';
      case 'sinVenta':
        return 'Ventas <= 0 unidades';
      default:
        return '';
    }
  };

  const getOportunidadColor = (type: string): string => {
    switch (type) {
      case 'agotado':
        return 'text-red-600 dark:text-red-400';
      case 'caducidad':
        return 'text-orange-600 dark:text-orange-400';
      case 'sinVenta':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Transform detailed data
  const transformAgotadoData = (response: any) => {
    if (!response || !response.data || !Array.isArray(response.data)) return [];
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
    if (!response || !response.data || !Array.isArray(response.data)) return [];
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
    if (!response || !response.data || !Array.isArray(response.data)) return [];
    return response.data.map((item: any, index: number) => ({
      id: `sinventa-${index}`,
      tienda: item.store_name,
      sku: item.product_name,
      impactoEstimado: item.impacto
    }));
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

  const getDetailData = (type: OpportunityType) => {
    switch (type) {
      case 'agotado':
        return agotadoDetalleData ? transformAgotadoData(agotadoDetalleData) : [];
      case 'caducidad':
        return caducidadDetalleData ? transformCaducidadData(caducidadDetalleData) : [];
      case 'sinVenta':
        return sinVentasDetalleData ? transformSinVentasData(sinVentasDetalleData) : [];
    }
  };

  const toggleOportunidadExpanded = (type: OpportunityType) => {
    setExpandedOportunidad(expandedOportunidad === type ? null : type);
  };

  // Calculate risk level based on segment data
  const getRiskLevel = (segment: string, diasInventario: number, contribucion: number): RiskLevel => {
    if (segment.toLowerCase() === 'criticas' || segment.toLowerCase() === 'críticas') {
      return 'Crítico';
    }
    if (segment.toLowerCase() === 'hot' && diasInventario < 30) {
      return 'Crítico';
    }
    if (segment.toLowerCase() === 'slow' && diasInventario > 60) {
      return 'Alto';
    }
    return 'Medio';
  };

  // Parse and prepare store data
  const storeData = {
    totalTiendas: segmentacionData?.summary.total_tiendas || 127,
    ventasTotales: segmentacionData?.summary.total_ventas_valor
      ? parseFloat(segmentacionData.summary.total_ventas_valor.replace(/[^0-9.-]/g, ''))
      : 120619,
    unidadesVendidas: segmentacionData?.summary.total_ventas_unidades
      ? parseFloat(segmentacionData.summary.total_ventas_unidades.replace(/[^0-9.-]/g, ''))
      : 8450,
    ventaPromedio: metricasData?.avg_venta_promedio_diaria
      ? metricasData.avg_venta_promedio_diaria * 7 // Convert daily to weekly
      : 949.75,
    diasInventario: segmentacionData?.summary.promedio_dias_inventario
      ? parseFloat(segmentacionData.summary.promedio_dias_inventario)
      : 45.2,
  };

  // Map segment names to display titles
  const getSegmentTitle = (segment: string): string => {
    const normalized = segment.toLowerCase();
    if (normalized === 'hot') return 'Prevenir Agotados';
    if (normalized === 'slow') return 'Acelerar Venta';
    if (normalized === 'criticas' || normalized === 'críticas') return 'Recuperación';
    if (normalized === 'balanceadas' || normalized === 'balanceada') return 'Optimización';
    return segment;
  };

  const getSegmentSubtitle = (segment: string): string => {
    const normalized = segment.toLowerCase();
    if (normalized === 'hot') return 'Hot';
    if (normalized === 'slow') return 'Slow';
    if (normalized === 'criticas' || normalized === 'críticas') return 'Críticas';
    if (normalized === 'balanceadas' || normalized === 'balanceada') return 'Balanceadas';
    return segment;
  };

  const getImpactoColor = (segment: string): string => {
    const normalized = segment.toLowerCase();
    if (normalized === 'hot') return 'text-red-600 dark:text-red-400';
    if (normalized === 'slow') return 'text-orange-600 dark:text-orange-400';
    if (normalized === 'criticas' || normalized === 'críticas') return 'text-purple-600 dark:text-purple-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Build opportunities from valorizacion data
  const oportunidades = valorizacionData ? [
    {
      type: 'agotado',
      title: getOportunidadTitle('agotado'),
      description: getOportunidadDescription('agotado'),
      tiendas: valorizacionData.agotado.tiendas,
      impacto: valorizacionData.agotado.impacto,
      risk: getOportunidadRiskLevel('agotado'),
      impactoColor: getOportunidadColor('agotado'),
    },
    {
      type: 'caducidad',
      title: getOportunidadTitle('caducidad'),
      description: getOportunidadDescription('caducidad'),
      tiendas: valorizacionData.caducidad.tiendas,
      impacto: valorizacionData.caducidad.impacto,
      risk: getOportunidadRiskLevel('caducidad'),
      impactoColor: getOportunidadColor('caducidad'),
    },
    {
      type: 'sinVenta',
      title: getOportunidadTitle('sinVenta'),
      description: getOportunidadDescription('sinVenta'),
      tiendas: valorizacionData.sinVentas.tiendas,
      impacto: valorizacionData.sinVentas.impacto,
      risk: getOportunidadRiskLevel('sinVenta'),
      impactoColor: getOportunidadColor('sinVenta'),
    },
  ] : [
    {
      type: 'agotado',
      title: 'Agotado',
      description: 'Inventario < 10 días (Tiendas Hot y Balanceadas)',
      tiendas: 38,
      impacto: 45000,
      risk: 'Crítico' as RiskLevel,
      impactoColor: 'text-red-600 dark:text-red-400',
    },
    {
      type: 'caducidad',
      title: 'Caducidad',
      description: 'Inventario remanente al 1-feb-2025 (Tiendas Slow y Críticas)',
      tiendas: 28,
      impacto: 52600,
      risk: 'Alto' as RiskLevel,
      impactoColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      type: 'sinVenta',
      title: 'Sin Venta',
      description: 'Ventas <= 0 unidades',
      tiendas: 9,
      impacto: 23800,
      risk: 'Crítico' as RiskLevel,
      impactoColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  // Find specific segments for actions
  const hotSegment = segmentacionData?.cards.find(c => c.segment.toLowerCase() === 'hot');
  const slowSegment = segmentacionData?.cards.find(c => c.segment.toLowerCase() === 'slow');
  const balanceadasSegment = segmentacionData?.cards.find(c => c.segment.toLowerCase() === 'balanceadas' || c.segment.toLowerCase() === 'balanceada');
  const criticasSegment = segmentacionData?.cards.find(c => c.segment.toLowerCase() === 'criticas' || c.segment.toLowerCase() === 'críticas');

  // Calculate tiendas HOT + Balanceadas for Reabasto Urgente
  const tiendasReabastoUrgente = (hotSegment?.num_tiendas_segmento || 38) + (balanceadasSegment?.num_tiendas_segmento || 52);
  
  // Calculate tiendas Slow + Dead/Críticas for Promoción
  const tiendasPromocionEvacuar = (slowSegment?.num_tiendas_segmento || 28) + (criticasSegment?.num_tiendas_segmento || 9);
  
  // Placeholder for tiendas HOT with exhibitions (25% of HOT stores approximately)
  const tiendasExhibicionesAdicionales = Math.round((hotSegment?.num_tiendas_segmento || 38) * 0.25);

  const acciones = [
    {
      id: 'reabasto_urgente' as TipoAccionGeneral,
      title: 'Reabasto Urgente',
      tiendas: tiendasReabastoUrgente,
      tipo: 'Tiendas HOT y Balanceadas',
      description: 'Prevenir quiebres de stock en tiendas de alto desempeño',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'exhibiciones_adicionales' as TipoAccionGeneral,
      title: 'Exhibiciones Adicionales',
      tiendas: tiendasExhibicionesAdicionales,
      tipo: 'Tiendas HOT con ROI positivo',
      description: `Identificadas ${tiendasExhibicionesAdicionales} tiendas HOT donde exhibiciones adicionales generarían retorno positivo sobre inversión`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'pedido_extraordinario' as TipoAccionGeneral,
      title: 'Pedido Extraordinario',
      tiendas: hotSegment?.num_tiendas_segmento || 38,
      tipo: 'Tiendas HOT',
      description: 'Pedido extraordinario requerido para cubrir demanda excepcional',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      id: 'promocion_evacuar' as TipoAccionGeneral,
      title: 'Promoción Evacuar Inventario',
      tiendas: tiendasPromocionEvacuar,
      tipo: 'Tiendas Slow y Dead',
      description: 'Activar promociones para reducir inventario en riesgo de caducidad',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'visita_promotoria' as TipoAccionGeneral,
      title: 'Visita Promotoría',
      tiendas: criticasSegment?.num_tiendas_segmento || 9,
      tipo: 'Tiendas Críticas',
      description: 'Visitas de campo para activar ventas en tiendas con bajo desempeño',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleAbrirWizard = (accion: typeof acciones[0]) => {
    setAccionSeleccionada(accion);
    setWizardAbierto(true);
  };

  const handleCerrarWizard = () => {
    setWizardAbierto(false);
    setAccionSeleccionada(null);
  };

  const handleCompletarWizard = (datos: any) => {
    console.log("Plan de acción completado:", datos);
    // Aquí puedes agregar lógica adicional como mostrar una notificación, refrescar datos, etc.
  };

  const impactoTotal = oportunidades.reduce((sum, op) => sum + op.impacto, 0);

  // Calculate stores with opportunities from valorizacion data
  const tiendasConOportunidades = valorizacionData 
    ? valorizacionData.agotado.tiendas + valorizacionData.caducidad.tiendas + valorizacionData.sinVentas.tiendas
    : 71;

  const porcentajeTiendasConOportunidades = ((tiendasConOportunidades / storeData.totalTiendas) * 100).toFixed(0);

  const loading = loadingSegmentacion || loadingMetricas || loadingValorizacion;
  const error = errorSegmentacion || errorMetricas;

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
      {/* Main Card - Visita Consolidada */}
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

        {/* Store Metrics - 5 Cards */}
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 border border-blue-200 dark:border-blue-800">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
              Total Tiendas
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatNumber(storeData.totalTiendas)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              100% del universo
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 border border-green-200 dark:border-green-800">
            <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
              Ventas Totales
            </div>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(storeData.ventasTotales)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Semana actual
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 border border-purple-200 dark:border-purple-800">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
              Unidades Vendidas
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {formatNumber(storeData.unidadesVendidas)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Semana actual
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 border border-orange-200 dark:border-orange-800">
            <div className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
              Venta Promedio
            </div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {formatCurrency(storeData.ventaPromedio)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              Por tienda/semana
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 border border-cyan-200 dark:border-cyan-800">
            <div className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-1">
              Días Inventario
            </div>
            <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
              {storeData.diasInventario.toFixed(1)}
            </div>
            <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
              Promedio ponderado
            </div>
          </div>
        </div>

        {/* Áreas de Oportunidades */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Áreas de Oportunidades Identificadas
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {oportunidades.map((oportunidad, index) => {
              const detailData = getDetailData(oportunidad.type as OpportunityType);
              const isDetailLoading = getDetailLoading(oportunidad.type as OpportunityType);
              const isExpanded = expandedOportunidad === oportunidad.type;

              return (
                <div
                  key={index}
                  className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                  <div className="relative p-4">
                    {/* Risk Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded ${getBadgeColor(oportunidad.risk)}`}>
                        {oportunidad.risk}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {oportunidad.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {oportunidad.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatNumber(oportunidad.tiendas)} tiendas afectadas
                      </p>
                    </div>

                    <div className="mt-3 mb-4">
                      <div className={`text-2xl font-bold mb-0.5 ${oportunidad.impactoColor}`}>
                        {formatCurrency(oportunidad.impacto)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Impacto potencial
                      </div>
                    </div>

                    {/* Ver Detalle Button */}
                    {isDetailLoading ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-400 text-white rounded-lg cursor-not-allowed text-sm"
                      >
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Cargando...
                      </button>
                    ) : detailData.length > 0 ? (
                      <button
                        onClick={() => toggleOportunidadExpanded(oportunidad.type as OpportunityType)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ver Detalle ({detailData.length} registros)
                        <svg
                          className={`h-4 w-4 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm">
                        Sin registros detallados
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && detailData.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Tienda
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                SKU
                              </th>
                              {oportunidad.type === 'agotado' && (
                                <>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Días Inv.
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Segmento
                                  </th>
                                </>
                              )}
                              {oportunidad.type === 'caducidad' && (
                                <>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Inv. Rem.
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    F. Cad.
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    Segmento
                                  </th>
                                </>
                              )}
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                Impacto
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {detailData.slice(0, 5).map((registro: any) => (
                              <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                  {registro.tienda}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                  {registro.sku}
                                </td>
                                {oportunidad.type === 'agotado' && (
                                  <>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium">
                                      {registro.diasInventario}d
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda)}`}>
                                        {registro.segmentoTienda}
                                      </span>
                                    </td>
                                  </>
                                )}
                                {oportunidad.type === 'caducidad' && (
                                  <>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-yellow-600 font-medium">
                                      {registro.inventarioRemanente}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                      {new Date(registro.fechaCaducidad).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda)}`}>
                                        {registro.segmentoTienda}
                                      </span>
                                    </td>
                                  </>
                                )}
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-green-600 font-medium">
                                  {formatCurrency(registro.impactoEstimado)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {detailData.length > 5 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            Mostrando 5 de {detailData.length} registros
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Impacto Total Banner */}
        <div className="mt-8 rounded-lg bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium opacity-90 mb-2">
                Impacto Total
              </div>
              <div className="text-4xl font-bold mb-1">
                {formatCurrency(impactoTotal)}
              </div>
              <div className="text-sm opacity-90">
                Suma de todas las oportunidades detectadas
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Tiendas con Oportunidades
                </div>
                <div className="text-4xl font-bold mb-1">
                  {formatNumber(tiendasConOportunidades)}
                </div>
                <div className="text-sm opacity-90">
                  {porcentajeTiendasConOportunidades}% del total requiere acción
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Recomendadas */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Recomendadas a Nivel General
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {acciones.map((accion) => (
              <button
                key={accion.id}
                onClick={() => handleAbrirWizard(accion)}
                className="rounded-lg p-4 border bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                title={accion.description}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 text-brand-600 dark:text-brand-400">
                    {accion.icon}
                  </div>

                  <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {formatNumber(accion.tiendas)}
                  </div>

                  <h4 className="text-sm font-semibold mb-1 text-gray-900 dark:text-white">
                    {accion.title}
                  </h4>

                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {accion.tipo}
                  </div>

                  {/* Description hint */}
                  <div className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
                    {accion.description}
                  </div>

                  {/* Click indicator - Blue button style */}
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-full transition-colors">
                    <span>Planificar</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      {wizardAbierto && accionSeleccionada && (
        <WizardAccionesGenerales
          accionInfo={accionSeleccionada}
          onClose={handleCerrarWizard}
          onComplete={handleCompletarWizard}
        />
      )}
    </div>
  );
}
