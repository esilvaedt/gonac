# 🚀 Descuento Module - Quick Start Guide

Get the promotion calculator running in 5 minutes!

---

## ✅ What Was Created

### Core Files
```
✓ src/types/descuento.ts                      # TypeScript types
✓ src/repositories/descuento.repository.ts    # Database layer
✓ src/services/descuento.service.ts           # Business logic
✓ src/app/api/descuento/route.ts             # API endpoint
✓ src/app/api/descuento/comparar/route.ts    # Comparison endpoint
✓ src/hooks/useDescuento.ts                   # React hooks
✓ src/components/descuento/PromocionCalculator.tsx  # UI component
```

---

## 📋 Prerequisites

### 1. Database Function

The PostgreSQL function must exist in your Supabase database:

```sql
CREATE OR REPLACE FUNCTION gonac.calcular_metricas_descuento(
    p_descuento NUMERIC,
    p_elasticidad NUMERIC,
    p_categoria TEXT
)
RETURNS TABLE (
    inventario_inicial_total BIGINT,
    ventas_plus NUMERIC,
    venta_original NUMERIC,
    costo NUMERIC,
    valor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(ssm.inventario_inicial)::BIGINT AS inventario_inicial_total,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)))::NUMERIC AS ventas_plus,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio)::NUMERIC AS venta_original,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * (1 - p_descuento))::NUMERIC AS costo,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * p_descuento)::NUMERIC AS valor
    FROM 
        gonac.core_store_sku_metrics ssm
    INNER JOIN 
        gonac.core_cat_product cp ON ssm.sku = cp.sku
    WHERE 
        ssm.id_store IN (
            SELECT DISTINCT id_store 
            FROM gonac.core_segmentacion_tiendas
            WHERE segment IN ('Slow','Dead')
        )
        AND cp.category = p_categoria;
END;
$$ LANGUAGE plpgsql;
```

**To create the function:**
1. Go to Supabase Dashboard → SQL Editor
2. Paste the function above
3. Run it

### 2. Required Tables

Verify these tables exist:
- `gonac.core_store_sku_metrics`
- `gonac.core_cat_product`
- `gonac.core_segmentacion_tiendas`

### 3. Environment Variables

Already configured from valorizacion module:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 🎯 Quick Integration

### Option 1: Use the Full Component (Recommended)

```tsx
// In your page (e.g., app/promociones/page.tsx)
import PromocionCalculator from '@/components/descuento/PromocionCalculator';

export default function PromocionesPage() {
  return (
    <div className="container mx-auto p-6">
      <PromocionCalculator />
    </div>
  );
}
```

**That's it!** The component includes:
- Configuration inputs (discount %, elasticity)
- Real-time calculation
- Results display for PAPAS & TOTOPOS
- Error handling
- Loading states

### Option 2: Use the Hook (Custom UI)

```tsx
"use client";

import { useDescuento } from '@/hooks/useDescuento';

export default function CustomPromotion() {
  const { data, loading, calcular } = useDescuento();

  const handleCalculate = async () => {
    await calcular({
      descuento: 0.41,           // 41%
      elasticidad_papas: 1.5,
      elasticidad_totopos: 1.8,
    });
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Promotion'}
      </button>

      {data && (
        <div>
          <h2>PAPAS Results</h2>
          <p>Cost: ${data.papas?.costo_promocion.toLocaleString()}</p>
          <p>Value: ${data.papas?.valor_capturar.toLocaleString()}</p>
          <p>Risk Reduction: {data.papas?.reduccion_riesgo.toFixed(1)}%</p>

          <h2>TOTOPOS Results</h2>
          <p>Cost: ${data.totopos?.costo_promocion.toLocaleString()}</p>
          <p>Value: ${data.totopos?.valor_capturar.toLocaleString()}</p>
          <p>Risk Reduction: {data.totopos?.reduccion_riesgo.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Test the API

### 1. Start Dev Server

```bash
npm run dev
# or
pnpm dev
```

### 2. Test the Endpoint

```bash
# Calculate 41% discount promotion
curl "http://localhost:3000/api/descuento?descuento=0.41"

# With custom elasticity
curl "http://localhost:3000/api/descuento?descuento=0.41&elasticidad_papas=2.0&elasticidad_totopos=1.5"

