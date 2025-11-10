interface ExhibicionConfigCardProps {
  costoExhibicion: number;
  incrementoVenta: number;
  onCostoChange: (value: number) => void;
  onIncrementoChange: (value: number) => void;
}

export default function ExhibicionConfigCard({
  costoExhibicion,
  incrementoVenta,
  onCostoChange,
  onIncrementoChange,
}: ExhibicionConfigCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Configuración de Exhibiciones
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Costo Mensual por Exhibición (MXN)
          </label>
          <input
            type="number"
            value={costoExhibicion}
            onChange={(e) => onCostoChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Costo que cobra el autoservicio por rentar el espacio de exhibición
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Incremento Esperado en Ventas (%)
          </label>
          <input
            type="number"
            value={incrementoVenta}
            onChange={(e) => onIncrementoChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Incremento proyectado en ventas diarias por la exhibición adicional
          </p>
        </div>
      </div>
    </div>
  );
}

