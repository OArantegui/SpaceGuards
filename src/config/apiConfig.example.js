/**
 * Configuración de APIs - ARCHIVO DE EJEMPLO
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo como 'apiConfig.js' en la misma carpeta
 * 2. Reemplaza los valores de ejemplo con tus credenciales reales
 * 3. NO subas apiConfig.js a GitHub (ya está en .gitignore)
 */

export const config = {
    openai: {
        // Tu API Key de OpenAI (obtén una en https://platform.openai.com/api-keys)
        apiKey: 'sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        
        // ID de tu Assistant (encuentra el tuyo en https://platform.openai.com/assistants)
        assistantId: 'asst_XXXXXXXXXXXXXXXXXXXXXXXX',
        
        // URL base de la API de OpenAI
        apiBaseUrl: 'https://api.openai.com/v1'
    },
    firebase: {
        // URL de tu Firebase Realtime Database
        databaseURL: 'https://tu-proyecto-default-rtdb.firebaseio.com/'
    }
};
