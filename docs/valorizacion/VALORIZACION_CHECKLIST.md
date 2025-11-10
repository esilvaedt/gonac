# ✅ Valorizacion Implementation Checklist

Use this checklist to verify your valorizacion module setup and start using it.

---

## 📋 Pre-Implementation (Already Done ✓)

- [x] Types created (`src/types/valorizacion.ts`)
- [x] Server-side Supabase client (`src/lib/supabase-server.ts`)
- [x] Repository layer (`src/repositories/valorizacion.repository.ts`)
- [x] Service layer (`src/services/valorizacion.service.ts`)
- [x] API route (`src/app/api/valorizacion/route.ts`)
- [x] React hooks (`src/hooks/useValorizacion.ts`)
- [x] Example component (`src/components/valorizacion/ValorizacionCard.tsx`)
- [x] Example patterns (`src/components/valorizacion/ValorizacionExamples.tsx`)
- [x] Documentation created

---

## 🔧 Setup Tasks (Your Action Required)

### 1. Environment Variables

- [ ] Create `.env.local` file (if not exists)
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] (Optional) Add `SUPABASE_SERVICE_ROLE_KEY` for server operations

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Verify**: 
```bash
cat .env.local
```

---

### 2. Database Setup

- [ ] Verify Supabase project is accessible
- [ ] Verify schema `gonac` exists
- [ ] Verify table `gonac.agotamiento_detalle` exists
- [ ] Verify table `gonac.caducidad_detalle` exists
- [ ] Verify table `gonac.sin_ventas_detalle` exists
- [ ] Verify tables have data

**Verify in Supabase SQL Editor**:
```sql
-- Check schema
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'gonac';

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'gonac' 
  AND table_name IN ('agotamiento_detalle', 'caducidad_detalle', 'sin_ventas_detalle');

-- Check data counts
SELECT 'agotamiento_detalle' as table_name, COUNT(*) as row_count 
FROM gonac.agotamiento_detalle
UNION ALL
SELECT 'caducidad_detalle', COUNT(*) 
FROM gonac.caducidad_detalle
UNION ALL
SELECT 'sin_ventas_detalle', COUNT(*) 
FROM gonac.sin_ventas_detalle;

-- Preview data
SELECT * FROM gonac.agotamiento_detalle LIMIT 5;
SELECT * FROM gonac.caducidad_detalle LIMIT 5;
SELECT * FROM gonac.sin_ventas_detalle LIMIT 5;
```

---

### 3. Test Installation

- [ ] Install dependencies (if needed)
- [ ] Start dev server
- [ ] Verify no build errors

**Commands**:
```bash
# Install dependencies
npm install
# or
pnpm install

# Start dev server
npm run dev
# or
pnpm dev

# Check for errors in terminal
```

---

### 4. Test API Endpoint

- [ ] Dev server is running
- [ ] Test default endpoint
- [ ] Test summary format
- [ ] Test percentages format
- [ ] Test critical format
- [ ] Test specific type

**Commands**:
```bash
# Test default format
curl http://localhost:3000/api/valorizacion | jq

# Test summary format
curl http://localhost:3000/api/valorizacion?format=summary | jq

# Test percentages format
curl http://localhost:3000/api/valorizacion?format=percentages | jq

# Test critical format
curl http://localhost:3000/api/valorizacion?format=critical | jq

# Test specific type
curl http://localhost:3000/api/valorizacion?type=Agotado | jq

# If you don't have jq, omit it:
curl http://localhost:3000/api/valorizacion
```

**Expected Response** (summary format):
```json
{
  "success": true,
  "data": {
    "agotado": {
      "tiendas": 45,
      "impacto": 125000
    },
    "caducidad": {
      "tiendas": 32,
      "impacto": 89000
    },
    "sinVentas": {
      "tiendas": 18,
      "impacto": 45000
    },
    "total": {
      "tiendas": 95,
      "impacto": 259000
    }
  }
}
```

---

### 5. Integration with Your Dashboard

Choose one of these options:

#### Option A: Use Pre-built Component

- [ ] Import `ValorizacionCard` in your dashboard
- [ ] Add it to your layout
- [ ] Test in browser

```tsx
// Example: src/components/vemio/views/ResumenView.tsx
import ValorizacionCard from '@/components/valorizacion/ValorizacionCard';

export default function ResumenView({ data }: ResumenViewProps) {
  return (
    <div className="space-y-6">
      <ValorizacionCard />
      {/* Your existing components */}
    </div>
  );
}
```

#### Option B: Use Hooks in Custom Component

- [ ] Create your custom component
- [ ] Import the hook
- [ ] Display the data
- [ ] Test in browser

```tsx
// Example: src/components/dashboard/MyValorizacion.tsx
"use client";

import { useValorizacionSummary } from '@/hooks/useValorizacion';

export default function MyValorizacion() {
  const { data, loading, error } = useValorizacionSummary();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Valorizacion Summary</h2>
      <p>Agotado: {data?.agotado.tiendas} stores</p>
      <p>Caducidad: {data?.caducidad.tiendas} stores</p>
      <p>Sin Ventas: {data?.sinVentas.tiendas} stores</p>
    </div>
  );
}
```

