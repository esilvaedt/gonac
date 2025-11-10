import { ExhibicionResumen } from "@/types/exhibiciones";

interface ExhibicionMetricsCardsProps {
  resumen: ExhibicionResumen;
  formatCurrency: (amount: number) => string;
}

export default function ExhibicionMetricsCards({
  resumen,
  formatCurrency,
}: ExhibicionMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Exhibiciones Viables
        </div>
        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          {resumen.tiendas_viables}
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="text-sm text-green-600 dark:text-green-400">
          Retorno Mensual
        </div>
        <div className="text-xl font-bold text-green-700 dark:text-green-300">
          {formatCurrency(resumen.retorno_mensual_neto)}
        </div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
        <div className="text-sm text-red-600 dark:text-red-400">
          Costo Total
        </div>
        <div className="text-xl font-bold text-red-700 dark:text-red-300">
          {formatCurrency(resumen.costo_total_exhibicion)}
        </div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="text-sm text-purple-600 dark:text-purple-400">
          ROI Promedio
        </div>
        <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
          {resumen.roi_promedio_x.toFixed(2)}x
        </div>
      </div>
    </div>
  );
}

