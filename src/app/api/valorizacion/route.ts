import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ValorizacionRepository } from '@/repositories/valorizacion.repository';
import { ValorizacionService } from '@/services/valorizacion.service';

/**
 * GET /api/valorizacion
 * Fetches valorizacion data (Agotado, Caducidad, Sin Ventas)
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'default'; // default | summary | percentages
    const type = searchParams.get('type') as 'Agotado' | 'Caducidad' | 'Sin Ventas' | null;

    // Initialize repository and service
    const supabase = createServerSupabaseClient();
    const repository = new ValorizacionRepository(supabase);
    const service = new ValorizacionService(repository);

    // Handle specific type request
    if (type) {
      const data = await service.getValorizacionByType(type);
      return NextResponse.json({
        success: true,
        data,
      });
    }

    // Handle different formats
    let data;
    switch (format) {
      case 'summary':
        data = await service.getValorizacionSummary();
        break;
      case 'percentages':
        data = await service.getValorizacionPercentages();
        break;
      case 'critical':
        data = await service.getMostCritical();
        break;
      default:
        data = await service.getValorizacion();
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Valorizacion API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch valorizacion data',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/valorizacion/refresh
 * Manually trigger data refresh (if needed for caching)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const repository = new ValorizacionRepository(supabase);
    const service = new ValorizacionService(repository);

    const data = await service.getValorizacion();

    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      data,
    });
  } catch (error) {
    console.error('Valorizacion Refresh Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh valorizacion data',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