#### Option C: Server Component (No Hook)

- [ ] Create server component
- [ ] Use service directly
- [ ] Test in browser

```tsx
// Example: src/app/valorizacion/page.tsx
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
      <h1>Valorizacion</h1>
      <p>Agotado: {data.agotado.tiendas} stores</p>
      <p>Caducidad: {data.caducidad.tiendas} stores</p>
      <p>Sin Ventas: {data.sinVentas.tiendas} stores</p>
    </div>
  );
}
```

---

### 6. Browser Testing

- [ ] Open your app in browser
- [ ] Navigate to page with valorizacion component
- [ ] Verify data loads correctly
- [ ] Check browser console for errors
- [ ] Test refresh functionality (if applicable)
- [ ] Test loading states
- [ ] Test error states (disable network to test)

**Verify**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for `/api/valorizacion` request
5. Check response status (should be 200)
6. Check response data

---

### 7. TypeScript Verification

- [ ] No TypeScript errors
- [ ] Autocomplete works in IDE
- [ ] Type inference works

**Verify**:
```bash
# Check for TypeScript errors
npm run build
# or
pnpm build

# Should complete without errors
```

---

## 🎯 Feature Testing

### Basic Features
- [ ] Data loads on component mount
- [ ] Loading state displays correctly
- [ ] Data displays correctly
- [ ] Error state works (test by disconnecting DB)

### Advanced Features
- [ ] Manual refresh works (if implemented)
- [ ] Auto-refresh works (if configured)
- [ ] Different formats work (summary, percentages, etc.)
- [ ] Specific type queries work

### Performance
- [ ] Initial load time acceptable
- [ ] No unnecessary re-renders
- [ ] Parallel queries execute properly

---

## 📚 Documentation Review

- [ ] Read `VALORIZACION_SUMMARY.md` - Overview
- [ ] Read `SETUP_VALORIZACION.md` - Setup guide
- [ ] Read `VALORIZACION_API.md` - API documentation
- [ ] Read `VALORIZACION_FLOW.md` - Data flow diagram
- [ ] Review `src/README_VALORIZACION.md` - Developer guide
- [ ] Check examples in `ValorizacionExamples.tsx`

---

## 🔍 Troubleshooting

If something doesn't work, check:

### API Returns 500 Error
- [ ] Check environment variables are set
- [ ] Check Supabase connection works
- [ ] Check terminal output for errors
- [ ] Check Supabase dashboard for errors

### No Data Returned
- [ ] Verify tables have data
- [ ] Check table names match exactly
- [ ] Check schema name is `gonac`
- [ ] Check Supabase Row Level Security (RLS) policies

### TypeScript Errors
- [ ] Run `npm install` to ensure types are installed
- [ ] Restart TypeScript server in IDE
- [ ] Check import paths are correct

### Component Doesn't Render
- [ ] Check component is imported correctly
- [ ] Check it's in a client component (if using hooks)
- [ ] Check browser console for errors
- [ ] Verify Next.js server is running

---

## ✨ Optional Enhancements

Consider adding these features:

### Caching
- [ ] Add Next.js route caching
- [ ] Add Redis caching
- [ ] Add SWR or React Query

### Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics
- [ ] Add performance monitoring

### Testing
- [ ] Add unit tests for service layer
- [ ] Add unit tests for repository layer
- [ ] Add integration tests for API
- [ ] Add E2E tests for components

### Features
- [ ] Add date range filtering
- [ ] Add store filtering
- [ ] Add export to CSV/Excel
- [ ] Add real-time updates with Supabase subscriptions

---

## 🎉 Success Criteria

Your implementation is successful when:

✅ API endpoint returns data without errors  
✅ Component displays data correctly in browser  
✅ No console errors  
✅ No TypeScript errors  
✅ Data refreshes correctly  
✅ Loading and error states work  

---

## 📞 Quick Reference

### Files to Know
- **Types**: `src/types/valorizacion.ts`
- **Hooks**: `src/hooks/useValorizacion.ts`
- **Component**: `src/components/valorizacion/ValorizacionCard.tsx`
- **API**: `src/app/api/valorizacion/route.ts`

### Quick Commands
```bash
# Start dev
npm run dev

# Test API
curl http://localhost:3000/api/valorizacion?format=summary

# Build for production
npm run build

# Check types
npx tsc --noEmit
```

### Quick Import
```tsx
import { useValorizacionSummary } from '@/hooks/useValorizacion';
import ValorizacionCard from '@/components/valorizacion/ValorizacionCard';
```

---

## 📋 Final Checklist

Before considering this complete:

- [ ] Environment variables configured
- [ ] Database tables exist and have data
- [ ] API endpoint tested and working
- [ ] Component integrated and displaying data
- [ ] No errors in browser console
- [ ] No errors in terminal
- [ ] Documentation reviewed
- [ ] Team informed of new feature

---

**Status**: ⬜ Not Started | 🟨 In Progress | ✅ Complete

**Date Started**: _______________  
**Date Completed**: _______________  
**Implemented By**: _______________

---

**Need help?** Check the documentation files or review the examples in `ValorizacionExamples.tsx`.

