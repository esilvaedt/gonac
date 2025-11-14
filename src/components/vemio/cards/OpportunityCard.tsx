/**
 * Opportunity Card Component
 */

import type { RiskLevel, OpportunityType, DetailRecord } from '@/types/tiendas.types';
import { getBadgeColor, getSegmentColor } from '@/utils/tiendas.mappers';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

interface OpportunityCardProps {
  type: OpportunityType;
  title: string;
  description: string;
  tiendas: number;
  impacto: number;
  risk: RiskLevel;
  impactoColor: string;
  isExpanded: boolean;
  detailData: DetailRecord[];
  isLoading: boolean;
  onToggleExpand: () => void;
}

export default function OpportunityCard({
  type,
  title,
  description,
  tiendas,
  impacto,
  risk,
  impactoColor,
  isExpanded,
  detailData,
  isLoading,
  onToggleExpand,
}: OpportunityCardProps) {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="relative p-4">
        {/* Risk Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded ${getBadgeColor(risk)}`}>
            {risk}
          </span>
        </div>

        <div className="mb-3">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatNumber(tiendas)} tiendas afectadas
          </p>
        </div>

        <div className="mt-3 mb-4">
          <div className={`text-2xl font-bold mb-0.5 ${impactoColor}`}>
            {formatCurrency(impacto)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Impacto potencial
          </div>
        </div>

        {/* Toggle Detail Button */}
        {isLoading ? (
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-400 text-white rounded-lg cursor-not-allowed text-sm"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Cargando...
          </button>
        ) : detailData.length > 0 ? (
          <button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver Detalle ({detailData.length} registros)
            <svg
              className={`h-4 w-4 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm">
            Sin registros detallados
          </div>
        )}
      </div>

      {/* Expanded Details Table */}
      {isExpanded && detailData.length > 0 && (
        <OpportunityDetailTable type={type} detailData={detailData} />
      )}
    </div>
  );
}

// Sub-component for detail table
function OpportunityDetailTable({ 
  type, 
  detailData 
}: { 
  type: OpportunityType; 
  detailData: DetailRecord[] 
}) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Tienda
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                SKU
              </th>
              {type === 'agotado' && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Días Inv.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Segmento
                  </th>
                </>
              )}
              {type === 'caducidad' && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Inv. Rem.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    F. Cad.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Segmento
                  </th>
                </>
              )}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Impacto
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {detailData.slice(0, 5).map((registro) => (
              <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                  {registro.tienda}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                  {registro.sku}
                </td>
                {type === 'agotado' && (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium">
                      {registro.diasInventario}d
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda || '')}`}>
                        {registro.segmentoTienda}
                      </span>
                    </td>
                  </>
                )}
                {type === 'caducidad' && (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-yellow-600 font-medium">
                      {registro.inventarioRemanente}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {registro.fechaCaducidad ? formatDate(registro.fechaCaducidad) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getSegmentColor(registro.segmentoTienda || '')}`}>
                        {registro.segmentoTienda}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-3 py-2 whitespace-nowrap text-xs text-green-600 font-medium">
                  {formatCurrency(registro.impactoEstimado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {detailData.length > 5 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Mostrando 5 de {detailData.length} registros
          </div>
        )}
      </div>
    </div>
  );
}

