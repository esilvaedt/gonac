import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SegmentacionRepository } from '@/repositories/segmentacion.repository';
import { SegmentacionService } from '@/services/segmentacion.service';

/**
 * GET /api/segmentacion
 * Get store segmentation metrics
 * 
 * Query Parameters:
 * - format: 'raw' | 'formatted' | 'cards' | 'summary' | 'stores' (default: 'raw')
 * - segment: specific segment name (optional)
 * - segments: comma-separated segment names (optional)
 * - limit: number of top segments to return (optional, for top segments)
 * 
 * Examples:
 * - GET /api/segmentacion
 * - GET /api/segmentacion?format=formatted
 * - GET /api/segmentacion?format=cards
 * - GET /api/segmentacion?format=summary
 * - GET /api/segmentacion?format=stores (get store details with stats)
 * - GET /api/segmentacion?format=stores&segment=Hot (filter by segment)
 * - GET /api/segmentacion?segment=Slow
 * - GET /api/segmentacion?segments=Slow,Dead
 * - GET /api/segmentacion?limit=3
 * 
 * Response (raw):
 * {
 *   "success": true,
 *   "segments": [
 *     {
 *       "segment": "Slow",
 *       "ventas_valor": 5000000,
 *       "ventas_unidades": 50000,
 *       "dias_inventario": 45.5,
 *       "contribucion_porcentaje": 35.2,
 *       "num_tiendas_segmento": 120,
 *       "participacion_segmento": 48.5,
 *       "ventas_semana_promedio_tienda_pesos": 41666.67,
 *       "ventas_semana_promedio_tienda_unidades": 416.67
 *     },
 *     ...
 *   ],
 *   "total_ventas_valor": 15000000,
 *   "total_ventas_unidades": 150000,
 *   "total_tiendas": 250,
 *   "timestamp": "2025-11-10T12:34:56.789Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'raw';
    const segment = searchParams.get('segment');
    const segmentsParam = searchParams.get('segments');
    const limitParam = searchParams.get('limit');

    const supabase = createServerSupabaseClient();
    const repository = new SegmentacionRepository(supabase);
    const service = new SegmentacionService(repository);

    // Handle specific segment query
    if (segment) {
      const segmentData = await service.getSegmentMetrics(segment);
      
      if (!segmentData) {
        return NextResponse.json(
          {
            success: false,
            error: 'Segment not found',
            message: `No data found for segment: ${segment}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: segmentData,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle multiple segments query
    if (segmentsParam) {
      const segments = segmentsParam.split(',').map((s) => s.trim());
      const segmentsData = await service.getMultipleSegmentMetrics(segments);

      return NextResponse.json({
        success: true,
        segments: segmentsData,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle top segments with limit
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid limit',
            message: 'limit must be a positive number',
          },
          { status: 400 }
        );
      }

      const data = await service.getTopSegments(limit);
      return NextResponse.json({ success: true, ...data });
    }

    // Handle store details format
    if (format === 'stores') {
      const storeDetails = await service.getStoreDetails(segment || undefined);
      return NextResponse.json({
        success: true,
        ...storeDetails,
      });
    }

    // Handle different formats
    let data;

    switch (format) {
      case 'formatted':
        data = await service.getSegmentacionMetricsFormatted();
        break;

      case 'cards':
        const cards = await service.getSegmentCards();
        data = {
          cards,
          timestamp: new Date().toISOString(),
        };
        break;

      case 'summary':
        data = await service.getSegmentSummary();
        break;

      case 'comparison':
        const comparison = await service.compareSegments();
        data = {
          comparison,
          timestamp: new Date().toISOString(),
        };
        break;

      case 'raw':
      default:
        data = await service.getSegmentacionMetrics();
        break;
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Segmentacion API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch segmentation metrics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/segmentacion/refresh
 * Refresh the materialized view
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const repository = new SegmentacionRepository(supabase);
    const service = new SegmentacionService(repository);

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
    console.error('Segmentacion Refresh API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh segmentation metrics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

