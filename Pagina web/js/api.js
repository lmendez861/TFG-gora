// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';
let currentUser = null;
let authToken = null;

// API Helper Functions
class AgoraAPI {
    
    // Configuración base para fetch
    static getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (includeAuth && authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        return headers;
    }

    // Autenticación
    static async login(username, password) {
        try {
            console.log('🔐 Intentando login con:', username);
            console.log('📡 URL de API:', `${API_BASE_URL}/auth/login`);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify({ username, password })
            });
            
            console.log('📡 Respuesta del servidor - Status:', response.status);
            console.log('📡 Respuesta del servidor - OK:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📡 Datos recibidos:', data);
            
            if (data.success) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('agoraToken', authToken);
                localStorage.setItem('agoraUser', JSON.stringify(currentUser));
                console.log('✅ Login exitoso para:', currentUser.username);
                return { success: true, user: currentUser };
            } else {
                console.log('❌ Login falló:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Error en login:', error);
            console.error('💥 Error stack:', error.stack);
            return { success: false, error: `Error de conexión: ${error.message}` };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    static logout() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('agoraToken');
        localStorage.removeItem('agoraUser');
    }

    static initializeAuth() {
        authToken = localStorage.getItem('agoraToken');
        const userData = localStorage.getItem('agoraUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    }

    // Verificar token
    static async verifyToken() {
        try {
            if (!authToken) {
                return { valid: false, error: 'No hay token' };
            }
            
            console.log('🔍 Verificando token...');
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: this.getHeaders(true)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Token verificado:', data);
            
            if (data.valid) {
                currentUser = data.user;
                localStorage.setItem('agoraUser', JSON.stringify(currentUser));
            }
            
            return data;
        } catch (error) {
            console.error('💥 Error verificando token:', error);
            this.logout();
            return { valid: false, error: error.message };
        }
    }

    // Grupos
    static async getGroups() {
        try {
            const response = await fetch(`${API_BASE_URL}/groups`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            return data.groups || [];
        } catch (error) {
            console.error('Error obteniendo grupos:', error);
            return [];
        }
    }

    static async getGroup(groupId) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo grupo:', error);
            return null;
        }
    }

    static async createGroup(groupData) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(groupData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error creando grupo:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    static async joinGroup(groupId) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error uniéndose al grupo:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    // Mensajes
    static async getMessages(groupId, limit = 50, before = null) {
        try {
            let url = `${API_BASE_URL}/groups/${groupId}/messages?limit=${limit}`;
            if (before) {
                url += `&before=${before}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('Error obteniendo mensajes:', error);
            return [];
        }
    }

    static async sendMessage(groupId, content) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ contenido: content })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    static async deleteMessage(messageId) {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error eliminando mensaje:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }

    // ====== FUNCIONES DE BOTS ======

    // Obtener lista de bots
    static async getBots(tipo = null, scope = null) {
        try {
            let url = `${API_BASE_URL}/bots`;
            const params = new URLSearchParams();
            
            if (tipo) params.append('tipo', tipo);
            if (scope) params.append('scope', scope);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            console.log('🤖 Obteniendo bots:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📋 Bots obtenidos:', data);
            return data.bots || [];
        } catch (error) {
            console.error('❌ Error obteniendo bots:', error);
            return [];
        }
    }

    // Obtener detalles de un bot
    static async getBot(botId) {
        try {
            console.log('🔍 Obteniendo detalles del bot:', botId);
            const response = await fetch(`${API_BASE_URL}/bots/${botId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('🤖 Detalles del bot:', data);
            return data.bot || null;
        } catch (error) {
            console.error('❌ Error obteniendo bot:', error);
            return null;
        }
    }

    // Crear nuevo bot
    static async createBot(botData) {
        try {
            console.log('🆕 Creando bot:', botData);
            const response = await fetch(`${API_BASE_URL}/bots`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(botData)
            });

            const data = await response.json();
            console.log('✅ Bot creado:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando bot:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir bot a grupo
    static async addBotToGroup(botId, grupoId) {
        try {
            console.log('➕ Añadiendo bot al grupo:', { botId, grupoId });
            const response = await fetch(`${API_BASE_URL}/bots/${botId}/grupos/${grupoId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('✅ Bot añadido al grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error añadiendo bot al grupo:', error);
            return { success: false, error: error.message };
        }
    }

    // Remover bot de grupo
    static async removeBotFromGroup(botId, grupoId) {
        try {
            console.log('➖ Removiendo bot del grupo:', { botId, grupoId });
            const response = await fetch(`${API_BASE_URL}/bots/${botId}/grupos/${grupoId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('✅ Bot removido del grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error removiendo bot del grupo:', error);
            return { success: false, error: error.message };
        }
    }

    // Probar bot
    static async testBot(botId, mensaje) {
        try {
            console.log('🧪 Probando bot:', { botId, mensaje });
            const response = await fetch(`${API_BASE_URL}/bots/test/${botId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ mensaje })
            });

            const data = await response.json();
            console.log('🤖 Respuesta del bot:', data);
            return data;
        } catch (error) {
            console.error('❌ Error probando bot:', error);
            return { success: false, error: error.message };
        }
    }

    // ====== FUNCIONES DE CHAT MEJORADAS ======

    // Enviar mensaje (actualizada para bots)
    static async sendMessageToGroup(contenido, grupoId = null, usuarioId = null) {
        try {
            const messageData = {
                contenido: contenido,
                grupo_id: grupoId,
                usuario_id: usuarioId || currentUser?.id || 1
            };

            console.log('📤 Enviando mensaje:', messageData);
            const response = await fetch(`${API_BASE_URL}/chat/mensajes`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(messageData)
            });

            const data = await response.json();
            console.log('✅ Mensaje enviado:', data);
            
            if (data.bot_respondio) {
                console.log('🤖 Bot respondió:', data.respuesta_bot);
            }

            return data;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener mensajes de grupo
    static async getGroupMessages(grupoId, limite = 50, offset = 0) {
        try {
            const url = `${API_BASE_URL}/chat/mensajes/${grupoId}?limite=${limite}&offset=${offset}`;
            console.log('📥 Obteniendo mensajes:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📨 Mensajes obtenidos:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error);
            return { success: false, mensajes: [] };
        }
    }

    // Obtener bots de un grupo
    static async getGroupBots(grupoId) {
        try {
            console.log('🤖 Obteniendo bots del grupo:', grupoId);
            const response = await fetch(`${API_BASE_URL}/chat/grupos/${grupoId}/bots`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📋 Bots del grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo bots del grupo:', error);
            return { success: false, bots_activos: [], bots_disponibles: [] };
        }
    }

    // ====== FUNCIONES DE MULTIMEDIA ======

    // Obtener stickers
    static async getStickers() {
        try {
            console.log('🎨 Obteniendo stickers...');
            const response = await fetch(`${API_BASE_URL}/multimedia/stickers`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📸 Stickers obtenidos:', data);
            return data.stickers || [];
        } catch (error) {
            console.error('❌ Error obteniendo stickers:', error);
            return [];
        }
    }

    // Obtener GIFs
    static async getGifs() {
        try {
            console.log('🎬 Obteniendo GIFs...');
            const response = await fetch(`${API_BASE_URL}/multimedia/gifs`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📹 GIFs obtenidos:', data);
            return data.gifs || [];
        } catch (error) {
            console.error('❌ Error obteniendo GIFs:', error);
            return [];
        }
    }

    // Obtener emojis
    static async getEmojis() {
        try {
            console.log('😀 Obteniendo emojis...');
            const response = await fetch(`${API_BASE_URL}/multimedia/emojis`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('😊 Emojis obtenidos:', data);
            return data.emojis || [];
        } catch (error) {
            console.error('❌ Error obteniendo emojis:', error);
            return [];
        }
    }

    // Estado de LocalAI
    static async getLocalAIStatus() {
        try {
            console.log('🧠 Verificando estado de LocalAI...');
            const response = await fetch(`${API_BASE_URL}/bots/localai/status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('🔧 Estado de LocalAI:', data);
            return data;
        } catch (error) {
            console.error('❌ Error verificando LocalAI:', error);
            return { success: false, error: error.message };
        }
    }
}

// Funciones de utilidad para el UI
class AgoraUI {
    
    static showError(message) {
        console.error(message);
        // Aquí puedes agregar tu lógica para mostrar errores en el UI
        alert(message);
    }

    static showSuccess(message) {
        console.log(message);
        // Aquí puedes agregar tu lógica para mostrar éxito en el UI
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ====== FUNCIONES DE BOTS ======

    // Obtener lista de bots
    static async getBots(tipo = null, scope = null) {
        try {
            let url = `${API_BASE_URL}/bots`;
            const params = new URLSearchParams();
            
            if (tipo) params.append('tipo', tipo);
            if (scope) params.append('scope', scope);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            console.log('🤖 Obteniendo bots:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📋 Bots obtenidos:', data);
            return data.bots || [];
        } catch (error) {
            console.error('❌ Error obteniendo bots:', error);
            return [];
        }
    }

    // Obtener detalles de un bot
    static async getBot(botId) {
        try {
            console.log('🔍 Obteniendo detalles del bot:', botId);
            const response = await fetch(`${API_BASE_URL}/bots/${botId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('🤖 Detalles del bot:', data);
            return data.bot || null;
        } catch (error) {
            console.error('❌ Error obteniendo bot:', error);
            return null;
        }
    }

    // Crear nuevo bot
    static async createBot(botData) {
        try {
            console.log('🆕 Creando bot:', botData);
            const response = await fetch(`${API_BASE_URL}/bots`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(botData)
            });

            const data = await response.json();
            console.log('✅ Bot creado:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creando bot:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir bot a grupo
    static async addBotToGroup(botId, grupoId) {
        try {
            console.log('➕ Añadiendo bot al grupo:', { botId, grupoId });
            const response = await fetch(`${API_BASE_URL}/bots/${botId}/grupos/${grupoId}`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('✅ Bot añadido al grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error añadiendo bot al grupo:', error);
            return { success: false, error: error.message };
        }
    }

    // Remover bot de grupo
    static async removeBotFromGroup(botId, grupoId) {
        try {
            console.log('➖ Removiendo bot del grupo:', { botId, grupoId });
            const response = await fetch(`${API_BASE_URL}/bots/${botId}/grupos/${grupoId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('✅ Bot removido del grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error removiendo bot del grupo:', error);
            return { success: false, error: error.message };
        }
    }

    // Probar bot
    static async testBot(botId, mensaje) {
        try {
            console.log('🧪 Probando bot:', { botId, mensaje });
            const response = await fetch(`${API_BASE_URL}/bots/test/${botId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ mensaje })
            });

            const data = await response.json();
            console.log('🤖 Respuesta del bot:', data);
            return data;
        } catch (error) {
            console.error('❌ Error probando bot:', error);
            return { success: false, error: error.message };
        }
    }

    // Enviar mensaje a grupo (actualizada para bots)
    static async sendMessageToGroup(contenido, grupoId) {
        try {
            const messageData = {
                contenido: contenido,
                grupo_id: grupoId
            };

            console.log('📤 Enviando mensaje al grupo:', messageData);
            const response = await fetch(`${API_BASE_URL}/chat/mensajes`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(messageData)
            });

            const data = await response.json();
            console.log('✅ Mensaje enviado:', data);
            
            if (data.bot_respondio) {
                console.log('🤖 Bot respondió:', data.respuesta_bot);
            }

            return data;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener mensajes de grupo
    static async getMessages(grupoId, limite = 50, offset = 0) {
        try {
            const url = `${API_BASE_URL}/chat/mensajes/${grupoId}?limite=${limite}&offset=${offset}`;
            console.log('📥 Obteniendo mensajes:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📨 Mensajes obtenidos:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error);
            return { success: false, mensajes: [] };
        }
    }

    // Obtener bots de un grupo
    static async getGroupBots(grupoId) {
        try {
            console.log('🤖 Obteniendo bots del grupo:', grupoId);
            const response = await fetch(`${API_BASE_URL}/chat/grupos/${grupoId}/bots`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📋 Bots del grupo:', data);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo bots del grupo:', error);
            return { success: false, bots_activos: [], bots_disponibles: [] };
        }
    }

    // ====== FUNCIONES DE MULTIMEDIA ======

    // Obtener stickers
    static async getStickers() {
        try {
            console.log('🎨 Obteniendo stickers...');
            const response = await fetch(`${API_BASE_URL}/multimedia/stickers`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📸 Stickers obtenidos:', data);
            return data.stickers || [];
        } catch (error) {
            console.error('❌ Error obteniendo stickers:', error);
            return [];
        }
    }

    // Obtener GIFs
    static async getGifs() {
        try {
            console.log('🎬 Obteniendo GIFs...');
            const response = await fetch(`${API_BASE_URL}/multimedia/gifs`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('📹 GIFs obtenidos:', data);
            return data.gifs || [];
        } catch (error) {
            console.error('❌ Error obteniendo GIFs:', error);
            return [];
        }
    }

    // Obtener emojis
    static async getEmojis() {
        try {
            console.log('😀 Obteniendo emojis...');
            const response = await fetch(`${API_BASE_URL}/multimedia/emojis`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('😊 Emojis obtenidos:', data);
            return data.emojis || [];
        } catch (error) {
            console.error('❌ Error obteniendo emojis:', error);
            return [];
        }
    }

    // Estado de LocalAI
    static async getLocalAIStatus() {
        try {
            console.log('🧠 Verificando estado de LocalAI...');
            const response = await fetch(`${API_BASE_URL}/bots/localai/status`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            console.log('🔧 Estado de LocalAI:', data);
            return data;
        } catch (error) {
            console.error('❌ Error verificando LocalAI:', error);
            return { success: false, error: error.message };
        }
    }
}

// Inicializar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    AgoraAPI.initializeAuth();
    
    if (currentUser) {
        console.log('Usuario autenticado:', currentUser);
        // Aquí puedes actualizar el UI para mostrar que el usuario está logueado
    }
});

// Funciones globales para usar en tu HTML
window.AgoraAPI = AgoraAPI;
window.AgoraUI = AgoraUI;
window.currentUser = currentUser;