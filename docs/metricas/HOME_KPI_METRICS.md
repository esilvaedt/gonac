# Home Page KPI Metrics

Consolidated metrics for home page dashboard from materialized view `gonac.mvw_metricas_consolidadas`.

## Overview

This feature provides pre-aggregated KPI metrics for the home page dashboard, fetched from a materialized view for optimal performance. The metrics include sales, growth, inventory, and coverage data.

## Database Source

**Materialized View:** `gonac.mvw_metricas_consolidadas`

### Schema Structure

| Field Name | Data Type | Format | Description |
|------------|-----------|--------|-------------|
| `ventas_totales_pesos` | numeric | numeric | Total sales in Mexican Pesos |
| `crecimiento_vs_semana_anterior_pct` | numeric | numeric | Growth percentage vs previous week |
| `ventas_totales_unidades` | bigint | int8 | Total sales in units |
| `sell_through_pct` | numeric | numeric | Sell-through percentage |
| `cobertura_pct` | numeric | numeric | Coverage percentage |
| `cobertura_ponderada_pct` | numeric | numeric | Weighted coverage percentage |
| `promedio_dias_inventario` | double precision | float8 | Average inventory days |
| `porcentaje_agotados_pct` | numeric | numeric | Out of stock percentage |
| `avg_venta_promedio_diaria` | double precision | float8 | Average daily sales |

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
                                         │  Materialized   │
                                         │      View       │
                                         │    (gonac)      │
                                         └─────────────────┘
```

## API Endpoint

### GET `/api/metricas`

Fetch consolidated metrics with optional formatting.

**Query Parameters:**
- `format`: `'raw'` | `'formatted'` | `'cards'` (default: `'raw'`)

#### Format: Raw (default)
```bash
curl http://localhost:3000/api/metricas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ventas_totales_pesos": 15000000,
    "crecimiento_vs_semana_anterior_pct": 8.5,
    "ventas_totales_unidades": 125000,
    "sell_through_pct": 85.2,
    "cobertura_pct": 92.3,
    "cobertura_ponderada_pct": 88.7,
    "promedio_dias_inventario": 45.3,
    "porcentaje_agotados_pct": 12.5,
    "avg_venta_promedio_diaria": 150000
  },
  "timestamp": "2025-11-10T12:34:56.789Z",
  "source": "mvw_metricas_consolidadas"
}
```

#### Format: Formatted
```bash
curl http://localhost:3000/api/metricas?format=formatted
```

**Response:**
```json
{
  "success": true,
  "ventas_totales_pesos": 15000000,
  "ventas_totales_pesos_formatted": "$15,000,000",
  "crecimiento_vs_semana_anterior_pct": 8.5,
  "crecimiento_formatted": "8.50%",
  "ventas_totales_unidades": 125000,
  "ventas_totales_unidades_formatted": "125,000",
  "sell_through_pct": 85.2,
  "sell_through_formatted": "85.20%",
  ...
}
```

#### Format: Cards
```bash
curl http://localhost:3000/api/metricas?format=cards
```

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "id": "ventas_totales_pesos",
      "label": "Ventas Totales",
      "value": 15000000,
      "formatted_value": "$15,000,000",
      "unit": "currency",
      "trend": "up",
      "icon": "currency"
    },
    {
      "id": "crecimiento_vs_semana_anterior",
      "label": "Crecimiento vs Semana Anterior",
      "value": 8.5,
      "formatted_value": "8.50%",
      "unit": "percentage",
      "trend": "up",
      "icon": "trending"
    },
    ...
  ],
  "timestamp": "2025-11-10T12:34:56.789Z"
}
```

### POST `/api/metricas`

Refresh the materialized view (requires database permissions).

```bash
curl -X POST http://localhost:3000/api/metricas
```

**Response:**
```json
{
  "success": true,
  "message": "Materialized view refreshed successfully",
  "timestamp": "2025-11-10T12:34:56.789Z"
}
```

## React Hooks

### `useMetricas(options)` - Raw Metrics

Fetch raw consolidated metrics.

**Options:**
```typescript
interface UseMetricasOptions {
  format?: 'raw' | 'formatted' | 'cards';
  autoFetch?: boolean;
  refreshInterval?: number; // milliseconds
}
```

**Example:**
```tsx
import { useMetricas } from '@/hooks/useMetricas';

function HomePage() {
  const { data, loading, error, refetch, refresh } = useMetricas({
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Ventas Totales: ${data?.data.ventas_totales_pesos.toLocaleString()}</h1>
      <p>Crecimiento: {data?.data.crecimiento_vs_semana_anterior_pct}%</p>
      
      <button onClick={refetch}>Actualizar</button>
      <button onClick={refresh}>Recalcular Vista</button>
    </div>
  );
}
```

