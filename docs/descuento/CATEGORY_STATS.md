# Category Statistics API

Get unique product and store counts by category for discount analysis.

## Overview

This feature provides statistics about unique products (SKUs) and unique stores for specific product categories. This is useful for understanding the scope and reach of promotional campaigns across different categories.

## SQL Query Logic

The implementation executes the following SQL logic:

```sql
SELECT cp.category, 
       count(distinct cp.sku) as unique_products, 
       count(distinct skm.id_store) as unique_stores
FROM gonac.core_cat_product cp
LEFT JOIN gonac.core_store_sku_metrics skm ON skm.sku = cp.sku
WHERE category IN ('Papas', 'Mix', 'Totopos')
GROUP BY category;
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React     │────▶│  API Route   │────▶│   Service       │
│   Hook      │     │              │     │                 │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │   Repository    │
                                         │                 │
                                         └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │   Supabase DB   │
                                         │  (gonac schema) │
                                         └─────────────────┘
```

## API Endpoint

### POST `/api/descuento/category-stats`

Get statistics for specified categories.

**Request Body:**
```json
{
  "categories": ["Papas", "Totopos", "Mix"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "category": "Papas",
        "unique_products": 45,
        "unique_stores": 120
      },
      {
        "category": "Totopos",
        "unique_products": 32,
        "unique_stores": 98
      },
      {
        "category": "Mix",
        "unique_products": 18,
        "unique_stores": 75
      }
    ],
    "total_products": 95,
    "total_stores": 150,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation:**
- `categories` must be a non-empty array
- Each category must be a string
- Returns 400 if validation fails

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid categories",
  "message": "categories must be a non-empty array of strings"
}
```

## React Hook Usage

### `useCategoryStats(options)`

React hook to fetch category statistics.

**Options:**
```typescript
interface UseCategoryStatsOptions {
  categories?: string[];  // Categories to fetch stats for
  autoFetch?: boolean;    // Auto-fetch on mount (default: false)
}
```

**Returns:**
```typescript
interface UseCategoryStatsReturn {
  data: CategoryStatsResponse | null;
  loading: boolean;
  error: Error | null;
  fetchStats: (categories: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}
```

### Examples

#### Auto-fetch on Mount
```tsx
import { useCategoryStats } from '@/hooks/useDescuento';

function CategoryStatsCard() {
  const { data, loading, error } = useCategoryStats({
    categories: ['Papas', 'Totopos'],
    autoFetch: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Category Statistics</h2>
      {data?.stats.map(stat => (
        <div key={stat.category}>
          <h3>{stat.category}</h3>
          <p>Products: {stat.unique_products}</p>
          <p>Stores: {stat.unique_stores}</p>
        </div>
      ))}
      <div>
        <strong>Total Products: {data?.total_products}</strong>
        <strong>Total Stores: {data?.total_stores}</strong>
      </div>
    </div>
  );
}
```

#### Manual Fetch
```tsx
import { useCategoryStats } from '@/hooks/useDescuento';

function CategorySelector() {
  const { data, loading, fetchStats } = useCategoryStats();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleFetch = async () => {
    if (selectedCategories.length > 0) {
      await fetchStats(selectedCategories);
    }
  };

  return (
    <div>
      <select 
        multiple 
        value={selectedCategories}
        onChange={(e) => setSelectedCategories(
          Array.from(e.target.selectedOptions, option => option.value)
        )}
      >
        <option value="Papas">Papas</option>
        <option value="Totopos">Totopos</option>
        <option value="Mix">Mix</option>
        <option value="Galletas">Galletas</option>
      </select>
      
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Stats'}
      </button>

      {data && (
        <div>
          {data.stats.map(stat => (
            <div key={stat.category}>
              <strong>{stat.category}:</strong> {stat.unique_products} products in {stat.unique_stores} stores
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Dynamic Categories
```tsx
import { useCategoryStats } from '@/hooks/useDescuento';

function PromotionPlanner() {
  const { data, loading, fetchStats } = useCategoryStats();

  const handleAnalyzePromotion = async (categories: string[]) => {
    await fetchStats(categories);
    
    // Use stats to determine promotion scope
    data?.stats.forEach(stat => {
      console.log(`${stat.category} reaches ${stat.unique_stores} stores`);
      console.log(`Coverage: ${stat.unique_products} different products`);
    });
  };

  return (
    // ... UI implementation
  );
}
```

## Service Layer

### `DescuentoService.getCategoryStats(categories: string[])`

Business logic for category statistics.

```typescript
const service = new DescuentoService(repository);
const response = await service.getCategoryStats(['Papas', 'Totopos']);

console.log(response.stats);        // Array of CategoryStats
console.log(response.total_products); // Sum of unique products
console.log(response.total_stores);   // Sum of unique stores
console.log(response.timestamp);      // ISO timestamp
```

## Repository Layer

### `DescuentoRepository.getCategoryStats(categories: string[])`

Data access for category statistics.

**Implementation Details:**
1. Fetches products from `gonac.core_cat_product` filtered by categories
2. Fetches store metrics from `gonac.core_store_sku_metrics` for those SKUs
3. Aggregates using JavaScript Maps to calculate unique counts per category
4. Implements LEFT JOIN behavior (products without stores still counted)

**Returns:**
```typescript
interface CategoryStats {
  category: string;
  unique_products: number;
  unique_stores: number;
}
```

## Types

```typescript
// Category statistics for a single category
export interface CategoryStats {
  category: string;
  unique_products: number;
  unique_stores: number;
}

