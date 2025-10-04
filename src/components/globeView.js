import { GLOBE_IMAGE_URL, BUMP_IMAGE_URL, SAT_ALTITUDE_FACTOR, EGO_ALTITUDE_FACTOR, EGO_ORBIT_SPEED, EARTH_RADIUS_KM } from '../config/constants.js';

let world;
let satRadius;
let egoRadius;

/**
 * Inicializa el globo 3D en el contenedor especificado.
 * @param {HTMLElement} container - El elemento del DOM donde se renderizará el globo.
 */
export function initGlobe(container) {
    world = window.Globe()(container)
        .globeImageUrl(GLOBE_IMAGE_URL)
        .bumpImageUrl(BUMP_IMAGE_URL);

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.35;

    const globeRadius = world.getGlobeRadius();
    // satRadius ya no es una constante global, se calcula por satélite
    egoRadius = globeRadius + globeRadius * EGO_ALTITUDE_FACTOR;

    return world;
}

/**
 * Crea y añade la Estación de Gestión Orbital (EGO) a la escena.
 * @returns {object} El objeto que representa a la EGO.
 */
export function createEgoStation() {
    const egoGeo = new window.THREE.DodecahedronGeometry(5, 0); // Poliedro para distinguirla
    const egoMat = new window.THREE.MeshBasicMaterial({ color: 0x00bfff }); // Azul cielo
    const egoMesh = new window.THREE.Mesh(egoGeo, egoMat);
    world.scene().add(egoMesh);

    return {
        mesh: egoMesh,
        theta: Math.random() * Math.PI * 2,
        phi: Math.PI / 4, // Órbita inclinada fija
        speed: EGO_ORBIT_SPEED
    };
}

/**
 * Crea y añade los objetos 3D de los satélites a la escena.
 * @param {Array<object>} satelliteData - Los datos de los satélites.
 * @returns {Array<object>} Una lista de objetos de satélite con sus mallas 3D.
 */
export function createSatelliteMeshes(satelliteData) {
    const globeRadius = world.getGlobeRadius();
    const canvasScale = globeRadius / EARTH_RADIUS_KM; // Unidades de Three.js por km

    console.log(`🌍 Radio del globo: ${globeRadius.toFixed(2)} unidades`);
    console.log(`📏 Escala canvas: ${canvasScale.toFixed(6)} unidades/km`);

    return satelliteData.map((sat, index) => {
        const satGeo = new window.THREE.SphereGeometry(2, 16, 16);
        const satMat = new window.THREE.MeshBasicMaterial({ color: sat.originalColor });
        const satMesh = new window.THREE.Mesh(satGeo, satMat);
        
        const radius = (EARTH_RADIUS_KM + sat.altitude) * canvasScale;

        // Log de depuración para los primeros 5 satélites
        if (index < 5) {
            console.log(`🛰️ Satélite ${index}: alt=${sat.altitude.toFixed(2)}km, radius=${radius.toFixed(2)} unidades`);
        }

        // Adjuntar los datos del satélite a la malla para una fácil identificación
        satMesh.userData = sat;
        world.scene().add(satMesh);

        return {
            ...sat,
            mesh: satMesh,
            radius: radius // Guardar el radio orbital en unidades de la escena
        };
    });
}

/**
 * Inicia el bucle de animación para mover los satélites y la EGO.
 * @param {Array<object>} satellites - La lista de satélites con sus mallas.
 * @param {object} ego - El objeto de la estación EGO.
 * @param {Function} onFrameTick - Callback que se ejecuta en cada frame (para la cámara).
 */
export function startAnimation(satellites, ego, onFrameTick) {
    let frameCount = 0;
    
    (function animate() {
        // Mover la EGO
        ego.theta += ego.speed;
        const ego_x = egoRadius * Math.sin(ego.phi) * Math.cos(ego.theta);
        const ego_y = egoRadius * Math.cos(ego.phi);
        const ego_z = egoRadius * Math.sin(ego.phi) * Math.sin(ego.theta);
        ego.mesh.position.set(ego_x, ego_y, ego_z);

        // Mover los satélites en sus órbitas individuales
        satellites.forEach((sat, index) => {
            sat.theta += sat.speed;
            const x = sat.radius * Math.sin(sat.phi) * Math.cos(sat.theta);
            const y = sat.radius * Math.cos(sat.phi);
            const z = sat.radius * Math.sin(sat.phi) * Math.sin(sat.theta);
            sat.mesh.position.set(x, y, z);
            
            // Log de depuración para el primer satélite en el primer frame
            if (frameCount === 0 && index === 0) {
                console.log(`🎬 Frame 0, Satélite 0:`, {
                    radius: sat.radius.toFixed(2),
                    phi: sat.phi.toFixed(3),
                    theta: sat.theta.toFixed(3),
                    position: `(${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`
                });
            }
        });

        onFrameTick(); // Ejecutar lógica adicional (ej: seguir con la cámara)

        frameCount++;
        requestAnimationFrame(animate);
    })();
}

/**
 * Configura la detección de clics en los satélites.
 * @param {Array<object>} satellites - La lista de satélites.
 * @param {Function} onSatelliteClick - Callback a ejecutar cuando se hace clic en un satélite.
 */
export function setupInteractions(satellites, onSatelliteClick) {
    const raycaster = new window.THREE.Raycaster();
    const mouse = new window.THREE.Vector2();
    const canvas = world.renderer().domElement;

    canvas.addEventListener('click', event => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, world.camera());
        
        const visibleMeshes = satellites.filter(s => s.mesh.visible).map(s => s.mesh);
        const intersects = raycaster.intersectObjects(visibleMeshes);

        if (intersects.length > 0) {
            const clickedSatData = intersects[0].object.userData;
            onSatelliteClick(clickedSatData);
        }
    });
}

/**
 * Mueve la cámara para seguir a un satélite seleccionado.
 * @param {object} satellite - El satélite a seguir.
 */
export function followSatellite(satellite) {
    if (!satellite || !satellite.mesh) return; // Añadir comprobación de seguridad

    world.controls().autoRotate = false;

    const target = satellite.mesh.position;
    const camera = world.camera();
    const controls = world.controls();

    const targetVector = new window.THREE.Vector3().copy(target).normalize();
    const cameraDistance = 200;

    const newCameraPosition = camera.position.clone().lerp(targetVector.clone().multiplyScalar(satellite.radius + cameraDistance), 0.1);

    camera.position.copy(newCameraPosition);
    controls.target.copy(target);
    controls.update();
}

/**
 * Detiene el seguimiento de la cámara y restaura la rotación automática.
 */
export function stopFollowing() {
    world.controls().autoRotate = true;
    world.controls().target.set(0, 0, 0);
    world.controls().update();
}
