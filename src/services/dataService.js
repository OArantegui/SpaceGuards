import { MATERIALS, EARTH_RADIUS_KM, CATEGORY_COLORS, MU_EARTH } from '../config/constants.js';
import { fetchAllSpaceObjects } from './firebaseService.js';

/**
 * Calcula la altitud orbital a partir del movimiento medio (MEAN_MOTION).
 * @param {number} meanMotion - Revoluciones por día.
 * @returns {number} Altitud en km.
 */
function calculateAltitudeFromMeanMotion(meanMotion) {
    if (!meanMotion || meanMotion <= 0) {
        // Altitud aleatoria entre 200 y 800 km si no hay datos
        return 200 + Math.random() * 600;
    }
    
    // Convertir revoluciones/día a radianes/segundo
    const n = (meanMotion * 2 * Math.PI) / 86400; // rad/s
    
    // Usar la tercera ley de Kepler: n² * a³ = μ
    // a = (μ / n²)^(1/3)
    const a = Math.pow(MU_EARTH / (n * n), 1/3); // Semi-eje mayor en metros
    
    // Altitud = a - radio de la Tierra
    const altitudeKm = (a / 1000) - EARTH_RADIUS_KM;
    
    // Limitar a valores razonables (LEO a GEO)
    // Si el valor es muy grande o negativo, usar un valor aleatorio razonable
    if (altitudeKm < 100 || altitudeKm > 40000) {
        return 200 + Math.random() * 600; // LEO típico
    }
    
    return altitudeKm;
}

/**
 * Estima la masa basándose en el coeficiente de arrastre BSTAR y el tipo de objeto.
 * @param {number} bstar - Coeficiente de arrastre balístico.
 * @param {string} category - Categoría del objeto.
 * @returns {number} Masa estimada en kg.
 */
function estimateMass(bstar, category) {
    // BSTAR está relacionado con el área/masa del objeto
    // Valores más altos de BSTAR = más arrastre = menor masa o mayor área
    
    let baseMass = 100;
    
    if (category === 'space_stations') {
        baseMass = 50000 + Math.random() * 100000; // 50-150 toneladas
    } else if (category === 'debris') {
        baseMass = 10 + Math.random() * 100; // 10-110 kg
    } else if (category === 'communications' || category === 'navigation') {
        baseMass = 500 + Math.random() * 2000; // 500-2500 kg
    } else if (category === 'scientific') {
        baseMass = 200 + Math.random() * 1000; // 200-1200 kg
    } else {
        baseMass = 50 + Math.random() * 500; // 50-550 kg
    }
    
    // Ajustar por BSTAR si está disponible
    if (bstar && bstar > 0) {
        const bstarFactor = Math.min(Math.abs(bstar) * 10000, 2);
        baseMass = baseMass / (1 + bstarFactor);
    }
    
    return Math.round(baseMass);
}

/**
 * Determina el material basándose en la categoría del objeto.
 * @param {string} category - Categoría del objeto.
 * @returns {string} Material del objeto.
 */
function determineMaterial(category) {
    if (category === 'debris') {
        return MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    } else if (category === 'space_stations') {
        return 'Composite';
    } else if (category === 'communications' || category === 'navigation') {
        return Math.random() > 0.5 ? 'Aluminum' : 'Composite';
    } else {
        return 'Aluminum';
    }
}

/**
 * Calcula el tiempo de decaimiento estimado basándose en la altitud y BSTAR.
 * @param {number} altitude - Altitud en km.
 * @param {number} bstar - Coeficiente de arrastre.
 * @returns {number} Tiempo de decaimiento en años.
 */
function calculateDecayTime(altitude, bstar) {
    // A mayor altitud, mayor tiempo de decaimiento
    // A mayor BSTAR, menor tiempo de decaimiento (más arrastre)
    
    let baseTime = (altitude / 100) * 2; // Aproximación simple
    
    if (bstar && bstar > 0) {
        const dragFactor = Math.abs(bstar) * 100000;
        baseTime = baseTime / (1 + dragFactor);
    }
    
    return Math.max(1, Math.min(baseTime, 100)); // Entre 1 y 100 años
}

/**
 * Transforma los datos de Firebase al formato usado por la aplicación.
 * @param {Array} firebaseObjects - Array de objetos desde Firebase.
 * @returns {{satellites: Array<Object>, avgMass: number, avgSpeed: number}}
 */
