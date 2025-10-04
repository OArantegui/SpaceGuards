/**
 * Servicio de Chat con OpenAI Assistant API
 * Gestiona la comunicación con el Assistant de OpenAI para responder preguntas
 * sobre desechos espaciales y misiones de retirada.
 */

import { config } from '../config/apiConfig.js';

// Configuración de OpenAI desde archivo de configuración
const OPENAI_API_KEY = config.openai.apiKey;
const ASSISTANT_ID = config.openai.assistantId;
const API_BASE_URL = config.openai.apiBaseUrl;

// Validar configuración al cargar
console.log('🔑 API Key configurada:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 20)}...` : 'NO CONFIGURADA');
console.log('🤖 Assistant ID:', ASSISTANT_ID);

// Estado del chat
let currentThreadId = null;

/**
 * Crea un nuevo thread de conversación
 * @returns {Promise<string>} ID del thread creado
 */
async function createThread() {
    try {
        const response = await fetch(`${API_BASE_URL}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error detallado al crear thread:', errorData);
            console.error('📋 Status:', response.status);
            console.error('📋 Error message:', errorData.error?.message);
            throw new Error(`Error al crear thread: ${errorData.error?.message || response.status}`);
        }

        const data = await response.json();
        currentThreadId = data.id;
        console.log('✅ Thread creado:', currentThreadId);
        return currentThreadId;
    } catch (error) {
        console.error('❌ Error al crear thread:', error);
        throw error;
    }
}

/**
 * Envía un mensaje al Assistant y espera la respuesta
 * @param {string} message - Mensaje del usuario
 * @returns {Promise<string>} Respuesta del Assistant
 */
export async function sendMessage(message) {
    try {
        // Crear thread si no existe
        if (!currentThreadId) {
            await createThread();
        }

        // 1. Añadir mensaje al thread
        const messageResponse = await fetch(`${API_BASE_URL}/threads/${currentThreadId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });

        if (!messageResponse.ok) {
            const errorData = await messageResponse.json();
            console.error('❌ Error al añadir mensaje:', errorData);
            throw new Error(`Error al añadir mensaje: ${errorData.error?.message || messageResponse.status}`);
        }

        // 2. Ejecutar el Assistant
        const runResponse = await fetch(`${API_BASE_URL}/threads/${currentThreadId}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID,
                response_format: { type: "text" }  // Forzar respuesta en texto, no JSON
            })
        });

        if (!runResponse.ok) {
            const errorData = await runResponse.json();
            console.error('❌ Error al ejecutar run:', errorData);
            throw new Error(`Error al ejecutar run: ${errorData.error?.message || runResponse.status}`);
        }

        const runData = await runResponse.json();
        console.log('✅ Run creado:', runData);
        
        if (!runData.id) {
            throw new Error('No se recibió ID del run');
        }
        
        const runId = runData.id;

        // 3. Esperar a que el Assistant termine de procesar
        let runStatus = await waitForRunCompletion(runId);

        if (runStatus.status !== 'completed') {
            throw new Error(`Run no completado: ${runStatus.status}`);
        }

        // 4. Obtener los mensajes del thread
        const messagesResponse = await fetch(`${API_BASE_URL}/threads/${currentThreadId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        const messagesData = await messagesResponse.json();
        
        // Obtener el último mensaje del assistant
        const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');
        
        if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
            return assistantMessage.content[0].text.value;
        }

        return 'Lo siento, no pude generar una respuesta.';

    } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
        throw error;
    }
}

/**
 * Espera a que el run se complete
 * @param {string} runId - ID del run
 * @returns {Promise<Object>} Estado del run
 */
async function waitForRunCompletion(runId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(`${API_BASE_URL}/threads/${currentThreadId}/runs/${runId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error al consultar run status:', errorData);
            throw new Error(`Error al consultar run: ${errorData.error?.message || response.status}`);
        }

        const runStatus = await response.json();
        console.log(`⏳ Run status (intento ${i + 1}):`, runStatus.status);

        if (runStatus.status === 'completed' || runStatus.status === 'failed' || runStatus.status === 'cancelled') {
            return runStatus;
        }

        // Esperar 1 segundo antes de volver a consultar
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Timeout esperando respuesta del Assistant');
}

/**
 * Reinicia la conversación creando un nuevo thread
 */
export function resetConversation() {
    currentThreadId = null;
    console.log('🔄 Conversación reiniciada');
}

/**
 * Obtiene el ID del thread actual
 * @returns {string|null} ID del thread o null si no existe
 */
export function getCurrentThreadId() {
    return currentThreadId;
}