### `useMetricasFormatted(options)` - Formatted Metrics

Fetch metrics with formatted strings (currency, percentages).

**Example:**
```tsx
import { useMetricasFormatted } from '@/hooks/useMetricas';

function FormattedMetrics() {
  const { data, loading } = useMetricasFormatted({ autoFetch: true });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Ventas: {data?.ventas_totales_pesos_formatted}</p>
      <p>Crecimiento: {data?.crecimiento_formatted}</p>
      <p>Unidades: {data?.ventas_totales_unidades_formatted}</p>
      <p>Sell Through: {data?.sell_through_formatted}</p>
    </div>
  );
}
```

### `useMetricasCards(options)` - KPI Cards

Fetch metrics as structured KPI cards for dashboard display.

**Example:**
```tsx
import { useMetricasCards } from '@/hooks/useMetricas';

function KPIDashboard() {
  const { cards, loading, error } = useMetricasCards({
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000,
  });

  if (loading) return <div>Loading KPIs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards?.map(card => (
        <div key={card.id} className="kpi-card">
          <h3>{card.label}</h3>
          <p className="value">{card.formatted_value}</p>
          {card.trend && <span className={`trend-${card.trend}`}>
            {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→'}
          </span>}
        </div>
      ))}
    </div>
  );
}
```

## Component Example

### Full Dashboard Component

```tsx
'use client';

import { useMetricasCards } from '@/hooks/useMetricas';

export function HomeKPIDashboard() {
  const { cards, loading, error, refetch, refresh } = useMetricasCards({
    autoFetch: true,
    refreshInterval: 5 * 60 * 1000,
  });

  if (loading && !cards) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div>
      <div className="header">
        <h2>KPIs Consolidados</h2>
        <button onClick={refetch}>Actualizar</button>
        <button onClick={refresh}>Recalcular</button>
      </div>

      <div className="kpi-grid">
        {cards?.map(card => (
          <KPICard key={card.id} {...card} />
        ))}
      </div>
    </div>
  );
}
```

## Service Layer

### `MetricasService`

**Methods:**

#### `getMetricasConsolidadas()`
Get raw consolidated metrics.

```typescript
const service = new MetricasService(repository);
const response = await service.getMetricasConsolidadas();

console.log(response.data.ventas_totales_pesos);
console.log(response.timestamp);
```

#### `getMetricasConsolidadasFormatted()`
Get formatted metrics with currency and percentage strings.

```typescript
const formatted = await service.getMetricasConsolidadasFormatted();

console.log(formatted.ventas_totales_pesos_formatted); // "$15,000,000"
console.log(formatted.crecimiento_formatted); // "8.50%"
```

#### `getKPICards()`
Get metrics as KPI card objects.

```typescript
const cards = await service.getKPICards();

cards.forEach(card => {
  console.log(`${card.label}: ${card.formatted_value} (${card.trend})`);
});
```

#### `refreshMetrics()`
Refresh the materialized view.

```typescript
const success = await service.refreshMetrics();
console.log(success ? 'Refreshed' : 'Failed');
```

## Repository Layer

### `MetricasRepository`

**Methods:**

#### `getMetricasConsolidadas()`
Fetch from `gonac.mvw_metricas_consolidadas`.

```typescript
const repository = new MetricasRepository(supabase);
const metrics = await repository.getMetricasConsolidadas();
```

#### `refreshMetricasConsolidadas()`
Refresh the materialized view (requires RPC function).

```typescript
const success = await repository.refreshMetricasConsolidadas();
```

#### `getMetricasConsolidadasWithFilters(filters)`
Get metrics with optional filters (if view supports it).

```typescript
const metrics = await repository.getMetricasConsolidadasWithFilters({
  store_id: '123',
  category: 'Papas'
});
```

## Types

```typescript
export interface MetricasConsolidadas {
  ventas_totales_pesos: number;
  crecimiento_vs_semana_anterior_pct: number;
  ventas_totales_unidades: number;
  sell_through_pct: number;
  cobertura_pct: number;
  cobertura_ponderada_pct: number;
  promedio_dias_inventario: number;
  porcentaje_agotados_pct: number;
  avg_venta_promedio_diaria: number;
}

export interface KPICard {
  id: string;
  label: string;
  value: number;
  formatted_value: string;
  unit: 'currency' | 'percentage' | 'number' | 'days';
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}
```

