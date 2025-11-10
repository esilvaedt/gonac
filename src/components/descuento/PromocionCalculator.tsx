"use client";

import { useState } from 'react';
import { useDescuento } from '@/hooks/useDescuento';

/**
 * Promotion Calculator Component
 * Based on the "Acción 3: Promoción para Evacuar Inventario" screenshot
 */
export default function PromocionCalculator() {
  const { data, loading, error, calcular } = useDescuento();

  // Configuration state (from screenshot)
  const [descuento, setDescuento] = useState(41); // 41% default
  const [elasticidadPapas, setElasticidadPapas] = useState(1.5);
  const [elasticidadTotopos, setElasticidadTotopos] = useState(1.8);

  const handleCalcular = async () => {
    await calcular({
      descuento: descuento / 100, // Convert percentage to decimal
      elasticidad_papas: elasticidadPapas,
      elasticidad_totopos: elasticidadTotopos,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
            ALTA
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Acción 3: Promoción para Evacuar Inventario (Tiendas Slow y Dead)
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Focalizado en tiendas de bajo desempeño para reducir riesgo de caducidad
        </p>
      </div>

      {/* Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚙️</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración de Promoción
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Máximo Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo Descuento (%)
            </label>
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sugerido: 1.5
            </p>
          </div>

          {/* Elasticidad Papas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Elasticidad Papas
            </label>
            <input
              type="number"
              value={elasticidadPapas}
              onChange={(e) => setElasticidadPapas(Number(e.target.value))}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sugerido: 1.5
            </p>
          </div>

          {/* Elasticidad Totopos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Elasticidad Totopos
            </label>
            <input
              type="number"
              value={elasticidadTotopos}
              onChange={(e) => setElasticidadTotopos(Number(e.target.value))}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sugerido: 1.8
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Costo Promoción
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {formatCurrency(
                  (data.papas?.costo_promocion || 0) + (data.totopos?.costo_promocion || 0)
                )}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                Valor a Capturar
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                {formatCurrency(
                  (data.papas?.valor_capturar || 0) + (data.totopos?.valor_capturar || 0)
                )}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                Inventario Post
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                {formatNumber(
                  (data.papas?.inventario_post || 0) + (data.totopos?.inventario_post || 0)
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Results */}
      {data && (
        <div className="space-y-4">
          {/* PAPAS Section */}
          {data.papas && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    PAPAS {descuento}% descuento
                  </h3>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Reducción riesgo {data.papas.reduccion_riesgo.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {data.papas.ventas_plus.toLocaleString()} SKUs en {formatNumber(data.papas.inventario_inicial_total)} tiendas
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Inv. Inicial
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(data.papas.inventario_inicial_total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Ventas +
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatNumber(data.papas.ventas_plus)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Costo
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(data.papas.costo)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Valor
                    </p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(data.papas.valor)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Reducción
                    </p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(data.papas.reduccion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOTOPOS Section */}
          {data.totopos && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-4 border-b border-orange-200 dark:border-orange-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    TOTOPOS {descuento}% descuento
                  </h3>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Reducción riesgo {data.totopos.reduccion_riesgo.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {data.totopos.ventas_plus.toLocaleString()} SKUs en {formatNumber(data.totopos.inventario_inicial_total)} tiendas
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Inv. Inicial
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(data.totopos.inventario_inicial_total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Ventas +
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatNumber(data.totopos.ventas_plus)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Costo
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(data.totopos.costo)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Valor
                    </p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(data.totopos.valor)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Reducción
                    </p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(data.totopos.reduccion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculation Info */}
      {data && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">💡</span>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Cálculo:</strong> Incremento ventas = Elasticidad × % Descuento | 
              Ejemplo: Con {descuento}% descuento y elasticidad {elasticidadPapas}, 
              las ventas de papas aumentan {((elasticidadPapas * descuento) / 100 * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCalcular}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                   text-white font-semibold py-3 px-6 rounded-lg transition
                   flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Calculando...
            </>
          ) : (
            <>
              <span>✓</span>
              Aprobar Promoción
            </>
          )}
        </button>

        <button
          className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30
                   text-orange-700 dark:text-orange-300 font-semibold py-3 px-6 rounded-lg transition
                   flex items-center justify-center gap-2"
        >
          <span>💬</span>
          Ajustar con VEMIO
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <p className="text-red-800 dark:text-red-300 font-semibold">Error</p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
}

