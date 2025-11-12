"use client";

import { useState } from "react";
import Paso1Alcance from "./steps/Paso1Alcance";
import Paso2Accion from "./steps/Paso2Accion";
import Paso3Revision from "./steps/Paso3Revision";

export type TipoAccion = 
  | "reabastecer" 
  | "redistribuir" 
  | "exhibicion" 
  | "promocion" 
  | "visita_promotoria";

export interface Tienda {
  id: string;
  nombre: string;
  ubicacion: string;
  segmento: string;
}

export interface SKU {
  id: string;
  nombre: string;
  categoria: string;
  inventario: number;
  precio: number;
}

export interface ParametrosAccion {
  // Reabastecer
  diasCobertura?: number;
  nivelStockObjetivo?: number;
  
  // Redistribuir
  tiendaOrigen?: string;
  tiendaDestino?: string;
  
  // Exhibición
  tipoExhibicion?: string;
  duracionDias?: number;
  
  // Promoción
  porcentajeDescuento?: number;
  elasticidadPrecio?: number;
  fechaInicio?: string;
  fechaFin?: string;
  
  // Visita Promotoría
  objetivoVisita?: string;
  duracionHoras?: number;
}

export interface DatosWizard {
  // Paso 1
  tiendasSeleccionadas: Tienda[];
  skusSeleccionados: SKU[];
  
  // Paso 2
  accionSeleccionada: TipoAccion | null;
  parametros: ParametrosAccion;
  
  // Paso 3
  costoEstimado: number;
  roiProyectado: number;
  utilidadNeta: number;
  unidadesAfectadas: number;
}

export interface DatosOportunidad {
  id: string;
  categoria: string;
  tiendas?: Tienda[];
  skus?: SKU[];
  impacto: number;
}

interface WizardPlanPrescriptivoProps {
  oportunidad?: DatosOportunidad;
  onClose?: () => void;
  onComplete?: (datos: DatosWizard) => void;
}

export default function WizardPlanPrescriptivo({
  oportunidad,
  onClose,
  onComplete
}: WizardPlanPrescriptivoProps) {
  const [pasoActual, setPasoActual] = useState(1);
  const [datos, setDatos] = useState<DatosWizard>({
    tiendasSeleccionadas: oportunidad?.tiendas || [],
    skusSeleccionados: oportunidad?.skus || [],
    accionSeleccionada: null,
    parametros: {},
    costoEstimado: 0,
    roiProyectado: 0,
    utilidadNeta: 0,
    unidadesAfectadas: 0
  });

  const totalPasos = 3;

  const handleSiguiente = () => {
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const handleActualizarDatos = (nuevosDatos: Partial<DatosWizard>) => {
    setDatos(prev => ({ ...prev, ...nuevosDatos }));
  };

  const handleGuardar = () => {
    console.log("Guardando borrador...", datos);
    // TODO: Implementar guardado
  };

  const handleAprobar = () => {
    console.log("Aprobando plan...", datos);
    if (onComplete) {
      onComplete(datos);
    }
  };

  const handleCrearTareas = () => {
    console.log("Creando tareas...", datos);
    // TODO: Implementar creación de tareas
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <Paso1Alcance
            datos={datos}
            oportunidad={oportunidad}
            onActualizar={handleActualizarDatos}
            onSiguiente={handleSiguiente}
          />
        );
      case 2:
        return (
          <Paso2Accion
            datos={datos}
            onActualizar={handleActualizarDatos}
            onSiguiente={handleSiguiente}
            onAnterior={handleAnterior}
          />
        );
      case 3:
        return (
          <Paso3Revision
            datos={datos}
            onActualizar={handleActualizarDatos}
            onAnterior={handleAnterior}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Dashboard / Planning / Create Plan
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Plan Prescriptivo
              </h1>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Paso {pasoActual} de {totalPasos}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pasoActual === 1 && "Seleccionar Alcance"}
              {pasoActual === 2 && "Seleccionar Acción"}
              {pasoActual === 3 && "Revisar y Confirmar"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(pasoActual / totalPasos) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderPaso()}
      </div>

      {/* Footer con botones de acción */}
      {pasoActual === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleAnterior}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Atrás
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGuardar}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleAprobar}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
                <button
                  onClick={handleCrearTareas}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Tareas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

