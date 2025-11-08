import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { descuento, items } = body;

    // Validate descuento
    if (typeof descuento !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'descuento is required and must be a number',
        },
        { status: 400 }
      );
    }

    if (descuento < 0 || descuento > 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid descuento value',
          message: 'descuento must be between 0 and 1',
        },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
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

    // Calculate promotion
    const data = await service.calcularPromocion({
      descuento,
      items,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Descuento API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate discount metrics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
