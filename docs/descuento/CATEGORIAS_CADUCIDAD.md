# 📊 Categorias con Caducidad - Feature Documentation

## Overview

This feature retrieves the top categories with the most close-to-expiration products based on their impact value from the `gonac.caducidad_detalle` table.

---

## 🎯 Business Logic

The query aggregates expiration impact by product category:

```sql
SELECT ccp.category, SUM(cd.impacto) as impacto
FROM gonac.caducidad_detalle cd
LEFT JOIN gonac.core_cat_product ccp ON cd.sku = ccp.sku
GROUP BY ccp.category
ORDER BY impacto DESC
LIMIT 2;
```

**Returns**: Top 2 categories (by default) with highest expiration impact

---

## 📁 Files Created/Modified

### 1. **Types** (`src/types/descuento.ts`)

```typescript
export interface CategoriaConCaducidad {
  category: string;
  impacto: number;
}

export interface TopCategoriasExpiracionResponse {
  categorias: CategoriaConCaducidad[];
  total_impacto: number;
  timestamp: string;
}
```

### 2. **Repository** (`src/repositories/descuento.repository.ts`)

**New Methods**:
- `getTopCategoriasConCaducidad(limit)` - Main method (tries RPC, falls back to direct query)
- `getTopCategoriasConCaducidadDirect(limit)` - Fallback using Supabase query builder

### 3. **Service** (`src/services/descuento.service.ts`)

**New Methods**:
- `getTopCategoriasConCaducidad(limit)` - Returns raw data with totals
- `getTopCategoriasConCaducidadFormatted(limit)` - Returns formatted data with percentages

### 4. **API Route** (`src/app/api/descuento/categorias-caducidad/route.ts`)

New endpoint: `GET /api/descuento/categorias-caducidad`

### 5. **React Hook** (`src/hooks/useDescuento.ts`)

**New Hook**: `useCategoriasConCaducidad(options)`

---

## 🚀 Usage

### API Endpoint

#### Basic Request

```bash
GET /api/descuento/categorias-caducidad
```

**Response**:
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "category": "PAPAS",
        "impacto": 125000.50
      },
      {
        "category": "TOTOPOS",
        "impacto": 89000.25
      }
    ],
    "total_impacto": 214000.75,
    "timestamp": "2024-11-07T12:00:00.000Z"
  }
}
```

#### With Custom Limit

```bash
GET /api/descuento/categorias-caducidad?limit=5
```

#### With Formatting

```bash
GET /api/descuento/categorias-caducidad?formatted=true
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "category": "PAPAS",
      "impacto": 125000.50,
      "impacto_formatted": "$125,001",
      "percentage": 58.4
    },
    {
      "category": "TOTOPOS",
      "impacto": 89000.25,
      "impacto_formatted": "$89,000",
      "percentage": 41.6
    }
  ]
}
```

---

### React Hook Usage

#### Basic Usage

```typescript
import { useCategoriasConCaducidad } from '@/hooks/useDescuento';

export function ExpirationCategories() {
  const { data, loading, error } = useCategoriasConCaducidad();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Categories Close to Expiration</h2>
      {data?.categorias.map((cat) => (
        <div key={cat.category}>
          <p>{cat.category}: ${cat.impacto.toLocaleString()}</p>
        </div>
      ))}
      <p>Total Impact: ${data?.total_impacto.toLocaleString()}</p>
    </div>
  );
}
```

#### With Custom Limit

```typescript
const { data, loading, refetch } = useCategoriasConCaducidad({ 
  limit: 5,
  autoFetch: true 
});
```

#### Manual Fetch

```typescript
const { data, refetch } = useCategoriasConCaducidad({ 
  autoFetch: false 
});

