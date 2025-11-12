"use client";

import { useEffect, useState } from "react";
import { DatosWizard } from "../WizardPlanPrescriptivo";

interface Paso3RevisionProps {
  datos: DatosWizard;
  onActualizar: (datos: Partial<DatosWizard>) => void;
  onAnterior: () => void;
}

export default function Paso3Revision({ datos, onActualizar, onAnterior }: Paso3RevisionProps) {
  const [calculando, setCalculando] = useState(true);

  useEffect(() => {
    // Simular cálculo de métricas
    setTimeout(() => {
      const metricas = calcularMetricas();
      onActualizar(metricas);
      setCalculando(false);
    }, 1000);
  }, []);

  const calcularMetricas = (): Partial<DatosWizard> => {
    const numTiendas = datos.tiendasSeleccionadas.length;
    const numSKUs = datos.skusSeleccionados.length;
    
    let costoEstimado = 0;
    let utilidadNeta = 0;
    let unidadesAfectadas = 0;

    // Cálculos basados en el tipo de acción
    switch (datos.accionSeleccionada) {
      case 'reabastecer':
        costoEstimado = numTiendas * numSKUs * 150; // Costo logístico
        utilidadNeta = numTiendas * numSKUs * 800; // Venta potencial
        unidadesAfectadas = (datos.parametros.nivelStockObjetivo || 500) * numTiendas;
        break;
        
      case 'redistribuir':
        costoEstimado = numTiendas * 200; // Costo de transporte
        utilidadNeta = numTiendas * numSKUs * 600;
        unidadesAfectadas = numSKUs * 300;
        break;
        
      case 'exhibicion':
        costoEstimado = numTiendas * 1500; // Costo de material y montaje
        utilidadNeta = numTiendas * numSKUs * 1200;
        unidadesAfectadas = numSKUs * 450;
        break;
        
      case 'promocion':
        const descuento = datos.parametros.porcentajeDescuento || 15;
        costoEstimado = numTiendas * numSKUs * 250 * (descuento / 100);
        utilidadNeta = numTiendas * numSKUs * 950;
        unidadesAfectadas = numSKUs * 600;
        break;
        
      case 'visita_promotoria':
        const horas = datos.parametros.duracionHoras || 4;
        costoEstimado = numTiendas * horas * 180; // Costo por hora de promotor
        utilidadNeta = numTiendas * numSKUs * 700;
        unidadesAfectadas = numSKUs * 350;
        break;
        
      default:
        costoEstimado = numTiendas * numSKUs * 100;
        utilidadNeta = numTiendas * numSKUs * 500;
        unidadesAfectadas = numSKUs * 400;
    }

    const roiProyectado = ((utilidadNeta - costoEstimado) / costoEstimado) * 100;

    return {
      costoEstimado,
      utilidadNeta,
      roiProyectado,
      unidadesAfectadas
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(Math.round(num));
  };

  const getAccionNombre = () => {
    const nombres = {
      reabastecer: "Reabastecer",
      redistribuir: "Redistribuir",
      exhibicion: "Exhibición",
      promocion: "Promoción",
      visita_promotoria: "Visita Promotoría"
    };
    return nombres[datos.accionSeleccionada || 'reabastecer'];
  };

  if (calculando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Calculando métricas del plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paso 3: Revisar y Confirmar
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Revisa el resumen del plan y confirma para crear las tareas
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Estimated Cost
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(datos.costoEstimado)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Projected Net Profit
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(datos.utilidadNeta)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            Projected ROI
            <svg className="h-4 w-4 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {datos.roiProyectado.toFixed(0)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Units Affected
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(datos.unidadesAfectadas)}
          </div>
        </div>
      </div>

      {/* Resumen del plan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resumen del Plan
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Acción seleccionada */}
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Acción Prescriptiva
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-lg font-semibold">
                {getAccionNombre()}
              </div>
            </div>
          </div>

          {/* Alcance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Tiendas Seleccionadas ({datos.tiendasSeleccionadas.length})
              </div>
              <div className="space-y-2">
                {datos.tiendasSeleccionadas.slice(0, 5).map(tienda => (
                  <div key={tienda.id} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900 dark:text-white">{tienda.nombre}</span>
                    <span className="text-gray-500 dark:text-gray-400">- {tienda.ubicacion}</span>
                  </div>
                ))}
                {datos.tiendasSeleccionadas.length > 5 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                    +{datos.tiendasSeleccionadas.length - 5} más
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                SKUs Seleccionados ({datos.skusSeleccionados.length})
              </div>
              <div className="space-y-2">
                {datos.skusSeleccionados.slice(0, 5).map(sku => (
                  <div key={sku.id} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900 dark:text-white">{sku.nombre}</span>
                  </div>
                ))}
                {datos.skusSeleccionados.length > 5 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                    +{datos.skusSeleccionados.length - 5} más
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parámetros de la acción */}
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Parámetros Configurados
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {datos.accionSeleccionada === 'reabastecer' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Días de cobertura</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.diasCobertura} días</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Nivel de stock objetivo</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.nivelStockObjetivo} unidades</dd>
                    </div>
                  </>
                )}
                {datos.accionSeleccionada === 'promocion' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Descuento</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.porcentajeDescuento}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Elasticidad</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.elasticidadPrecio}</dd>
                    </div>
                    {datos.parametros.fechaInicio && (
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Período</dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(datos.parametros.fechaInicio).toLocaleDateString('es-MX')} - {datos.parametros.fechaFin ? new Date(datos.parametros.fechaFin).toLocaleDateString('es-MX') : 'N/A'}
                        </dd>
                      </div>
                    )}
                  </>
                )}
                {datos.accionSeleccionada === 'exhibicion' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Tipo</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{datos.parametros.tipoExhibicion?.replace('_', ' ')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Duración</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.duracionDias} días</dd>
                    </div>
                  </>
                )}
                {datos.accionSeleccionada === 'visita_promotoria' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Objetivo</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{datos.parametros.objetivoVisita}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Duración</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{datos.parametros.duracionHoras} horas</dd>
                    </div>
                  </>
                )}
                {datos.accionSeleccionada === 'redistribuir' && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Origen</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                        {datos.tiendasSeleccionadas.find(t => t.id === datos.parametros.tiendaOrigen)?.nombre || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Destino</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                        {datos.tiendasSeleccionadas.find(t => t.id === datos.parametros.tiendaDestino)?.nombre || 'N/A'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de viabilidad */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Plan Viable
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Este plan tiene un ROI proyectado de <strong>{datos.roiProyectado.toFixed(0)}%</strong>, 
              lo que indica una alta viabilidad de retorno. La utilidad neta estimada es de{' '}
              <strong>{formatCurrency(datos.utilidadNeta - datos.costoEstimado)}</strong>.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Los cálculos son estimaciones basadas en datos históricos y parámetros configurados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

