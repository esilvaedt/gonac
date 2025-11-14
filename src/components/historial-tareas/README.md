# Historial de Tareas y Acciones

Vista completa para visualizar el registro de todas las tareas ejecutadas, activas y canceladas en el sistema.

## Ubicación
- **Tab en Dashboard**: Integrada como tercera tab en VemioDashboard
- **Ruta del dashboard**: `/` (página principal)
- **Vista principal**: `HistorialView.tsx` (en `src/components/vemio/views/`)

## Estructura de Componentes

### 1. HistorialView (Tab)
Vista adaptada para sistema de tabs, sin header duplicado.
- **Ubicación**: `src/components/vemio/views/HistorialView.tsx`
- **Uso**: Se renderiza cuando el usuario selecciona la tab "Historial"

### 2. HistorialStatsCards
Muestra las tarjetas de estadísticas principales:
- **Total Tareas**: Número total de tareas en el sistema
- **Completadas**: Cantidad de tareas completadas exitosamente
- **Activas**: Tareas en progreso
- **Valor Capturado**: Monto total generado
- **ROI Promedio**: Retorno de inversión promedio

### 3. HistorialMetricsCards
Muestra tres métricas clave:
- **Tasa de Éxito**: Porcentaje de tareas completadas exitosamente
- **Tiempo Promedio de Ejecución**: Tiempo promedio para completar tareas
- **Distribución por Tipo**: Cantidad de tareas por tipo (Reabasto, Exhibición, Promoción, Visita)

### 4. HistorialTaskList
Lista todas las tareas con paginación y filtros.

### 5. TaskCard
Componente individual para mostrar los detalles de cada tarea:
- Información básica (folio, tienda, responsable)
- Estado y prioridad
- Métricas financieras (SKUs, monto estimado, impacto real, ROI)
- Evidencias
- Notas
- Timeline de la tarea

## Integración con VemioDashboard

### Archivos Modificados

1. **VemioDashboard.tsx**
   - Agregado tipo `"historial"` a `TabType`
   - Importado `HistorialView`
   - Agregado case en `renderTabContent()`

2. **VemioTabs.tsx**
   - Agregada nueva tab "Historial" con icono de documento
   - Orden: Resumen → Acciones → Historial

### Flujo de Navegación

```
Usuario → Dashboard Principal (/)
         ↓
    VemioDashboard
         ↓
    VemioTabs [Resumen | Acciones | Historial]
         ↓
    Click en "Historial"
         ↓
    HistorialView renderiza
         ↓
    Muestra: Stats + Metrics + TaskList
```

## Tipos de Tareas

1. **Reabasto** (🚚)
   - Color: Rojo
   - Icono: TruckDelivery

2. **Exhibición** (📦)
   - Color: Azul
   - Icono: BoxTapped

3. **Promoción** (⭐)
   - Color: Morado
   - Icono: ShootingStarIcon

4. **Visita** (👥)
   - Color: Naranja
   - Icono: GroupIcon

## Estados de Tareas

- **Completada**: Badge verde
- **Activa**: Badge azul
- **Cancelada**: Badge rojo

## Prioridades

- **Crítica**: Badge rojo
- **Alta**: Badge naranja
- **Media**: Badge azul
- **Baja**: Badge gris

## Funcionalidades

### Búsqueda
Campo de búsqueda para filtrar por:
- Folio
- Tienda
- Acción
- Responsable

### Filtros
- **Rango de fechas**: Últimos 7 días, 30 días, 90 días, Todo el tiempo
- **Más Filtros**: Botón para filtros adicionales (por implementar)

### Exportar
Botón para exportar los datos (por implementar)

## Datos Mock

Actualmente utiliza datos mock definidos en `HistorialTaskList.tsx`. Para integrar con datos reales:

1. Crear un hook personalizado (ej: `useHistorialTareas`)
2. Conectar con la API correspondiente
3. Reemplazar el array `mockTasks` con los datos reales

## Próximas Mejoras

- [ ] Integración con API real
- [ ] Implementar búsqueda funcional
- [ ] Implementar filtros avanzados
- [ ] Funcionalidad de exportación (Excel, PDF)
- [ ] Paginación
- [ ] Modal de detalle de tarea
- [ ] Gráficos interactivos en métricas
- [ ] Filtros por estado y prioridad
- [ ] Ordenamiento por columnas

## Uso Como Tab

La vista está integrada automáticamente en el sistema de tabs. No requiere configuración adicional.

```tsx
// Ya integrada en VemioDashboard.tsx
import HistorialView from "./views/HistorialView";

// ...
case "historial":
  return <HistorialView />;
```

## Uso Standalone (Opcional)

Si necesitas usar la vista fuera del sistema de tabs:

```tsx
import HistorialTareasView from "@/components/historial-tareas/HistorialTareasView";

export default function StandalonePage() {
  return (
    <div className="p-6">
      <HistorialTareasView />
    </div>
  );
}
```

## Estilos

Utiliza el sistema de diseño del proyecto con:
- Tailwind CSS
- Dark mode support
- Colores de marca configurados
- Componentes UI reutilizables (Badge)
- Responsive design completo