function transformFirebaseData(firebaseObjects) {
    const satellites = [];
    const allMasses = [];
    const allSpeeds = [];
    
    firebaseObjects.forEach((obj, index) => {
        // Extraer parámetros TLE
        const meanMotion = parseFloat(obj.MEAN_MOTION) || 15.5;
        const inclination = parseFloat(obj.INCLINATION) || 0;
        const raAscNode = parseFloat(obj.RA_OF_ASC_NODE) || 0;
        const argPericenter = parseFloat(obj.ARG_OF_PERICENTER) || 0;
        const meanAnomaly = parseFloat(obj.MEAN_ANOMALY) || 0;
        const eccentricity = parseFloat(obj.ECCENTRICITY) || 0;
        const bstar = parseFloat(obj.BSTAR) || 0;
        
        // Calcular altitud desde el movimiento medio
        const altitudeKm = calculateAltitudeFromMeanMotion(meanMotion);
        
        // Estimar masa
        const mass = estimateMass(bstar, obj.category);
        
        // Determinar material
        const material = determineMaterial(obj.category);
        
        // Calcular tiempo de decaimiento
        const decayTime = calculateDecayTime(altitudeKm, bstar);
        
        // Calcular velocidad angular simulada desde el movimiento medio
        const simulatedSpeed = (Math.random() - 0.5) * 0.003; // Velocidad aleatoria para variedad
        
        // Distribuir los objetos de manera uniforme usando coordenadas esféricas
        // Usar distribución aleatoria verdadera para máxima dispersión
        const theta = Math.random() * Math.PI * 2; // Longitud: 0 a 2π (360°)
        const phi = Math.acos(2 * Math.random() - 1); // Latitud: distribución uniforme en esfera
        
        // Determinar color según categoría
        const originalColor = CATEGORY_COLORS[obj.category] || 0xff0000;
        
        const satData = {
            id: obj.NORAD_CAT_ID || `obj-${index}`,
            name: obj.OBJECT_NAME || `Objeto ${index}`,
            noradId: obj.NORAD_CAT_ID,
            objectId: obj.OBJECT_ID,
            category: obj.category,
            
            // Propiedades físicas
            mass: mass,
            material: material,
            decayTime: decayTime,
            
            // Propiedades orbitales calculadas
            altitude: altitudeKm,
            inclination: inclination,
            eccentricity: eccentricity,
            
            // Parámetros TLE originales (para referencia)
            tle: {
                meanMotion: meanMotion,
                raAscNode: raAscNode,
                argPericenter: argPericenter,
                meanAnomaly: meanAnomaly,
                bstar: bstar,
                epoch: obj.EPOCH
            },
            
            // Propiedades para visualización 3D
            originalColor: originalColor,
            theta: theta,
            phi: phi,
            speed: simulatedSpeed
        };
        
        // Log de depuración para los primeros objetos
        if (index < 3) {
            console.log(`📡 Objeto ${index}:`, {
                name: satData.name,
                altitude: altitudeKm.toFixed(2),
                theta: theta.toFixed(3),
                phi: phi.toFixed(3),
                meanMotion: meanMotion
            });
        }
        
        allMasses.push(mass);
        allSpeeds.push(Math.abs(simulatedSpeed * 10000));
        
        satellites.push(satData);
    });
    
    // Calcular promedios
    const avgMass = allMasses.length > 0 
        ? allMasses.reduce((a, b) => a + b, 0) / allMasses.length 
        : 100;
    const avgSpeed = allSpeeds.length > 0 
        ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length 
        : 10;
    
    return { satellites, avgMass, avgSpeed };
}

/**
 * Carga los datos de satélites desde Firebase y los transforma.
 * @returns {Promise<{satellites: Array<Object>, avgMass: number, avgSpeed: number}>}
 */
export async function loadSatelliteData() {
    try {
        console.log('🔄 Cargando datos desde Firebase...');
        const firebaseObjects = await fetchAllSpaceObjects();
        
        console.log(`📊 Transformando ${firebaseObjects.length} objetos...`);
        const transformedData = transformFirebaseData(firebaseObjects);
        
        console.log(`✅ Datos cargados: ${transformedData.satellites.length} satélites`);
        console.log(`📈 Masa promedio: ${transformedData.avgMass.toFixed(2)} kg`);
        console.log(`📈 Velocidad promedio: ${transformedData.avgSpeed.toFixed(2)}`);
        
        return transformedData;
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        // Retornar datos vacíos en caso de error
        return { satellites: [], avgMass: 100, avgSpeed: 10 };
    }
}

/**
 * Función legacy para compatibilidad (ahora es asíncrona).
 * @deprecated Usar loadSatelliteData() en su lugar.
 */
export async function generateSatelliteData() {
    return await loadSatelliteData();
}
