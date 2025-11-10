import { ExhibicionResumen } from "@/types/exhibiciones";

interface ExhibicionPedidoCardProps {
  resumen: ExhibicionResumen;
  incrementoVenta: number;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

export default function ExhibicionPedidoCard({
  resumen,
  incrementoVenta,
  formatCurrency,
  formatNumber,
}: ExhibicionPedidoCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border-2 border-orange-300 dark:border-orange-800 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            📦 Pedido Extraordinario Requerido
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Para soportar el incremento del {incrementoVenta}% en ventas, se
            require el siguiente pedido adicional:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Unidades Totales
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(resumen.unidades_totales_pedido)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Valor del Pedido
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(resumen.valor_total_pedido)}
          </div>
        </div>
      </div>
    </div>
  );
}

