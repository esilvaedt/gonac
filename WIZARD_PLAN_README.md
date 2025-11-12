# 🧙‍♂️ Wizard de Plan Prescriptivo

Sistema completo de creación de planes prescriptivos paso a paso para convertir oportunidades en acciones ejecutables.

## 📍 Ubicación

### Componentes Principales
```
src/components/plan-wizard/
├── WizardPlanPrescriptivo.tsx          # Componente principal del wizard
└── steps/
    ├── Paso1Alcance.tsx                # Selección de tiendas y SKUs
    ├── Paso2Accion.tsx                 # Selección de acción y parámetros
    └── Paso3Revision.tsx               # Revisión de costos y ROI
```

### Páginas
```
src/app/demo/wizard-plan/page.tsx       # Página demo standalone
```

## 🎯 Características

### ✅ Wizard de 3 Pasos

#### Paso 1: Seleccionar Alcance
- **Selección de Tiendas**
  - Búsqueda y filtrado
  - Visualización por segmento (Hot, Balanceada, Slow, Crítica)
  - Selección múltiple con checkboxes visuales
  - Cards con información de ubicación

- **Selección de SKUs**
  - Búsqueda por nombre o categoría
  - Información de inventario y precio
  - Selección múltiple
  - Vista detallada por card

- **Resumen en tiempo real**
  - Contador de tiendas seleccionadas
  - Contador de SKUs seleccionados

#### Paso 2: Seleccionar Acción
- **5 Tipos de Acciones Disponibles:**
  1. **Reabastecer** 📦
     - Parámetros: Días de cobertura, Nivel de stock objetivo
     - Ideal para: Evitar agotados en tiendas Hot
     
  2. **Redistribuir** 🔄
     - Parámetros: Tienda origen, Tienda destino
     - Ideal para: Balancear inventario entre tiendas
     
  3. **Exhibición** 🏪
     - Parámetros: Tipo de exhibición, Duración (días)
     - Tipos: Punto Extra, Isla, Cabecera de Góndola, Pallet Display
     - Ideal para: Aumentar visibilidad de productos
     
  4. **Promoción** 🏷️
     - Parámetros: % Descuento, Elasticidad precio, Fechas
     - Slider interactivo para descuento
     - Ideal para: Acelerar rotación en tiendas Slow
     
  5. **Visita Promotoría** 👥
     - Parámetros: Objetivo, Duración (horas)
     - Objetivos: Activación, Acomodo, Capacitación, Auditoría
     - Ideal para: Impulso de ventas en tiendas críticas

- **Configuración dinámica de parámetros** según acción seleccionada
- **Validación de campos** antes de avanzar

#### Paso 3: Revisar y Confirmar
- **4 Métricas Clave:**
  - 🔴 Total Estimated Cost (Costo total estimado)
  - 🟢 Projected Net Profit (Utilidad neta proyectada)
  - 📈 Projected ROI (%) (Retorno de inversión)
  - 📊 Total Units Affected (Unidades afectadas)

- **Resumen Completo del Plan:**
  - Acción prescriptiva seleccionada
  - Lista de tiendas incluidas
  - Lista de SKUs incluidos
  - Parámetros configurados
  - Análisis de viabilidad automático

- **Cálculo Automático de ROI** basado en:
  - Tipo de acción
  - Número de tiendas
  - Número de SKUs
  - Parámetros específicos (descuentos, días, etc.)

### ✅ Navegación y UX

- **Barra de Progreso Visual**
  - Indicador de paso actual (X de 3)
  - Barra de progreso porcentual
  - Título descriptivo del paso

- **Breadcrumb Navigation**
  - Dashboard / Planning / Create Plan
  - Contexto claro de ubicación

- **Botones de Navegación**
  - "Atrás" disponible desde paso 2
  - "Continuar" con validación
  - Botones deshabilitados si faltan datos requeridos

- **Footer con Acciones Finales** (solo en Paso 3)
  - **Guardar**: Guardar como borrador
  - **Aprobar**: Aprobar el plan
  - **Crear Tareas**: Generar tareas ejecutables

### ✅ Diseño y Estilos

- **Diseño Moderno y Minimalista**
  - Cards limpias con sombras sutiles
  - Bordes redondeados
  - Espaciado consistente

- **Color Coding**
  - Azul: Tiendas y elementos principales
  - Púrpura: SKUs y elementos secundarios
  - Verde: Métricas positivas (ROI, utilidad)
  - Rojo: Costos
  - Por segmento: Hot (rojo), Balanceada (verde), Slow (amarillo), Crítica (púrpura)

- **Modo Oscuro Completo**
  - Todos los componentes soportan dark mode
  - Transiciones suaves
  - Contraste optimizado

- **Responsive Design**
  - Mobile: Cards apiladas, navegación simplificada
  - Tablet: Grid 2 columnas
  - Desktop: Grid completo, vista optimizada

## 🔗 Integración

### Acceso desde Centro de Oportunidades

El botón "Crear Plan Prescriptivo" en cada card de oportunidad redirige al wizard:

```tsx
// En PriorizacionOportunidadesView.tsx
<button onClick={() => router.push('/demo/wizard-plan')}>
  Crear Plan Prescriptivo
</button>
```

### URLs de Acceso

