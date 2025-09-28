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