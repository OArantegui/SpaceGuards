import { MAX_DELTA_V } from '../config/constants.js';
import { calculateDeltaV, calculateVulnerability, calculateMissionBudget, calculateDistanceToEgo, calculateOrbitalVelocity, calculateOrbitalPeriod } from '../core/mission.js';

const dashboardEl = document.getElementById('dashboard');
let comparisonChart;
let onMissionStartCallback, onCloseCallback;

// Elementos de las barras de métricas
const vulnerabilityPercentageEl = document.getElementById('vulnerability-percentage');
const vulnerabilityBarEl = document.getElementById('vulnerability-bar');
const deltavPercentageEl = document.getElementById('deltav-percentage');
const deltavBarEl = document.getElementById('deltav-bar');

// Elementos del DOM para el Pop-up
const missionPopupEl = document.getElementById('mission-popup');
const popupSatIdEl = document.getElementById('popup-sat-id');
const popupDistanceEl = document.getElementById('popup-distance');
const popupDeltaVEl = document.getElementById('popup-delta-v');
const popupBudgetEl = document.getElementById('popup-budget');

// Elementos del DOM
const satNameEl = document.getElementById('sat-name');
const satIdEl = document.getElementById('sat-id');
const satCategoryEl = document.getElementById('sat-category');
const satAltEl = document.getElementById('sat-alt');
const satMaterialEl = document.getElementById('sat-material');
const satSpeedEl = document.getElementById('sat-speed');
const satPeriodEl = document.getElementById('sat-period');
const satMassEl = document.getElementById('sat-mass');
const satDeltaVEl = document.getElementById('sat-delta-v');
const satDecayEl = document.getElementById('sat-decay');
const statusIndicatorEl = document.getElementById('status-indicator');

/**
 * Inicializa el panel de control (dashboard).
 * @param {Function} onMissionStart - Callback para cuando se inicia una misión.
 * @param {Function} onClose - Callback para cuando se cierra el panel.
 */
export function initDashboard(onMissionStart, onClose) {
    onMissionStartCallback = onMissionStart;
    onCloseCallback = onClose;

    document.getElementById('mission-button').addEventListener('click', () => {
        if (onMissionStartCallback) onMissionStartCallback();
    });

    document.getElementById('close-dashboard').addEventListener('click', () => {
        if (onCloseCallback) onCloseCallback();
    });

    document.getElementById('close-mission-popup').addEventListener('click', hideMissionPopup);
}

/**
 * Muestra el panel de control y actualiza sus datos.
 * @param {object} satData - Los datos del satélite seleccionado.
 * @param {object} egoData - Los datos de la estación EGO.
 * @param {object} globalMetrics - Métricas globales como avgMass y avgSpeed.
 * @param {object} world - La instancia del globo para obtener radios.
 */
