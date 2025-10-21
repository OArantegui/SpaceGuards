# 🛰️ SpaceGuard - Visualizador de Desechos Espaciales (EGO)

**Earth Guard Orbit** - Aplicación web 3D para visualización y análisis de satélites y basura espacial en órbita terrestre con asistente de IA integrado.

Demo Web -> [https://space-guard-project.netlify.app/](https://space-guard-project.netlify.app/)

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue)](https://www.spaceappschallenge.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green)](https://openai.com/)

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Inicio Rápido](#-inicio-rápido)
- [Asistente de IA Integrado](#-asistente-de-ia-integrado)
- [Categorización de Objetos](#-categorización-de-objetos)
- [Datos de Firebase](#-datos-de-firebase)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Cálculos Implementados](#-cálculos-implementados)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Solución de Problemas](#-solución-de-problemas)
- [Notas Técnicas](#-notas-técnicas)
- [Futuras Mejoras](#-futuras-mejoras)

## 🌟 Características Principales

- **Visualización 3D interactiva** del globo terráqueo con 1,435+ objetos orbitales reales
- **Datos en tiempo real** desde Firebase Realtime Database
- **Asistente de IA con OpenAI** para análisis y búsqueda de satélites
- **Cálculos orbitales precisos** basados en parámetros TLE (Two-Line Element)
- **Análisis de viabilidad económica** de misiones de retirada
- **Evaluación de riesgo de colisión** con métricas detalladas
- **Simulación de misiones** de retirada de basura espacial

## 💻 Requisitos del Sistema

- **Navegador**: Chrome, Firefox, Edge o Safari (última versión)
- **Python**: 3.x o superior (para servidor local)
- **Conexión a Internet**: Requerida para cargar datos de Firebase
- **OpenAI API Key**: Opcional, solo para el chatbot de IA

## 🚀 Instalación y Ejecución

### ⚠️ IMPORTANTE: NO abrir `index.html` directamente

Esta aplicación usa módulos ES6 y requiere un servidor HTTP. **NO funcionará** si abres el archivo `index.html` directamente en el navegador debido a las políticas CORS.

### Método 1: Servidor Python (Recomendado)

```bash
# Navega a la carpeta del proyecto
cd "Hackaton NASA"

# Ejecuta el servidor incluido
python server.py

# O alternativamente:
python -m http.server 8000
```

Luego abre en tu navegador: **http://localhost:8000**

### Método 2: Node.js (Alternativa)

```bash
# Si tienes Node.js instalado
npx http-server -p 8000
```

Luego abre en tu navegador: **http://localhost:8000**

### Método 3: Visual Studio Code (Live Server)

1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"

### Configuración de API Key (OpenAI)

Para usar el asistente de IA, necesitas configurar tu API Key de OpenAI:

1. Crea un archivo `src/config/apiConfig.js` (ya está en `.gitignore`)
2. Añade tu configuración:

```javascript
export const OPENAI_CONFIG = {
    apiKey: 'tu-api-key-aqui',
    assistantId: 'tu-assistant-id-aqui'
};
```

3. **NUNCA** compartas o subas este archivo a repositorios públicos

## 🚀 Inicio Rápido

Una vez iniciado el servidor, la aplicación te mostrará:

1. **Globo 3D** con 1,435+ objetos espaciales en órbita
2. **Panel de filtros** a la izquierda para buscar objetos específicos
3. **Botón de chat flotante** (💬) en la esquina inferior derecha

### Ejemplos de Uso

**Buscar la Estación Espacial Internacional:**
- Haz clic en el botón de chat (💬)
- Escribe: `NORAD 25544`
- El mapa mostrará solo la ISS y abrirá su dashboard

**Analizar objetos de alto riesgo:**
- En el chat, escribe: `riesgo de colisión`
- Verás los 5 objetos más peligrosos

**Evaluar viabilidad de una misión:**
- Escribe: `¿es viable NORAD 25544?`
- Obtendrás un análisis económico completo

**Buscar satélites Starlink:**
- Escribe: `buscar Starlink`
- El mapa filtrará solo satélites Starlink

## 🤖 Asistente de IA Integrado

El chatbot inteligente puede ayudarte con:

### Comandos Disponibles

- **`NORAD [número]`** - Busca y selecciona un satélite por su ID NORAD
  - Ejemplo: `NORAD 25544` (Estación Espacial Internacional)
  
- **`buscar [nombre]`** - Filtra satélites por nombre
  - Ejemplo: `buscar COSMOS` o `buscar Starlink`
  
- **`satélites de [material]`** - Filtra por material
  - Materiales: Aluminum, Steel, Composite
  
- **`riesgo de colisión`** - Lista los 5 objetos de mayor riesgo
  - Análisis específico: `riesgo de colisión NORAD [ID]`
  
- **`¿es viable NORAD [ID]?`** - Análisis económico completo
  - Calcula costes, beneficios y rentabilidad de misiones de retirada
  
- **`mostrar todos`** - Restaura la vista completa del mapa

### Capacidades del Asistente

- 📊 Análisis de riesgo de colisión con métricas detalladas
- 💰 Evaluación de viabilidad económica de misiones
- 🔍 Búsqueda inteligente por múltiples criterios
- 📈 Estadísticas y comparativas en tiempo real
- 🎯 Filtrado visual automático en el mapa 3D
- 💡 Respuestas contextuales sobre desechos espaciales

## 📊 Categorización de Objetos

- 🟢 **Comunicaciones** - Satélites de telecomunicaciones (Starlink, Iridium, etc.)
- 🔴 **Basura Espacial (Debris)** - Fragmentos de colisiones y etapas de cohetes
- 🟡 **Misceláneos** - Objetos diversos sin categoría específica
- 🔵 **Navegación** - Sistemas GPS, GLONASS, Galileo
- 🟣 **Científicos** - Satélites de investigación y observación
- 🟠 **Estaciones Espaciales** - ISS, Tiangong, etc.

## 📊 Datos de Firebase

### Origen de los Datos

Los datos fueron obtenidos de fuentes oficiales de la NASA y CelesTrak, procesados y categorizados en 6 grupos principales:

- **CelesTrak NORAD Elements**: Elementos orbitales TLE en formato JSON
- **NASA Open Data Portal**: Información complementaria de satélites
- **NASA ODPO**: Datos de desechos orbitales catalogados

Estos datos fueron mapeados y almacenados en Firebase Realtime Database para acceso en tiempo real desde la aplicación web.

### Estructura de la Base de Datos

```
spaceguard-b46ef-default-rtdb.firebaseio.com/
├── communications/      # Satélites de comunicaciones
├── debris/             # Basura espacial y fragmentos
├── misc/               # Objetos misceláneos
├── navigation/         # Satélites de navegación (GPS, GLONASS)
├── scientific/         # Satélites científicos
└── space_stations/     # Estaciones espaciales
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
├── index.html                    # Página principal
├── server.py                     # Servidor de desarrollo Python
├── README.md                     # Esta documentación
├── ASSISTANT_CONTEXT.md          # Contexto del asistente de IA
├── CALCULOS.md                   # Documentación de cálculos orbitales
├── .gitignore                    # Archivos ignorados por Git
├── css/
│   └── main.css                  # Estilos principales
└── src/
    ├── app.js                    # Aplicación principal
    ├── components/
    │   ├── chatbot.js            # Chatbot con IA (OpenAI)
    │   ├── dashboard.js          # Panel de control
    │   ├── filterPanel.js        # Panel de filtros
    │   └── globeView.js          # Visualización 3D
    ├── config/
    │   ├── apiConfig.js          # Configuración API (NO incluido en Git)
    │   └── constants.js          # Constantes y configuración
    ├── core/
    │   └── mission.js            # Cálculos de misión
    └── services/
        ├── chatService.js        # Servicio de comunicación con OpenAI
        ├── dataService.js        # Transformación de datos
        └── firebaseService.js    # Conexión a Firebase
```

## 🔄 Funcionalidades Implementadas

### 1. Integración con Firebase Realtime Database

- ✅ Conexión a Firebase con 1,435+ objetos espaciales reales
- ✅ Carga asíncrona de datos desde 6 categorías
- ✅ Datos TLE (Two-Line Element) para cálculos orbitales precisos
- ✅ Actualización en tiempo real de métricas

### 2. Asistente de IA con OpenAI

- ✅ Chatbot flotante integrado en la interfaz
- ✅ Procesamiento de comandos especiales (NORAD, búsqueda, filtros)
- ✅ Análisis de riesgo de colisión automatizado
- ✅ Evaluación de viabilidad económica de misiones
- ✅ Filtrado visual automático en el mapa 3D
- ✅ Contexto persistente con historial de conversación

### 3. Cálculos Orbitales Avanzados

- ✅ Uso de parámetros TLE (MEAN_MOTION, ECCENTRICITY, INCLINATION, etc.)
- ✅ Cálculo de altitud orbital usando la Tercera Ley de Kepler
- ✅ Delta-V para maniobras de desorbitación
- ✅ Tiempo de decaimiento atmosférico
- ✅ Velocidad orbital y período calculados en tiempo real

### 4. Interfaz de Usuario Mejorada

- ✅ Visualización 3D con Three.js y Globe.gl
- ✅ Panel de filtros avanzados (masa, velocidad, material, categoría)
- ✅ Dashboard detallado con gráficos (Chart.js)
- ✅ Lista de resultados con badges de categoría
- ✅ Colores diferenciados por tipo de objeto
- ✅ Indicadores de carga y estado
- ✅ Botón flotante del chatbot con animaciones

### 5. Análisis de Misiones

- ✅ Cálculo de distancia a la estación EGO
- ✅ Estimación de costes por masa, velocidad, distancia y Delta-V
- ✅ Beneficio potencial basado en valor de materiales
- ✅ Rentabilidad de misiones de retirada
- ✅ Propuestas de servicio (Básico y Premium)
- ✅ Métricas de impacto ambiental

## 🎨 Colores por Categoría

| Categoría | Color | Hex |
|-----------|-------|-----|
| Comunicaciones | 🟢 Verde | #00ff00 |
| Debris | 🔴 Rojo | #ff0000 |
| Misceláneos | 🟡 Amarillo | #ffff00 |
| Navegación | 🔵 Azul Cielo | #00bfff |
| Científicos | 🟣 Magenta | #ff00ff |
| Estaciones Espaciales | 🟠 Naranja | #ffa500 |

## 🎯 Funcionalidades Principales

### Visualización del Globo 3D

- Rotación automática del globo terráqueo
- 1,435+ objetos espaciales en órbita con colores por categoría
- Estación EGO (Earth Guard Orbit) en azul cielo
- Interacción con clic para seleccionar objetos
- Seguimiento de cámara del objeto seleccionado

### Panel de Filtros

- **Masa Mínima**: Filtra objetos por masa (kg)
- **Velocidad Máxima**: Filtra por velocidad orbital
- **Material**: Aluminio, Acero, Compuesto
- **Categoría**: Comunicaciones, Debris, Navegación, Científicos, Estaciones Espaciales, Misceláneos
- Lista de resultados con información detallada

### Dashboard de Análisis

- Información completa del objeto seleccionado
- Métricas visuales (vulnerabilidad, Delta-V)
- Gráficos comparativos (Chart.js)
- Análisis de riesgo y coste
- Propuestas de servicio (Básico €250k / Premium €890k)
- Impacto ambiental estimado
- Botón de simulación de misión

### Chatbot Inteligente

- Búsqueda por NORAD ID o nombre
- Filtrado automático visual
- Análisis de riesgo de colisión
- Evaluación económica de misiones
- Respuestas contextuales sobre desechos espaciales

## 🐛 Solución de Problemas

### La aplicación no carga datos

1. Verifica la conexión a Internet
2. Abre la consola del navegador (F12)
3. Revisa si hay errores de Firebase
4. Espera a que aparezca el mensaje "✅ Aplicación inicializada"

### El chatbot no responde

1. Verifica que hayas configurado `src/config/apiConfig.js` con tu API Key de OpenAI
2. Revisa la consola del navegador para errores de API
3. Comprueba que tu API Key sea válida y tenga créditos
4. Asegúrate de que el Assistant ID sea correcto

### Los objetos no se muestran en el globo

1. Espera a que termine la carga (mensaje verde)
2. Aplica los filtros (botón "Aplicar Filtros")
3. Verifica que los filtros no sean muy restrictivos
4. Usa el comando "mostrar todos" en el chatbot para restaurar la vista

### El servidor no inicia

1. Verifica que Python esté instalado: `python --version`
2. Asegúrate de estar en el directorio correcto
3. Prueba con: `python -m http.server 8000`
4. Si el puerto 8000 está ocupado, usa otro: `python server.py` (usa puerto 8080)

## 📝 Notas Técnicas

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Visualización 3D**: Three.js, Globe.gl
- **Gráficos**: Chart.js
- **Base de Datos**: Firebase Realtime Database
- **IA**: OpenAI API (GPT-4 con Assistants)
- **Servidor**: Python HTTP Server

### Consideraciones

- Los datos se cargan una sola vez al inicio desde Firebase
- Los datos provienen de fuentes oficiales: CelesTrak, NASA Open Data Portal y NASA ODPO
- La aplicación funciona completamente en el navegador (client-side)
- No se requiere autenticación para Firebase (lectura pública)
- Los cálculos orbitales son aproximaciones basadas en parámetros TLE de CelesTrak
- El chatbot requiere API Key de OpenAI (no incluida)
- La API Key debe mantenerse segura y nunca compartirse públicamente

### Rendimiento

- 1,435+ objetos renderizados en tiempo real
- Filtrado y búsqueda optimizados
- Carga asíncrona de datos
- Animación fluida a 60 FPS

## 🚧 Futuras Mejoras

- [ ] Alertas automáticas de riesgo
- [ ] Exportación de datos y reportes PDF
- [ ] Modo de realidad aumentada (AR)
- [ ] API REST propia para datos
- [ ] Integración con más fuentes de datos
- [ ] Visualización de trayectorias de misiones
- [ ] Comparación de múltiples objetos
- [ ] Historial de cambios orbitales

## 👥 Equipo y Créditos

Proyecto desarrollado para **NASA Space Apps Challenge 2025**

### Fuentes de Datos

Los datos de los 1,435+ objetos espaciales fueron obtenidos de las siguientes fuentes oficiales y mapeados a Firebase Realtime Database:

- **[CelesTrak](https://celestrak.org/NORAD/elements/index.php?FORMAT=json)**: Elementos orbitales NORAD en formato JSON con parámetros TLE actualizados
- **[NASA Open Data Portal](https://data.nasa.gov/)**: Portal de datos abiertos de la NASA
- **[NASA Orbital Debris Program Office (ODPO)](https://orbitaldebris.jsc.nasa.gov/)**: Recursos oficiales del programa de desechos orbitales de la NASA
- **Firebase Realtime Database**: Base de datos en tiempo real con 1,435+ objetos espaciales categorizados
- **OpenAI API**: Asistente inteligente con GPT-4

### Librerías y Frameworks

- [Three.js](https://threejs.org/) - Renderizado 3D
- [Globe.gl](https://globe.gl/) - Visualización del globo terráqueo
- [Chart.js](https://www.chartjs.org/) - Gráficos y visualizaciones
- [Firebase](https://firebase.google.com/) - Base de datos en tiempo real
- [OpenAI](https://openai.com/) - Asistente de IA

## 📄 Licencia

Este proyecto fue desarrollado para el **NASA Space Apps Challenge 2025** con fines educativos y de investigación.

## 📞 Contacto

Para preguntas, sugerencias o colaboraciones, por favor abre un issue en el repositorio.

---

**🌍 Desarrollado con ❤️ para la exploración espacial segura y sostenible**

*"Protegiendo las órbitas terrestres para las futuras generaciones"*
