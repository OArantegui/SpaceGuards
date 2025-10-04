# 🛰️ SpaceGuard - Visualizador de Objetos Espaciales

Sistema de visualización 3D de satélites y basura espacial usando datos en tiempo real desde Firebase Realtime Database.

## 🚀 Características

- **Visualización 3D interactiva** del globo terráqueo con objetos orbitales
- **Datos en tiempo real** desde Firebase Realtime Database
- **Categorización de objetos**:
  - 🟢 Comunicaciones
  - 🔴 Basura Espacial (Debris)
  - 🟡 Misceláneos
  - 🔵 Navegación (GPS, GLONASS, etc.)
  - 🟣 Científicos
  - 🟠 Estaciones Espaciales

- **Cálculos orbitales** basados en parámetros TLE (Two-Line Element)
- **Filtros avanzados** por masa, velocidad, material y categoría
- **Panel de control detallado** con métricas y gráficos
- **Simulación de misiones** de retirada de basura espacial

## 📊 Datos de Firebase

### Estructura de la Base de Datos

```
spaceguard-b46ef-default-rtdb.firebaseio.com/
├── communications/
├── debris/
├── misc/
├── navigation/
├── scientific/
└── space_stations/
```

### Parámetros TLE Utilizados

Cada objeto contiene los siguientes parámetros orbitales:

- `NORAD_CAT_ID` - Identificador NORAD
- `OBJECT_NAME` - Nombre del objeto
- `EPOCH` - Época de los elementos
- `MEAN_MOTION` - Movimiento medio (revoluciones/día)
- `ECCENTRICITY` - Excentricidad orbital
- `INCLINATION` - Inclinación orbital (grados)
- `RA_OF_ASC_NODE` - Ascensión recta del nodo ascendente
- `ARG_OF_PERICENTER` - Argumento del pericentro
- `MEAN_ANOMALY` - Anomalía media
- `BSTAR` - Coeficiente de arrastre balístico

## 🔧 Instalación y Uso

### Requisitos

- Python 3.x (para el servidor local)
- Navegador web moderno (Chrome, Firefox, Edge)
- Conexión a Internet (para cargar datos de Firebase)

### Ejecución

1. **Iniciar el servidor local:**

```bash
python server.py
```

2. **Abrir en el navegador:**

```
http://localhost:8000
```

## 🎯 Funcionalidades Principales

### 1. Visualización del Globo

- Rotación automática del globo terráqueo
- Objetos espaciales en órbita con colores según categoría
- Estación EGO (Estación de Gestión Orbital) en azul cielo

### 2. Filtros

- **Masa Mínima**: Filtra objetos por masa (kg)
- **Velocidad Máxima**: Filtra por velocidad orbital
- **Material**: Aluminio, Acero, Compuesto
- **Categoría**: Comunicaciones, Debris, Navegación, etc.

### 3. Selección de Objetos

- **Clic en el globo**: Selecciona un objeto directamente
- **Lista de resultados**: Selecciona desde el panel lateral
- **Resaltado**: El objeto seleccionado se marca en verde

### 4. Panel de Control (Dashboard)

Muestra información detallada del objeto seleccionado:

- Nombre y categoría
- ID NORAD
- Altitud orbital
- Masa estimada
- Material
- Velocidad orbital
- Delta-V requerido para misión
- Nivel de riesgo de reentrada
- Gráficos de vulnerabilidad y comparación

### 5. Simulación de Misión

- Cálculo de distancia a la estación EGO
- Delta-V requerido
- Rentabilidad estimada de la misión
- Seguimiento con cámara del objeto seleccionado

## 🧮 Cálculos Implementados

### Altitud Orbital

Calculada usando la Tercera Ley de Kepler:

```javascript
n² × a³ = μ
a = (μ / n²)^(1/3)
altitud = a - radio_tierra
```

Donde:
- `n` = movimiento medio (rad/s)
- `μ` = constante gravitacional terrestre (3.986×10¹⁴ m³/s²)
- `a` = semi-eje mayor

### Estimación de Masa

