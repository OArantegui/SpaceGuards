import { loadSatelliteData } from './services/dataService.js';
import * as globeView from './components/globeView.js';
import * as filterPanel from './components/filterPanel.js';
import * as dashboard from './components/dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO DE LA APLICACIÓN ---
    let satellites = [];
    let egoStation = {};
    let globalMetrics = {};
    let selectedSat = null;
    let world;

    // --- INICIALIZACIÓN ---
    async function init() {
        try {
            // Mostrar mensaje de carga
            showLoadingMessage('Cargando datos desde Firebase...');

            // 1. Cargar datos desde Firebase (asíncrono)
            const data = await loadSatelliteData();
            
            if (!data || data.satellites.length === 0) {
                showLoadingMessage('⚠️ No se pudieron cargar datos. Verifica la conexión a Firebase.');
                return;
            }

            globalMetrics = { avgMass: data.avgMass, avgSpeed: data.avgSpeed };

            // 2. Inicializar el globo
            const globeContainer = document.getElementById('globeViz');
            world = globeView.initGlobe(globeContainer);

            // 3. Crear objetos 3D
            satellites = globeView.createSatelliteMeshes(data.satellites);
            egoStation = globeView.createEgoStation();

            // 4. Inicializar componentes de UI
            filterPanel.initFilterPanel(handleFilterChange, handleSatelliteSelect);
            dashboard.initDashboard(handleMissionStart, handleCloseDashboard);

            // 5. Configurar interacciones y animación
            globeView.setupInteractions(satellites, handleSatelliteSelect);
            globeView.startAnimation(satellites, egoStation, onFrameTick);

            // 6. Aplicar filtros iniciales
            handleFilterChange(filterPanel.getFilters());

            // Ocultar mensaje de carga
            hideLoadingMessage();

            console.log(`✅ Aplicación inicializada con ${satellites.length} objetos espaciales`);
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            showLoadingMessage('❌ Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    // --- FUNCIONES DE UI PARA CARGA ---
    function showLoadingMessage(message) {
        let loadingDiv = document.getElementById('loading-message');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-message';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                padding: 30px 50px;
                border-radius: 10px;
                font-size: 18px;
                z-index: 10000;
                text-align: center;
                border: 2px solid #00ff00;
            `;
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.textContent = message;
        loadingDiv.style.display = 'block';
    }

    function hideLoadingMessage() {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    // --- MANEJADORES DE EVENTOS Y LÓGICA DE CONTROL ---

    /**
     * Se ejecuta cuando el usuario cambia los filtros y hace clic en "Aplicar".
     */
    function handleFilterChange(filters) {
        const filteredSats = satellites.filter(sat => {
            const massPass = sat.mass >= filters.minMass;
            const currentSpeedKmH = Math.abs(sat.speed * 10000);
            const speedScale = (currentSpeedKmH / 24) * 100; // Escala de velocidad para el slider
            const speedPass = speedScale <= filters.maxSpeed;
            const materialPass = filters.materialType === 'ALL' || sat.material === filters.materialType;
            const categoryPass = filters.categoryType === 'ALL' || sat.category === filters.categoryType;

            const isVisible = massPass && speedPass && materialPass && categoryPass;
            sat.mesh.visible = isVisible;
            return isVisible;
        });

        // Si el satélite seleccionado ya no es visible, ciérralo
        if (selectedSat && !selectedSat.mesh.visible) {
            handleCloseDashboard();
        }

        filterPanel.renderResultsList(filteredSats, selectedSat);
    }

    /**
     * Se ejecuta cuando el usuario selecciona un satélite (desde el globo o la lista).
     */
    function handleSatelliteSelect(satData) {
        // El satData que llega del evento de clic solo tiene los datos, no la malla.
        // Necesitamos encontrar el objeto de satélite completo en nuestra lista principal.
        const fullSatObject = satellites.find(s => s.id === satData.id);
        if (!fullSatObject) return; // No hacer nada si no se encuentra

        // Deseleccionar el anterior si es diferente
        if (selectedSat && selectedSat.id !== fullSatObject.id) {
            selectedSat.mesh.material.color.set(selectedSat.originalColor);
        }

        selectedSat = fullSatObject;
        selectedSat.mesh.material.color.set(0x00ff00); // Resaltar en verde

        // Actualizar UI
        filterPanel.updateSelectionInList(selectedSat);
        dashboard.showDashboard(selectedSat, egoStation, globalMetrics, world);
    }

    /**
     * Se ejecuta cuando el usuario cierra el panel de control.
     */
    function handleCloseDashboard() {
        if (selectedSat) {
            selectedSat.mesh.material.color.set(selectedSat.originalColor);
            selectedSat = null;
        }
        dashboard.hideDashboard();
        filterPanel.updateSelectionInList(null);
        globeView.stopFollowing();
    }

    /**
     * Se ejecuta cuando el usuario hace clic en "Iniciar Misión".
     */
    function handleMissionStart() {
        if (selectedSat) {
            dashboard.showMissionPopup(selectedSat, egoStation, world);
        }
    }

    /**
     * Se ejecuta en cada frame de la animación (para el seguimiento de la cámara).
     */
    function onFrameTick() {
        if (selectedSat) {
            globeView.followSatellite(selectedSat);
        }
    }

    // Iniciar la aplicación
    init();
});