export function showDashboard(satData, egoData, globalMetrics, world) {
    const globeRadius = world.getGlobeRadius();

    // Calcular valores reales usando datos TLE
    const deltaV = calculateDeltaV(satData.altitude, satData.mass);
    const vulnerability = calculateVulnerability(satData.decayTime);
    const distanceMeters = calculateDistanceToEgo(egoData, satData, globeRadius);
    const rentabilidad = calculateMissionBudget(deltaV, distanceMeters, satData);
    
    // Velocidad orbital real en km/h
    const orbitalVelocityMs = calculateOrbitalVelocity(satData.altitude);
    const currentSpeedKmH = (orbitalVelocityMs * 3.6); // m/s a km/h
    
    // Período orbital en minutos
    const orbitalPeriodMin = calculateOrbitalPeriod(satData.altitude);

    // Actualizar campos de texto
    satNameEl.textContent = satData.name || 'N/A';
    satIdEl.textContent = satData.noradId || satData.id;
    satCategoryEl.textContent = satData.category ? satData.category.toUpperCase() : 'N/A';
    satAltEl.textContent = `${satData.altitude.toFixed(2)} km`;
    satMaterialEl.textContent = satData.material;
    satSpeedEl.textContent = `${currentSpeedKmH.toFixed(2)} km/h (${orbitalVelocityMs.toFixed(0)} m/s)`;
    satPeriodEl.textContent = `${orbitalPeriodMin.toFixed(2)} min`;
    satMassEl.textContent = `${satData.mass.toFixed(0)} kg`;
    satDeltaVEl.textContent = `${deltaV.toFixed(1)} m/s`;
    satDecayEl.textContent = `${satData.decayTime.toFixed(1)} años`;
    statusIndicatorEl.textContent = `RIESGO: ${vulnerability.level}`;
    statusIndicatorEl.style.backgroundColor = vulnerability.color;

    // Actualizar secciones adicionales
    updateRiskInfo(vulnerability, rentabilidad, deltaV);
    updateGlobalMetrics(satData, globalMetrics);
    updateImpactInfo(satData, deltaV);

    // Actualizar barras de métricas
    updateMetricBars(vulnerability, deltaV);

    // Inicializar o actualizar gráfico de comparación
    if (!comparisonChart) {
        initComparisonChart(satData, currentSpeedKmH, globalMetrics);
    } else {
        updateComparisonChart(satData, currentSpeedKmH, globalMetrics);
    }

    dashboardEl.style.display = 'block';
}

/**
 * Muestra el pop-up de la misión con los datos calculados.
 * @param {object} satData - El satélite seleccionado.
 * @param {object} egoData - La estación EGO.
 * @param {object} world - La instancia del globo.
 */
export function showMissionPopup(satData, egoData, world) {
    const globeRadius = world.getGlobeRadius();

    // Usar cálculos reales con datos TLE
    const deltaV = calculateDeltaV(satData.altitude, satData.mass);
    const distanceMeters = calculateDistanceToEgo(egoData, satData, globeRadius);
    const rentabilidad = calculateMissionBudget(deltaV, distanceMeters, satData);

    popupSatIdEl.textContent = satData.noradId || satData.id;
    popupDistanceEl.textContent = (distanceMeters / 1000).toFixed(2);
    popupDeltaVEl.textContent = deltaV.toFixed(1);
    popupBudgetEl.textContent = rentabilidad.toFixed(2);

    missionPopupEl.style.display = 'block';
}

/**
 * Oculta el pop-up de la misión.
 */
export function hideMissionPopup() {
    missionPopupEl.style.display = 'none';
}

/**
 * Oculta el panel de control y destruye los gráficos para liberar memoria.
 */
export function hideDashboard() {
    dashboardEl.style.display = 'none';
    if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }
}

// --- Funciones para actualizar barras de métricas ---

function updateMetricBars(vulnerability, deltaV) {
    // Actualizar barra de vulnerabilidad
    const vulnPercent = vulnerability.riskValue;
    vulnerabilityPercentageEl.textContent = vulnPercent.toFixed(0) + '%';
    vulnerabilityBarEl.style.width = vulnPercent + '%';
    
    // Color según nivel de riesgo
    if (vulnerability.level === 'ALTA') {
        vulnerabilityBarEl.style.background = 'linear-gradient(90deg, #ff5555 0%, #FC3D21 100%)';
    } else if (vulnerability.level === 'MEDIA') {
        vulnerabilityBarEl.style.background = 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)';
    } else {
        vulnerabilityBarEl.style.background = 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)';
    }
    
    // Actualizar barra de Delta-V
    const dvRatio = deltaV / MAX_DELTA_V;
    const dvPercent = Math.min(dvRatio * 100, 100);
    deltavPercentageEl.textContent = dvPercent.toFixed(0) + '%';
    deltavBarEl.style.width = dvPercent + '%';
    
    // Color según nivel de Delta-V
    if (dvRatio > 0.7) {
        deltavBarEl.style.background = 'linear-gradient(90deg, #ff5555 0%, #FC3D21 100%)';
    } else if (dvRatio > 0.4) {
        deltavBarEl.style.background = 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)';
    } else {
        deltavBarEl.style.background = 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)';
    }
}

