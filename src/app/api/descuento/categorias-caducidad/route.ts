import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

/**
 * GET /api/descuento/categorias-caducidad
 * Get top categories with most close-to-expiration products
 * 
 * Query params:
 * - limit: number (optional) - Number of top categories to return (default: 2)
 * - formatted: boolean (optional) - Return formatted data with percentages
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse parameters
    const limitParam = searchParams.get('limit');
    const formattedParam = searchParams.get('formatted');

    const limit = limitParam ? parseInt(limitParam, 10) : 2;
    const formatted = formattedParam === 'true';

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit value',
          message: 'Limit must be between 1 and 20',
        },
        { status: 400 }
      );
    }

    // Initialize service
    const supabase = createServerSupabaseClient();
    const repository = new DescuentoRepository(supabase);
    const service = new DescuentoService(repository);

    // Get data
    const data = formatted
      ? await service.getTopCategoriasConCaducidadFormatted(limit)
      : await service.getTopCategoriasConCaducidad(limit);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Categorias Caducidad API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch expiration categories',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

