# ✅ Schema Update: Using `gonac` Schema

## Changes Made

All repository queries have been updated to use the **`gonac` schema** instead of the default `public` schema.

---

## Files Updated

### 1. **Descuento Repository** (`src/repositories/descuento.repository.ts`)

Updated all queries to use `.schema('gonac')`:

- ✅ `getCategoriasDisponibles()` → `gonac.core_cat_product`
- ✅ `getStoresBySegment()` → `gonac.core_segmentacion_tiendas`
- ✅ `getSkusByCategoria()` → `gonac.core_store_sku_metrics`
- ✅ `getTopCategoriasConCaducidad()` → `gonac.caducidad_detalle` + `gonac.core_cat_product`

### 2. **Valorizacion Repository** (`src/repositories/valorizacion.repository.ts`)

Updated all queries to use `.schema('gonac')`:

- ✅ `getAgotadoData()` → `gonac.agotamiento_detalle`
- ✅ `getCaducidadData()` → `gonac.caducidad_detalle`
- ✅ `getSinVentasData()` → `gonac.sin_ventas_detalle`

---

## SQL Query Execution

### Top Categories with Expiration Risk

The exact SQL query is now executed with the `gonac` schema:

```sql
SELECT ccp.category, SUM(cd.impacto) as impacto
FROM gonac.caducidad_detalle cd
LEFT JOIN gonac.core_cat_product ccp ON cd.sku = ccp.sku
GROUP BY ccp.category
ORDER BY impacto DESC
LIMIT 2;
```

**Implementation** (using Supabase query builder):
```typescript
await this.supabase
  .schema('gonac')
  .from('caducidad_detalle')
  .select(`
    sku,
    impacto,
    core_cat_product!inner(category)
  `);
```

---

## Tables in `gonac` Schema

### Descuento Module
- `gonac.caducidad_detalle`
- `gonac.core_cat_product`
- `gonac.core_segmentacion_tiendas`
- `gonac.core_store_sku_metrics`

### Valorizacion Module
- `gonac.agotamiento_detalle`
- `gonac.caducidad_detalle`
- `gonac.sin_ventas_detalle`

---

## Supabase Configuration

### Before (using `public` schema):
```typescript
const { data } = await this.supabase
  .from('caducidad_detalle')
  .select('*');
```

### After (using `gonac` schema):
```typescript
const { data } = await this.supabase
  .schema('gonac')
  .from('caducidad_detalle')
  .select('*');
```

---

## Testing

### Test Descuento Endpoints

```bash
# Test discount calculation
curl "http://localhost:3000/api/descuento?descuento=0.41"

# Test expiration categories
curl "http://localhost:3000/api/descuento/categorias-caducidad?limit=2"
```

### Test Valorizacion Endpoints

```bash
# Test valorizacion data
curl "http://localhost:3000/api/valorizacion?format=summary"
```

---

## Database Setup

Ensure your Supabase has the `gonac` schema with the required tables:

```sql
-- Verify schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'gonac';

-- Verify tables exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'gonac';
```

Expected tables:
- `gonac.agotamiento_detalle`
- `gonac.caducidad_detalle`
- `gonac.sin_ventas_detalle`
- `gonac.core_cat_product`
- `gonac.core_segmentacion_tiendas`
- `gonac.core_store_sku_metrics`

---

## Benefits

✅ **Proper Schema Organization** - Data separated from `public` schema  
✅ **Better Security** - Schema-level permissions  
✅ **Query Clarity** - Explicit schema references  
✅ **Namespace Isolation** - Avoid conflicts with public tables  

---

## Migration Notes

- **No Breaking Changes** - All existing functionality preserved
- **Backward Compatible** - API responses remain the same
- **Schema Explicit** - All queries now use `.schema('gonac')`

---

**Status**: ✅ Complete  
**Date**: November 7, 2024  
**Schema**: `gonac`

