# Valorizacion API Documentation

This document describes the repository and service layer architecture for the valorizacion business logic.

## Architecture Overview

```
┌─────────────────┐
│  React Hook     │  useValorizacion()
└────────┬────────┘
         │
┌────────▼────────┐
│  API Route      │  /api/valorizacion
└────────┬────────┘
         │
┌────────▼────────┐
│  Service Layer  │  ValorizacionService
└────────┬────────┘
         │
┌────────▼────────┐
│  Repository     │  ValorizacionRepository
└────────┬────────┘
         │
┌────────▼────────┐
│  Supabase       │  PostgreSQL Database
└─────────────────┘
```

## Files Created

### 1. Types (`src/types/valorizacion.ts`)
- `ValorizacionItem`: Single valorizacion record
- `ValorizacionResponse`: API response format
- `ValorizacionSummary`: Structured summary data

### 2. Repository (`src/repositories/valorizacion.repository.ts`)
Handles all database operations:
- `getValorizacionData()`: Fetches data using UNION ALL
- `getValorizacionDataSeparate()`: Alternative approach with parallel queries
- `getValorizacionByType()`: Fetch specific type (Agotado, Caducidad, Sin Ventas)

### 3. Service (`src/services/valorizacion.service.ts`)
Contains business logic:
- `getValorizacion()`: Get complete data with metadata
- `getValorizacionSummary()`: Structured summary object
- `getValorizacionPercentages()`: Calculate percentage impact
- `getMostCritical()`: Find highest impact valorizacion

### 4. API Route (`src/app/api/valorizacion/route.ts`)
REST endpoints:
- `GET /api/valorizacion`: Fetch valorizacion data
- `POST /api/valorizacion`: Refresh data (if using caching)

### 5. React Hook (`src/hooks/useValorizacion.ts`)
Easy-to-use hooks for components:
- `useValorizacion()`: Main hook with options
- `useValorizacionSummary()`: Get summary format
- `useValorizacionPercentages()`: Get percentages
- `useValorizacionCritical()`: Get most critical item

### 6. Server Client (`src/lib/supabase-server.ts`)
Server-side Supabase client for API routes

## API Usage Examples

### Get All Valorizacion Data
```bash
GET /api/valorizacion
```

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "valorizacion": "Agotado",
        "tiendas": 45,
        "impacto": 125000.50
      },
      {
        "valorizacion": "Caducidad",
        "tiendas": 32,
        "impacto": 89000.25
      },
      {
        "valorizacion": "Sin Ventas",
        "tiendas": 18,
        "impacto": 45000.75
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "totalTiendas": 95,
    "totalImpacto": 259001.50
  }
}
```

### Get Summary Format
```bash
GET /api/valorizacion?format=summary
```

Response:
```json
{
  "success": true,
  "data": {
    "agotado": {
      "tiendas": 45,
      "impacto": 125000.50
    },
    "caducidad": {
      "tiendas": 32,
      "impacto": 89000.25
    },
    "sinVentas": {
      "tiendas": 18,
      "impacto": 45000.75
    },
    "total": {
      "tiendas": 95,
      "impacto": 259001.50
    }
  }
}
```

### Get Percentages
```bash
GET /api/valorizacion?format=percentages
```

### Get Specific Type
```bash
GET /api/valorizacion?type=Agotado
```

### Get Most Critical
```bash
GET /api/valorizacion?format=critical
```

## React Component Usage Examples

### Basic Usage
```tsx
import { useValorizacion } from '@/hooks/useValorizacion';

export function ValorizacionDashboard() {
  const { data, loading, error, refetch } = useValorizacion();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Total Impact: ${data?.totalImpacto.toLocaleString()}</h2>
      <h3>Affected Stores: {data?.totalTiendas}</h3>
      
      {data?.data.map((item) => (
        <div key={item.valorizacion}>
          <h4>{item.valorizacion}</h4>
          <p>Stores: {item.tiendas}</p>
          <p>Impact: ${item.impacto.toLocaleString()}</p>
        </div>
      ))}
      
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}
```

### Using Summary Hook
```tsx
import { useValorizacionSummary } from '@/hooks/useValorizacion';

export function ValorizacionSummary() {
  const { data, loading } = useValorizacionSummary();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card">
        <h3>Agotado</h3>
        <p>Stores: {data?.agotado.tiendas}</p>
        <p>Impact: ${data?.agotado.impacto.toLocaleString()}</p>
      </div>
      
      <div className="card">
        <h3>Caducidad</h3>
        <p>Stores: {data?.caducidad.tiendas}</p>
        <p>Impact: ${data?.caducidad.impacto.toLocaleString()}</p>
      </div>
      
      <div className="card">
        <h3>Sin Ventas</h3>
        <p>Stores: {data?.sinVentas.tiendas}</p>
        <p>Impact: ${data?.sinVentas.impacto.toLocaleString()}</p>
      </div>
    </div>
  );
}
```

### Auto-Refresh Every 5 Minutes
```tsx
import { useValorizacion } from '@/hooks/useValorizacion';

export function LiveValorizacion() {
  const { data, loading } = useValorizacion({
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div>
      <p>Last updated: {data?.timestamp}</p>
      {/* Your UI here */}
    </div>
  );
}
```

### Get Most Critical Item
```tsx
import { useValorizacionCritical } from '@/hooks/useValorizacion';

export function CriticalAlert() {
  const { data } = useValorizacionCritical();

  if (!data) return null;

  return (
    <div className="alert alert-danger">
      <h3>⚠️ Critical: {data.valorizacion}</h3>
      <p>Impact: ${data.impacto.toLocaleString()}</p>
      <p>Affected Stores: {data.tiendas}</p>
    </div>
  );
}
```

## Direct Service Usage (Server Components)

```tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ValorizacionRepository } from '@/repositories/valorizacion.repository';
import { ValorizacionService } from '@/services/valorizacion.service';

export default async function ValorizacionPage() {
  const supabase = createServerSupabaseClient();
  const repository = new ValorizacionRepository(supabase);
  const service = new ValorizacionService(repository);
  
  const data = await service.getValorizacion();

  return (
    <div>
      <h1>Valorizacion Report</h1>
      {/* Render data */}
    </div>
  );
}
```

## Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for server operations)
```

## Database Schema

The queries expect these tables in your Supabase database:

```sql
-- Table: gonac.agotamiento_detalle
CREATE TABLE gonac.agotamiento_detalle (
  id_store TEXT,
  impacto NUMERIC
);

-- Table: gonac.caducidad_detalle
CREATE TABLE gonac.caducidad_detalle (
  id_store TEXT,
  impacto NUMERIC
);

-- Table: gonac.sin_ventas_detalle
CREATE TABLE gonac.sin_ventas_detalle (
  id_store TEXT,
  impacto NUMERIC
);
```

## Benefits of This Architecture

1. **Separation of Concerns**: Clear distinction between data access (repository), business logic (service), and presentation (hooks)
2. **Testability**: Each layer can be tested independently
3. **Reusability**: Services and repositories can be used in multiple endpoints
4. **Type Safety**: Full TypeScript support throughout
5. **Maintainability**: Easy to modify or extend functionality
6. **Scalability**: Can easily add caching, rate limiting, or other middleware

## Next Steps

1. Add error logging service (e.g., Sentry)
2. Implement caching layer (Redis or Next.js cache)
3. Add rate limiting for API routes
4. Create unit tests for service and repository layers
5. Add request validation with Zod or similar
6. Implement pagination if data volume grows

