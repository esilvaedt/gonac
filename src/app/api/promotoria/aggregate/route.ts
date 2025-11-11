import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { PromotoriaRepository } from '@/repositories/promotoria.repository';
import { PromotoriaService } from '@/services/promotoria.service';

/**
 * GET /api/promotoria/aggregate
 * Get single store with highest risk
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id_store": 123,
 *     "store_name": "Supercito Oriente",
 *     "ventas_acumuladas": "0",
 *     "riesgo_total": 29153.5,
 *     "inventario_sin_rotacion_total": "2034"
 *   },
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const repository = new PromotoriaRepository(supabase);
    const service = new PromotoriaService(repository);

    const result = await service.getTiendaTopRiesgo();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Promotoria Tienda Top Riesgo API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotoria tienda top riesgo',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

