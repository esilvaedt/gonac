# 📋 Valorizacion Module - Developer Guide

> Complete repository and service layer implementation for GONAC valorizacion business logic

## 🎯 What This Module Does

This module implements a clean architecture pattern to fetch and process valorizacion data from three Supabase tables:
- `gonac.agotamiento_detalle` (Out of Stock)
- `gonac.caducidad_detalle` (Expiration Risk)  
- `gonac.sin_ventas_detalle` (No Sales)

It aggregates store counts and impact values across these risk categories.

---

## 📂 Module Structure

```
src/
├── types/
│   └── valorizacion.ts                 # TypeScript interfaces
│
├── lib/
│   └── supabase-server.ts              # Server-side Supabase client
│
├── repositories/
│   └── valorizacion.repository.ts      # Database queries
│
├── services/
│   └── valorizacion.service.ts         # Business logic
│
├── app/api/
│   └── valorizacion/
│       └── route.ts                    # API endpoint
│
├── hooks/
│   └── useValorizacion.ts              # React hooks
│
└── components/valorizacion/
    ├── ValorizacionCard.tsx            # UI component
    └── ValorizacionExamples.tsx        # 10 usage examples
```

---

## 🚀 Quick Integration

### Step 1: Use the Hook in Your Component

```tsx
import { useValorizacionSummary } from '@/hooks/useValorizacion';

export function MyDashboard() {
  const { data, loading, error } = useValorizacionSummary();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Risk Summary</h2>
      <p>Agotado: {data?.agotado.tiendas} stores</p>
      <p>Caducidad: {data?.caducidad.tiendas} stores</p>
      <p>Sin Ventas: {data?.sinVentas.tiendas} stores</p>
    </div>
  );
}
```

### Step 2: Or Use the Pre-built Component

```tsx
import ValorizacionCard from '@/components/valorizacion/ValorizacionCard';

export function Dashboard() {
  return (
    <div>
      <ValorizacionCard />
    </div>
  );
}
```

---

## 🔧 API Reference

### Hooks

#### `useValorizacion(options?)`
Main hook with flexible options.

```tsx
const { data, loading, error, refetch } = useValorizacion({
  format: 'default',           // 'default' | 'summary' | 'percentages' | 'critical'
  type: undefined,             // 'Agotado' | 'Caducidad' | 'Sin Ventas'
  autoFetch: true,             // Auto-fetch on mount
  refreshInterval: undefined,  // Auto-refresh interval in ms
});
```

#### `useValorizacionSummary()`
Get data in structured summary format.

```tsx
const { data, loading, error } = useValorizacionSummary();

// data structure:
{
  agotado: { tiendas: 45, impacto: 125000 },
  caducidad: { tiendas: 32, impacto: 89000 },
  sinVentas: { tiendas: 18, impacto: 45000 },
  total: { tiendas: 95, impacto: 259000 }
}
```

#### `useValorizacionPercentages()`
Get data with percentage calculations.

```tsx
const { data } = useValorizacionPercentages();

// data structure:
[
  { valorizacion: 'Agotado', tiendas: 45, impacto: 125000, percentage: 48.3 },
  { valorizacion: 'Caducidad', tiendas: 32, impacto: 89000, percentage: 34.4 },
  { valorizacion: 'Sin Ventas', tiendas: 18, impacto: 45000, percentage: 17.4 }
]
```

#### `useValorizacionCritical()`
Get the most critical valorizacion type (highest impact).

```tsx
const { data } = useValorizacionCritical();

// data structure:
{ valorizacion: 'Agotado', tiendas: 45, impacto: 125000 }
```

---

## 🌐 API Endpoints

### GET `/api/valorizacion`

