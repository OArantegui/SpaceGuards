/**
 * Componente de Chatbot con OpenAI Assistant
 * Proporciona una interfaz de chat flotante para que los usuarios
 * hagan preguntas sobre desechos espaciales y misiones.
 */

import { sendMessage, resetConversation } from '../services/chatService.js';
import { calculateVulnerability, calculateDeltaV, calculateMissionBudget, calculateDistanceToEgo } from '../core/mission.js';

// Estado del chatbot
let isOpen = false;
let isWaitingResponse = false;
let chatHistory = [];

// Datos de la aplicación
let satellitesData = [];
let onSatelliteSelectCallback = null;
let onFilterChangeCallback = null;
let egoStationData = null;
let globeInstance = null;

// Elementos del DOM
let chatButton;
let chatContainer;
let chatMessages;
let chatInput;
let sendButton;
let closeButton;
let resetButton;

/**
 * Inicializa el chatbot y crea los elementos de UI
 * @param {Array} satellites - Array de satélites disponibles
 * @param {Function} onSatelliteSelect - Callback para seleccionar un satélite
 * @param {Function} onFilterChange - Callback para cambiar filtros
 * @param {Object} egoStation - Datos de la estación EGO
 * @param {Object} globe - Instancia del globo
 */
export function initChatbot(satellites = [], onSatelliteSelect = null, onFilterChange = null, egoStation = null, globe = null) {
    satellitesData = satellites;
    onSatelliteSelectCallback = onSatelliteSelect;
    onFilterChangeCallback = onFilterChange;
    egoStationData = egoStation;
    globeInstance = globe;
    
    createChatElements();
    attachEventListeners();
    addWelcomeMessage();
    console.log('✅ Chatbot inicializado con', satellites.length, 'satélites');
}

/**
 * Actualiza los datos de satélites (útil después de filtrar)
 * @param {Array} satellites - Array actualizado de satélites
 */
export function updateSatellitesData(satellites) {
    satellitesData = satellites;
}

/**
 * Crea todos los elementos HTML del chatbot
 */