## CURL Examples

### Get Raw Metrics
```bash
curl http://localhost:3000/api/metricas
```

### Get Formatted Metrics
```bash
curl http://localhost:3000/api/metricas?format=formatted
```

### Get KPI Cards
```bash
curl http://localhost:3000/api/metricas?format=cards
```

### Refresh Materialized View
```bash
curl -X POST http://localhost:3000/api/metricas
```

### Pretty Print with jq
```bash
curl -s http://localhost:3000/api/metricas?format=cards | jq '.cards[] | {label: .label, value: .formatted_value}'
```

### Extract Specific Metric
```bash
curl -s http://localhost:3000/api/metricas | jq '.data.ventas_totales_pesos'
```

## KPI Trends

The service automatically calculates trends based on metric values:

| Metric | Good (↑) | Neutral (→) | Bad (↓) |
|--------|----------|-------------|---------|
| Crecimiento | > 0% | 0% | < 0% |
| Sell Through | ≥ 80% | 60-80% | < 60% |
| Cobertura | ≥ 90% | 75-90% | < 75% |
| Días Inventario | ≤ 30 | 30-60 | > 60 |
| Porcentaje Agotados | ≤ 5% | 5-15% | > 15% |

## Materialized View Refresh

To create the PostgreSQL function for refreshing the view:

```sql
CREATE OR REPLACE FUNCTION gonac.refresh_mvw_metricas_consolidadas()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW gonac.mvw_metricas_consolidadas;
END;
$$ LANGUAGE plpgsql;
```

## Performance Considerations

### Materialized View Benefits
- Pre-aggregated data for fast queries
- No complex JOINs at query time
- Consistent performance regardless of data volume

### Refresh Strategy
1. **On-Demand:** Call POST `/api/metricas` manually
2. **Scheduled:** Set up a cron job or database trigger
3. **Auto-Refresh:** Use `refreshInterval` option in hooks

### Recommended Refresh Intervals
- **Real-time dashboards:** Every 5 minutes
- **Standard dashboards:** Every 15-30 minutes
- **Overnight batch:** Once daily (off-peak hours)

## Error Handling

### API Errors
```json
{
  "success": false,
  "error": "Failed to fetch consolidated metrics",
  "message": "Error details here"
}
```

### Hook Error Handling
```tsx
const { data, error } = useMetricas({ autoFetch: true });

if (error) {
  // Display user-friendly error
  return <ErrorMessage error={error} />;
}
```

## Use Cases

### 1. Home Page Dashboard
Display key metrics on the main dashboard.

```tsx
function HomePage() {
  const { cards, loading } = useMetricasCards({ autoFetch: true });
  return <KPIDashboard cards={cards} loading={loading} />;
}
```

### 2. Executive Summary
Generate executive reports with formatted metrics.

```tsx
function ExecutiveSummary() {
  const { data } = useMetricasFormatted({ autoFetch: true });
  return <ReportTable data={data} />;
}
```

### 3. Real-time Monitoring
Auto-refresh metrics for monitoring screens.

```tsx
function MonitoringScreen() {
  const { cards } = useMetricasCards({
    autoFetch: true,
    refreshInterval: 60 * 1000, // Every minute
  });
  return <FullScreenDashboard cards={cards} />;
}
```

### 4. Mobile Dashboard
Responsive KPI cards for mobile devices.

```tsx
function MobileDashboard() {
  const { cards } = useMetricasCards({ autoFetch: true });
  return <MobileKPIGrid cards={cards} />;
}
```

## Testing

### Test API Endpoints
```bash
# Test basic fetch
curl http://localhost:3000/api/metricas

# Test formatted output
curl http://localhost:3000/api/metricas?format=formatted | jq '.'

# Test cards format
curl http://localhost:3000/api/metricas?format=cards | jq '.cards | length'

# Test refresh
curl -X POST http://localhost:3000/api/metricas
```

### Test Hooks
```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useMetricas } from '@/hooks/useMetricas';

test('fetches metrics on mount', async () => {
  const { result } = renderHook(() => useMetricas({ autoFetch: true }));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeTruthy();
  });
});
```

## Files

1. `src/types/metricas.ts` - Type definitions
2. `src/repositories/metricas.repository.ts` - Data access layer
3. `src/services/metricas.service.ts` - Business logic
4. `src/app/api/metricas/route.ts` - API endpoints
5. `src/hooks/useMetricas.ts` - React hooks
6. `src/components/metricas/HomeKPIDashboard.tsx` - Example component
7. `docs/metricas/HOME_KPI_METRICS.md` - This documentation

