import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExhibicionesRepository } from '@/repositories/exhibiciones.repository';
import { ExhibicionesService } from '@/services/exhibiciones.service';

/**
 * GET /api/exhibiciones
 * Get exhibition analysis (summary or ROI calculation)
 * 
 * Query Parameters:
 * - type: 'resumen' | 'roi' | 'analisis' (default: 'resumen')
 * - format: 'raw' | 'formatted' (default: 'raw')
 * - costo_exhibicion: number (default: 500) - Exhibition cost in MXN
 * - incremento_venta: number (default: 0.5) - Sales increment (0.5 = 50%)
 * - dias_mes: number (default: 30) - Days in month
 * - id_store: number (optional) - Filter by specific store
 * - limit: number (optional) - Limit top stores (for type=roi)
 * 
 * Examples:
 * - GET /api/exhibiciones (get summary with defaults)
 * - GET /api/exhibiciones?type=resumen&dias_mes=30
 * - GET /api/exhibiciones?type=roi&costo_exhibicion=500&incremento_venta=0.5
 * - GET /api/exhibiciones?type=roi&format=formatted
 * - GET /api/exhibiciones?type=roi&id_store=1010
 * - GET /api/exhibiciones?type=roi&limit=10
 * - GET /api/exhibiciones?type=analisis (complete analysis)
 * 
 * Response (resumen):
 * {
 *   "success": true,
 *   "resumen": {
 *     "tiendas_viables": 38,
 *     "retorno_mensual_neto": 218476.87,
 *     "costo_total_exhibicion": 1140,
 *     "unidades_totales_pedido": 10094,
 *     "valor_total_pedido": 130494.07,
 *     "roi_promedio_x": 191.65
 *   },
 *   "params": { "dias_mes": 30 },
 *   "timestamp": "2025-11-10T12:34:56.789Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'resumen';
    const format = searchParams.get('format') || 'raw';
    const costo_exhibicion = parseFloat(
      searchParams.get('costo_exhibicion') || '500'
    );
    const incremento_venta = parseFloat(
      searchParams.get('incremento_venta') || '0.5'
    );
    const dias_mes = parseInt(searchParams.get('dias_mes') || '30', 10);
    const id_store = searchParams.get('id_store');
    const limit = searchParams.get('limit');

    // Validate parameters
    if (isNaN(costo_exhibicion) || costo_exhibicion < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid costo_exhibicion',
          message: 'costo_exhibicion must be a non-negative number',
        },
        { status: 400 }
      );
    }

    if (
      isNaN(incremento_venta) ||
      incremento_venta < 0 ||
      incremento_venta > 10
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid incremento_venta',
          message: 'incremento_venta must be between 0 and 10',
        },
        { status: 400 }
      );
    }

    if (isNaN(dias_mes) || dias_mes < 1 || dias_mes > 31) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid dias_mes',
          message: 'dias_mes must be between 1 and 31',
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const repository = new ExhibicionesRepository(supabase);
    const service = new ExhibicionesService(repository);

    // Handle different types
    switch (type) {
      case 'resumen': {
        const params = {
          costo_exhibicion,
          incremento_venta,
          dias_mes,
        };

        if (format === 'formatted') {
          const data = await service.getResumenExhibicionFormatted(params);
          return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
          });
        } else {
          const data = await service.getResumenExhibicion(params);
          return NextResponse.json({ success: true, ...data });
        }
      }

      case 'roi': {
        const params = {
          costo_exhibicion,
          incremento_venta,
          dias_mes,
        };

        // Handle specific store
        if (id_store) {
          const storeId = parseInt(id_store, 10);
          if (isNaN(storeId)) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid id_store',
                message: 'id_store must be a number',
              },
              { status: 400 }
            );
          }

          const items = await service.getROIByStore(storeId, params);
          return NextResponse.json({
            success: true,
            items,
            params,
            timestamp: new Date().toISOString(),
          });
        }

        // Handle top stores with limit
        if (limit) {
          const limitNum = parseInt(limit, 10);
          if (isNaN(limitNum) || limitNum < 1) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid limit',
                message: 'limit must be a positive number',
              },
              { status: 400 }
            );
          }

          const topStores = await service.getTopStoresByROI(limitNum, params);
          return NextResponse.json({
            success: true,
            top_stores: topStores,
            params,
            timestamp: new Date().toISOString(),
          });
        }

        // Handle formatted
        if (format === 'formatted') {
          const items = await service.calcularROIExhibicionFormatted(params);
          return NextResponse.json({
            success: true,
            items,
            params,
            timestamp: new Date().toISOString(),
          });
        }

        // Default: full ROI response
        const data = await service.calcularROIExhibicion(params);
        return NextResponse.json({ success: true, ...data });
      }

      case 'analisis': {
        const params = {
          costo_exhibicion,
          incremento_venta,
          dias_mes,
        };

        const analisis = await service.getAnalisisCompleto(params);
        return NextResponse.json({
          success: true,
          ...analisis,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid type',
            message: 'type must be one of: resumen, roi, analisis',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Exhibiciones API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exhibition data',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