function createChatElements() {
    // Botón flotante para abrir el chat
    chatButton = document.createElement('button');
    chatButton.id = 'chat-button';
    chatButton.innerHTML = '💬';
    chatButton.title = 'Abrir asistente de IA';
    document.body.appendChild(chatButton);

    // Contenedor principal del chat
    chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.style.display = 'none';
    
    chatContainer.innerHTML = `
        <div id="chat-header">
            <div class="chat-header-content">
                <span class="chat-icon">🤖</span>
                <div class="chat-title-group">
                    <span class="chat-title">Asistente EGO</span>
                    <span class="chat-subtitle">Powered by OpenAI</span>
                </div>
            </div>
            <div class="chat-header-actions">
                <button id="chat-reset-button" title="Reiniciar conversación">🔄</button>
                <button id="chat-close-button" title="Cerrar">✕</button>
            </div>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-input-container">
            <input type="text" id="chat-input" placeholder="Pregunta sobre desechos espaciales..." />
            <button id="chat-send-button">
                <span class="send-icon">➤</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(chatContainer);

    // Guardar referencias a los elementos
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendButton = document.getElementById('chat-send-button');
    closeButton = document.getElementById('chat-close-button');
    resetButton = document.getElementById('chat-reset-button');
}

/**
 * Adjunta los event listeners a los elementos
 */
function attachEventListeners() {
    // Abrir/cerrar chat con el botón flotante
    chatButton.addEventListener('click', toggleChat);
    
    // Cerrar chat
    closeButton.addEventListener('click', closeChat);
    
    // Reiniciar conversación
    resetButton.addEventListener('click', handleReset);
    
    // Enviar mensaje
    sendButton.addEventListener('click', handleSendMessage);
    
    // Enviar con Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}

/**
 * Alterna la visibilidad del chat
 */
function toggleChat() {
    if (isOpen) {
        closeChat();
    } else {
        openChat();
    }
}

/**
 * Abre el chat
 */
function openChat() {
    chatContainer.style.display = 'flex';
    chatButton.style.display = 'none';
    isOpen = true;
    chatInput.focus();
}

/**
 * Cierra el chat
 */
function closeChat() {
    chatContainer.style.display = 'none';
    chatButton.style.display = 'flex';
    isOpen = false;
}

/**
 * Añade el mensaje de bienvenida
 */
function addWelcomeMessage() {
    const welcomeText = `¡Hola! 👋 Soy tu asistente de IA especializado en desechos espaciales y misiones de retirada.

Puedo ayudarte a:
🔍 Buscar satélites por NORAD ID (ej: "NORAD 25544")
📝 Buscar por nombre (ej: "buscar COSMOS")
🔧 Filtrar por material (Aluminum, Steel, Composite)
⚠️ Analizar riesgo de colisión (ej: "riesgo de colisión")
💰 Evaluar viabilidad económica (ej: "¿es viable NORAD 25544?")
📊 Responder preguntas sobre desechos espaciales

¿En qué puedo ayudarte?`;
    addMessage(welcomeText, 'assistant');
}

/**
 * Busca satélites por NORAD ID
 * @param {number} noradId - ID NORAD a buscar
 * @returns {Object|null} Satélite encontrado o null
 */
function searchByNoradId(noradId) {
    return satellitesData.find(sat => sat.id === noradId);
}

/**
 * Busca satélites por nombre (búsqueda parcial)
 * @param {string} name - Nombre a buscar
 * @returns {Array} Array de satélites que coinciden
 */
function searchByName(name) {
    const searchTerm = name.toLowerCase();
    return satellitesData.filter(sat => 
        sat.name.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limitar a 10 resultados
}

/**
 * Filtra satélites por material
 * @param {string} material - Material a filtrar
 * @returns {Array} Array de satélites con ese material
 */
function filterByMaterial(material) {
    return satellitesData.filter(sat => 
        sat.material.toLowerCase() === material.toLowerCase()
    ).slice(0, 10);
}

/**
 * Filtra satélites por categoría
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Array de satélites de esa categoría
 */
function filterByCategory(category) {
    return satellitesData.filter(sat => 
        sat.category.toLowerCase() === category.toLowerCase()
    ).slice(0, 10);
}

/**
 * Aplica filtro visual en el globo (oculta/muestra satélites)
 * @param {Array} visibleSatellites - Array de satélites que deben ser visibles
 */
function applyVisualFilter(visibleSatellites) {
    const visibleIds = new Set(visibleSatellites.map(sat => sat.id));
    
    // Ocultar todos los satélites primero
    satellitesData.forEach(sat => {
        if (sat.mesh) {
            sat.mesh.visible = visibleIds.has(sat.id);
        }
    });
    
    console.log(`🎯 Filtro aplicado: ${visibleSatellites.length} satélites visibles de ${satellitesData.length} totales`);
}

/**
 * Restaura la visibilidad de todos los satélites
 */
function clearVisualFilter() {
    satellitesData.forEach(sat => {
        if (sat.mesh) {
            sat.mesh.visible = true;
        }
    });
    console.log('🔄 Filtro visual limpiado: todos los satélites visibles');
}

/**
 * Calcula el riesgo de colisión de un satélite
 * @param {Object} satellite - Datos del satélite
 * @returns {Object} Información del riesgo
 */
function calculateCollisionRisk(satellite) {
    const vulnerability = calculateVulnerability(satellite.decayTime);
    const deltaV = calculateDeltaV(satellite.altitude, satellite.mass);
    
    // Factores de riesgo adicionales
    const altitudeFactor = satellite.altitude < 1000 ? 'ALTA' : satellite.altitude < 1500 ? 'MEDIA' : 'BAJA';
    const massFactor = satellite.mass > 1000 ? 'ALTO' : satellite.mass > 500 ? 'MEDIO' : 'BAJO';
    
    return {
        vulnerability,
        deltaV,
        altitudeFactor,
        massFactor
    };
}

/**
 * Analiza la viabilidad económica de retirar un satélite
 * @param {Object} satellite - Datos del satélite
 * @returns {Object} Análisis económico completo
 */
function analyzeEconomicViability(satellite) {
    if (!egoStationData || !globeInstance) {
        return {
            viable: null,
            message: '⚠️ No se puede calcular viabilidad sin datos de la estación EGO. Selecciona un satélite en el mapa primero.'
        };
    }
    
    const deltaV = calculateDeltaV(satellite.altitude, satellite.mass);
    const globeRadius = globeInstance.getGlobeRadius();
    const distance = calculateDistanceToEgo(egoStationData, satellite, globeRadius);
    const rentabilidad = calculateMissionBudget(deltaV, distance, satellite);
    
    // Calcular costos desglosados
    const costeMasa = 50 * satellite.mass;
    const orbitalVelocity = Math.sqrt(398600.4418 / (6371 + satellite.altitude));
    const costeVelocidad = 1000 * (orbitalVelocity * orbitalVelocity);
    const costeDistancia = 0.1 * (distance / 1000);
    const costeDeltaV = deltaV * 0.5;
    const costeTotal = costeMasa + costeVelocidad + costeDistancia + costeDeltaV;
    
    // Calcular beneficio (valor del material)
    const materialValues = { 'Aluminum': 2.5, 'Steel': 1.8, 'Composite': 3.2 };
    const valorMaterial = materialValues[satellite.material] || 2.0;
    const beneficio = valorMaterial * satellite.mass;
    
    const viable = rentabilidad > 0;
    const margen = ((rentabilidad / costeTotal) * 100);
    
    return {
        viable,
        rentabilidad,
        beneficio,
        costeTotal,
        costeMasa,
        costeVelocidad,
        costeDistancia,
        costeDeltaV,
        deltaV,
        distance: distance / 1000, // en km
        margen,
        material: satellite.material,
        valorMaterial
    };
}

/**
 * Procesa comandos especiales del usuario
 * @param {string} message - Mensaje del usuario
 * @returns {Object|null} Resultado del comando o null si no es un comando
 */
function processCommand(message) {
    const lowerMessage = message.toLowerCase();
    
    // Comando de viabilidad económica
    if ((lowerMessage.includes('viable') || lowerMessage.includes('viabilidad') || lowerMessage.includes('rentable') || lowerMessage.includes('rentabilidad')) && 
        (lowerMessage.includes('economic') || lowerMessage.includes('económic') || lowerMessage.includes('retirar') || lowerMessage.includes('mision') || lowerMessage.includes('misión'))) {
        
        const noradMatch = message.match(/norad[:\s]+(\d+)/i) || message.match(/(\d{5,})/);
        
        if (noradMatch) {
            const noradId = parseInt(noradMatch[1]);
            const satellite = searchByNoradId(noradId);
            
            if (satellite) {
                const analysis = analyzeEconomicViability(satellite);
                
                if (analysis.viable === null) {
                    return {
                        type: 'error',
                        message: analysis.message
                    };
                }
                
                const viableIcon = analysis.viable ? '✅' : '❌';
                const viableText = analysis.viable ? 'SÍ ES VIABLE' : 'NO ES VIABLE';
                const razon = analysis.viable ? 
                    `El beneficio (€${analysis.beneficio.toFixed(0)}) supera el coste (€${analysis.costeTotal.toFixed(0)}) con un margen de ${analysis.margen.toFixed(1)}%.` :
                    `El coste (€${analysis.costeTotal.toFixed(0)}) supera el beneficio (€${analysis.beneficio.toFixed(0)}). Pérdida de €${Math.abs(analysis.rentabilidad).toFixed(0)}.`;
                
                return {
                    type: 'economic_analysis',
                    data: satellite,
                    message: `💰 Análisis de Viabilidad Económica\n\n🛰️ ${satellite.name} (NORAD ${satellite.id})\n\n${viableIcon} ${viableText}\n\n📊 DESGLOSE ECONÓMICO:\n\n💵 Beneficio Potencial:\n• Valor material (${analysis.material}): €${analysis.valorMaterial}/kg\n• Masa recuperable: ${satellite.mass.toFixed(0)} kg\n• Total beneficio: €${analysis.beneficio.toFixed(0)}\n\n💸 Costes de Misión:\n• Coste por masa: €${analysis.costeMasa.toFixed(0)}\n• Coste por velocidad orbital: €${analysis.costeVelocidad.toFixed(0)}\n• Coste por distancia (${analysis.distance.toFixed(0)} km): €${analysis.costeDistancia.toFixed(0)}\n• Coste Delta-V (${analysis.deltaV.toFixed(1)} m/s): €${analysis.costeDeltaV.toFixed(0)}\n• Total coste: €${analysis.costeTotal.toFixed(0)}\n\n📈 Rentabilidad: €${analysis.rentabilidad.toFixed(0)}\n\n💡 RAZÓN:\n${razon}`
                };
            } else {
                return {
                    type: 'not_found',
                    message: `❌ No se encontró ningún satélite con NORAD ID ${noradId}`
                };
            }
        } else {
            return {
                type: 'help',
                message: `💰 Para analizar viabilidad económica, especifica un satélite:\n\nEjemplo: "¿Es viable económicamente retirar NORAD 25544?"\n\nTambién puedes usar:\n• "viabilidad económica NORAD 25544"\n• "¿es rentable NORAD 25544?"`
            };
        }
    }
    
    // Comando de riesgo de colisión
    if (lowerMessage.includes('riesgo') && (lowerMessage.includes('colision') || lowerMessage.includes('colisión'))) {
        // Buscar si mencionan un NORAD ID específico
        const noradMatch = message.match(/norad[:\s]+(\d+)/i) || message.match(/(\d{5,})/);
        
        if (noradMatch) {
            const noradId = parseInt(noradMatch[1]);
            const satellite = searchByNoradId(noradId);
            
            if (satellite) {
                const risk = calculateCollisionRisk(satellite);
                
                return {
                    type: 'risk_analysis',
                    data: satellite,
                    message: `⚠️ Análisis de Riesgo de Colisión\n\n🛰️ ${satellite.name} (NORAD ${satellite.id})\n\n📊 NIVEL DE RIESGO: ${risk.vulnerability.level}\n🎯 Vulnerabilidad: ${risk.vulnerability.riskValue.toFixed(1)}%\n⏱️ Tiempo de decaimiento: ${satellite.decayTime.toFixed(1)} años\n\n🌍 Altitud: ${satellite.altitude.toFixed(0)} km (Riesgo ${risk.altitudeFactor})\n⚖️ Masa: ${satellite.mass.toFixed(0)} kg (Impacto ${risk.massFactor})\n🚀 Delta-V requerido: ${risk.deltaV.toFixed(1)} m/s\n\n💡 ${risk.vulnerability.level === 'ALTA' ? 'Este objeto representa un riesgo significativo y debería ser priorizado para retirada.' : risk.vulnerability.level === 'MEDIA' ? 'Este objeto requiere monitoreo continuo.' : 'Este objeto tiene bajo riesgo de colisión inmediata.'}`
                };
            } else {
                return {
                    type: 'not_found',
                    message: `❌ No se encontró ningún satélite con NORAD ID ${noradId}`
                };
            }
        } else {
            // Análisis general de riesgos
            const highRiskSats = satellitesData.filter(sat => {
                const vuln = calculateVulnerability(sat.decayTime);
                return vuln.level === 'ALTA';
            }).slice(0, 5);
            
            if (highRiskSats.length > 0) {
                const list = highRiskSats.map(sat => {
                    const risk = calculateCollisionRisk(sat);
                    return `• ${sat.name} (NORAD ${sat.id}) - Riesgo: ${risk.vulnerability.riskValue.toFixed(0)}%`;
                }).join('\n');
                
                return {
                    type: 'risk_summary',
                    data: highRiskSats,
                    message: `⚠️ Objetos de ALTO RIESGO de colisión:\n\n${list}\n\n💡 Estos objetos tienen tiempo de decaimiento < 8 años. Para ver detalles de uno específico, escribe "riesgo de colisión NORAD [ID]"`
                };
            }
        }
    }
    
    // Buscar por NORAD ID
    const noradMatch = message.match(/norad[:\s]+(\d+)/i);
    if (noradMatch) {
        const noradId = parseInt(noradMatch[1]);
        const satellite = searchByNoradId(noradId);
        if (satellite) {
            // Calcular riesgo
            const risk = calculateCollisionRisk(satellite);
            
            // Filtrar visualmente: solo mostrar este satélite
            applyVisualFilter([satellite]);
            
            // Seleccionar el satélite
            if (onSatelliteSelectCallback) {
                onSatelliteSelectCallback(satellite);
            }
            
            return {
                type: 'satellite_found',
                data: satellite,
                message: `✅ Satélite encontrado y seleccionado:\n\n🛰️ ${satellite.name} (NORAD ${satellite.id})\n📊 Material: ${satellite.material}\n🌍 Altitud: ${satellite.altitude.toFixed(0)} km\n⚖️ Masa: ${satellite.mass.toFixed(0)} kg\n⚠️ Riesgo de colisión: ${risk.vulnerability.level} (${risk.vulnerability.riskValue.toFixed(0)}%)\n\n💡 El mapa ahora muestra solo este satélite. Para ver todos de nuevo, escribe "mostrar todos".`
            };
        } else {
            return {
                type: 'not_found',
                message: `❌ No se encontró ningún satélite con NORAD ID ${noradId}`
            };
        }
    }
    
    // Comando para mostrar todos
    if (lowerMessage.includes('mostrar todos') || lowerMessage.includes('ver todos') || lowerMessage.includes('limpiar filtro')) {
        clearVisualFilter();
        return {
            type: 'filter_cleared',
            message: `✅ Filtro limpiado. Ahora se muestran todos los ${satellitesData.length} satélites en el mapa.`
        };
    }
    
    // Buscar por nombre
    if (lowerMessage.includes('buscar') || lowerMessage.includes('nombre')) {
        const nameMatch = message.match(/["']([^"']+)["']/) || message.match(/buscar\s+([a-z0-9\s-]+)/i);
        if (nameMatch) {
            const results = searchByName(nameMatch[1]);
            if (results.length > 0) {
                // Aplicar filtro visual
                applyVisualFilter(results);
                
                // Si solo hay uno, seleccionarlo
                if (results.length === 1 && onSatelliteSelectCallback) {
                    onSatelliteSelectCallback(results[0]);
                }
                
                const list = results.slice(0, 10).map(sat => 
                    `• ${sat.name} (NORAD ${sat.id}) - ${sat.material}`
                ).join('\n');
                
                const moreText = results.length > 10 ? `\n\n(Mostrando primeros 10 de ${results.length} resultados)` : '';
                
                return {
                    type: 'search_results',
                    data: results,
                    message: `🔍 Encontrados ${results.length} satélites:\n\n${list}${moreText}\n\n💡 El mapa ahora muestra solo estos satélites. Para ver todos de nuevo, escribe "mostrar todos".`
                };
            } else {
                return {
                    type: 'not_found',
                    message: `❌ No se encontraron satélites con el nombre "${nameMatch[1]}"`
                };
            }
        }
    }
    
    // Filtrar por material
    const materials = ['aluminum', 'aluminio', 'steel', 'acero', 'composite', 'compuesto'];
    for (const mat of materials) {
        if (lowerMessage.includes(mat)) {
            const materialName = mat.includes('alum') ? 'Aluminum' : 
                                mat.includes('steel') || mat.includes('acero') ? 'Steel' : 'Composite';
            const results = filterByMaterial(materialName);
            if (results.length > 0) {
                // Aplicar filtro visual
                applyVisualFilter(results);
                
                const list = results.slice(0, 10).map(sat => 
                    `• ${sat.name} (NORAD ${sat.id})`
                ).join('\n');
                
                const moreText = results.length > 10 ? `\n\n(Mostrando primeros 10 de ${results.length} resultados)` : '';
                
                return {
                    type: 'filter_results',
                    data: results,
                    message: `🔧 Encontrados ${results.length} satélites de ${materialName}:\n\n${list}${moreText}\n\n💡 El mapa ahora muestra solo satélites de ${materialName}. Para ver todos de nuevo, escribe "mostrar todos".`
                };
            }
        }
    }
    
    // Filtrar por categoría
    const categories = {
        'comunicaciones': 'communications',
        'communications': 'communications',
        'basura': 'debris',
        'debris': 'debris',
        'navegacion': 'navigation',
        'navigation': 'navigation',
        'gps': 'navigation',
        'cientifico': 'scientific',
        'scientific': 'scientific',
        'estacion': 'space_stations',
        'station': 'space_stations',
        'starlink': 'communications' // Starlink es comunicaciones
    };
    
    for (const [keyword, category] of Object.entries(categories)) {
        if (lowerMessage.includes(keyword)) {
            let results = filterByCategory(category);
            
            // Si buscan específicamente Starlink, filtrar más
            if (keyword === 'starlink') {
                results = results.filter(sat => sat.name.toLowerCase().includes('starlink'));
            }
            
            if (results.length > 0) {
                // Aplicar filtro visual
                applyVisualFilter(results);
                
                const list = results.slice(0, 10).map(sat => 
                    `• ${sat.name} (NORAD ${sat.id})`
                ).join('\n');
                
                const moreText = results.length > 10 ? `\n\n(Mostrando primeros 10 de ${results.length} resultados)` : '';
                
                return {
                    type: 'filter_results',
                    data: results,
                    message: `📡 Encontrados ${results.length} satélites de categoría ${category}:\n\n${list}${moreText}\n\n💡 El mapa ahora muestra solo esta categoría. Para ver todos de nuevo, escribe "mostrar todos".`
                };
            }
        }
    }
    
    return null;
}

/**
 * Maneja el envío de mensajes
 */
async function handleSendMessage() {
    const message = chatInput.value.trim();
    
    if (!message || isWaitingResponse) return;
    
    // Añadir mensaje del usuario
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Procesar comandos especiales primero
    const commandResult = processCommand(message);
    if (commandResult) {
        addMessage(commandResult.message, 'assistant');
        return;
    }
    
    // Mostrar indicador de escritura
    isWaitingResponse = true;
    const typingIndicator = addTypingIndicator();
    
    try {
        // Preparar contexto para el Assistant
        const contextMessage = `${message}\n\n[Contexto: Tengo acceso a ${satellitesData.length} satélites. Puedo buscar por NORAD ID, nombre, material (Aluminum, Steel, Composite) o categoría.]`;
        
        // Enviar mensaje al Assistant
        const response = await sendMessage(contextMessage);
        
        // Remover indicador de escritura
        typingIndicator.remove();
        
        // Añadir respuesta del assistant
        addMessage(response, 'assistant');
        
    } catch (error) {
        console.error('❌ Error al obtener respuesta:', error);
        typingIndicator.remove();
        addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', 'assistant', true);
    } finally {
        isWaitingResponse = false;
    }
}

/**
 * Añade un mensaje al chat
 * @param {string} text - Texto del mensaje
 * @param {string} role - 'user' o 'assistant'
 * @param {boolean} isError - Si es un mensaje de error
 */
function addMessage(text, role, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message${isError ? ' error-message' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Guardar en historial
    chatHistory.push({ role, text, timestamp: new Date() });
}

/**
 * Añade un indicador de escritura
 * @returns {HTMLElement} Elemento del indicador
 */
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

/**
 * Maneja el reinicio de la conversación
 */
function handleReset() {
    if (confirm('¿Estás seguro de que quieres reiniciar la conversación?')) {
        // Limpiar historial
        chatHistory = [];
        chatMessages.innerHTML = '';
        
        // Reiniciar en el servicio
        resetConversation();
        
        // Añadir mensaje de bienvenida
        addWelcomeMessage();
        
        console.log('🔄 Conversación reiniciada');
    }
}

/**
 * Obtiene el historial de chat
 * @returns {Array} Historial de mensajes
 */
export function getChatHistory() {
    return chatHistory;
}

/**
 * Cierra el chatbot (para uso externo)
 */
export function closeChatbot() {
    closeChat();
}

/**
 * Abre el chatbot (para uso externo)
 */
export function openChatbot() {
    openChat();
}
