import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AccionReabastoRepository } from '@/repositories/accionReabasto.repository';
import { AccionReabastoService } from '@/services/accionReabasto.service';

/**
 * GET /api/accion-reabasto
 * Fetches urgent restocking action data (Acción #1)
 * 
 * Query Parameters:
 * - format: 'summary' | 'por-tienda' | 'detalle' (default: 'summary')
 * 
 * Examples:
 * - GET /api/accion-reabasto (summary format)
 * - GET /api/accion-reabasto?format=summary
 * - GET /api/accion-reabasto?format=por-tienda
 * - GET /api/accion-reabasto?format=detalle
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'summary';

    // Validate format parameter
    const validFormats = ['summary', 'por-tienda', 'detalle'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid format. Must be one of: ${validFormats.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Initialize repository and service
    const supabase = createServerSupabaseClient();
    const repository = new AccionReabastoRepository(supabase);
    const service = new AccionReabastoService(repository);

    // Handle different formats
    switch (format) {
      case 'summary': {
        const result = await service.getSummary();
        return NextResponse.json({
          success: true,
          ...result
        });
      }

      case 'por-tienda': {
        const result = await service.getPorTienda();
        return NextResponse.json({
          success: true,
          ...result
        });
      }

      case 'detalle': {
        const result = await service.getDetalle();
        return NextResponse.json({
          success: true,
          ...result
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid format parameter'
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error (accion-reabasto):', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