- **Wizard completo**: `/demo/wizard-plan`
- **Desde oportunidades**: Clic en "Crear Plan Prescriptivo"

## 💻 Uso del Componente

### Implementación Básica

```tsx
import WizardPlanPrescriptivo from "@/components/plan-wizard/WizardPlanPrescriptivo";

export default function MyPage() {
  return <WizardPlanPrescriptivo />;
}
```

### Con Props y Callbacks

```tsx
import WizardPlanPrescriptivo from "@/components/plan-wizard/WizardPlanPrescriptivo";

export default function MyPage() {
  const handleComplete = (datos) => {
    console.log("Plan creado:", datos);
    // Enviar a API, mostrar confirmación, etc.
  };

  const handleClose = () => {
    // Volver a la página anterior
    router.back();
  };

  return (
    <WizardPlanPrescriptivo
      oportunidadId="opp-001"
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
}
```

## 📊 Estructura de Datos

### Interface Principal: DatosWizard

```typescript
interface DatosWizard {
  // Paso 1: Alcance
  tiendasSeleccionadas: Tienda[];
  skusSeleccionados: SKU[];
  
  // Paso 2: Acción
  accionSeleccionada: TipoAccion | null;
  parametros: ParametrosAccion;
  
  // Paso 3: Métricas calculadas
  costoEstimado: number;
  roiProyectado: number;
  utilidadNeta: number;
  unidadesAfectadas: number;
}
```

### Tipos de Acción

```typescript
type TipoAccion = 
  | "reabastecer" 
  | "redistribuir" 
  | "exhibicion" 
  | "promocion" 
  | "visita_promotoria";
```

### Parámetros por Acción

```typescript
interface ParametrosAccion {
  // Reabastecer
  diasCobertura?: number;
  nivelStockObjetivo?: number;
  
  // Redistribuir
  tiendaOrigen?: string;
  tiendaDestino?: string;
  
  // Exhibición
  tipoExhibicion?: string;
  duracionDias?: number;
  
  // Promoción
  porcentajeDescuento?: number;
  elasticidadPrecio?: number;
  fechaInicio?: string;
  fechaFin?: string;
  
  // Visita Promotoría
  objetivoVisita?: string;
  duracionHoras?: number;
}
```

## 🎨 Capturas de Funcionalidad

### Paso 1: Selección Visual
- Cards interactivas para tiendas y SKUs
- Checkmarks visuales al seleccionar
- Filtros de búsqueda en tiempo real

### Paso 2: Configuración Dinámica
- Parámetros específicos según acción
- Slider interactivo para descuentos
- Selectores de fecha para promociones
- Campos numéricos con validación

### Paso 3: Dashboard de Métricas
- 4 cards con métricas clave
- Resumen detallado del plan
- Análisis de viabilidad con recomendación
- Listado completo de elementos seleccionados

## 🚀 Próximas Mejoras

### Fase 1: Validaciones Avanzadas
- [ ] Validar disponibilidad de inventario
- [ ] Verificar capacidad de tiendas
- [ ] Alertas de conflictos de fechas
- [ ] Sugerencias inteligentes de parámetros

### Fase 2: Integración con APIs
- [ ] Conectar con API de tiendas real
- [ ] Conectar con API de SKUs real
- [ ] Guardar planes en base de datos
- [ ] Sistema de aprobaciones workflow

### Fase 3: Features Avanzadas
- [ ] Plantillas de planes predefinidas
- [ ] Duplicar planes existentes
- [ ] Historial de planes creados
- [ ] Comparación entre planes
- [ ] Exportar plan a PDF/Excel

### Fase 4: Analytics y Seguimiento
- [ ] Dashboard de seguimiento de planes
- [ ] Métricas de efectividad post-ejecución
- [ ] A/B testing de acciones
- [ ] Recomendaciones ML basadas en histórico

## 🧪 Testing

### Flujo Completo de Testing

1. **Acceder al wizard**: `/demo/wizard-plan`
2. **Paso 1**: Seleccionar al menos 1 tienda y 1 SKU
3. **Paso 2**: Elegir acción y configurar parámetros
4. **Paso 3**: Revisar métricas calculadas
5. **Acciones**: Probar botones Guardar, Aprobar, Crear Tareas

### Validaciones a Probar

- ✅ No permite avanzar sin selecciones
- ✅ Parámetros requeridos según acción
- ✅ Cálculo correcto de métricas
- ✅ Navegación atrás mantiene datos
- ✅ Responsive en diferentes tamaños

## 📝 Notas Técnicas

- **Estado**: Manejado con `useState` en componente principal
- **Navegación**: Control manual de pasos (no router-based)
- **Validación**: En cada paso antes de permitir avanzar
- **Cálculos**: Simulados en cliente (TODO: mover a backend)
- **Datos**: Mock data incluido (TODO: conectar con API)

## 🎓 Patrones de Diseño Implementados

1. **Wizard Pattern**: Proceso paso a paso guiado
2. **State Lifting**: Estado compartido entre pasos
3. **Conditional Rendering**: Parámetros dinámicos
4. **Controlled Components**: Formularios controlados
5. **Composition**: Pasos como componentes separados

---

**Desarrollado para GONAC** - Dashboard Comercial EDT  
**Versión**: 1.0.0  
**Última actualización**: 12 de noviembre de 2025

