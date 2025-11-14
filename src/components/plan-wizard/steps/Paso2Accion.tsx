"use client";

import { useState } from "react";
import { DatosWizard } from "../WizardPlanPrescriptivo";

interface Paso2AccionProps {
  datos: DatosWizard;
  onActualizar: (datos: Partial<DatosWizard>) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
}

type TipoAccionDetallado = 'reabastoUrgente' | 'exhibicionesAdicionales' | 'promocionEvacuar' | 'visitaPromotoria';

export default function Paso2Accion({ datos, onActualizar, onSiguiente, onAnterior }: Paso2AccionProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<TipoAccionDetallado | null>(
    datos.accionSeleccionada as TipoAccionDetallado | null
  );

  // Parámetros para Reabasto Urgente
  const [diasCobertura, setDiasCobertura] = useState<number>(
    datos.parametros.diasCobertura || 30
  );
  const [stockObjetivo, setStockObjetivo] = useState<number>(
    datos.parametros.stockObjetivo || 100
  );

  // Parámetros para Exhibiciones Adicionales
  const [costoExhibicion, setCostoExhibicion] = useState<number>(
    datos.parametros.costoExhibicion || 500
  );
  const [incrementoVentas, setIncrementoVentas] = useState<number>(
    datos.parametros.incrementoVentas || 50
  );

  // Parámetros para Promoción para Evacuar
  const [maxDescuento, setMaxDescuento] = useState<number>(
    datos.parametros.maxDescuento || 45
  );
  const [elasticidadPapas, setElasticidadPapas] = useState<number>(
    datos.parametros.elasticidadPapas || 1.5
  );
  const [elasticidadMix, setElasticidadMix] = useState<number>(
    datos.parametros.elasticidadMix || 1.8
  );

  // Parámetros para Visita Promotoría
  const [objetivoVisita, setObjetivoVisita] = useState<string>(
    datos.parametros.objetivoVisita || 'auditoria'
  );
  const [duracionVisita, setDuracionVisita] = useState<number>(
    datos.parametros.duracionVisita || 2
  );

  const handleSeleccionarAccion = (accion: TipoAccionDetallado) => {
    setAccionSeleccionada(accion);
  };

  const handleContinuar = () => {
    // Recopilar todos los parámetros según la acción seleccionada
    const parametrosFinales = {
      // Reabasto
      diasCobertura,
      stockObjetivo,
      // Exhibiciones
      costoExhibicion,
      incrementoVentas,
      // Promoción
      maxDescuento,
      elasticidadPapas,
      elasticidadMix,
      // Visita
      objetivoVisita,
      duracionVisita,
    };

    onActualizar({
      accionSeleccionada: accionSeleccionada as TipoAccionDetallado,
      parametros: parametrosFinales,
    });
    onSiguiente();
  };

  const acciones = [
    {
      id: 'reabastoUrgente' as TipoAccionDetallado,
      titulo: 'Reabasto Urgente',
      descripcion: 'Para tiendas HOT y Balanceadas con inventario bajo',
      icono: (
        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600',
      colorActivo: 'border-red-500 bg-red-50 dark:bg-red-950/20'
    },
    {
      id: 'exhibicionesAdicionales' as TipoAccionDetallado,
      titulo: 'Exhibiciones Adicionales',
      descripcion: 'Ganar espacio adicional en tiendas HOT con alto ROI',
      icono: (
        <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
      colorActivo: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
    },
    {
      id: 'promocionEvacuar' as TipoAccionDetallado,
      titulo: 'Promoción para Evacuar Inventario',
      descripcion: 'Descuentos estratégicos en tiendas Slow y Dead',
      icono: (
        <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600',
      colorActivo: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
    },
    {
      id: 'visitaPromotoria' as TipoAccionDetallado,
      titulo: 'Visita Promotoría',
      descripcion: 'Visita presencial para auditoría y optimización',
      icono: (
        <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600',
      colorActivo: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
    },
  ];

  const renderParametrosAccion = () => {
    switch (accionSeleccionada) {
      case 'reabastoUrgente':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuración de Reabasto Urgente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Días de Cobertura Objetivo
                </label>
                <input
                  type="number"
                  value={diasCobertura}
                  onChange={(e) => setDiasCobertura(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 30"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Días de inventario post-reabasto
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Objetivo por SKU (unidades)
                </label>
                <input
                  type="number"
                  value={stockObjetivo}
                  onChange={(e) => setStockObjetivo(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unidades mínimas por tienda
                </p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">💡 Nota:</span> Se priorizarán tiendas HOT y Balanceadas con inventario menor a 10 días de cobertura.
              </p>
            </div>
          </div>
        );

      case 'exhibicionesAdicionales':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuración de Exhibiciones Adicionales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Costo por Exhibición ($)
                </label>
                <input
                  type="number"
                  value={costoExhibicion}
                  onChange={(e) => setCostoExhibicion(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Costo mensual por espacio adicional
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Incremento en Ventas Esperado (%)
                </label>
                <input
                  type="number"
                  value={incrementoVentas}
                  onChange={(e) => setIncrementoVentas(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Aumento esperado en ventas con exhibición
                </p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">💡 Viabilidad:</span> Solo se implementarán exhibiciones donde el ROI sea positivo: (Venta Incremental - Costo Exhibición) &gt; 0
              </p>
            </div>
          </div>
        );

      case 'promocionEvacuar':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuración de Promoción
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Máximo Descuento (%)
                </label>
                <input
                  type="number"
                  value={maxDescuento}
                  onChange={(e) => setMaxDescuento(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 45"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Descuento máximo permitido
                </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 1.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sugerido: 1.5
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Elasticidad Mix
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={elasticidadMix}
                  onChange={(e) => setElasticidadMix(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 1.8"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sugerido: 1.8
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">📊 Cálculo:</span> Incremento ventas = Elasticidad × % Descuento. 
                Ej: Con {maxDescuento}% descuento y elasticidad {elasticidadPapas}, las ventas aumentan {(elasticidadPapas * maxDescuento).toFixed(0)}%.
              </p>
            </div>
          </div>
        );

      case 'visitaPromotoria':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuración de Visita Promotoría
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo de la Visita
                </label>
                <select
                  value={objetivoVisita}
                  onChange={(e) => setObjetivoVisita(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="auditoria">Auditoría de inventario</option>
                  <option value="negociacion">Negociación de espacio</option>
                  <option value="capacitacion">Capacitación de personal</option>
                  <option value="implementacion">Implementación de exhibición</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración Estimada (horas)
                </label>
                <input
                  type="number"
                  value={duracionVisita}
                  onChange={(e) => setDuracionVisita(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Ej: 2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tiempo estimado por tienda
                </p>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">📱 Funcionalidad:</span> Se generará una tarea móvil para el promotor con productos sin venta, inventario en riesgo y objetivo específico.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              Selecciona una acción para configurar sus parámetros
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Selección de Acción */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Selecciona el Tipo de Acción
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Elige la estrategia que deseas implementar para esta oportunidad
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acciones.map((accion) => (
            <button
              key={accion.id}
              onClick={() => handleSeleccionarAccion(accion.id)}
              className={`flex items-start p-5 border-2 rounded-lg transition-all text-left ${
                accionSeleccionada === accion.id
                  ? accion.colorActivo
                  : `border-gray-200 dark:border-gray-700 hover:${accion.color} bg-white dark:bg-gray-800`
              }`}
            >
              <div className="flex-shrink-0 mr-4">
                {accion.icono}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {accion.titulo}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {accion.descripcion}
                </p>
              </div>
              {accionSeleccionada === accion.id && (
                <svg className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Parámetros de Configuración */}
      {accionSeleccionada && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          {renderParametrosAccion()}
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onAnterior}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <button
          onClick={handleContinuar}
          disabled={!accionSeleccionada}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
            accionSeleccionada
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          Siguiente
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