#### Default Format
```bash
GET /api/valorizacion
```

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      { "valorizacion": "Agotado", "tiendas": 45, "impacto": 125000 },
      { "valorizacion": "Caducidad", "tiendas": 32, "impacto": 89000 },
      { "valorizacion": "Sin Ventas", "tiendas": 18, "impacto": 45000 }
    ],
    "timestamp": "2024-11-07T12:00:00.000Z",
    "totalTiendas": 95,
    "totalImpacto": 259000
  }
}
```

#### Summary Format
```bash
GET /api/valorizacion?format=summary
```

#### Percentages Format
```bash
GET /api/valorizacion?format=percentages
```

#### Critical Only
```bash
GET /api/valorizacion?format=critical
```

#### Specific Type
```bash
GET /api/valorizacion?type=Agotado
```

### POST `/api/valorizacion`

Manually refresh data (useful with caching).

```bash
POST /api/valorizacion
```

---

## 💡 Usage Examples

### Example 1: Basic Display

```tsx
import { useValorizacion } from '@/hooks/useValorizacion';

export function ValorizacionList() {
  const { data, loading } = useValorizacion();

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data.map(item => (
        <li key={item.valorizacion}>
          {item.valorizacion}: {item.tiendas} stores, ${item.impacto.toLocaleString()}
        </li>
      ))}
    </ul>
  );
}
```

### Example 2: Auto-Refresh Dashboard

```tsx
import { useValorizacionSummary } from '@/hooks/useValorizacion';

