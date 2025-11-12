"use client";

import { useState, useEffect } from "react";
import { DatosWizard, Tienda, SKU, DatosOportunidad } from "../WizardPlanPrescriptivo";

interface Paso1AlcanceProps {
  datos: DatosWizard;
  oportunidad?: DatosOportunidad;
  onActualizar: (datos: Partial<DatosWizard>) => void;
  onSiguiente: () => void;
}

// Mock data - TODO: conectar con API real
const tiendasMock: Tienda[] = [
  { id: "T001", nombre: "Downtown Central", ubicacion: "Springfield, IL", segmento: "Hot" },
  { id: "T002", nombre: "North Point Mall", ubicacion: "Albany, NY", segmento: "Slow" },
  { id: "T003", nombre: "Westside Galleria", ubicacion: "Los Angeles, CA", segmento: "Hot" },
  { id: "T004", nombre: "South Beach Plaza", ubicacion: "Miami, FL", segmento: "Critica" },
  { id: "T005", nombre: "East Side Center", ubicacion: "Boston, MA", segmento: "Balanceada" },
];

const skusMock: SKU[] = [
  { id: "SKU001", nombre: "Producto A Premium", categoria: "Premium", inventario: 250, precio: 45.00 },
  { id: "SKU002", nombre: "Producto B Estándar", categoria: "Estándar", inventario: 500, precio: 32.00 },
  { id: "SKU003", nombre: "Producto C Económico", categoria: "Económico", inventario: 800, precio: 18.50 },
  { id: "SKU004", nombre: "Producto D Premium Plus", categoria: "Premium", inventario: 150, precio: 65.00 },
  { id: "SKU005", nombre: "Producto E Familiar", categoria: "Familiar", inventario: 600, precio: 28.00 },
];

type TabType = 'stores' | 'products';

export default function Paso1Alcance({ datos, oportunidad, onActualizar, onSiguiente }: Paso1AlcanceProps) {
  const [tabActiva, setTabActiva] = useState<TabType>('stores');
  const [busqueda, setBusqueda] = useState("");
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<Tienda[]>(
    datos.tiendasSeleccionadas || []
  );
  const [skusSeleccionados, setSkusSeleccionados] = useState<SKU[]>(
    datos.skusSeleccionados || []
  );

  // Prellenar datos si vienen de la oportunidad
  useEffect(() => {
    if (oportunidad) {
      if (oportunidad.tiendas && oportunidad.tiendas.length > 0) {
        setTiendasSeleccionadas(oportunidad.tiendas);
      }
      if (oportunidad.skus && oportunidad.skus.length > 0) {
        setSkusSeleccionados(oportunidad.skus);
      }
    }
  }, [oportunidad]);

  // Usar datos de oportunidad o mock data
  const tiendas = oportunidad?.tiendas && oportunidad.tiendas.length > 0 
    ? oportunidad.tiendas 
    : tiendasMock;
  
  const skus = oportunidad?.skus && oportunidad.skus.length > 0 
    ? oportunidad.skus 
    : skusMock;

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

  const toggleAll = () => {
    if (tabActiva === 'stores') {
      if (tiendasSeleccionadas.length === tiendasFiltradas.length) {
        setTiendasSeleccionadas([]);
      } else {
        setTiendasSeleccionadas(tiendasFiltradas);
      }
    } else {
      if (skusSeleccionados.length === skusFiltrados.length) {
        setSkusSeleccionados([]);
      } else {
        setSkusSeleccionados(skusFiltrados);
      }
    }
  };

  const handleSave = () => {
    onActualizar({
      tiendasSeleccionadas,
      skusSeleccionados
    });
  };

  const handleContinuar = () => {
    onActualizar({
      tiendasSeleccionadas,
      skusSeleccionados
    });
    onSiguiente();
  };

  const tiendasFiltradas = tiendas.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const skusFiltrados = skus.filter(s =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.categoria.toLowerCase().includes(busqueda.toLowerCase())
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

  const puedeAvanzar = tiendasSeleccionadas.length > 0 || skusSeleccionados.length > 0;
  const todosSeleccionados = tabActiva === 'stores' 
    ? tiendasSeleccionadas.length === tiendasFiltradas.length && tiendasFiltradas.length > 0
    : skusSeleccionados.length === skusFiltrados.length && skusFiltrados.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-280px)]">
      {/* Header con info de oportunidad */}
      {oportunidad && (
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                Creando plan para: <span className="font-semibold">{oportunidad.categoria}</span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                Impacto estimado: ${oportunidad.impacto.toLocaleString('es-MX')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => {
              setTabActiva('stores');
              setBusqueda("");
            }}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'stores'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Stores
          </button>
          <button
            onClick={() => {
              setTabActiva('products');
              setBusqueda("");
            }}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'products'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Products
          </button>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={tabActiva === 'stores' ? 'Search for a store by name or ID' : 'Search for a product by name or category'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
      </div>

      {/* Tabla */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={toggleAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                {tabActiva === 'stores' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Store Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Opportunity Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Region
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {tabActiva === 'stores' ? (
                tiendasFiltradas.map((tienda) => {
                  const seleccionada = tiendasSeleccionadas.find(t => t.id === tienda.id);
                  // Calcular score basado en segmento
                  const score = tienda.segmento === 'Hot' ? 92 : 
                               tienda.segmento === 'Balanceada' ? 85 :
                               tienda.segmento === 'Slow' ? 78 : 75;
                  const region = tienda.ubicacion.split(',')[1]?.trim() || 'N/A';
                  
                  return (
                    <tr 
                      key={tienda.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        seleccionada ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => toggleTienda(tienda)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={!!seleccionada}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {tienda.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {tienda.ubicacion}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {score}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentoColor(tienda.segmento)}`}>
                          {region}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                skusFiltrados.map((sku) => {
                  const seleccionado = skusSeleccionados.find(s => s.id === sku.id);
                  
                  return (
                    <tr 
                      key={sku.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        seleccionado ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                      }`}
                      onClick={() => toggleSKU(sku)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={!!seleccionado}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {sku.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {sku.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {sku.inventario} units
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        ${sku.precio.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {tiendasSeleccionadas.length} Stores, {skusSeleccionados.length} Products Selected
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleContinuar}
            disabled={!puedeAvanzar}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              puedeAvanzar
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
