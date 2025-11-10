interface ExhibicionViabilidadCardProps {
  incrementoVenta: number;
  costoExhibicion: number;
}

export default function ExhibicionViabilidadCard({
  incrementoVenta,
  costoExhibicion,
}: ExhibicionViabilidadCardProps) {
  const ejemploVentaDiaria = 50;
  const ventaIncremental = (ejemploVentaDiaria * incrementoVenta) / 100;
  const retornoMensual = ventaIncremental * 30;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-2">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-white">
            💡 Cómo se calcula la viabilidad
          </h5>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-semibold">Ejemplo:</span> Si una tienda vende
            ${ejemploVentaDiaria} pesos/día con sus TOP 5 SKUs:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1 ml-4">
            <li>
              • Venta incremental = ${ejemploVentaDiaria} × {incrementoVenta}% =
              ${ventaIncremental.toFixed(2)}/día
            </li>
            <li>
              • Retorno mensual = ${ventaIncremental.toFixed(2)} × 30 días = $
              {retornoMensual.toFixed(2)}
            </li>
            <li>• Costo mensual = ${costoExhibicion}</li>
            <li>
              •{" "}
              <span className="font-semibold text-green-600">Viable si:</span>{" "}
              Retorno mensual &gt; Costo mensual
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

