# 🚀 Descuento Module - Quick Reference

## API Endpoints

### 1. Calculate Discount Promotion
```bash
GET /api/descuento?descuento=0.41&elasticidad_papas=1.5&elasticidad_totopos=1.8
POST /api/descuento
```

### 2. Compare Discount Scenarios
```bash
POST /api/descuento/comparar
Body: { "descuentos": [0.3, 0.4, 0.5] }
```

### 3. Top Categories with Expiration Risk ✨ NEW
```bash
GET /api/descuento/categorias-caducidad?limit=2
```

---

## React Hooks

### Calculate Promotion
```typescript
import { useDescuento } from '@/hooks/useDescuento';

const { data, loading, calcular } = useDescuento();
await calcular({ descuento: 0.41 });
```

### Compare Scenarios
```typescript
import { useCompararDescuentos } from '@/hooks/useDescuento';

const { data, loading, comparar } = useCompararDescuentos();
await comparar([0.3, 0.4, 0.5]);
```

### Get Expiration Categories ✨ NEW
```typescript
import { useCategoriasConCaducidad } from '@/hooks/useDescuento';

const { data, loading } = useCategoriasConCaducidad({ limit: 2 });
```

---

## Quick Examples

### 1. Basic Promotion Calculation
```typescript
const { data } = useDescuento();

await calcular({
  descuento: 0.41,
  elasticidad_papas: 1.5,
  elasticidad_totopos: 1.8,
});

console.log('PAPAS cost:', data.papas?.costo_promocion);
console.log('PAPAS reduction:', data.papas?.reduccion); // NEW FIELD
```

### 2. Get Top Expiration Categories
```typescript
const { data } = useCategoriasConCaducidad();

data?.categorias.forEach(cat => {
  console.log(`${cat.category}: $${cat.impacto}`);
});
```

### 3. Server Component
```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

const supabase = createServerSupabaseClient();
const repository = new DescuentoRepository(supabase);
const service = new DescuentoService(repository);

// Calculate promotion
const promo = await service.calcularPromocion({ descuento: 0.41 });

// Get expiration categories
const categories = await service.getTopCategoriasConCaducidad(3);
```

---

## Data Structure

### Promotion Response
```typescript
{
  papas: {
    inventario_inicial_total: number,
    ventas_plus: number,
    venta_original: number,
    costo: number,
    valor: number,
    reduccion: number,  // ✨ NEW
    // ... more fields
  },
  totopos: { /* same structure */ },
  config: { /* elasticity settings */ },
  timestamp: string
}
```

### Expiration Categories Response ✨ NEW
```typescript
{
  categorias: [
    { category: string, impacto: number },
    // ...
  ],
  total_impacto: number,
  timestamp: string
}
```

---

## Optional PostgreSQL Functions

### For Better Performance (Optional)

```sql
-- Function 1: Top categories with expiration
CREATE OR REPLACE FUNCTION gonac.get_top_categorias_caducidad(p_limit INTEGER DEFAULT 2)
RETURNS TABLE (category TEXT, impacto NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT ccp.category, SUM(cd.impacto)::NUMERIC as impacto
    FROM gonac.caducidad_detalle cd
    LEFT JOIN gonac.core_cat_product ccp ON cd.sku = ccp.sku
    WHERE ccp.category IS NOT NULL
    GROUP BY ccp.category
    ORDER BY impacto DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

**Note**: The module works without this function using a JavaScript fallback.

---

## Testing Commands

```bash
# Test promotion calculation
curl "http://localhost:3000/api/descuento?descuento=0.41"

# Test expiration categories
curl "http://localhost:3000/api/descuento/categorias-caducidad?limit=3"

# Test with formatting
curl "http://localhost:3000/api/descuento/categorias-caducidad?formatted=true"

# Pretty print
curl "http://localhost:3000/api/descuento/categorias-caducidad" | jq
```

---

## Common Patterns

### 1. Dashboard Widget
```typescript
function DashboardWidget() {
  const { data: promo } = useDescuento({ descuento: 0.41, autoFetch: true });
  const { data: categories } = useCategoriasConCaducidad({ limit: 3 });
  
  return (
    <div>
      <PromoSummary data={promo} />
      <ExpirationCategories data={categories} />
    </div>
  );
}
```

### 2. Refresh on Interval
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 5 * 60 * 1000); // 5 minutes
  
  return () => clearInterval(interval);
}, [refetch]);
```

### 3. Conditional Rendering
```typescript
{loading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <Results data={data} />}
```

---

## File Locations

```
src/
├── types/descuento.ts
├── repositories/descuento.repository.ts
├── services/descuento.service.ts
├── hooks/useDescuento.ts
├── app/api/
│   └── descuento/
│       ├── route.ts
│       ├── comparar/route.ts
│       └── categorias-caducidad/route.ts  ✨ NEW
└── components/descuento/
    └── PromocionCalculator.tsx

docs/descuento/
├── README_DESCUENTO.md
├── QUICK_START.md
├── CHANGELOG.md
├── UPDATE_SUMMARY.md
├── CATEGORIAS_CADUCIDAD.md  ✨ NEW
└── QUICK_REFERENCE.md  ✨ NEW (this file)
```

---

## Key Features

### Promotion Calculator
- ✅ Calculate for PAPAS & TOTOPOS
- ✅ Custom elasticity values
- ✅ Risk reduction metrics
- ✅ `reduccion` field support ✨

### Expiration Categories ✨ NEW
- ✅ Top N categories by impact
- ✅ Automatic fallback (no DB changes needed)
- ✅ Optional RPC function
- ✅ Formatted data with percentages
- ✅ Total impact calculation

---

**Version**: 1.2.0  
**Last Updated**: November 7, 2024  
**Status**: Production Ready ✅

