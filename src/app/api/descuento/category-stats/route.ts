import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

/**
 * POST /api/descuento/category-stats
 * Get unique products and stores count by categories
 * 
 * Body:
 * {
 *   "categories": ["Papas", "Totopos", "Mix"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "stats": [
 *       {
 *         "category": "Papas",
 *         "unique_products": 45,
 *         "unique_stores": 120
 *       },
 *       {
 *         "category": "Totopos",
 *         "unique_products": 32,
 *         "unique_stores": 98
 *       }
 *     ],
 *     "total_products": 77,
 *     "total_stores": 150,
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body;

    // Validate categories
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid categories',
          message: 'categories must be a non-empty array of strings',
        },
        { status: 400 }
      );
    }

    // Validate all items are strings
    for (const category of categories) {
      if (typeof category !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid category format',
            message: 'Each category must be a string',
          },
          { status: 400 }
        );
      }
    }

    const supabase = createServerSupabaseClient();
    const repository = new DescuentoRepository(supabase);
    const service = new DescuentoService(repository);

    const data = await service.getCategoryStats(categories);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Category Stats API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get category statistics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

