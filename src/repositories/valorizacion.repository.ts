import { SupabaseClient } from '@supabase/supabase-js';
import { ValorizacionItem } from '@/types/valorizacion';

/**
 * Valorizacion Repository
 * Handles all database operations related to valorizacion data
 */
export class ValorizacionRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetches valorizacion data from multiple tables using UNION ALL
   * Retrieves Agotado, Caducidad, and Sin Ventas data
   */
  async getValorizacionData(): Promise<ValorizacionItem[]> {
    const query = `
      SELECT 'Agotado' as valorizacion, 
             COUNT(DISTINCT(id_store))::int as tiendas, 
             SUM(impacto)::numeric as impacto
      FROM gonac.agotamiento_detalle
      UNION ALL
      SELECT 'Caducidad' as valorizacion, 
             COUNT(DISTINCT(id_store))::int as tiendas, 
             SUM(impacto)::numeric as impacto
      FROM gonac.caducidad_detalle
      UNION ALL 
      SELECT 'Sin Ventas' as valorizacion, 
             COUNT(DISTINCT(id_store))::int as tiendas, 
             SUM(impacto)::numeric as impacto
      FROM gonac.sin_ventas_detalle
    `;

    const { data, error } = await this.supabase.rpc('exec_valorizacion_query', {
      query_text: query
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as ValorizacionItem[];
  }

  /**
   * Alternative method: Fetch data from each table separately
   * Use this if you prefer individual queries over UNION ALL
   */
  async getValorizacionDataSeparate(): Promise<ValorizacionItem[]> {
    try {
      const [agotadoResult, caducidadResult, sinVentasResult] = await Promise.all([
        this.getAgotadoData(),
        this.getCaducidadData(),
        this.getSinVentasData(),
      ]);

      return [agotadoResult, caducidadResult, sinVentasResult];
    } catch (error) {
      throw new Error(`Failed to fetch valorizacion data: ${(error as Error).message}`);
    }
  }

  /**
   * Fetch Agotado (Out of Stock) data
   */
  private async getAgotadoData(): Promise<ValorizacionItem> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('agotamiento_detalle')
      .select('id_store, impacto');

    if (error) {
      throw new Error(`Agotado query error: ${error.message}`);
    }

    const uniqueStores = new Set(data.map((item: any) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: any) => sum + (item.impacto || 0), 0);

    return {
      valorizacion: 'Agotado',
      tiendas: uniqueStores.size,
      impacto: totalImpacto,
    };
  }

  /**
   * Fetch Caducidad (Expiration) data
   */
  private async getCaducidadData(): Promise<ValorizacionItem> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('caducidad_detalle')
      .select('id_store, impacto');

    if (error) {
      throw new Error(`Caducidad query error: ${error.message}`);
    }

    const uniqueStores = new Set(data.map((item: any) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: any) => sum + (item.impacto || 0), 0);

    return {
      valorizacion: 'Caducidad',
      tiendas: uniqueStores.size,
      impacto: totalImpacto,
    };
  }

  /**
   * Fetch Sin Ventas (No Sales) data
   */
  private async getSinVentasData(): Promise<ValorizacionItem> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('sin_ventas_detalle')
      .select('id_store, impacto');

    if (error) {
      throw new Error(`Sin Ventas query error: ${error.message}`);
    }

    const uniqueStores = new Set(data.map((item: any) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: any) => sum + (item.impacto || 0), 0);

    return {
      valorizacion: 'Sin Ventas',
      tiendas: uniqueStores.size,
      impacto: totalImpacto,
    };
  }

  /**
   * Get data for a specific valorizacion type
   */
  async getValorizacionByType(type: 'Agotado' | 'Caducidad' | 'Sin Ventas'): Promise<ValorizacionItem> {
    switch (type) {
      case 'Agotado':
        return this.getAgotadoData();
      case 'Caducidad':
        return this.getCaducidadData();
      case 'Sin Ventas':
        return this.getSinVentasData();
      default:
        throw new Error(`Invalid valorizacion type: ${type}`);
    }
  }
}

