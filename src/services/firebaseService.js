/**
 * Servicio de Firebase para conectar con Realtime Database
 * y obtener datos de satélites y basura espacial.
 */

// Configuración de Firebase
const firebaseConfig = {
    databaseURL: "https://spaceguard-b46ef-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/**
 * Obtiene todos los satélites y basura espacial de Firebase.
 * @returns {Promise<Array>} Array con todos los objetos espaciales.
 */
export async function fetchAllSpaceObjects() {
    try {
        const categories = ['communications', 'debris', 'misc', 'navigation', 'scientific', 'space_stations'];
        const allObjects = [];
        
        // Obtener datos de todas las categorías
        for (const category of categories) {
            const snapshot = await database.ref(category).once('value');
            const data = snapshot.val();
            
            if (data) {
                // Convertir el objeto de Firebase a array
                Object.keys(data).forEach(key => {
                    const obj = data[key];
                    allObjects.push({
                        ...obj,
                        category: category,
                        firebaseKey: key
                    });
                });
            }
        }
        
        console.log(`✅ Cargados ${allObjects.length} objetos espaciales desde Firebase`);
        return allObjects;
        
    } catch (error) {
        console.error('❌ Error al cargar datos de Firebase:', error);
        throw error;
    }
}

/**
 * Obtiene objetos de una categoría específica.
 * @param {string} category - Categoría a obtener (communications, debris, etc.)
 * @returns {Promise<Array>} Array con los objetos de esa categoría.
 */
export async function fetchByCategory(category) {
    try {
        const snapshot = await database.ref(category).once('value');
        const data = snapshot.val();
        
        if (!data) return [];
        
        return Object.keys(data).map(key => ({
            ...data[key],
            category: category,
            firebaseKey: key
        }));
        
    } catch (error) {
        console.error(`❌ Error al cargar categoría ${category}:`, error);
        throw error;
    }
}

/**
 * Escucha cambios en tiempo real en la base de datos.
 * @param {Function} callback - Función a ejecutar cuando hay cambios.
 */
export function listenToChanges(callback) {
    const categories = ['communications', 'debris', 'misc', 'navigation', 'scientific', 'space_stations'];
    
    categories.forEach(category => {
        database.ref(category).on('value', (snapshot) => {
            console.log(`🔄 Actualización detectada en ${category}`);
            callback(category, snapshot.val());
        });
    });
}

/**
 * Detiene la escucha de cambios en tiempo real.
 */
export function stopListening() {
    database.ref().off();
}