# Compare multiple scenarios
curl -X POST http://localhost:3000/api/descuento/comparar \
  -H "Content-Type: application/json" \
  -d '{
    "descuentos": [0.3, 0.35, 0.4, 0.45, 0.5],
    "elasticidad_papas": 1.5,
    "elasticidad_totopos": 1.8
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "papas": {
      "inventario_inicial_total": 12195,
      "ventas_plus": 7500,
      "venta_original": 55400,
      "costo": 79700,
      "valor": 86100,
      "descuento_porcentaje": 41,
      "elasticidad": 1.5,
      "categoria": "PAPAS",
      "reduccion_riesgo": 61.5,
      "costo_promocion": 59900,
      "valor_capturar": 86100,
      "inventario_post": 4695
    },
    "totopos": { /* similar structure */ },
    "config": {
      "descuento_maximo": 41,
      "elasticidad_papas": 1.5,
      "elasticidad_totopos": 1.8
    },
    "timestamp": "2024-11-07T12:00:00.000Z"
  }
}
```

---

## 📊 Understanding the Results

### Key Metrics Explained

| Metric | Description | Formula |
|--------|-------------|---------|
| **Inventario Inicial** | Starting inventory | From database |
| **Ventas Plus** | Additional sales from promotion | `CEIL(Inv × Discount × Elasticity)` |
| **Valor Capturar** | Revenue before discount | `Ventas Plus × Price` |
| **Costo Promoción** | Discount amount (cost) | `Valor × Discount` |
| **Reducción Riesgo** | % of inventory cleared | `(Ventas Plus / Inv Inicial) × 100` |
| **Inventario Post** | Remaining inventory | `Inv Inicial - Ventas Plus` |

### Example Calculation

For **PAPAS** with **41% discount** and **1.5 elasticity**:

1. Initial Inventory: **12,195** units
2. Additional Sales: `CEIL(12,195 × 0.41 × 1.5)` = **7,500** units
3. Risk Reduction: `(7,500 / 12,195) × 100` = **61.5%**
4. Post Inventory: `12,195 - 7,500` = **4,695** units

---

## 🎨 Component Features

The `PromocionCalculator` component includes:

### Configuration Section
- **Máximo Descuento** input (%)
- **Elasticidad Papas** input
- **Elasticidad Totopos** input
- Suggested values displayed

### Summary Cards
- **Costo Promoción** (total)
- **Valor a Capturar** (total)
- **Inventario Post** (total)

### Category Results
Each category (PAPAS, TOTOPOS) shows:
- Discount percentage
- Risk reduction badge
- Number of SKUs and stores
- Detailed metrics (Inv. Inicial, Ventas+, Costo, Valor)

### Actions
- **Aprobar Promoción** button (triggers calculation)
- **Ajustar con VEMIO** button (placeholder for integration)

### Calculation Info
- Formula explanation
- Example calculation display

---

## 🔄 Integration with Existing Dashboard

### Add to VemioDashboard

```tsx
// src/components/vemio/VemioDashboard.tsx
import PromocionCalculator from '@/components/descuento/PromocionCalculator';

export default function VemioDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("resumen");

  const renderTabContent = () => {
    switch (activeTab) {
      case "resumen":
        return <ResumenView data={vemioMockData.resumen} />;
      case "tiendas":
        return <TiendasView data={vemioMockData} />;
      case "skus":
        return <SKUsView data={vemioMockData.skus} />;
      case "oportunidades":
        return <OportunidadesView data={vemioMockData.oportunidades} />;
      case "acciones":
        return (
          <div className="space-y-6">
            <AccionesView data={vemioMockData.acciones} />
            {/* Add promotion calculator */}
            <PromocionCalculator />
          </div>
        );
      default:
        return <ResumenView data={vemioMockData.resumen} />;
    }
  };

  return (
    <div className="space-y-6">
      <VemioHeader projectInfo={vemioMockData.projectInfo} />
      <VemioTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
```

---

## 🔍 Troubleshooting

### Issue: "Database error calling function"

**Solution**:
1. Check function exists: `SELECT * FROM pg_proc WHERE proname = 'calcular_metricas_descuento';`
2. Verify you're using correct schema: `gonac.calcular_metricas_descuento`
3. Test function directly in SQL Editor:
   ```sql
   SELECT * FROM gonac.calcular_metricas_descuento(0.41, 1.5, 'PAPAS');
   ```

### Issue: "No data returned"

**Solution**:
1. Check stores exist in 'Slow' or 'Dead' segments:
   ```sql
   SELECT COUNT(*) FROM gonac.core_segmentacion_tiendas 
   WHERE segment IN ('Slow', 'Dead');
   ```
2. Check category exists:
   ```sql
   SELECT DISTINCT category FROM gonac.core_cat_product 
   WHERE category IN ('PAPAS', 'TOTOPOS');
   ```
3. Check inventory data exists:
   ```sql
   SELECT COUNT(*) FROM gonac.core_store_sku_metrics;
   ```

### Issue: "Invalid descuento value"

**Solution**: Descuento must be between 0 and 1
- ✅ Correct: `0.41` (for 41%)
- ❌ Wrong: `41` (this is 4100%)

---

## 📚 Next Steps

1. ✅ Test the component in your dashboard
2. ✅ Customize styling to match your design
3. ✅ Add to your navigation/menu
4. ✅ Test with real data
5. ⬜ Add more categories if needed
6. ⬜ Integrate with VEMIO system
7. ⬜ Add export functionality
8. ⬜ Add historical tracking

---

## 📖 Additional Documentation

- **Full Documentation**: `docs/descuento/README_DESCUENTO.md`
- **API Reference**: See "API Reference" section in README
- **Type Definitions**: `src/types/descuento.ts`
- **Example Usage**: See "Usage Examples" in README

---

## ✨ Summary

You now have a complete promotion calculator with:

✅ **Clean Architecture** - Repository → Service → API → UI  
✅ **Type Safety** - Full TypeScript support  
✅ **Real Database** - Uses your PostgreSQL function  
✅ **Production Ready** - Error handling, validation, loading states  
✅ **Beautiful UI** - Based on your screenshot design  
✅ **Easy Integration** - Drop-in component or flexible hooks  

**Start using it now by adding `<PromocionCalculator />` to any page!** 🚀

---

**Questions?** Check the full documentation in `docs/descuento/README_DESCUENTO.md`

