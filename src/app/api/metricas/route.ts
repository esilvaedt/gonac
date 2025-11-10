import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { MetricasRepository } from '@/repositories/metricas.repository';
import { MetricasService } from '@/services/metricas.service';

/**
 * GET /api/metricas
 * Get consolidated metrics for home page KPIs
 * 
 * Query Parameters:
 * - format: 'raw' | 'formatted' | 'cards' (default: 'raw')
 * 
 * Examples:
 * - GET /api/metricas
 * - GET /api/metricas?format=formatted
 * - GET /api/metricas?format=cards
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "ventas_totales_pesos": 15000000,
 *     "crecimiento_vs_semana_anterior_pct": 8.5,
 *     "ventas_totales_unidades": 125000,
 *     ...
 *   },
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "source": "mvw_metricas_consolidadas"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'raw';

    const supabase = createServerSupabaseClient();
    const repository = new MetricasRepository(supabase);
    const service = new MetricasService(repository);

    let data;

    switch (format) {
      case 'formatted':
        // Get metrics with formatted strings
        const formattedMetrics = await service.getMetricasConsolidadasFormatted();
        data = {
          ...formattedMetrics,
          timestamp: new Date().toISOString(),
          source: 'mvw_metricas_consolidadas',
        };
        break;

      case 'cards':
        // Get metrics as KPI cards
        const cards = await service.getKPICards();
        data = {
          cards,
          timestamp: new Date().toISOString(),
          source: 'mvw_metricas_consolidadas',
        };
        break;

      case 'raw':
      default:
        // Get raw metrics
        data = await service.getMetricasConsolidadas();
        break;
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Metricas API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch consolidated metrics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metricas/refresh
 * Refresh the materialized view (requires appropriate permissions)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Materialized view refreshed successfully"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const repository = new MetricasRepository(supabase);
    const service = new MetricasService(repository);

    const refreshed = await service.refreshMetrics();

    if (!refreshed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to refresh materialized view',
          message: 'Check database permissions or view configuration',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Materialized view refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Metricas Refresh API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh metrics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

