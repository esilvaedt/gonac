# 📊 Descuento (Promotion Calculator) Module

> Clean architecture implementation for discount promotion calculations using Supabase PostgreSQL function

## 🎯 Overview

This module implements the **"Acción 3: Promoción para Evacuar Inventario"** use case, calculating promotion metrics for Slow and Dead stores to reduce expiration risk through strategic discounts.

### Business Logic

The system calculates:
- **Inventory reduction** through increased sales (using price elasticity)
- **Promotion cost** vs **value captured**
- **Risk reduction** percentage
- **Post-promotion inventory** levels

### Formula

```
Ventas Plus = CEIL(Inventario Inicial × Descuento × Elasticidad)
Venta Original = Ventas Plus × Precio Promedio
Costo = Venta Original × (1 - Descuento)
Valor = Venta Original × Descuento
```

---

## 📂 Module Structure

```
src/
├── types/
│   └── descuento.ts                    # TypeScript types
│
├── repositories/
│   └── descuento.repository.ts         # Database access (PostgreSQL function)
│
├── services/
│   └── descuento.service.ts            # Business logic
│
├── app/api/
│   └── descuento/
│       ├── route.ts                    # Main API endpoint
│       └── comparar/
│           └── route.ts                # Compare scenarios endpoint
│
├── hooks/
│   └── useDescuento.ts                 # React hooks
│
└── components/descuento/
    └── PromocionCalculator.tsx         # UI component
```

---

## 🚀 Quick Start

### 1. Database Setup

Ensure the PostgreSQL function exists in Supabase:

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
    valor NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(ssm.inventario_inicial)::BIGINT AS inventario_inicial_total,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)))::NUMERIC AS ventas_plus,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio)::NUMERIC AS venta_original,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * (1 - p_descuento))::NUMERIC AS costo,
        SUM(CEIL(ssm.inventario_inicial * (p_descuento * p_elasticidad)) * ssm.precio_sku_promedio * p_descuento)::NUMERIC AS valor
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

### 2. Use the Component

```tsx
import PromocionCalculator from '@/components/descuento/PromocionCalculator';

export default function PromotionsPage() {
  return (
    <div>
      <h1>Promotion Calculator</h1>
      <PromocionCalculator />
    </div>
  );
}
```

### 3. Or Use the Hook

```tsx
import { useDescuento } from '@/hooks/useDescuento';

export function MyComponent() {
  const { data, loading, calcular } = useDescuento();

  const handleCalculate = async () => {
    await calcular({
      descuento: 0.41,           // 41% discount
      elasticidad_papas: 1.5,
      elasticidad_totopos: 1.8,
    });
  };

  return (
    <div>
      <button onClick={handleCalculate}>Calculate</button>
      {data && (
        <div>
          <p>PAPAS Cost: ${data.papas?.costo_promocion}</p>
          <p>TOTOPOS Value: ${data.totopos?.valor_capturar}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 API Reference

### GET `/api/descuento`

Calculate promotion metrics for given parameters.

**Query Parameters:**
- `descuento` (required): Discount as decimal (0.41 = 41%)
- `elasticidad_papas` (optional): Price elasticity for PAPAS (default: 1.5)
- `elasticidad_totopos` (optional): Price elasticity for TOTOPOS (default: 1.8)
- `categorias` (optional): Comma-separated categories (default: PAPAS,TOTOPOS)

**Example:**
```bash
GET /api/descuento?descuento=0.41&elasticidad_papas=1.5&elasticidad_totopos=1.8
```

**Response:**
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

### POST `/api/descuento`

Same as GET but with body parameters.

**Body:**
```json
{
  "descuento": 0.41,
  "elasticidad_papas": 1.5,
  "elasticidad_totopos": 1.8,
  "categorias": ["PAPAS", "TOTOPOS"]
}
```

### POST `/api/descuento/comparar`

Compare multiple discount scenarios.

**Body:**
```json
{
  "descuentos": [0.3, 0.35, 0.4, 0.45, 0.5],
  "elasticidad_papas": 1.5,
  "elasticidad_totopos": 1.8
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { /* results for 30% discount */ },
    { /* results for 35% discount */ },
    { /* results for 40% discount */ },
    { /* results for 45% discount */ },
    { /* results for 50% discount */ }
  ]
}
```

---

## 🎣 React Hooks

### `useDescuento(options?)`

Main hook for calculating discount promotions.

```tsx
const { data, loading, error, calcular, refetch } = useDescuento({
  descuento: 0.41,              // Optional: auto-calculate on mount
  elasticidad_papas: 1.5,       // Optional: custom elasticity
  elasticidad_totopos: 1.8,     // Optional: custom elasticity
  autoFetch: false,             // Optional: auto-calculate on mount
});

