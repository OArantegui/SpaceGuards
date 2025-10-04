import { MU_EARTH, COST_COEFFICIENTS, MATERIAL_VALUES, EARTH_RADIUS_KM } from '../config/constants.js';

/**
 * Calcula la velocidad orbital real a partir de la altitud.
 * @param {number} altitudeKm - Altitud en kilómetros.
 * @returns {number} Velocidad orbital en m/s.
 */
export function calculateOrbitalVelocity(altitudeKm) {
    const r = (EARTH_RADIUS_KM + altitudeKm) * 1000; // Radio orbital en metros
    return Math.sqrt(MU_EARTH / r); // v = sqrt(μ/r)
}

/**
 * Calcula el Delta-V necesario para una maniobra de desorbitación.
 * Usa la fórmula de Hohmann para transferencia orbital.
 * @param {number} altitudeKm - Altitud actual en km.
 * @param {number} mass - Masa del satélite en kg.
 * @returns {number} El Delta-V estimado en m/s.
 */
export function calculateDeltaV(altitudeKm, mass) {
    // Radio orbital actual
    const r1 = (EARTH_RADIUS_KM + altitudeKm) * 1000; // metros
    
    // Radio de órbita de reentrada (100 km de altitud)
    const r2 = (EARTH_RADIUS_KM + 100) * 1000; // metros
    
    // Velocidad orbital actual
    const v1 = Math.sqrt(MU_EARTH / r1);
    
    // Velocidad en el periapsis de la órbita de transferencia
    const v_transfer = Math.sqrt(MU_EARTH * (2/r1 - 2/(r1 + r2)));
    
    // Delta-V para la maniobra de Hohmann
    const deltaV = Math.abs(v1 - v_transfer);
    
    return deltaV;
}

/**
 * Calcula el nivel de vulnerabilidad de reentrada basado en el tiempo de decaimiento.
 * @param {number} decayTime - Tiempo de decaimiento en años.
 * @returns {{level: string, riskValue: number, color: string}} Objeto con el nivel, valor y color del riesgo.
 */
export function calculateVulnerability(decayTime) {
    let level, riskValue, color;

    if (decayTime < 8) {
        level = "ALTA";
        riskValue = 100 - (decayTime / 8) * 100;
        color = 'rgb(255, 85, 85)';
    } else if (decayTime < 15) {
        level = "MEDIA";
        riskValue = 50 + (15 - decayTime) / 7 * 50;
        color = 'rgb(255, 152, 0)';
    } else {
        level = "BAJA";
        riskValue = (25 - decayTime) / 10 * 50;
        color = 'rgb(76, 175, 80)';
    }
    riskValue = Math.min(100, Math.max(10, riskValue));
    return { level, riskValue, color };
}

/**
 * Calcula el período orbital en minutos.
 * @param {number} altitudeKm - Altitud en km.
 * @returns {number} Período orbital en minutos.
 */
export function calculateOrbitalPeriod(altitudeKm) {
    const r = (EARTH_RADIUS_KM + altitudeKm) * 1000; // Radio en metros
    const T = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU_EARTH); // Período en segundos
    return T / 60; // Convertir a minutos
}

/**
 * Calcula la rentabilidad de una misión de recolección.
 * @param {number} deltaV - Delta-V necesario (m/s).
 * @param {number} distance - Distancia al satélite (m).
 * @param {object} satData - Datos del satélite {mass, material, altitude}.
 * @returns {number} La rentabilidad estimada en euros.
 */
export function calculateMissionBudget(deltaV, distance, satData) {
    const distanceKm = distance / 1000;
    const m = satData.mass;
    const material = satData.material;
    const M = MATERIAL_VALUES[material] || MATERIAL_VALUES.Default;
    
    // Calcular velocidad orbital real
    const v_orbital = calculateOrbitalVelocity(satData.altitude); // m/s
    const v_km_s = v_orbital / 1000; // km/s

    // Beneficio = valor del material * masa
    const beneficio = M * m;

    // Coste = f(masa, velocidad, distancia, deltaV)
    const costeMasa = COST_COEFFICIENTS.MASS * m;
    const costeVelocidad = COST_COEFFICIENTS.VELOCITY * (v_km_s * v_km_s);
    const costeDistancia = COST_COEFFICIENTS.DISTANCE * distanceKm;
    const costeDeltaV = deltaV * 0.5; // Coste por m/s de Delta-V
    
    const coste = costeMasa + costeVelocidad + costeDistancia + costeDeltaV;

    const rentabilidad = beneficio - coste;

    return rentabilidad;
}

/**
 * Calcula la distancia euclídea 3D entre la EGO y un satélite.
 * @param {object} ego - Objeto de la estación EGO.
 * @param {object} sat - Objeto del satélite.
 * @param {number} globeRadius - Radio del globo en unidades de la simulación.
 * @returns {number} La distancia en metros.
 */
export function calculateDistanceToEgo(ego, sat, globeRadius) {
    const egoPos = ego.mesh.position.clone();
    const satPos = sat.mesh.position.clone();
    const distanceUnits = egoPos.distanceTo(satPos);

    // Convertir unidades 3D a kilómetros (1 radio del globo = 6371 km)
    const kmPerUnit = 6371 / globeRadius;
    return distanceUnits * kmPerUnit * 1000; // Distancia en metros
}