// Later...
await refetch();
```

---

### Service Layer Usage (Server Components)

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

export default async function ExpirationPage() {
  const supabase = createServerSupabaseClient();
  const repository = new DescuentoRepository(supabase);
  const service = new DescuentoService(repository);
  
  const data = await service.getTopCategoriasConCaducidad(3);

  return (
    <div>
      <h1>Top Categories with Expiration Risk</h1>
      {data.categorias.map((cat) => (
        <div key={cat.category}>
          <p>{cat.category}: ${cat.impacto.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Database Setup

### No Setup Required! ✅

The repository executes your SQL query logic directly using Supabase's query builder:

1. Fetches data from `gonac.caducidad_detalle`
2. Joins with `gonac.core_cat_product` 
3. Aggregates by category (JavaScript)
4. Sums impacto per category
5. Sorts by impacto DESC
6. Returns top N results

**Works immediately - no database changes needed!**

### Optional: Create Database View (For Better Performance)

If you have very large datasets (>100k rows), you can create a materialized view:

```sql
-- Materialized view for better performance (optional)
CREATE MATERIALIZED VIEW gonac.mv_categorias_caducidad AS
SELECT 
    ccp.category, 
    SUM(cd.impacto)::NUMERIC as impacto
FROM gonac.caducidad_detalle cd
LEFT JOIN gonac.core_cat_product ccp ON cd.sku = ccp.sku
WHERE ccp.category IS NOT NULL
GROUP BY ccp.category
ORDER BY impacto DESC;

-- Refresh periodically (e.g., hourly via cron job)
-- REFRESH MATERIALIZED VIEW gonac.mv_categorias_caducidad;
```

**Benefits of Materialized View**:
- ✅ Pre-computed aggregations
- ✅ Much faster queries
- ✅ Reduced database load

**Note**: The current implementation works perfectly without any database changes!

---

## 📊 Example Component

```typescript
"use client";

import { useCategoriasConCaducidad } from '@/hooks/useDescuento';

export default function ExpirationDashboard() {
  const { data, loading, error, refetch } = useCategoriasConCaducidad({ limit: 3 });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">Error: {error.message}</p>
        <button onClick={refetch} className="mt-2 text-red-600 underline">
          Retry
        </button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPercentage = (impacto: number) => {
    if (!data?.total_impacto) return 0;
    return ((impacto / data.total_impacto) * 100).toFixed(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Categories with Expiration Risk
        </h2>
        <button
          onClick={refetch}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-4">
        {data?.categorias.map((categoria, index) => (
          <div
            key={categoria.category}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categoria.category}
                </h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getPercentage(categoria.impacto)}% of total
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Expiration Impact
              </span>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(categoria.impacto)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${getPercentage(categoria.impacto)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Impact
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data?.total_impacto || 0)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Last updated: {data ? new Date(data.timestamp).toLocaleString() : '-'}
      </p>
    </div>
  );
}
```

---

## 🔍 Testing

### Test API Endpoint

```bash
# Basic test
curl http://localhost:3000/api/descuento/categorias-caducidad

# With limit
curl http://localhost:3000/api/descuento/categorias-caducidad?limit=5

# With formatting
curl "http://localhost:3000/api/descuento/categorias-caducidad?formatted=true"

# Pretty print with jq
curl http://localhost:3000/api/descuento/categorias-caducidad | jq
```

### Test in Component

1. Create a test page with the example component
2. Navigate to the page
3. Verify categories load
4. Test the refresh button
5. Check data accuracy against database

---

## 📈 Performance Considerations

### Current Implementation
- ✅ Works immediately, no DB changes required
- ✅ Uses Supabase query builder with JOIN
- ⚠️ Aggregation done in JavaScript (after fetching data)
- ⚠️ May be slower with very large datasets (>50k rows)

### For Large Datasets
If you have >50k rows in `caducidad_detalle`:
1. Create a materialized view (see Database Setup section)
2. Refresh it periodically via cron job
3. Query the view instead of the table

**Current solution works great for most use cases!**

---

## 🎯 Use Cases

1. **Dashboard Widget** - Show top at-risk categories
2. **Promotion Targeting** - Prioritize categories for discount promotions
3. **Inventory Management** - Focus on categories needing attention
4. **Reporting** - Generate expiration risk reports
5. **Alerts** - Trigger notifications for high-impact categories

---

## ✅ Feature Complete

- ✅ Types defined
- ✅ Repository layer with fallback
- ✅ Service layer with formatting
- ✅ API endpoint
- ✅ React hook
- ✅ Documentation
- ✅ Example component
- ✅ Optional RPC function SQL

---

## 📚 Related Features

- **Valorizacion Module** - Uses same `caducidad_detalle` table
- **Descuento Calculator** - Can use these categories for targeted promotions

---

**Version**: 1.2.0  
**Date**: November 7, 2024  
**Status**: ✅ Complete