// Manual calculation
await calcular({
  descuento: 0.41,
  elasticidad_papas: 1.5,
  elasticidad_totopos: 1.8,
});

// Re-fetch with same parameters
await refetch();
```

### `useCompararDescuentos()`

Hook for comparing multiple discount scenarios.

```tsx
const { data, loading, error, comparar } = useCompararDescuentos();

await comparar([0.3, 0.35, 0.4, 0.45, 0.5], 1.5, 1.8);

// Results array
data?.forEach((scenario, index) => {
  console.log(`Discount ${index * 5 + 30}%:`, scenario);
});
```

---

## 📦 TypeScript Types

### Main Types

```typescript
// Input parameters
interface DescuentoParams {
  descuento: number;        // 0.41 = 41%
  elasticidad: number;      // 1.5
  categoria: string;        // 'PAPAS'
}

// Raw database result
interface DescuentoMetrics {
  inventario_inicial_total: number;
  ventas_plus: number;
  venta_original: number;
  costo: number;
  valor: number;
}

// Enhanced metrics with calculations
interface PromocionMetrics extends DescuentoMetrics {
  descuento_porcentaje: number;
  elasticidad: number;
  categoria: string;
  reduccion_riesgo: number;
  costo_promocion: number;
  valor_capturar: number;
  inventario_post: number;
}

// Complete response
interface PromocionResponse {
  papas: PromocionMetrics | null;
  totopos: PromocionMetrics | null;
  config: PromocionConfig;
  timestamp: string;
}
```

---

## 💡 Usage Examples

### Example 1: Basic Usage

```tsx
import { useDescuento } from '@/hooks/useDescuento';

