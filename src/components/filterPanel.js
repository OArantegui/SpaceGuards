import { DEFAULT_FILTERS } from '../config/constants.js';
import { calculateVulnerability } from '../core/mission.js';

const minMassEl = document.getElementById('min-mass');
const maxSpeedEl = document.getElementById('max-speed');
const materialTypeEl = document.getElementById('material-type');
const categoryTypeEl = document.getElementById('category-type');
const resultsListEl = document.getElementById('results-list');
const resultsCountEl = document.getElementById('results-count');

let onFilterChangeCallback;
let onSatelliteSelectCallback;

/**
 * Inicializa el panel de filtros, configurando los listeners de eventos.
 * @param {Function} onFilterChange - Callback que se ejecuta cuando los filtros cambian.
 * @param {Function} onSatelliteSelect - Callback que se ejecuta cuando se selecciona un satélite de la lista.
 */
export function initFilterPanel(onFilterChange, onSatelliteSelect) {
    onFilterChangeCallback = onFilterChange;
    onSatelliteSelectCallback = onSatelliteSelect;

    document.getElementById('apply-filters-button').addEventListener('click', () => {
        onFilterChangeCallback(getFilters());
    });

    document.getElementById('reset-filters-button').addEventListener('click', () => {
        resetFilters();
        onFilterChangeCallback(getFilters());
    });
}

/**
 * Obtiene los valores actuales de los filtros del DOM.
 * @returns {object} Un objeto con los filtros aplicados.
 */
export function getFilters() {
    return {
        minMass: parseFloat(minMassEl.value) || 0,
        maxSpeed: parseFloat(maxSpeedEl.value) || Infinity,
        materialType: materialTypeEl.value,
        categoryType: categoryTypeEl.value
    };
}

/**
 * Reinicia los campos del formulario de filtros a sus valores por defecto.
 */
function resetFilters() {
    minMassEl.value = DEFAULT_FILTERS.minMass;
    maxSpeedEl.value = DEFAULT_FILTERS.maxSpeed;
    materialTypeEl.value = DEFAULT_FILTERS.materialType;
    categoryTypeEl.value = DEFAULT_FILTERS.categoryType || 'ALL';
}

/**
 * Renderiza la lista de satélites filtrados en el panel.
 * @param {Array<object>} filteredSats - La lista de satélites a mostrar.
 * @param {object|null} selectedSat - El satélite actualmente seleccionado.
 */
export function renderResultsList(filteredSats, selectedSat) {
    resultsListEl.innerHTML = '';
    resultsCountEl.textContent = filteredSats.length;

    filteredSats.forEach(sat => {
        const box = document.createElement('div');
        box.className = 'result-box';
        box.id = `sat-box-${sat.id}`;
        
        const vulnerability = calculateVulnerability(sat.decayTime);
        const categoryBadge = sat.category ? `<span style="background: #333; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">${sat.category.toUpperCase()}</span>` : '';

        box.innerHTML = `
            <p><strong>${sat.name || 'Objeto ' + sat.id}</strong> ${categoryBadge}</p>
            <p><strong>NORAD:</strong> ${sat.noradId || sat.id}</p>
            <p><strong>Masa:</strong> ${sat.mass} kg</p>
            <p><strong>Altitud:</strong> ${sat.altitude.toFixed(0)} km</p>
            <p style="color: ${vulnerability.color};"><strong>Riesgo:</strong> ${vulnerability.level}</p>
        `;

        box.addEventListener('click', () => {
            onSatelliteSelectCallback(sat);
        });

        resultsListEl.appendChild(box);
    });

    // Marcar el satélite seleccionado si está en la lista
    if (selectedSat) {
        const selectedBox = document.getElementById(`sat-box-${selectedSat.id}`);
        if (selectedBox) {
            selectedBox.classList.add('selected');
            selectedBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

/**
 * Actualiza la clase 'selected' en la lista de resultados.
 * @param {object|null} selectedSat - El satélite que debe ser marcado como seleccionado.
 */
export function updateSelectionInList(selectedSat) {
    document.querySelectorAll('.result-box').forEach(box => box.classList.remove('selected'));
    if (selectedSat) {
        const selectedBox = document.getElementById(`sat-box-${selectedSat.id}`);
        if (selectedBox) {
            selectedBox.classList.add('selected');
        }
    }
}
