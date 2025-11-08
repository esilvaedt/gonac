# 🎯 Multiple Items Support - Descuento Module

## Overview

The `calcularPromocion` method now supports calculating promotions for multiple categories with individual elasticity values per category.

---

## 🆕 New Format

### Request Body

```json
{
  "descuento": 0.41,
  "items": [
    {
      "elasticidad": 1.5,
      "categoria": "PAPAS"
    },
    {
      "elasticidad": 1.8,
      "categoria": "TOTOPOS"
    },
    {
      "elasticidad": 2.0,
      "categoria": "GALLETAS"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "items": {
      "PAPAS": {
        "inventario_inicial_total": 12195,
        "ventas_plus": 7500,
        "venta_original": 55400,
        "costo": 79700,
        "valor": 86100,
        "reduccion": 12345.67,
        "descuento_porcentaje": 41,
        "elasticidad": 1.5,
        "categoria": "PAPAS",
        "reduccion_riesgo": 61.5,
        "costo_promocion": 59900,
        "valor_capturar": 86100,
        "inventario_post": 4695
      },
      "TOTOPOS": {
        "inventario_inicial_total": 1146,
        "ventas_plus": 846,
        // ... similar structure
      },
      "GALLETAS": {
        // ... similar structure
      }
    },
    "config": {
      "descuento_maximo": 41,
      "items": [
        { "elasticidad": 1.5, "categoria": "PAPAS" },
        { "elasticidad": 1.8, "categoria": "TOTOPOS" },
        { "elasticidad": 2.0, "categoria": "GALLETAS" }
      ]
    },
    "timestamp": "2024-11-07T12:00:00.000Z",
    // Legacy fields for backward compatibility
    "papas": { /* PAPAS data */ },
    "totopos": { /* TOTOPOS data */ }
  }
}
```

---

## 🔄 Backward Compatibility

### Legacy Format (Still Supported)

```json
{
  "descuento": 0.41,
  "elasticidad_papas": 1.5,
  "elasticidad_totopos": 1.8
}
```

**Response includes both new and legacy fields**:
- New: `data.items.PAPAS`, `data.items.TOTOPOS`
- Legacy: `data.papas`, `data.totopos` (maintained for backward compatibility)

---

## 🚀 API Usage

### POST `/api/descuento`

#### New Format (Multiple Items)

```bash
curl -X POST http://localhost:3000/api/descuento \
  -H "Content-Type: application/json" \
  -d '{
    "descuento": 0.41,
    "items": [
      { "elasticidad": 1.5, "categoria": "PAPAS" },
      { "elasticidad": 1.8, "categoria": "TOTOPOS" },
      { "elasticidad": 2.0, "categoria": "GALLETAS" }
    ]
  }'
```

#### Legacy Format (Still Works)

```bash
curl -X POST http://localhost:3000/api/descuento \
  -H "Content-Type": application/json" \
  -d '{
    "descuento": 0.41,
    "elasticidad_papas": 1.5,
    "elasticidad_totopos": 1.8
  }'
```

---

## 🎣 React Hook Usage

### New Format

```typescript
import { useDescuento } from '@/hooks/useDescuento';

function MyComponent() {
  const { data, loading, calcular } = useDescuento();

  const handleCalculate = async () => {
    await calcular({
      descuento: 0.41,
      items: [
        { elasticidad: 1.5, categoria: 'PAPAS' },
        { elasticidad: 1.8, categoria: 'TOTOPOS' },
        { elasticidad: 2.0, categoria: 'GALLETAS' },
      ],
    });
  };

  // Access results
  if (data) {
    console.log('PAPAS:', data.items.PAPAS);
    console.log('TOTOPOS:', data.items.TOTOPOS);
    console.log('GALLETAS:', data.items.GALLETAS);
    
    // Legacy access still works
    console.log('PAPAS (legacy):', data.papas);
  }

  return (
    <button onClick={handleCalculate}>
      Calculate Promotion
    </button>
  );
}
```

### Legacy Format (Still Works)

```typescript
const { data, calcular } = useDescuento();

await calcular({
  descuento: 0.41,
  elasticidad_papas: 1.5,
  elasticidad_totopos: 1.8,
});

// Both work
console.log(data.items.PAPAS);  // New way
console.log(data.papas);         // Legacy way
```

---

## 💡 Use Cases

### 1. Dynamic Categories

Calculate promotions for any number of categories:

```typescript
const categories = ['PAPAS', 'TOTOPOS', 'GALLETAS', 'DULCES', 'BEBIDAS'];

await calcular({
  descuento: 0.41,
  items: categories.map((cat) => ({
    elasticidad: getCategoryElasticity(cat),
    categoria: cat,
  })),
});
```

### 2. Different Elasticity Per Category

Each category can have its own elasticity:

```typescript
await calcular({
  descuento: 0.41,
  items: [
    { elasticidad: 1.2, categoria: 'PAPAS' },      // Low elasticity
    { elasticidad: 2.5, categoria: 'GALLETAS' },   // High elasticity
    { elasticidad: 1.8, categoria: 'TOTOPOS' },    // Medium elasticity
  ],
});
```

### 3. A/B Testing

Test different elasticity values for the same category:

```typescript
const testScenarios = [
  { descuento: 0.41, items: [{ elasticidad: 1.5, categoria: 'PAPAS' }] },
  { descuento: 0.41, items: [{ elasticidad: 2.0, categoria: 'PAPAS' }] },
  { descuento: 0.41, items: [{ elasticidad: 2.5, categoria: 'PAPAS' }] },
];

for (const scenario of testScenarios) {
  await calcular(scenario);
  console.log('Results:', data);
}
```

---

## 📊 Service Layer Usage

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

export default async function PromotionPage() {
  const supabase = createServerSupabaseClient();
  const repository = new DescuentoRepository(supabase);
  const service = new DescuentoService(repository);
  
  const data = await service.calcularPromocion({
    descuento: 0.41,
    items: [
      { elasticidad: 1.5, categoria: 'PAPAS' },
      { elasticidad: 1.8, categoria: 'TOTOPOS' },
      { elasticidad: 2.0, categoria: 'GALLETAS' },
    ],
  });

  return (
    <div>
      {Object.entries(data.items).map(([categoria, metrics]) => (
        <div key={categoria}>
          <h2>{categoria}</h2>
          <p>Cost: ${metrics.costo_promocion.toLocaleString()}</p>
          <p>Value: ${metrics.valor_capturar.toLocaleString()}</p>
          <p>Risk Reduction: {metrics.reduccion_riesgo.toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 TypeScript Types

### New Types

```typescript
export interface PromocionItem {
  elasticidad: number;
  categoria: string;
}

export interface CalcularPromocionRequest {
  descuento: number;
  items?: PromocionItem[];  // New format
  // Legacy support
  elasticidad_papas?: number;
  elasticidad_totopos?: number;
  categorias?: string[];
}

export interface PromocionResponse {
  items: Record<string, PromocionMetrics>;  // Dynamic categories
  config: {
    descuento_maximo: number;
    items: PromocionItem[];
  };
  timestamp: string;
  // Legacy fields
  papas?: PromocionMetrics | null;
  totopos?: PromocionMetrics | null;
}
```

---

## ✨ Benefits

### ✅ Flexibility
- Calculate for **any number of categories**
- Each category can have **individual elasticity**
- No hardcoded category names

### ✅ Scalability
- Add new categories without code changes
- Dynamic configuration per request
- Easy to test different scenarios

### ✅ Backward Compatible
- Existing code continues to work
- Legacy fields maintained
- Gradual migration path

### ✅ Type Safe
- Full TypeScript support
- Compile-time validation
- IDE autocomplete

---

## 🔄 Migration Guide

### Before (Hardcoded Categories)

```typescript
const data = await service.calcularPromocion({
  descuento: 0.41,
  elasticidad_papas: 1.5,
  elasticidad_totopos: 1.8,
});

console.log(data.papas.costo_promocion);
console.log(data.totopos.valor_capturar);
```

### After (Dynamic Items)

```typescript
const data = await service.calcularPromocion({
  descuento: 0.41,
  items: [
    { elasticidad: 1.5, categoria: 'PAPAS' },
    { elasticidad: 1.8, categoria: 'TOTOPOS' },
    { elasticidad: 2.0, categoria: 'GALLETAS' },  // ✨ New!
  ],
});

// New way (dynamic)
console.log(data.items.PAPAS.costo_promocion);
console.log(data.items.TOTOPOS.valor_capturar);
console.log(data.items.GALLETAS.costo_promocion);  // ✨ New!

// Legacy way (still works)
console.log(data.papas.costo_promocion);
console.log(data.totopos.valor_capturar);
```

---

## 🧪 Testing

### Test New Format

```bash
# Test with multiple items
curl -X POST http://localhost:3000/api/descuento \
  -H "Content-Type: application/json" \
  -d '{
    "descuento": 0.41,
    "items": [
      {"elasticidad": 1.5, "categoria": "PAPAS"},
      {"elasticidad": 1.8, "categoria": "TOTOPOS"}
    ]
  }' | jq '.data.items'
```

### Test Legacy Format

```bash
# Test legacy format still works
curl -X POST http://localhost:3000/api/descuento \
  -H "Content-Type: application/json" \
  -d '{
    "descuento": 0.41,
    "elasticidad_papas": 1.5,
    "elasticidad_totopos": 1.8
  }' | jq '.data.papas'
```

---

## 📝 Notes

1. **Validation**: The API validates that each item has `elasticidad` (number) and `categoria` (string)
2. **Parallel Execution**: All categories are calculated in parallel for performance
3. **Dynamic Response**: The `items` object dynamically includes all calculated categories
4. **Legacy Support**: `papas` and `totopos` fields are automatically populated if present in `items`

---

## 🎯 Summary

| Feature | Old | New |
|---------|-----|-----|
| **Categories** | Fixed (PAPAS, TOTOPOS) | Dynamic (any categories) |
| **Elasticity** | Fixed per category | Individual per item |
| **API Format** | Query params or fixed body | Flexible items array |
| **Response** | Fixed fields (`papas`, `totopos`) | Dynamic (`items` object) |
| **Scalability** | Limited | Unlimited |
| **Backward Compatible** | N/A | ✅ Yes |

---

**Version**: 1.3.0  
**Date**: November 7, 2024  
**Breaking Changes**: None (fully backward compatible)  
**Status**: ✅ Complete

