"use client";

import { useState } from "react";
import { DatosWizard, Tienda, SKU } from "../WizardPlanPrescriptivo";

interface Paso1AlcanceProps {
  datos: DatosWizard;
  onActualizar: (datos: Partial<DatosWizard>) => void;
  onSiguiente: () => void;
}

// Mock data - TODO: conectar con API real
const tiendasMock: Tienda[] = [
  { id: "T001", nombre: "Supercito Centro", ubicacion: "Centro Histórico", segmento: "Hot" },
  { id: "T002", nombre: "Supercito Norte", ubicacion: "Zona Norte", segmento: "Slow" },
  { id: "T003", nombre: "Supercito Sur", ubicacion: "Zona Sur", segmento: "Hot" },
  { id: "T004", nombre: "Supercito Oriente", ubicacion: "Zona Oriente", segmento: "Critica" },
  { id: "T005", nombre: "Supercito Poniente", ubicacion: "Zona Poniente", segmento: "Balanceada" },
];

const skusMock: SKU[] = [
  { id: "SKU001", nombre: "Producto A Premium", categoria: "Premium", inventario: 250, precio: 45.00 },
  { id: "SKU002", nombre: "Producto B Estándar", categoria: "Estándar", inventario: 500, precio: 32.00 },
  { id: "SKU003", nombre: "Producto C Económico", categoria: "Económico", inventario: 800, precio: 18.50 },
  { id: "SKU004", nombre: "Producto D Premium Plus", categoria: "Premium", inventario: 150, precio: 65.00 },
  { id: "SKU005", nombre: "Producto E Familiar", categoria: "Familiar", inventario: 600, precio: 28.00 },
];

export default function Paso1Alcance({ datos, onActualizar, onSiguiente }: Paso1AlcanceProps) {
  const [filtroTiendas, setFiltroTiendas] = useState("");
  const [filtroSKUs, setFiltroSKUs] = useState("");
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<Tienda[]>(
    datos.tiendasSeleccionadas || []
  );
  const [skusSeleccionados, setSkusSeleccionados] = useState<SKU[]>(
    datos.skusSeleccionados || []
  );

  const toggleTienda = (tienda: Tienda) => {
    const yaSeleccionada = tiendasSeleccionadas.find(t => t.id === tienda.id);
    if (yaSeleccionada) {
      setTiendasSeleccionadas(tiendasSeleccionadas.filter(t => t.id !== tienda.id));
    } else {
      setTiendasSeleccionadas([...tiendasSeleccionadas, tienda]);
    }
  };

  const toggleSKU = (sku: SKU) => {
    const yaSeleccionado = skusSeleccionados.find(s => s.id === sku.id);
    if (yaSeleccionado) {
      setSkusSeleccionados(skusSeleccionados.filter(s => s.id !== sku.id));
    } else {
      setSkusSeleccionados([...skusSeleccionados, sku]);
    }
  };

  const handleContinuar = () => {
    onActualizar({
      tiendasSeleccionadas,
      skusSeleccionados
    });
    onSiguiente();
  };

  const tiendasFiltradas = tiendasMock.filter(t =>
    t.nombre.toLowerCase().includes(filtroTiendas.toLowerCase()) ||
    t.ubicacion.toLowerCase().includes(filtroTiendas.toLowerCase())
  );

  const skusFiltrados = skusMock.filter(s =>
    s.nombre.toLowerCase().includes(filtroSKUs.toLowerCase()) ||
    s.categoria.toLowerCase().includes(filtroSKUs.toLowerCase())
  );

  const getSegmentoColor = (segmento: string) => {
    switch (segmento.toLowerCase()) {
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

  const puedeAvanzar = tiendasSeleccionadas.length > 0 && skusSeleccionados.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paso 1: Seleccionar Alcance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona las tiendas y SKUs que serán incluidos en este plan prescriptivo
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">
            Tiendas Seleccionadas
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
            {tiendasSeleccionadas.length}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">
            SKUs Seleccionados
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
            {skusSeleccionados.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selección de Tiendas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tiendas
            </h3>
            <input
              type="text"
              placeholder="Buscar tiendas..."
              value={filtroTiendas}
              onChange={(e) => setFiltroTiendas(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {tiendasFiltradas.map((tienda) => {
                const seleccionada = tiendasSeleccionadas.find(t => t.id === tienda.id);
                return (
                  <div
                    key={tienda.id}
                    onClick={() => toggleTienda(tienda)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      seleccionada
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {tienda.nombre}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSegmentoColor(tienda.segmento)}`}>
                            {tienda.segmento}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tienda.ubicacion}
                        </p>
                      </div>
                      <div className="ml-3">
                        {seleccionada ? (
                          <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selección de SKUs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              SKUs
            </h3>
            <input
              type="text"
              placeholder="Buscar SKUs..."
              value={filtroSKUs}
              onChange={(e) => setFiltroSKUs(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {skusFiltrados.map((sku) => {
                const seleccionado = skusSeleccionados.find(s => s.id === sku.id);
                return (
                  <div
                    key={sku.id}
                    onClick={() => toggleSKU(sku)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      seleccionado
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {sku.nombre}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>{sku.categoria}</span>
                          <span>•</span>
                          <span>{sku.inventario} unidades</span>
                          <span>•</span>
                          <span>${sku.precio.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        {seleccionado ? (
                          <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
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

