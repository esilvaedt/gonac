# Descuento Module - Changelog

## [Updated] - 2024-11-07

### Added New Field: `reduccion`

The PostgreSQL function `gonac.calcular_metricas_descuento` now returns a new field called `reduccion` (float).

---

## 📝 Changes Made

### 1. **Type Definitions** (`src/types/descuento.ts`)

Updated `DescuentoMetrics` interface to include the new field:

```typescript
export interface DescuentoMetrics {
  inventario_inicial_total: number;
  ventas_plus: number;
  venta_original: number;
  costo: number;
  valor: number;
  reduccion: number;  // ✨ NEW FIELD
}
```

Since `PromocionMetrics` extends `DescuentoMetrics`, it automatically includes the `reduccion` field as well.

---

### 2. **Repository Layer** (`src/repositories/descuento.repository.ts`)

Updated to parse and return the new `reduccion` field from the database:

```typescript
return {
  inventario_inicial_total: Number(result.inventario_inicial_total) || 0,
  ventas_plus: Number(result.ventas_plus) || 0,
  venta_original: Number(result.venta_original) || 0,
  costo: Number(result.costo) || 0,
  valor: Number(result.valor) || 0,
  reduccion: Number(result.reduccion) || 0,  // ✨ NEW FIELD
};
```

Also updated error handling to include default value for `reduccion`:

```typescript
metrics: {
  inventario_inicial_total: 0,
  ventas_plus: 0,
  venta_original: 0,
  costo: 0,
  valor: 0,
  reduccion: 0,  // ✨ NEW FIELD
}
```

---

### 3. **UI Component** (`src/components/descuento/PromocionCalculator.tsx`)

Updated the display to show the new `reduccion` field for both PAPAS and TOTOPOS:

**Changes:**
- Changed grid from `md:grid-cols-4` to `md:grid-cols-5` to accommodate the new column
- Added a new column displaying "Reducción" with orange color

**For PAPAS:**
```tsx
<div>
  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
    Reducción
  </p>
  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
    {formatCurrency(data.papas.reduccion)}
  </p>
</div>
```

**For TOTOPOS:**
```tsx
<div>
  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
    Reducción
  </p>
  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
    {formatCurrency(data.totopos.reduccion)}
  </p>
</div>
```

---

## 🎯 What Works Now

### API Response

The API now returns the `reduccion` field in the response:

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
      "reduccion": 12345.67,  // ✨ NEW FIELD
      "descuento_porcentaje": 41,
      "elasticidad": 1.5,
      "categoria": "PAPAS",
      "reduccion_riesgo": 61.5,
      "costo_promocion": 59900,
      "valor_capturar": 86100,
      "inventario_post": 4695
    },
    "totopos": {
      "inventario_inicial_total": 1146,
      "ventas_plus": 846,
      "venta_original": 4500,
      "costo": 6500,
      "valor": 4500,
      "reduccion": 1234.56,  // ✨ NEW FIELD
      "descuento_porcentaje": 41,
      "elasticidad": 1.8,
      "categoria": "TOTOPOS",
      "reduccion_riesgo": 73.8,
      "costo_promocion": 4500,
      "valor_capturar": 6500,
      "inventario_post": 300
    },
    "config": {
      "descuento_maximo": 41,
      "elasticidad_papas": 1.5,
      "elasticidad_totopos": 1.8
    },
    "timestamp": "2024-11-07T12:00:00.000Z"
  }
}
```

### UI Display

The promotion calculator now displays 5 metrics per category:

| Metric | Description | Color |
|--------|-------------|-------|
| **Inv. Inicial** | Initial inventory | Gray |
| **Ventas +** | Additional sales | Green |
| **Costo** | Cost after discount | Gray |
| **Valor** | Value captured | Blue |
| **Reducción** | Reduction value | Orange ✨ |

---

## 🧪 Testing

### Test the Updated API

```bash
# Test with curl
curl "http://localhost:3000/api/descuento?descuento=0.41"

# Verify the response includes "reduccion" field
curl "http://localhost:3000/api/descuento?descuento=0.41" | jq '.data.papas.reduccion'
```

### Test in UI

1. Open the `PromocionCalculator` component
2. Enter discount and elasticity values
3. Click "Aprobar Promoción"
4. Verify the "Reducción" column appears for both PAPAS and TOTOPOS

---

## 📊 Database Function

Your PostgreSQL function should now return the `reduccion` field:

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
    valor NUMERIC,
    reduccion NUMERIC  -- ✨ NEW FIELD
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(ssm.inventario_inicial)::BIGINT AS inventario_inicial_total,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)))::NUMERIC AS ventas_plus,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio)::NUMERIC AS venta_original,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * (1 - p_descuento))::NUMERIC AS costo,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * p_descuento)::NUMERIC AS valor,
        -- Add your reduccion calculation here
        SUM(your_reduccion_calculation)::NUMERIC AS reduccion  -- ✨ NEW FIELD
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

---

## ✅ Files Modified

- ✅ `src/types/descuento.ts` - Added `reduccion` to `DescuentoMetrics`
- ✅ `src/repositories/descuento.repository.ts` - Parse `reduccion` from DB
- ✅ `src/components/descuento/PromocionCalculator.tsx` - Display `reduccion` in UI

---

## 🔄 Service Layer

**No changes required** - The service layer (`src/services/descuento.service.ts`) automatically handles the new field since it passes through the `DescuentoMetrics` from the repository without transformation.

---

## 🎨 Styling

The new "Reducción" field uses:
- **Color**: Orange (`text-orange-600 dark:text-orange-400`)
- **Format**: Currency (using `formatCurrency()`)
- **Position**: 5th column in the grid

---

## 🚀 Migration Guide

If you have existing code using the descuento module:

### Before
```typescript
const { data } = await calcular({ descuento: 0.41 });
console.log(data.papas.costo);
console.log(data.papas.valor);
// Only 5 fields available
```

### After
```typescript
const { data } = await calcular({ descuento: 0.41 });
console.log(data.papas.costo);
console.log(data.papas.valor);
console.log(data.papas.reduccion);  // ✨ NEW FIELD
// Now 6 fields available
```

**Note**: This is a **non-breaking change** - existing code continues to work, and the new field is simply available for use.

---

## 📋 Backward Compatibility

✅ **Fully backward compatible**
- Existing code continues to work without modifications
- New `reduccion` field is optional to use
- Default value of `0` provided if field is missing from database

---

**Updated by**: AI Assistant  
**Date**: November 7, 2024  
**Version**: 1.1.0

