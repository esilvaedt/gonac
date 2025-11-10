import { SupabaseClient } from '@supabase/supabase-js';
import { 
  ValorizacionItem, 
  AgotadoDetalle,
  CaducidadDetalle,
  SinVentasDetalle 
} from '@/types/valorizacion';

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

    const uniqueStores = new Set(data.map((item: Record<string, unknown>) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: Record<string, unknown>) => sum + (Number(item.impacto) || 0), 0);

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

    const uniqueStores = new Set(data.map((item: Record<string, unknown>) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: Record<string, unknown>) => sum + (Number(item.impacto) || 0), 0);

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

    const uniqueStores = new Set(data.map((item: Record<string, unknown>) => item.id_store));
    const totalImpacto = data.reduce((sum: number, item: Record<string, unknown>) => sum + (Number(item.impacto) || 0), 0);

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

  /**
   * Get detailed Agotado opportunities with store and product information
   * Joins agotamiento_detalle with core_cat_store and core_cat_product
   */
  async getAgotadoDetalle(): Promise<AgotadoDetalle[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('agotamiento_detalle')
      .select(`
        segment,
        dias_inventario,
        impacto,
        detectado,
        core_cat_store!inner(store_name),
        core_cat_product!inner(product_name)
      `);

    if (error) {
      throw new Error(`Error fetching agotado details: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested structure to flat objects
    return data.map((item: any) => ({
      segment: String(item.segment || ''),
      store_name: String(item.core_cat_store?.store_name || ''),
      product_name: String(item.core_cat_product?.product_name || ''),
      dias_inventario: Number(item.dias_inventario) || 0,
      impacto: Number(item.impacto) || 0,
      detectado: String(item.detectado || ''),
    }));
  }

  /**
   * Get detailed Caducidad opportunities with store and product information
   * Joins caducidad_detalle with core_cat_store and core_cat_product
   */
  async getCaducidadDetalle(): Promise<CaducidadDetalle[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('caducidad_detalle')
      .select(`
        segment,
        fecha_caducidad,
        inventario_remanente,
        impacto,
        detectado,
        core_cat_store!inner(store_name),
        core_cat_product!inner(product_name)
      `);

    if (error) {
      throw new Error(`Error fetching caducidad details: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested structure to flat objects
    return data.map((item: any) => ({
      segment: String(item.segment || ''),
      store_name: String(item.core_cat_store?.store_name || ''),
      product_name: String(item.core_cat_product?.product_name || ''),
      fecha_caducidad: String(item.fecha_caducidad || ''),
      inventario_remanente: Number(item.inventario_remanente) || 0,
      impacto: Number(item.impacto) || 0,
      detectado: String(item.detectado || ''),
    }));
  }

  /**
   * Get detailed Sin Ventas opportunities with store and product information
   * Joins sin_ventas_detalle with core_cat_store and core_cat_product
   */
  async getSinVentasDetalle(): Promise<SinVentasDetalle[]> {
    const { data, error } = await this.supabase
      .schema('gonac')
      .from('sin_ventas_detalle')
      .select(`
        impacto,
        core_cat_store!inner(store_name),
        core_cat_product!inner(product_name)
      `);

    if (error) {
      throw new Error(`Error fetching sin ventas details: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the nested structure to flat objects
    return data.map((item: any) => ({
      store_name: String(item.core_cat_store?.store_name || ''),
      product_name: String(item.core_cat_product?.product_name || ''),
      impacto: Number(item.impacto) || 0,
    }));
  }
}

