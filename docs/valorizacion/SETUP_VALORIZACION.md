# Quick Setup Guide - Valorizacion API

## ✅ Files Created

The following files have been created for the repository and service layer architecture:

### Core Files
- ✅ `src/types/valorizacion.ts` - TypeScript types and interfaces
- ✅ `src/lib/supabase-server.ts` - Server-side Supabase client
- ✅ `src/repositories/valorizacion.repository.ts` - Database access layer
- ✅ `src/services/valorizacion.service.ts` - Business logic layer
- ✅ `src/app/api/valorizacion/route.ts` - Next.js API route
- ✅ `src/hooks/useValorizacion.ts` - React hooks for components

### Example Files
- ✅ `src/components/valorizacion/ValorizacionCard.tsx` - Example component

### Documentation
- ✅ `VALORIZACION_API.md` - Complete API documentation
- ✅ `SETUP_VALORIZACION.md` - This setup guide

## 🚀 Quick Start

### 1. Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional but recommended
```

### 2. Verify Database Schema

Ensure your Supabase database has these tables:

```sql
-- Schema: gonac
CREATE SCHEMA IF NOT EXISTS gonac;

-- Tables with the required structure
CREATE TABLE IF NOT EXISTS gonac.agotamiento_detalle (
  id_store TEXT NOT NULL,
  impacto NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gonac.caducidad_detalle (
  id_store TEXT NOT NULL,
  impacto NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gonac.sin_ventas_detalle (
  id_store TEXT NOT NULL,
  impacto NUMERIC DEFAULT 0
);
```

### 3. Test the API

Start your dev server:

```bash
npm run dev
# or
pnpm dev
```

Test the API endpoint:

```bash
# Get all valorizacion data
curl http://localhost:3000/api/valorizacion

# Get summary format
curl http://localhost:3000/api/valorizacion?format=summary

# Get specific type
curl http://localhost:3000/api/valorizacion?type=Agotado
```

### 4. Use in Your Components

#### Option A: Add to Existing Dashboard

Add the example component to your dashboard:

```tsx
// src/components/vemio/views/ResumenView.tsx
import ValorizacionCard from '@/components/valorizacion/ValorizacionCard';

export default function ResumenView({ data }: ResumenViewProps) {
  return (
    <div className="space-y-6">
      {/* Add the valorizacion card */}
      <ValorizacionCard />
      
      {/* Your existing content */}
      {/* ... */}
    </div>
  );
}
```

#### Option B: Create Custom Component

```tsx
"use client";

import { useValorizacion } from '@/hooks/useValorizacion';

export function MyValorizacion() {
  const { data, loading, error } = useValorizacion();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Valorizacion Data</h2>
      {data?.data.map((item) => (
        <div key={item.valorizacion}>
          <p>{item.valorizacion}: {item.tiendas} tiendas</p>
          <p>Impacto: ${item.impacto.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Available API Endpoints

### GET Endpoints

| Endpoint | Query Params | Description |
|----------|-------------|-------------|
| `/api/valorizacion` | none | Get all valorizacion data |
| `/api/valorizacion?format=summary` | `format=summary` | Get structured summary |
| `/api/valorizacion?format=percentages` | `format=percentages` | Get data with percentages |
| `/api/valorizacion?format=critical` | `format=critical` | Get most critical item |
| `/api/valorizacion?type=Agotado` | `type=Agotado\|Caducidad\|Sin Ventas` | Get specific type |

### POST Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/valorizacion` | Refresh/refetch data |

## 🎣 Available React Hooks

```tsx
import { 
  useValorizacion,           // Main hook with options
  useValorizacionSummary,    // Get summary format
  useValorizacionPercentages, // Get with percentages
  useValorizacionCritical    // Get most critical
} from '@/hooks/useValorizacion';
```

## 🔧 Architecture Layers

### 1. Repository Layer (`repositories/`)
- **Purpose**: Direct database access
- **Methods**: CRUD operations, queries
- **Returns**: Raw data from database

### 2. Service Layer (`services/`)
- **Purpose**: Business logic and data transformation
- **Methods**: Data processing, calculations, formatting
- **Returns**: Processed, business-ready data

### 3. API Layer (`app/api/`)
- **Purpose**: HTTP endpoints
- **Methods**: Request handling, response formatting
- **Returns**: JSON responses

### 4. Presentation Layer (`hooks/`, `components/`)
- **Purpose**: UI integration
- **Methods**: State management, rendering
- **Returns**: React components

## 🎯 Next Steps

1. **Add Authentication** (if needed)
   - Modify `supabase-server.ts` to handle auth
   - Add middleware to API route

2. **Add Caching**
   ```tsx
   // In your API route
   export const revalidate = 300; // Cache for 5 minutes
   ```

3. **Add Error Tracking**
   ```tsx
   // Install Sentry or similar
   import * as Sentry from '@sentry/nextjs';
   
   catch (error) {
     Sentry.captureException(error);
   }
   ```

4. **Add Request Validation**
   ```tsx
   import { z } from 'zod';
   
   const schema = z.object({
     format: z.enum(['default', 'summary', 'percentages']).optional(),
   });
   ```

5. **Add Tests**
   ```tsx
   // __tests__/services/valorizacion.test.ts
   import { ValorizacionService } from '@/services/valorizacion.service';
   
   describe('ValorizacionService', () => {
     it('should calculate totals correctly', async () => {
       // Test implementation
     });
   });
   ```

## 🐛 Troubleshooting

### Issue: "Missing environment variables"
**Solution**: Check your `.env.local` file and restart the dev server

### Issue: "Table not found"
**Solution**: Verify your Supabase schema and table names match exactly (`gonac.agotamiento_detalle`, etc.)

### Issue: "CORS errors"
**Solution**: This shouldn't happen with Next.js API routes, but if it does, check your Supabase settings

### Issue: "No data returned"
**Solution**: Check if your tables have data:
```sql
SELECT COUNT(*) FROM gonac.agotamiento_detalle;
SELECT COUNT(*) FROM gonac.caducidad_detalle;
SELECT COUNT(*) FROM gonac.sin_ventas_detalle;
```

## 📚 Additional Resources

- See `VALORIZACION_API.md` for complete API documentation
- Check the example component in `src/components/valorizacion/ValorizacionCard.tsx`
- Review the hooks in `src/hooks/useValorizacion.ts` for usage patterns

## ✨ Features

- ✅ Full TypeScript support
- ✅ Clean architecture with separation of concerns
- ✅ Reusable hooks for React components
- ✅ Multiple API formats (default, summary, percentages)
- ✅ Error handling at all layers
- ✅ Auto-refresh capability
- ✅ Server-side and client-side support
- ✅ Ready for production use

---

**Created for GONAC Dashboard** 🚀

