"use client";

import { useState, useEffect } from "react";
import { DatosWizard, TipoAccion, ParametrosAccion } from "../WizardPlanPrescriptivo";

interface Paso2AccionProps {
  datos: DatosWizard;
  onActualizar: (datos: Partial<DatosWizard>) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
}

const acciones = [
  {
    id: "redistribuir" as TipoAccion,
    nombre: "Redistribuir",
    descripcion: "Mover inventario entre tiendas para optimizar el stock",
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    id: "reabastecer" as TipoAccion,
    nombre: "Reabastecer",
    descripcion: "Aumentar el nivel de inventario para cubrir demanda",
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    id: "exhibicion" as TipoAccion,
    nombre: "Exhibición",
    descripcion: "Crear exhibiciones adicionales en punto de venta",
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: "promocion" as TipoAccion,
    nombre: "Promoción",
    descripcion: "Aplicar descuentos para acelerar la rotación",
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  },
  {
    id: "visita_promotoria" as TipoAccion,
    nombre: "Visita Promotoría",
    descripcion: "Programar visitas de promotoría para impulsar ventas",
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
];

export default function Paso2Accion({ datos, onActualizar, onSiguiente, onAnterior }: Paso2AccionProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<TipoAccion | null>(
    datos.accionSeleccionada || null
  );
  const [parametros, setParametros] = useState<ParametrosAccion>(datos.parametros || {});

  useEffect(() => {
    // Inicializar parámetros por defecto según la acción
    if (accionSeleccionada) {
      const nuevosParametros = { ...parametros };
      
      if (accionSeleccionada === 'reabastecer' && !parametros.diasCobertura) {
        nuevosParametros.diasCobertura = 30;
        nuevosParametros.nivelStockObjetivo = 500;
      } else if (accionSeleccionada === 'promocion' && !parametros.porcentajeDescuento) {
        nuevosParametros.porcentajeDescuento = 15;
        nuevosParametros.elasticidadPrecio = -1.5;
      } else if (accionSeleccionada === 'exhibicion' && !parametros.duracionDias) {
        nuevosParametros.duracionDias = 14;
      } else if (accionSeleccionada === 'visita_promotoria' && !parametros.duracionHoras) {
        nuevosParametros.duracionHoras = 4;
      }
      
      setParametros(nuevosParametros);
    }
  }, [accionSeleccionada]);

  const handleSeleccionarAccion = (accion: TipoAccion) => {
    setAccionSeleccionada(accion);
  };

  const handleActualizarParametro = (campo: keyof ParametrosAccion, valor: any) => {
    setParametros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleContinuar = () => {
    onActualizar({
      accionSeleccionada,
      parametros
    });
    onSiguiente();
  };

  const puedeAvanzar = accionSeleccionada !== null;

  const renderParametros = () => {
    if (!accionSeleccionada) return null;

    switch (accionSeleccionada) {
      case 'reabastecer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Días de cobertura
              </label>
              <input
                type="number"
                value={parametros.diasCobertura || 30}
                onChange={(e) => handleActualizarParametro('diasCobertura', parseInt(e.target.value))}
                placeholder="Ej: 30"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Días de inventario objetivo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de stock objetivo
              </label>
              <input
                type="number"
                value={parametros.nivelStockObjetivo || 500}
                onChange={(e) => handleActualizarParametro('nivelStockObjetivo', parseInt(e.target.value))}
                placeholder="Ej: 500 unidades"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Unidades totales deseadas
              </p>
            </div>
          </div>
        );

      case 'redistribuir':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tienda origen
              </label>
              <select
                value={parametros.tiendaOrigen || ''}
                onChange={(e) => handleActualizarParametro('tiendaOrigen', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar tienda...</option>
                {datos.tiendasSeleccionadas.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tienda destino
              </label>
              <select
                value={parametros.tiendaDestino || ''}
                onChange={(e) => handleActualizarParametro('tiendaDestino', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar tienda...</option>
                {datos.tiendasSeleccionadas.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'exhibicion':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de exhibición
              </label>
              <select
                value={parametros.tipoExhibicion || ''}
                onChange={(e) => handleActualizarParametro('tipoExhibicion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar tipo...</option>
                <option value="punto_extra">Punto Extra</option>
                <option value="isla">Isla</option>
                <option value="cabecera">Cabecera de Góndola</option>
                <option value="pallet">Pallet Display</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración (días)
              </label>
              <input
                type="number"
                value={parametros.duracionDias || 14}
                onChange={(e) => handleActualizarParametro('duracionDias', parseInt(e.target.value))}
                placeholder="Ej: 14"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      case 'promocion':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Porcentaje de descuento (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={parametros.porcentajeDescuento || 15}
                  onChange={(e) => handleActualizarParametro('porcentajeDescuento', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[60px]">
                  {parametros.porcentajeDescuento || 15}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Elasticidad de precio
                <span className="ml-2 text-gray-500 cursor-help" title="Factor que indica cuánto aumentan las ventas por cada punto de descuento">ⓘ</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={parametros.elasticidadPrecio || -1.5}
                onChange={(e) => handleActualizarParametro('elasticidadPrecio', parseFloat(e.target.value))}
                placeholder="Ej: -1.5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Valores negativos típicos: -0.5 (inelástico) a -3.0 (muy elástico)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={parametros.fechaInicio || ''}
                  onChange={(e) => handleActualizarParametro('fechaInicio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={parametros.fechaFin || ''}
                  onChange={(e) => handleActualizarParametro('fechaFin', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'visita_promotoria':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Objetivo de la visita
              </label>
              <select
                value={parametros.objetivoVisita || ''}
                onChange={(e) => handleActualizarParametro('objetivoVisita', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar objetivo...</option>
                <option value="activacion">Activación de producto</option>
                <option value="acomodo">Acomodo y merchandising</option>
                <option value="capacitacion">Capacitación al personal</option>
                <option value="auditoria">Auditoría de punto de venta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración estimada (horas)
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={parametros.duracionHoras || 4}
                onChange={(e) => handleActualizarParametro('duracionHoras', parseInt(e.target.value))}
                placeholder="Ej: 4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paso 2: Seleccionar Acción
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Elige la acción prescriptiva y completa los parámetros requeridos
        </p>
      </div>

      {/* Resumen de alcance */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-blue-700 dark:text-blue-400">Alcance:</span>
              <span className="ml-2 font-semibold text-blue-900 dark:text-blue-300">
                {datos.tiendasSeleccionadas.length} tiendas
              </span>
            </div>
            <div className="h-4 w-px bg-blue-300 dark:bg-blue-700"></div>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                {datos.skusSeleccionados.length} SKUs
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de acción */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tipo de Acción
          </h3>
          <div className="space-y-3">
            {acciones.map((accion) => {
              const seleccionada = accionSeleccionada === accion.id;
              return (
                <button
                  key={accion.id}
                  onClick={() => handleSeleccionarAccion(accion.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    seleccionada
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${seleccionada ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                      {accion.icono}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${
                        seleccionada 
                          ? 'text-blue-900 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {accion.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {accion.descripcion}
                      </p>
                    </div>
                    {seleccionada && (
                      <svg className="h-6 w-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Parámetros de la acción */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Parámetros
          </h3>
          {accionSeleccionada ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {renderParametros()}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona una acción a la izquierda para configurar sus parámetros
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onAnterior}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={handleContinuar}
          disabled={!puedeAvanzar}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            puedeAvanzar
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