Basada en:
- Categoría del objeto
- Coeficiente BSTAR (arrastre balístico)
- Rangos típicos por tipo de satélite

### Tiempo de Decaimiento

Calculado considerando:
- Altitud orbital
- Coeficiente de arrastre BSTAR
- Densidad atmosférica estimada

## 📁 Estructura del Proyecto

```
Hackaton NASA/
├── index.html              # Página principal
├── server.py              # Servidor de desarrollo
├── README.md              # Esta documentación
├── css/
│   └── main.css           # Estilos
└── src/
    ├── app.js             # Aplicación principal
    ├── components/
    │   ├── dashboard.js   # Panel de control
    │   ├── filterPanel.js # Panel de filtros
    │   └── globeView.js   # Visualización 3D
    ├── config/
    │   └── constants.js   # Constantes y configuración
    ├── core/
    │   └── mission.js     # Cálculos de misión
    └── services/
        ├── dataService.js     # Transformación de datos
        └── firebaseService.js # Conexión a Firebase
```

## 🔄 Cambios Realizados en la Refactorización

### 1. Integración con Firebase

- ✅ Conexión a Firebase Realtime Database
- ✅ Carga asíncrona de datos
- ✅ Soporte para múltiples categorías

### 2. Cálculos Orbitales Reales

- ✅ Uso de parámetros TLE
- ✅ Cálculo de altitud desde MEAN_MOTION
- ✅ Conversión de coordenadas orbitales

### 3. Mejoras en la UI

- ✅ Filtro por categoría
- ✅ Visualización de nombre del objeto
- ✅ Badges de categoría en la lista
- ✅ Colores diferenciados por tipo
- ✅ Mensaje de carga durante la inicialización

### 4. Estimaciones Mejoradas

- ✅ Masa estimada por categoría y BSTAR
- ✅ Material asignado según tipo de objeto
- ✅ Tiempo de decaimiento basado en altitud

## 🎨 Colores por Categoría

| Categoría | Color | Hex |
|-----------|-------|-----|
| Comunicaciones | 🟢 Verde | #00ff00 |
| Debris | 🔴 Rojo | #ff0000 |
| Misceláneos | 🟡 Amarillo | #ffff00 |
| Navegación | 🔵 Azul Cielo | #00bfff |
| Científicos | 🟣 Magenta | #ff00ff |
| Estaciones Espaciales | 🟠 Naranja | #ffa500 |

## 🔮 Funcionalidades Mantenidas

✅ Todas las funcionalidades originales se mantienen:
- Selección de objetos
- Filtros (masa, velocidad, material)
- Dashboard con métricas
- Gráficos comparativos
- Simulación de misiones
- Seguimiento con cámara
- Cálculo de Delta-V
- Análisis de riesgo

## 🐛 Solución de Problemas

### La aplicación no carga datos

1. Verifica la conexión a Internet
2. Abre la consola del navegador (F12)
3. Revisa si hay errores de Firebase
4. Verifica que la URL de Firebase sea correcta

### Los objetos no se muestran en el globo

1. Espera a que termine la carga (mensaje verde)
2. Aplica los filtros (botón "Aplicar Filtros")
3. Verifica que los filtros no sean muy restrictivos

### El servidor no inicia

1. Verifica que Python esté instalado: `python --version`
2. Asegúrate de estar en el directorio correcto
3. Prueba con: `python -m http.server 8000`

## 📝 Notas Técnicas

- Los datos se cargan una sola vez al inicio
- La aplicación funciona completamente en el navegador
- No se requiere autenticación para Firebase (lectura pública)
- Los cálculos orbitales son aproximaciones simplificadas
- La visualización 3D usa Three.js y Globe.gl

## 🚧 Futuras Mejoras

- [ ] Actualización en tiempo real de datos
- [ ] Predicción de trayectorias
- [ ] Alertas de colisión
- [ ] Exportación de datos
- [ ] Modo de realidad aumentada
- [ ] API REST propia

## 📄 Licencia

Proyecto desarrollado para Hackathon NASA Space Apps Challenge 2025

---

**Desarrollado con ❤️ para la exploración espacial segura**