export function LiveDashboard() {
  const { data } = useValorizacionSummary({
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return (
    <div>
      <h2>Live Valorizacion Data</h2>
      <p>Agotado: {data?.agotado.tiendas} stores</p>
      <p>Caducidad: {data?.caducidad.tiendas} stores</p>
      <p>Sin Ventas: {data?.sinVentas.tiendas} stores</p>
    </div>
  );
}
```

### Example 3: Critical Alert

```tsx
import { useValorizacionCritical } from '@/hooks/useValorizacion';

export function CriticalAlert() {
  const { data } = useValorizacionCritical();

  if (!data) return null;

  return (
    <div className="alert-danger">
      <h3>🚨 Critical: {data.valorizacion}</h3>
      <p>{data.tiendas} stores affected</p>
      <p>Impact: ${data.impacto.toLocaleString()}</p>
    </div>
  );
}
```

### Example 4: Percentage Chart

```tsx
import { useValorizacionPercentages } from '@/hooks/useValorizacion';

export function ImpactChart() {
  const { data } = useValorizacionPercentages();

  return (
    <div>
      {data?.map(item => (
        <div key={item.valorizacion}>
          <span>{item.valorizacion}</span>
          <div className="progress-bar">
            <div style={{ width: `${item.percentage}%` }}>
              {item.percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example 5: Server Component (Next.js)

```tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ValorizacionRepository } from '@/repositories/valorizacion.repository';
import { ValorizacionService } from '@/services/valorizacion.service';

export default async function ValorizacionPage() {
  const supabase = createServerSupabaseClient();
  const repository = new ValorizacionRepository(supabase);
  const service = new ValorizacionService(repository);
  
  const data = await service.getValorizacionSummary();

  return (
    <div>
      <h1>Valorizacion Report</h1>
      <p>Agotado: {data.agotado.tiendas} stores</p>
      <p>Caducidad: {data.caducidad.tiendas} stores</p>
      <p>Sin Ventas: {data.sinVentas.tiendas} stores</p>
    </div>
  );
}
```

---

## 📦 TypeScript Types

### ValorizacionItem
```typescript
interface ValorizacionItem {
  valorizacion: 'Agotado' | 'Caducidad' | 'Sin Ventas';
  tiendas: number;
  impacto: number;
}
```

### ValorizacionResponse
```typescript
interface ValorizacionResponse {
  data: ValorizacionItem[];
  timestamp: string;
  totalTiendas: number;
  totalImpacto: number;
}
```

### ValorizacionSummary
```typescript
interface ValorizacionSummary {
  agotado: { tiendas: number; impacto: number };
  caducidad: { tiendas: number; impacto: number };
  sinVentas: { tiendas: number; impacto: number };
  total: { tiendas: number; impacto: number };
}
```

---

## 🏗️ Architecture Layers

### Repository Layer
**File**: `repositories/valorizacion.repository.ts`  
**Purpose**: Database access and queries  
**Methods**:
- `getValorizacionData()`: UNION ALL query
- `getValorizacionDataSeparate()`: Parallel queries
- `getValorizacionByType()`: Single type query

### Service Layer
**File**: `services/valorizacion.service.ts`  
**Purpose**: Business logic and data transformation  
**Methods**:
- `getValorizacion()`: Complete data with metadata
- `getValorizacionSummary()`: Structured summary
- `getValorizacionPercentages()`: Calculate percentages
- `getMostCritical()`: Find highest impact

### API Layer
**File**: `app/api/valorizacion/route.ts`  
**Purpose**: HTTP endpoints  
**Methods**:
- `GET`: Fetch data with various formats
- `POST`: Refresh data

### Presentation Layer
**Files**: `hooks/useValorizacion.ts`, `components/valorizacion/*`  
**Purpose**: React integration  
**Exports**: Hooks and UI components

---

## ⚙️ Configuration

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional but recommended for server operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Schema

Required tables in Supabase:

```sql
CREATE SCHEMA IF NOT EXISTS gonac;

CREATE TABLE gonac.agotamiento_detalle (
  id_store TEXT,
  impacto NUMERIC
);

CREATE TABLE gonac.caducidad_detalle (
  id_store TEXT,
  impacto NUMERIC
);

CREATE TABLE gonac.sin_ventas_detalle (
  id_store TEXT,
  impacto NUMERIC
);
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test API
curl http://localhost:3000/api/valorizacion
curl http://localhost:3000/api/valorizacion?format=summary
curl http://localhost:3000/api/valorizacion?type=Agotado
```

### Unit Testing (Example)

```typescript
import { ValorizacionService } from '@/services/valorizacion.service';

describe('ValorizacionService', () => {
  it('calculates totals correctly', async () => {
    const mockRepository = {
      getValorizacionDataSeparate: jest.fn().mockResolvedValue([
        { valorizacion: 'Agotado', tiendas: 10, impacto: 1000 },
        { valorizacion: 'Caducidad', tiendas: 5, impacto: 500 },
        { valorizacion: 'Sin Ventas', tiendas: 3, impacto: 300 },
      ]),
    };

    const service = new ValorizacionService(mockRepository as any);
    const result = await service.getValorizacion();

    expect(result.totalTiendas).toBe(18);
    expect(result.totalImpacto).toBe(1800);
  });
});
```

---

## 🔍 Troubleshooting

### Problem: No data returned

**Check**:
1. Are the tables populated?
   ```sql
   SELECT COUNT(*) FROM gonac.agotamiento_detalle;
   ```
2. Are environment variables set?
3. Is Supabase connection working?

### Problem: Type errors

**Solution**: Make sure you're importing types:
```tsx
import type { ValorizacionSummary } from '@/types/valorizacion';
```

### Problem: API returns 500

**Check**:
1. Browser console for errors
2. Next.js terminal output
3. Supabase dashboard logs

---

## 📚 Additional Resources

- **Full Documentation**: See `/VALORIZACION_API.md`
- **Setup Guide**: See `/SETUP_VALORIZACION.md`
- **Architecture Overview**: See `/VALORIZACION_SUMMARY.md`
- **10 Examples**: See `components/valorizacion/ValorizacionExamples.tsx`

---

## ✨ Benefits

✅ **Clean Architecture** - Separation of concerns  
✅ **Type Safe** - Full TypeScript support  
✅ **Reusable** - Hooks and services can be used anywhere  
✅ **Testable** - Each layer can be tested independently  
✅ **Production Ready** - Error handling, loading states, caching support  
✅ **Flexible** - Multiple API formats and configuration options  
✅ **Well Documented** - Comprehensive docs and examples  

---

**Built for GONAC Dashboard** 🚀  
*Repository & Service Layer Pattern*