// Full response with aggregated totals
export interface CategoryStatsResponse {
  stats: CategoryStats[];
  total_products: number;
  total_stores: number;
  timestamp: string;
}
```

## CURL Examples

### Basic Request
```bash
curl -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Papas", "Totopos"]
  }'
```

### Multiple Categories
```bash
curl -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Papas", "Totopos", "Mix", "Galletas", "Refrescos"]
  }'
```

### Pretty Print with jq
```bash
curl -s -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Papas", "Totopos"]}' \
  | jq '.'
```

### Extract Specific Data
```bash
# Get only product counts
curl -s -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Papas", "Totopos"]}' \
  | jq '.data.stats[] | {category: .category, products: .unique_products}'

# Get total stores
curl -s -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Papas", "Totopos"]}' \
  | jq '.data.total_stores'
```

## Use Cases

### 1. Promotion Scope Analysis
Determine how many products and stores a category-based promotion will affect.

```typescript
const { data } = await fetchStats(['Papas']);
console.log(`Promotion will affect ${data.stats[0].unique_products} products across ${data.stats[0].unique_stores} stores`);
```

### 2. Multi-Category Campaigns
Compare reach across multiple categories for multi-category promotions.

```typescript
const { data } = await fetchStats(['Papas', 'Totopos', 'Mix']);
data.stats.forEach(stat => {
  console.log(`${stat.category}: ${stat.unique_stores} stores`);
});
```

### 3. Category Selection
Help users select categories based on their product and store availability.

```typescript
const { data } = await fetchStats(allCategories);
const categoriesWithGoodCoverage = data.stats.filter(
  stat => stat.unique_stores >= 100 && stat.unique_products >= 20
);
```

### 4. Dashboard Metrics
Display category coverage in dashboards and reports.

```tsx
<div className="metrics-grid">
  {data?.stats.map(stat => (
    <MetricCard
      key={stat.category}
      title={stat.category}
      products={stat.unique_products}
      stores={stat.unique_stores}
    />
  ))}
</div>
```

## Database Schema

### Tables Used

**gonac.core_cat_product**
- `sku`: Product SKU (primary key)
- `category`: Product category

**gonac.core_store_sku_metrics**
- `sku`: Product SKU
- `id_store`: Store ID
- Other metrics...

### Relationships
```
core_cat_product.sku ←→ core_store_sku_metrics.sku (LEFT JOIN)
```

## Performance Considerations

### Current Implementation
- Uses Supabase client-side filtering with `.in()`
- Aggregation done in JavaScript
- Suitable for moderate data volumes

### Optimization Options

If performance becomes an issue:

1. **PostgreSQL Function**
```sql
CREATE OR REPLACE FUNCTION gonac.get_category_stats(
  p_categories text[]
)
RETURNS TABLE (
  category text,
  unique_products bigint,
  unique_stores bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.category,
    count(DISTINCT cp.sku) as unique_products,
    count(DISTINCT skm.id_store) as unique_stores
  FROM gonac.core_cat_product cp
  LEFT JOIN gonac.core_store_sku_metrics skm ON skm.sku = cp.sku
  WHERE cp.category = ANY(p_categories)
  GROUP BY cp.category;
END;
$$ LANGUAGE plpgsql;
```

2. **Materialized View**
```sql
CREATE MATERIALIZED VIEW gonac.category_stats_summary AS
SELECT 
  cp.category,
  count(DISTINCT cp.sku) as unique_products,
  count(DISTINCT skm.id_store) as unique_stores
FROM gonac.core_cat_product cp
LEFT JOIN gonac.core_store_sku_metrics skm ON skm.sku = cp.sku
GROUP BY cp.category;

-- Refresh periodically
REFRESH MATERIALIZED VIEW gonac.category_stats_summary;
```

## Error Handling

### Validation Errors
- Empty categories array → 400 Bad Request
- Non-string category → 400 Bad Request

### Database Errors
- Table not found → 500 Internal Server Error
- Connection issues → 500 Internal Server Error

### Application Errors
- Service layer errors are logged and returned as 500
- Client-side errors caught by React hook and stored in `error` state

## Testing

### Manual Testing
```bash
# Test with valid categories
curl -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Papas", "Totopos"]}'

# Test with empty array (should fail)
curl -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": []}'

# Test with invalid type (should fail)
curl -X POST http://localhost:3000/api/descuento/category-stats \
  -H "Content-Type: application/json" \
  -d '{"categories": ["Papas", 123]}'
```

## Related Features

- **Discount Calculation** (`/api/descuento`) - Calculate promotion metrics
- **Expiration Categories** (`/api/descuento/categorias-caducidad`) - Get categories close to expiration
- **Compare Discounts** (`/api/descuento/comparar`) - Compare multiple discount scenarios

## Files Modified

1. `src/types/descuento.ts` - Added `CategoryStats` and `CategoryStatsResponse` types
2. `src/repositories/descuento.repository.ts` - Added `getCategoryStats()` method
3. `src/services/descuento.service.ts` - Added `getCategoryStats()` method
4. `src/app/api/descuento/category-stats/route.ts` - New API route
5. `src/hooks/useDescuento.ts` - Added `useCategoryStats()` hook
6. `docs/descuento/CATEGORY_STATS.md` - This documentation

