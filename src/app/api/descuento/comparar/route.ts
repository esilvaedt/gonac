import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

/**
 * POST /api/descuento/comparar
 * Compare multiple discount scenarios
 * 
 * Body:
 * {
 *   descuentos: number[] - Array of discount percentages (e.g., [0.3, 0.4, 0.5])
 *   items: PromocionItem[] - Array of items with elasticity and category
 * }
 * 
 * Example:
 * {
 *   "descuentos": [0.3, 0.35, 0.4, 0.45, 0.5],
 *   "items": [
 *     { "elasticidad": 1.5, "categoria": "PAPAS" },
 *     { "elasticidad": 1.8, "categoria": "TOTOPOS" }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { descuentos, items } = body;

    // Validate descuentos
    if (!Array.isArray(descuentos) || descuentos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'descuentos must be a non-empty array of numbers',
        },
        { status: 400 }
      );
    }

    // Validate each discount
    for (const descuento of descuentos) {
      if (typeof descuento !== 'number' || descuento < 0 || descuento > 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid descuento value',
            message: 'All descuentos must be between 0 and 1',
          },
          { status: 400 }
        );
      }
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid items',
          message: 'items must be a non-empty array',
        },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (typeof item.elasticidad !== 'number' || typeof item.categoria !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid item format',
            message: 'Each item must have elasticidad (number) and categoria (string)',
          },
          { status: 400 }
        );
      }
    }

    // Initialize service
    const supabase = createServerSupabaseClient();
    const repository = new DescuentoRepository(supabase);
    const service = new DescuentoService(repository);

    // Compare discounts
    const data = await service.compararDescuentos(descuentos, items);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Descuento Compare API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compare discount scenarios',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