export function BasicPromotion() {
  const { data, loading, calcular } = useDescuento();

  return (
    <div>
      <button onClick={() => calcular({ descuento: 0.41 })}>
        Calculate 41% Discount
      </button>
      
      {loading && <p>Calculating...</p>}
      
      {data && (
        <div>
          <h3>PAPAS</h3>
          <p>Cost: ${data.papas?.costo_promocion.toLocaleString()}</p>
          <p>Value: ${data.papas?.valor_capturar.toLocaleString()}</p>
          <p>Risk Reduction: {data.papas?.reduccion_riesgo.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Custom Elasticity

```tsx
import { useDescuento } from '@/hooks/useDescuento';

export function CustomElasticity() {
  const [elasticity, setElasticity] = useState(1.5);
  const { data, calcular } = useDescuento();

  const handleCalculate = () => {
    calcular({
      descuento: 0.41,
      elasticidad_papas: elasticity,
      elasticidad_totopos: elasticity * 1.2,
    });
  };

  return (
    <div>
      <input
        type="number"
        value={elasticity}
        onChange={(e) => setElasticity(Number(e.target.value))}
        step="0.1"
      />
      <button onClick={handleCalculate}>Calculate</button>
      {/* Display results */}
    </div>
  );
}
```

### Example 3: Compare Scenarios

```tsx
import { useCompararDescuentos } from '@/hooks/useDescuento';

export function CompareScenarios() {
  const { data, loading, comparar } = useCompararDescuentos();

  const handleCompare = () => {
    comparar([0.3, 0.35, 0.4, 0.45, 0.5]);
  };

  return (
    <div>
      <button onClick={handleCompare}>Compare Discounts</button>
      
      {data?.map((scenario, index) => (
        <div key={index}>
          <h4>{scenario.config.descuento_maximo}% Discount</h4>
          <p>PAPAS Value: ${scenario.papas?.valor_capturar}</p>
          <p>TOTOPOS Value: ${scenario.totopos?.valor_capturar}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Server Component

```tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DescuentoRepository } from '@/repositories/descuento.repository';
import { DescuentoService } from '@/services/descuento.service';

export default async function PromotionPage() {
  const supabase = createServerSupabaseClient();
  const repository = new DescuentoRepository(supabase);
  const service = new DescuentoService(repository);
  
  const data = await service.calcularPromocion({
    descuento: 0.41,
  });

  return (
    <div>
      <h1>Promotion Results</h1>
      <p>PAPAS Cost: ${data.papas?.costo_promocion}</p>
      <p>TOTOPOS Value: ${data.totopos?.valor_capturar}</p>
    </div>
  );
}
```

---

## 🏗️ Architecture Layers

### Repository Layer
**Purpose**: Database access via PostgreSQL function  
**File**: `repositories/descuento.repository.ts`

**Methods**:
- `calcularMetricasDescuento()`: Call PostgreSQL function
- `calcularMetricasMultiples()`: Parallel calculations
- `getCategoriasDisponibles()`: Get available categories
- `getStoresBySegment()`: Get stores by segment

### Service Layer
**Purpose**: Business logic and calculations  
**File**: `services/descuento.service.ts`

**Methods**:
- `calcularPromocion()`: Calculate complete promotion
- `calcularDescuentoOptimo()`: Find optimal discount
- `compararDescuentos()`: Compare scenarios
- `formatCurrency()`: Format utilities

### API Layer
**Purpose**: HTTP endpoints  
**Files**: `app/api/descuento/route.ts`, `app/api/descuento/comparar/route.ts`

**Endpoints**:
- `GET /api/descuento`: Calculate metrics
- `POST /api/descuento`: Calculate with body params
- `POST /api/descuento/comparar`: Compare scenarios

### Presentation Layer
**Purpose**: React components and hooks  
**Files**: `hooks/useDescuento.ts`, `components/descuento/PromocionCalculator.tsx`

**Components**:
- `PromocionCalculator`: Full UI component
- `useDescuento`: Main calculation hook
- `useCompararDescuentos`: Comparison hook

---

## 🧪 Testing

### Manual API Testing

```bash
# Calculate 41% discount
curl "http://localhost:3000/api/descuento?descuento=0.41"

# Custom elasticity
curl "http://localhost:3000/api/descuento?descuento=0.41&elasticidad_papas=2.0"

# Compare scenarios
curl -X POST http://localhost:3000/api/descuento/comparar \
  -H "Content-Type: application/json" \
  -d '{"descuentos":[0.3,0.4,0.5]}'
```

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PromocionCalculator from '@/components/descuento/PromocionCalculator';

test('calculates promotion on button click', async () => {
  render(<PromocionCalculator />);
  
  const button = screen.getByText(/Aprobar Promoción/i);
  fireEvent.click(button);
  
  // Wait for results
  await screen.findByText(/PAPAS 41% descuento/i);
});
```

---

## 📊 Business Metrics

### Key Calculations

1. **Ventas Plus (Additional Sales)**
   ```
   CEIL(Inventario Inicial × Descuento × Elasticidad)
   ```

2. **Risk Reduction**
   ```
   (Ventas Plus / Inventario Inicial) × 100
   ```

3. **Promotion Cost**
   ```
   Ventas Plus × Precio × Descuento
   ```

4. **Value to Capture**
   ```
   Ventas Plus × Precio
   ```

### Example Calculation

For PAPAS with 41% discount and 1.5 elasticity:
- Initial Inventory: 12,195 units
- Additional Sales: 12,195 × 0.41 × 1.5 = 7,500 units
- Risk Reduction: (7,500 / 12,195) × 100 = 61.5%

---

## 🔍 Troubleshooting

### Issue: "Database error"
**Check**: 
1. PostgreSQL function `gonac.calcular_metricas_descuento` exists
2. Required tables exist (core_store_sku_metrics, core_cat_product, core_segmentacion_tiendas)
3. Supabase connection is working

### Issue: "No data returned"
**Check**:
1. Stores exist in segments 'Slow' and 'Dead'
2. Category name matches exactly ('PAPAS', 'TOTOPOS')
3. SKUs have inventory data

### Issue: "Invalid descuento value"
**Solution**: Descuento must be between 0 and 1 (0.41 = 41%)

---

## ✨ Features

✅ **Clean Architecture** - Separated layers  
✅ **Type Safe** - Full TypeScript support  
✅ **Real-time Calculation** - PostgreSQL function call  
✅ **Multiple Categories** - PAPAS & TOTOPOS  
✅ **Scenario Comparison** - Test multiple discounts  
✅ **Risk Analysis** - Calculate risk reduction  
✅ **Production Ready** - Error handling, validation  
✅ **UI Component** - Ready-to-use React component  

---

**Built for GONAC Dashboard** 🚀  
*Promotion Calculator with Clean Architecture*

