// Materiales de los satélites
export const MATERIALS = ["Aluminum", "Steel", "Composite"];

// Categorías de objetos espaciales desde Firebase
export const CATEGORIES = [
    'communications',
    'debris',
    'misc',
    'navigation',
    'scientific',
    'space_stations'
];

// Colores por categoría (formato hexadecimal para Three.js)
export const CATEGORY_COLORS = {
    'communications': 0x00ff00,    // Verde - Satélites de comunicaciones
    'debris': 0xff0000,            // Rojo - Basura espacial
    'misc': 0xffff00,              // Amarillo - Misceláneos
    'navigation': 0x00bfff,        // Azul cielo - Navegación (GPS, etc.)
    'scientific': 0xff00ff,        // Magenta - Científicos
    'space_stations': 0xffa500     // Naranja - Estaciones espaciales
};

// Parámetros de la simulación del globo
export const GLOBE_IMAGE_URL = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg';
export const BUMP_IMAGE_URL = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png';

// Parámetros orbitales y físicos
export const EARTH_RADIUS_KM = 6371; // Radio real de la Tierra en km
export const SAT_ALTITUDE_FACTOR = 0.15; // Factor de altitud para los satélites
export const MU_EARTH = 3.986e14; // Constante gravitacional terrestre (m^3/s^2)

// Configuración de la simulación de satélites
export const NUM_SATELLITES = 500; // Deprecated - ahora se cargan desde Firebase
export const MAX_DELTA_V = 300; // Valor máximo para la escala del gráfico de Delta-V

// Filtros por defecto
export const DEFAULT_FILTERS = {
    minMass: 0,
    maxSpeed: 100,
    materialType: 'ALL',
    categoryType: 'ALL'
};

// --- Lógica de la EGO (Estación de Gestión Orbital) ---
export const EGO_ALTITUDE_FACTOR = 0.18; // Un poco más alta que la basura
export const EGO_ORBIT_SPEED = 0.001; // Velocidad de órbita simulada

// --- Lógica de Rentabilidad de la Misión ---
export const COST_COEFFICIENTS = {
    MASS: 20,   // €/kg por masa
    VELOCITY: 50, // Coeficiente por velocidad
    DISTANCE: 0.5 // Coeficiente por distancia
};

// Valor estimado de los materiales recuperados (€/kg)
export const MATERIAL_VALUES = {
    "Aluminum": 50,
    "Steel": 100,
    "Composite": 500,
    "Default": 100 // Valor por defecto si el material no está en la lista
};