// --- Funciones para manejar el gráfico de comparación ---

function initComparisonChart(satData, currentSpeedKmH, globalMetrics) {
    if (comparisonChart) comparisonChart.destroy();
    
    const compCtx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(compCtx, createComparisonChartConfig(satData, currentSpeedKmH, globalMetrics));
}

function updateComparisonChart(satData, currentSpeedKmH, globalMetrics) {
    if (comparisonChart) comparisonChart.destroy();
    
    const compCtx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(compCtx, createComparisonChartConfig(satData, currentSpeedKmH, globalMetrics));
}

// --- Configuración del Gráfico de Comparación ---

function createComparisonChartConfig(satData, currentSpeedKmH, globalMetrics) {
    return {
        type: 'bar',
        data: {
            labels: ['Masa (kg)', 'Velocidad (km/h)'],
            datasets: [
                { 
                    label: 'Objetivo', 
                    data: [satData.mass, currentSpeedKmH], 
                    backgroundColor: ['#00d4ff', '#FC3D21'],
                    borderColor: ['#00d4ff', '#FC3D21'],
                    borderWidth: 2
                },
                { 
                    label: 'Promedio Global', 
                    data: [globalMetrics.avgMass, globalMetrics.avgSpeed], 
                    backgroundColor: ['rgba(0, 212, 255, 0.3)', 'rgba(252, 61, 33, 0.3)'],
                    borderColor: ['rgba(0, 212, 255, 0.5)', 'rgba(252, 61, 33, 0.5)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: { 
                    grid: { color: 'rgba(0, 212, 255, 0.1)' }, 
                    ticks: { color: '#FFFFFF', font: { size: 11 } }, 
                    display: false 
                },
                y: { 
                    grid: { display: false }, 
                    ticks: { color: '#FFFFFF', font: { size: 12, weight: '600' } } 
                }
            },
            plugins: { 
                legend: { 
                    position: 'top', 
                    labels: { 
                        color: '#FFFFFF',
                        font: { size: 12, weight: '600' },
                        padding: 10
                    } 
                },
                tooltip: {
                    backgroundColor: 'rgba(11, 61, 145, 0.95)',
                    titleColor: '#00d4ff',
                    bodyColor: '#FFFFFF',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            }
        }
    };
}

// --- Funciones para actualizar secciones adicionales ---

/**
 * Actualiza la sección de Riesgo y Coste
 */
function updateRiskInfo(vulnerability, rentabilidad, deltaV) {
    const riskInfoEl = document.getElementById('risk-info');
    
    const isRentable = rentabilidad > 0;
    const riskClass = vulnerability.level === 'ALTA' ? 'high-risk' : vulnerability.level === 'MEDIA' ? 'medium-risk' : 'low-risk';
    const rentabilidadClass = isRentable ? 'profitable' : 'not-profitable';
    
    riskInfoEl.innerHTML = `
        <div class="risk-card ${riskClass}">
            <div class="risk-label">Nivel de Riesgo</div>
            <div class="risk-value">${vulnerability.level}</div>
            <div class="risk-percentage">${vulnerability.riskValue.toFixed(0)}%</div>
        </div>
        <div class="cost-card ${rentabilidadClass}">
            <div class="cost-label">Rentabilidad Estimada</div>
            <div class="cost-value">${isRentable ? '+' : ''}€${rentabilidad.toFixed(2)}</div>
            <div class="cost-status">${isRentable ? '✓ Rentable' : '✗ No Rentable'}</div>
        </div>
        <div class="info-card">
            <div class="info-label">Coste Operacional</div>
            <div class="info-value">€${(deltaV * 2.5).toFixed(2)}</div>
            <div class="info-detail">Basado en Delta-V requerido</div>
        </div>
    `;
}

/**
 * Actualiza la sección de Métricas Globales
 */
function updateGlobalMetrics(satData, globalMetrics) {
    const canvas = document.getElementById('globalDonut');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calcular porcentajes comparativos
    const massPercentage = (satData.mass / globalMetrics.avgMass) * 100;
    const isMassAboveAvg = massPercentage > 100;
    
    // Dibujar gráfico de dona simple
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    
    // Fondo
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(22, 33, 62, 0.4)';
    ctx.fill();
    
    // Porcentaje
    const angle = (massPercentage / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = isMassAboveAvg ? '#FC3D21' : '#4caf50';
    ctx.fill();
    
    // Círculo interior
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = '#0B3D91';
    ctx.fill();
    
    // Texto central
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(massPercentage.toFixed(0) + '%', centerX, centerY);
    
    // Texto descriptivo debajo del canvas
    const globalDonutParent = canvas.parentElement;
    let descEl = globalDonutParent.querySelector('.global-metrics-desc');
    if (!descEl) {
        descEl = document.createElement('div');
        descEl.className = 'global-metrics-desc';
        globalDonutParent.appendChild(descEl);
    }
    descEl.innerHTML = `
        <p><strong>Masa vs. Promedio:</strong> ${isMassAboveAvg ? 'Por encima' : 'Por debajo'}</p>
        <p><strong>Promedio Global:</strong> ${globalMetrics.avgMass.toFixed(0)} kg</p>
        <p><strong>Categoría:</strong> ${satData.category || 'N/A'}</p>
    `;
}

/**
 * Actualiza la sección de Impacto Ambiental
 */
function updateImpactInfo(satData, deltaV) {
    const canvas = document.getElementById('impactChart');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calcular impacto ambiental basado en masa y delta-V
    const co2Emissions = (satData.mass * 0.5 + deltaV * 0.1).toFixed(1); // kg CO2
    const debrisRisk = satData.decayTime < 10 ? 'ALTO' : satData.decayTime < 20 ? 'MEDIO' : 'BAJO';
    const reusabilityScore = satData.material === 'Aluminum' ? 85 : satData.material === 'Steel' ? 70 : 60;
    
    // Configuración mejorada
    const labelWidth = 90;
    const barHeight = 28;
    const barSpacing = 45;
    const maxBarWidth = canvas.width - labelWidth - 20;
    
    // Barra 1: Emisiones CO2
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Emisiones CO2:', 10, 20);
    
    ctx.fillStyle = 'rgba(252, 61, 33, 0.6)';
    const co2Width = Math.min((parseFloat(co2Emissions) / 500) * maxBarWidth, maxBarWidth);
    ctx.fillRect(labelWidth, 10, co2Width, barHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(co2Emissions + ' kg', labelWidth + 5, 24);
    
    // Barra 2: Reusabilidad
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Reusabilidad:', 10, 20 + barSpacing);
    
    ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
    ctx.fillRect(labelWidth, 10 + barSpacing, (reusabilityScore / 100) * maxBarWidth, barHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(reusabilityScore + '%', labelWidth + 5, 24 + barSpacing);
    
    // Barra 3: Riesgo de Fragmentación
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Fragmentación:', 10, 20 + barSpacing * 2);
    
    const riskWidth = debrisRisk === 'ALTO' ? 0.8 : debrisRisk === 'MEDIO' ? 0.5 : 0.2;
    ctx.fillStyle = debrisRisk === 'ALTO' ? 'rgba(255, 85, 85, 0.6)' : debrisRisk === 'MEDIO' ? 'rgba(255, 152, 0, 0.6)' : 'rgba(76, 175, 80, 0.6)';
    ctx.fillRect(labelWidth, 10 + barSpacing * 2, riskWidth * maxBarWidth, barHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(debrisRisk, labelWidth + 5, 24 + barSpacing * 2);
}
